<?php

/**
 * Description of feedupdate
 *
 * @author Chris Vaughan
 */
define("WALKMANAGERGROUPS", "https://walks-manager.ramblers.org.uk/api/volunteers/groups?");

class RJsonwalksWmOrganisation {

    private $cacheFolder = null;
    private $apiKey = null;

    public function __construct($cacheFolder, $apiKey) {
        $this->cacheFolder = $cacheFolder;
        $this->apiKey = $apiKey;
    }

    public function whereToGetWalksFrom($feedOpts) {
        // get when Walks Manager was last updated/ raw data
        // we only need to check if the Organisation data has changed, if so read from WM feed
        $cachedOrgFileName = $feedOpts->getCacheFileName("org.json");
        $readwhich = READSOURCE::FEED;
        $cachedUpdateRecord = "";
        if ($this->cacheFolder->fileExists($cachedOrgFileName)) {
            // data is cached, read the cached WM last update date
            // have we just read organisation data (last few seconds)    
            $cachedDate = $this->cacheFolder->lastModified($cachedOrgFileName);
            if ($cachedDate !== false) {
                $date = new DateTimeImmutable();
                $elapsed = $date->getTimestamp() - $cachedDate;
                if ($elapsed < 60) {
                    return READSOURCE::CACHE;
                }
            }
            $cachedUpdateRecord = $this->cacheFolder->readFile($cachedOrgFileName);
        }
        if ($feedOpts->groupCode === null) {
            $datestamp = date('Y-m-d H:i:s');
            // make time stamp change every 10 seconds
            $wmlastUpdateRecord = substr($datestamp, 0, 15) . " AREA feed " . str_replace(APIKEY, 'xxxxx', $feedurl);
        } else {
            $wmlastUpdateRecord = $this->getOrganisationData($feedOpts);
        }
        $this->cacheFolder->writeFile($cachedOrgFileName, $wmlastUpdateRecord);
        if ($cachedUpdateRecord === $wmlastUpdateRecord) {
            // date WM was updated has not changed, so use cache preferred
            $readwhich = READSOURCE::CACHE;
        } else {
            // WM has been updated so read directly from the feed
            $readwhich = READSOURCE::FEED;
        }
        return $readwhich;
    }

    private function getOrganisationData($feedOpts) {
        $groups = $feedOpts->groupCode;
        $groupData = new stdClass();
        if ($groups === null) {
            // If Groups is null then we are getting walks in an area
            // and it takes too long to get organisarion data for all groups
            $groupData->time = time() / 60; // divide by how often you wish to refresh the feed in seconds
        }
        if ($groups !== null) {
            $feedUrl = WALKMANAGERGROUPS . "groups=" . strtoupper($groups) . "&api-key=" . $this->apiKey;
            $result = RJsonwalksWmFileio::readFile($feedUrl);
            if (RJsonwalksWmFileio::getLastTimeElapsedSecs() > 2) {
                $app = JFactory::getApplication();
                $app->enqueueMessage("Reading organisation data for groups: " . strtoupper($groups) . ") took " . RJsonwalksWmFileio::getLastTimeElapsedSecs() . " seconds", 'information');
            }
            if ($result === false) {
                $groupData->errorMsg = "Error when checking if walks programme has been updated";
                RJsonwalksWmFileio::errorMsg($groupData->errorMsg);
            } else {
                if (!self::startsWith($result, "[")) {
                    RJsonwalksWmFileio::errorMsg("Returned JSON string does not start with [");
                } else {
                    $groups = json_decode($result);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $groups = $this->removeProperties($groups);
                    }
                }
            }
        }
        return json_encode($groups, JSON_PRETTY_PRINT);
    }

    private function removeProperties($groups) {
        foreach ($groups as $group) {
            foreach ($group as $key => $value) {
                switch ($key) {
                    case "group_code":
                    case "name":
                    case "date_walks_events_updated":
                        break;
                    default:
                        unset($group->$key);
                }
            }
        }
        return $groups;
    }

    private function startsWith($string, $startString) {
        $len = strlen($startString);
        return (substr($string, 0, $len) === $startString);
    }

}
