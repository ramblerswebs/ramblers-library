<?php

/**
 * Enable web master to specify a Google license key to enable google mapping
 *
 * @author Chris Vaughan
 */
class RLicense {

    private static $googlelicensekey = "undefined";
    private static $binglicensekey = "undefined";

    public static function GoogleMapKey($value) {
        self::$googlelicensekey = $value;
    }

    public static function getGoogleMapKey() {
        return self::$googlelicensekey;
    }

    public static function isGoogleKeyMapSet() {
        return false;
        //   return self::$googlelicensekey != "undefined";
    }

    public static function BingMapKey($value) {
        self::$binglicensekey = $value;
    }

    public static function getBingMapKey() {
        return self::$binglicensekey;
        // return  $key='AkD_CLFHRmiumGnu7sGZ4bR7gNGlbEWO3WSSOTASUbMtQ8J4On9WxSbEJkwPO_uy';
    }

    public static function isBingKeyMapSet() {
        //   return false;
        return self::$binglicensekey != "undefined";
    }

}
