<?php

/**
 * Enable web master to specify a Google license key to enable google mapping
 *
 * @author Chris Vaughan
 */
class RLicense {

    private static $licensekey = "undefined";

    public static function GoogleMapKey($value) {
        self::$licensekey = $value;
    }

    public static function getGoogleMapKey() {
        return self::$licensekey;
    }

    public static function isGoogleKeyMapSet() {
        return self::$licensekey != "undefined";
    }

}
