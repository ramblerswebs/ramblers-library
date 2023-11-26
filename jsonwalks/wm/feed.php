<?php

/**
 * Description of feed
 *
 * @author Chris Vaughan
 */
// Live Site Definition Below
define("WALKMANAGER", "https://walks-manager.ramblers.org.uk/api/volunteers/walksevents?");

// API Key for the active site
define("APIKEY", "853aa876db0a37ff0e6780db2d2addee");
// no direct access
defined('_JEXEC') or die('Restricted access');

class RJsonwalksWmFeed {

    private $cacheLocation = 'ra_wm_feed';
    private $cacheFolder = null;

    public function __construct() {
        $this->cacheFolder = new RJsonwalksWmCachefolder($this->cacheLocation);
    }

    public function getGroupFutureItems($groups, $readwalks, $readevents, $readwellbeingwalks) {
        $feedOpts = new RJsonwalksWmUrloptions();
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
        $feedOpts = new RJsonwalksWmUrloptions();

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
        $cachedFileName = $this->cacheFolder->getCacheNameFromUrl($feedurl, "json");
        $cachedDateFileName = $this->cacheFolder->getCacheNameFromUrl($feedurl, "log.json");
        $source = $this->whereToGetWalksFrom($feedurl, $feedOpts, $cachedFileName, $cachedDateFileName);
        if ($debug) {
            $this->debugMsg($feedurl, "Reading data from " . $source);
        }
        switch ($source) {
            case READSOURCE::CACHE:
                $result = $this->readFile($cachedFileName);
                break;
            case READSOURCE::FEED:
                // read from feed and then cache data
                $result = $this->readFeed($feedurl);
                if ($result !== null) {
                    // cache file
                    $this->writeFile($cachedFileName, $result);
                } else {
                    // unable to read feed, try using cache
                    if (file_exists($cachedFileName)) {
                        $result = $this->readFile($cachedFileName);
                    }
                }
        }
        if ($result === null) {
            return [];
        }
        $items = $this->convertResults($result, $feedurl);
        if ($items === null) {
            return [];
        }
        return $items->data;
    }

    private function whereToGetWalksFrom($feedurl, $feedOpts, $cachedFileName, $cachedDateFileName) {
        $readwhich = READSOURCE::FEED;
        // get when Walks Manager was last updated/ raw data
        // we only need to check if the Organisation data has changed, if so read from WM feed
        if ($feedOpts->groupCode === null) {
            $datestamp = date('Y-m-d H:i:s');
            // make time stamp change every 10 seconds
            $wmlastUpdateRecord = substr($datestamp, 0, 15) . " AREA feed " . str_replace(APIKEY, 'xxxxx', $feedurl);
        } else {
            $wmlastUpdateRecord = $this->getOrganisationData($feedurl, $feedOpts, $cachedDateFileName);
        }
        if (file_exists($cachedDateFileName)) {
            // data is cached, read the cached WM last update date
            $cacheddate = $this->readFile($cachedDateFileName);
        } else {
            $cacheddate = "";
        }
        if ($cacheddate == $wmlastUpdateRecord) {
            // date WM was updated has not changed, so use cache if it exists
            if (file_exists($cachedFileName)) {
                $readwhich = READSOURCE::CACHE;
            } else {
                $readwhich = READSOURCE::FEED;
            }
        } else {
            // WM has been updated so read directly from the feed
            $readwhich = READSOURCE::FEED;
            $this->writeFile($cachedDateFileName, $wmlastUpdateRecord);
        }
        return $readwhich;
    }

    private function readFile($filename) {
        $result = file_get_contents($filename);
        return $result;
    }

    private function writeFile($filename, $data) {
        jimport('joomla.filesystem.file');
        JFile::write($filename, $data);
    }

    private function getOrganisationData($feedurl, $feedOpts, $cachedDateFileName) {
        // have we just read organisation data (last few seconds)
        $justRead = false;
        if (file_exists($cachedDateFileName)) {
            $timestamp = filemtime($cachedDateFileName);
            if ($timestamp !== false) {
                if (time() - $timestamp < 30) { // reread data every 60 seconds
                    $justRead = true;
                    //  $app = JFactory::getApplication();
                    //  $app->enqueueMessage("Using cached organisation data", 'information');
                }
            }
        }
        if ($justRead) {
            $wmlastUpdateRecord = $this->readFeed($cachedDateFileName);
        } else {
            $org = $this->getOrgData($feedOpts->groupCode);
            $org->feed = str_replace(APIKEY, 'xxxxx', $feedurl);
            $wmlastUpdateRecord = json_encode($org);
        }
        return $wmlastUpdateRecord;
    }

    Private function getOrgData($groups) {
        // If Groups is null then we are getting walks in an area
        // and it takes too long to get organisarion data for all groups
        $result = new stdClass();
        if ($groups !== null) {
            $organisation = new RJsonwalksWmOrganisation();
            $data = $organisation->getFeedRawData($groups);
            $groups = json_decode($data);
            if (json_last_error() === JSON_ERROR_NONE) {
                foreach ($groups as $group) {
                    $code = $group->group_code;
                    $result->$code = $group->date_walks_events_updated;
                }
            }
        }
        return $result;
    }

    private function readFeed($feedurl) {
        try {
            $result = file_get_contents($feedurl);
        } catch (Exception $e) {
            self::errorMsg($feedurl, "Unexpected Error occurred: " . $e->getMessage());
        }

        if ($result === false) {
            self::errorMsg($feedurl, "Read walks failed.");
            return null;
        }
        return $result;
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
        $urlout = str_replace("&api-key=".APIKEY, '', $url);
        $app = JFactory::getApplication();
        $app->enqueueMessage("Error reading walks: " . $msg . " " . $urlout, 'error');
    }

    private static function debugMsg($url, $msg) {
        $urlout = str_replace("&api-key=".APIKEY, '', $url);
        $app = JFactory::getApplication();
        $app->enqueueMessage("Debug reading walks: " . $msg . " " . $urlout, 'Information');
    }

    private function startsWith($string, $startString) {
        $len = strlen($startString);
        return (substr($string, 0, $len) === $startString);
    }

}

abstract class READSOURCE {

    const FEED = 'FEED';
    const CACHE = 'CACHE';

}
