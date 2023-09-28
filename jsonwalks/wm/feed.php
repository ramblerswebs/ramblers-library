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
        $items = $this->getFeed($feedOpts);
        return $items;
    }

    public function getGroupPastItems($groups, $startdate, $enddate, $readwalks, $readevents, $readwellbeingwalks) {
        $feedOpts = new RJsonwalksWmUrloptions();
        $feedOpts->groupCode = $groups;
        $feedOpts->date_end = $enddate;
        $feedOpts->date_start = $startdate;
        $feedOpts->include_walks = $readevents;
        $feedOpts->include_events = $readwalks;
        $feedOpts->include_wellbeing_walks = $readwellbeingwalks;
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
        $debug = true;
        $feedurl = $feedOpts->getFeedURL();
        $cachedFileName = $this->cacheFolder->getCacheNameFromUrl($feedurl, "json");
        $cachedDateFileName = $this->cacheFolder->getCacheNameFromUrl($feedurl, "log");
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
            $wmlastUpdateRecord = $this->getOrgRawData($feedOpts->groupCode) . " GROUP feed " . str_replace(APIKEY, 'xxxxx', $feedurl);
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

    Private function getLastUpdate($groups) {
        $organisation = new RJsonwalksWmOrganisation();
        return $organisation->getWhenUpdated($groups);
    }

    Private function getOrgRawData($groups) {
        // If Groups is null then we are getting walks in an area
        // and it takes too long to get organisarion data for all groups
        if ($groups !== null) {
            $organisation = new RJsonwalksWmOrganisation();
            return $organisation->getFeedRawData($groups);
        } else {

            return "";
        }
    }

    private function readFeed($feedurl) {
        $result = file_get_contents($feedurl);
        if ($result === false) {
            self::errorMsg($feedurl, "Read feed, file_get_contents, failed. ");
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
        if (json_last_error() == JSON_ERROR_NONE) {
            $properties = [];
            if (self::checkJsonFileProperties($items->data, $properties) > 0) {
                self::errorMsg($feedurl, "Expected properties not found in JSON feed");
                return null;
            }
        } else {
            self::errorMsg($feedurl, "Error when decoding JSON feed");
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
        $urlout = str_replace(APIKEY, 'xxxxx', $url);
        $app = JFactory::getApplication();
        $app->enqueueMessage("Error reading walks: " . $msg . " " . $urlout, 'error');
    }

    private static function debugMsg($url, $msg) {
        $urlout = str_replace(APIKEY, 'xxxxx', $url);
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
