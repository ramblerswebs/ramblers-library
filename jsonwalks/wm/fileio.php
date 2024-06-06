<?php

/**
 * Description of fileio
 *
 * @author Chris Vaughan
 */
class RJsonwalksWmFileio {

    private static $lastError = "";
    private static $lastTimeElapsedSecs = 0;
    private static $secretStrings = [];

    public static function setSecretStrings($values) {
        self::$secretStrings = $values;
    }

    public static function getLastTimeElapsedSecs() {
        return self::$lastTimeElapsedSecs;
    }

    public static function getLastError() {
        return self::$lastError;
    }

    public static function readFile($url) {
        self::$lastError = "";
        $start = microtime(true);
        $result = file_get_contents($url);
        self::$lastTimeElapsedSecs = microtime(true) - $start;
        if ($result === false) {
            $e = error_get_last();
            self::$lastError = self::removeSecretStrings($e['message']);
        }

        return $result;
    }

    public static function writeFile($filename, $data) {
        jimport('joomla.filesystem.file');
        JFile::write($filename, $data);
    }

    private static function removeSecretStrings($str) {
        $out = $str;
        foreach (self::$secretStrings as $value) {
            $out = str_replace($value, '???', $out);
        }
        return $out;
    }

    public static function errorMsg($msg) {
    //    $app = JFactory::getApplication();
    //    $app->enqueueMessage($msg . self::$lastError, 'error');
        RErrors::notifyError($msg. self::$lastError, "Walks Manager", 'error' );
    }

}
