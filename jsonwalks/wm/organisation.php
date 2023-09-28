<?php

/**
 * Description of feedupdate
 *
 * @author Chris Vaughan
 */
define("WALKMANAGERGROUPS", "https://walks-manager.ramblers.org.uk/api/volunteers/groups?");
define("APIKEY2", "853aa876db0a37ff0e6780db2d2addee");

class RJsonwalksWmOrganisation {

    public function __construct() {
        
    }

    public function getWhenUpdated($groups) {
        $date = "1970-01-01T00:00:00";
        $feed = WALKMANAGERGROUPS . "groups=" . strtoupper($groups) . "&api-key=" . APIKEY2;
        try {
            $data = $this->getFeedData($feed);
            foreach ($data as $item) {
                if ($item->date_walks_events_updated > $date) {
                    $date = $item->date_walks_events_updated;
                }
            }
        } catch (Exception $ex) {
            self::errorMsg($feed, "Unexpected Error occurred: " . $ex->getMessage());
        }

        return $date;
    }

    public function getFeedRawData($groups) {
        $feed = WALKMANAGERGROUPS . "groups=" . strtoupper($groups) . "&api-key=" . APIKEY2;
        try {
            $json = file_get_contents($feed);
            if ($json === false) {
                self::errorMsg($feed, "Read feed, file_get_contents, failed");
                return '';
            } else {
                if (!self::startsWith("$json", "[")) {
                    self::errorMsg($feed, "Returned JSON string does not start with [");
                }
            }
        } catch (Exception $ex) {
            self::errorMsg($feed, "Unexpected Error occurred: " . $ex->getMessage());
            return "";
        }
        return $json;
    }

    private function getFeedData($feedurl) {
        $json = file_get_contents($feedurl);
        if ($json === false) {
            self::errorMsg($feedurl, "Read feed, file_get_contents, failed");
            return [];
        } else {
            if (!self::startsWith("$json", "[")) {
                self::errorMsg($feedurl, "Returned JSON string does not start with [");
                return [];
            }
        }
        $data = json_decode($json);
        if (json_last_error() !== JSON_ERROR_NONE) {
            self::errorMsg($feedurl, "Error when decoding JSON feed");
            return [];
        }
        return $data;
    }

    private static function errorMsg($url, $msg) {
        $urlout = str_replace(APIKEY2, 'xxxxx', $url);
        $app = JFactory::getApplication();
        $app->enqueueMessage("Unable to check if walks have been updated: " . $msg . " - URL:  " . $urlout, 'error');
    }

    private function startsWith($string, $startString) {
        $len = strlen($startString);
        return (substr($string, 0, $len) === $startString);
    }

}
