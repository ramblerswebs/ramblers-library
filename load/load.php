<?php

class RLoad {

    private static $revisionversion = "4.2.12";

    public static function addScript($path, $type = "text/javascript") {
        $document = JFactory::getDocument();
        $document->addScript($path . "?rev=" . self::$revisionversion, array('type'=>$type));
    }

    public static function addStyleSheet($path, $type = "text/css") {
        $document = JFactory::getDocument();
        $document->addStyleSheet($path . "?rev=" . self::$revisionversion, array('type'=>$type));
    }

}