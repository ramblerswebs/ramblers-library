<?php

/**
 * Description of feed
 *
 * @author Chris Vaughan
 */
// Live Site Definition Below
define("WALKMANAGER", "https://walks-manager.ramblers.org.uk/api/volunteers/walksevents?");
// https://walks-manager.ramblers.org.uk/api/volunteers/walksevents?&types=group-walk&api-key=853aa876db0a37ff0e6780db2d2addee&groups=er05
// API Key for the walks manager
define("APIKEY", "853aa876db0a37ff0e6780db2d2addee");
// no direct access
defined('_JEXEC') or die('Restricted access');

class RJsonwalksWmFeed {

    private $cacheFolder = null;
    private $organisation = null;
    private $method = "time";

    public function __construct() {
        $this->cacheFolder = new RJsonwalksWmCachefolder('ra_wm_feed');
        $this->organisation = new RJsonwalksWmOrganisation($this->cacheFolder, APIKEY);
        RJsonwalksWmFileio::setSecretStrings([APIKEY]);
    }

    public function getGroupFutureItems($groups, $readwalks, $readevents, $readwellbeingwalks) {
        $feedOpts = new RJsonwalksWmFeedoptions();
        $feedOpts->groupCode = $groups;
        $feedOpts->include_walks = $readevents;
        $feedOpts->include_events = $readwalks;
        $feedOpts->include_wellbeing_walks = $readwellbeingwalks;
        $today = date("Y-m-d");
        $feedOpts->date_start = $today;
        $date = date_create($feedOpts->date_start);
        date_add($date, date_interval_create_from_date_string("12 months"));
        $feedOpts->date_end = date_format($date, "Y-m-d");
        $items = $this->getFeed($feedOpts);
        return $items;
    }

    public function getItemsWithinArea($latitude, $longitude, $distance, $readwalks, $readevents, $readwellbeingwalks) {
        $feedOpts = new RJsonwalksWmFeedoptions();

        $feedOpts->include_events = $latitude;
        $feedOpts->latitude = $latitude;
        $feedOpts->longitude = $longitude;
        $feedOpts->distance = $distance;
        $feedOpts->include_walks = $readevents;
        $feedOpts->include_events = $readwalks;
        $feedOpts->include_wellbeing_walks = $readwellbeingwalks;
        $items = $this->getFeed($feedOpts);
        return $items;
    }

    private function getFeed($feedOpts) {
        $debug = false;
        $feedurl = $feedOpts->getFeedURL();
        $cachedWalksFileName = $feedOpts->getCacheFileName("walks.json");
        if ($this->method === "time") {
            $source = $this->whichSource($cachedWalksFileName);
        } else {
            $source = $this->organisation->whereToGetWalksFrom($feedOpts);
        }

        if ($debug) {
            $this->debugMsg($feedurl, "Reading data from " . $source);
        }
        if ($source === READSOURCE::CACHE) {
            $result = $this->cacheFolder->readFile($cachedWalksFileName);
            if ($result === false) {
                RJsonwalksWmFileio::errorMsg("Error reading walks from cache: ");
                $source = READSOURCE::FEED;
            }
        }
        if ($source === READSOURCE::FEED) {
            // read from feed and then cache data
            $result = RJsonwalksWmFileio::readFile($feedurl);
            if ($result === false) { // unable to read feed, try using cache
                if ($this->cacheFolder->fileExists($cachedWalksFileName)) {
                    // error msg
                    RJsonwalksWmFileio::errorMsg("Error reading walks from Central Office");
                    $result = RJsonwalksWmFileio::readFile($cachedWalksFileName);
                    if ($result === false) {
                        RJsonwalksWmFileio::errorMsg("Error reading walks from cache");
                    }
                }
            } else {
                // write walks to cache file
                $this->cacheFolder->writeFile($cachedWalksFileName, $result);
            }
        }

        if ($result === false) {
            return [];
        }
        $items = $this->convertResults($result, $feedurl);
        if ($items === null) {
            return [];
        }
        return $items->data;
    }

    private function whichSource($cachedWalksFileName) {
        if ($this->cacheFolder->fileExists($cachedWalksFileName)) {
            $cachedDate = $this->cacheFolder->lastModified($cachedWalksFileName);
            if ($cachedDate !== false) {
                $date = new DateTimeImmutable();
                $elapsed = $date->getTimestamp() - $cachedDate;
                if ($elapsed < 60 * 10) {
                    return READSOURCE::CACHE;
                }
            }
        }
        return READSOURCE::FEED;
    }

    private function convertResults($result, $feedurl) {
        if ($result === null) {
            return null;
        }
        if (!self::startsWith("$result", "{")) {
            self::errorMsg($feedurl, "JSON code does not start with {");
            return null;
        }
        $items = json_decode($result);
        if (json_last_error() === JSON_ERROR_NONE) {
            $properties = [];
            if (self::checkJsonFileProperties($items->data, $properties) > 0) {
                self::errorMsg($feedurl, "Expected properties not found in JSON feed");
                return null;
            }
        } else {
            self::errorMsg($feedurl, "Error when decoding JSON feed: " . json_last_error_msg());
            return null;
        }
        return $items;
    }

    private static function checkJsonFileProperties($json, $properties) {
        $errors = 0;
        foreach ($json as $item) {
            $ok = self::checkJsonProperties($item, $properties);
            $errors += $ok;
        }
        return $errors;
    }

    private static function checkJsonProperties($item, $properties) {
        foreach ($properties as $value) {
            if (!self::checkJsonProperty($item, $value)) {
                return 1;
            }
        }
        return 0;
    }

    private static function checkJsonProperty($item, $property) {
        if (property_exists($item, $property)) {
            return true;
        }
        return false;
    }

    private static function errorMsg($url, $msg) {
        $urlout = str_replace("&api-key=" . APIKEY, '', $url);
        $app = JFactory::getApplication();
        $app->enqueueMessage("Error reading walks: " . $msg . " " . $urlout, 'error');
    }

    private static function debugMsg($url, $msg) {
        $urlout = str_replace("&api-key=" . APIKEY, '', $url);
        $app = JFactory::getApplication();
        $app->enqueueMessage("Debug reading walks: " . $msg . " " . $urlout, 'Information');
    }

    private static function startsWith($string, $startString) {
        $len = strlen($startString);
        return (substr($string, 0, $len) === $startString);
    }

}

abstract class READSOURCE {

    const FEED = 'FEED';
    const CACHE = 'CACHE';

}
