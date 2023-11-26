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

    public function getFeedRawData($groups) {
        $feed = WALKMANAGERGROUPS . "groups=" . strtoupper($groups) . "&api-key=" . APIKEY2;
        try {
            $json = file_get_contents($feed);
            if ($json === false) {
                self::errorMsg($feed, "Read feed, file_get_contents, failed");
                return '';
            } else {
                if (!self::startsWith($json, "[")) {
                    self::errorMsg($feed, "Returned JSON string does not start with [");
                }
            }
        } catch (Exception $ex) {
            self::errorMsg($feed, "Unexpected Error occurred: " . $ex->getMessage());
            return "";
        }
        return $json;
    }


    private static function errorMsg($url, $msg) {
        $urlout = str_replace("&api-key=" . APIKEY2, '', $url);
        $app = JFactory::getApplication();
        $app->enqueueMessage("Unable to check if walks have been updated: " . $msg . " - URL:  " . $urlout, 'error');
    }

    private function startsWith($string, $startString) {
        $len = strlen($startString);
        return (substr($string, 0, $len) === $startString);
    }

}
