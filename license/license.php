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
        return self::$googlelicensekey != "undefined";
    }

    public static function BingMapKey($value) {
        self::$binglicensekey = $value;
    }

    public static function getBingMapKey() {
        return self::$binglicensekey;
    }

    public static function isBingKeyMapSet() {
        return self::$binglicensekey != "undefined";
    }

}
