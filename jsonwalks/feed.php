<?php

/**
 * @version		0.0
 * @package		Simple JSON Feed reader
 * @author              Chris Vaughan Ramblers-webs.org.uk
 * @copyright           Copyright (c) 2014 Chris Vaughan. All rights reserved.
 * @license		GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */
// no direct access
defined('_JEXEC') or die('Restricted access');

class RJsonwalksFeed {

    private $walks;
    private $rafeedurl;
    private $feederror;
    private $feednotfound;

    function __construct($rafeedurl) {
        $this->rafeedurl = strtolower($rafeedurl);
        $this->feederror = "Invalid walks feed (invalid json format): " . $this->rafeedurl;
        $this->feednotfound = "Walks feed error(url not found): " . $this->rafeedurl;
        $this->walks = new RJsonwalksWalks(NULL);
        $this->readFeed($rafeedurl);
    }

    private function readFeed($rafeedurl) {
        $CacheTime = 60; // minutes
        $cacheLocation = $this->CacheLocation();
        $srfr = new RFeedhelper($cacheLocation, $CacheTime);
        $contents = $srfr->getFeed($rafeedurl);
        switch ($contents) {
            case NULL:
                echo '<b>Walks feed: Unable to read feed: ' . $rafeedurl . '</b>';
                break;
            case "":
                echo '<b>Walks feed: No walks found</b>';
                break;
            case "[]":
                echo '<b>Walks feed empty: No walks found</b>';
                break;
            default:
                $json = json_decode($contents);
                unset($contents);
                $error = 0;
                if (json_last_error() == JSON_ERROR_NONE) {
                    foreach ($json as $value) {
                        $ok = $this->checkJsonProperties($value);
                        $error+=$ok;
                    }
                    if ($error > 0) {
                        echo '<br/><b>Walks feed: Json file format not supported</b>';
                    } else {
                        $this->walks = new RJsonwalksWalks($json);
                    }
                    unset($json);
                    break;
                } else {
                    echo '<br/><b>Walks feed: feed is not in Json format</b>';
                }
        }
    }

    function setNewWalks($days) {
        $this->walks->setNewWalks($days);
    }

    function filterGroups($filter) {
        $this->walks->filterGroups($filter);
    }

    function filterStrands($filter) {
        $this->walks->filterStrands($filter);
    }

    function filterFestivals($filter) {
        $this->walks->filterFestivals($filter);
    }

    function filterDayofweek($days) {
        $this->walks->filterDayofweek($days);
    }

    function noWalks($no) {
        $this->walks->noWalks($no);
    }

    function walksInFuture($period) {
        $this->walks->walksInFuture($period);
    }

    function display($displayclass) {
        if ($this->walks == null) {
            return;
        }
        if ($this->walks->totalWalks() == 0) {
            return;
        }
        $printOn = JRequest::getVar('print') == 1;
        if ($printOn) {
            $doc = JFactory::getDocument();
            $style = 'BODY {color: #000000;}';
            $doc->addStyleDeclaration($style);
        }
        $displayclass->DisplayWalks($this->walks);
    }

    function getWalks() {
        return $this->walks;
    }

    function clearCache() {
        $cacheFolderPath = $this->CacheLocation();
// Check if the cache folder exists
        if (file_exists($cacheFolderPath) && is_dir($cacheFolderPath)) {
// clear files from folder
            $files = glob($cacheFolderPath . '/*'); // get all file names
            echo "<h2>Feed cache has been cleared</h2>";
            foreach ($files as $file) { // iterate files
                if (is_file($file)) {
                    unlink($file); // delete file}
                }
            }
        }
// reread feed
        $this->readFeed($this->rafeedurl);
    }

    private function checkJsonProperties($item) {
        $properties = array("id", "status", "difficulty", "strands", "linkedEvent", "festivals",
            "walkContact", "linkedWalks", "linkedRoute", "title", "description", "groupCode", "groupName",
            "additionalNotes", "date", "distanceKM", "distanceMiles", "finishTime", "suitability",
            "surroundings", "theme", "specialStatus", "facilities", "pace", "ascentMetres", "ascentFeet",
            "gradeLocal", "attendanceMembers", "attendanceNonMembers", "attendanceChildren", "cancellationReason",
            "dateUpdated", "dateCreated", "media", "points", "groupInvite", "isLinear", "url");

        foreach ($properties as $value) {
            if (!$this->checkJsonProperty($item, $value)) {
                return 1;
            }
        }

        return 0;
    }

    private function checkJsonProperty($item, $property) {
        if (property_exists($item, $property)) {
            return true;
        }
        return false;
    }

    private function CacheLocation() {
        if (!defined('DS')) {
            define('DS', DIRECTORY_SEPARATOR);
        }
        return 'cache' . DS . 'ra_feed';
    }

}
