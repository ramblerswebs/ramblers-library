<?php

/**
 * Enable web master to specify license keys
 *
 * @author Chris Vaughan
 */
class RLicense {

    private static $openRoutingServicelicensekey = "undefined";
    private static $binglicensekey = true;

    public static function GoogleMapKey($value) {
        // self::$googlelicensekey = $value;
    }

    public static function getGoogleMapKey() {
        return "undefined";
    }

    public static function isGoogleKeyMapSet() {
        return false;
    }

    public static function OpenRoutingServiceKey($value) {
        self::$openRoutingServicelicensekey = $value;
    }

    public static function getOpenRoutingServiceKey() {
        return self::$openRoutingServicelicensekey;
    }

    public static function isOpenRoutingServiceKeySet() {
        return self::$openRoutingServicelicensekey != "undefined";
    }

    public static function BingMapKey($value) {
        self::$binglicensekey = $value;
    }

    public static function getBingMapKey() {
        // return self::$binglicensekey;
        if (strpos(JURI::base(), 'localhost') !== false) {
            return $key = 'AjtUzWJBHlI3Ma_Ke6Qv2fGRXEs0ua5hUQi54ECwfXTiWsitll4AkETZDihjcfeI';
        } else {
            return $key = 'AslaaoNJXOTEF-i8IS4cWAWnsxOuTqna5IZXJSNh-H45Nlmt5YF5olfmv-AiGg97';
        }
    }

    public static function isBingKeyMapSet() {
        //   return false;
        return true;
    }

}
