<?php

class RLoad {

    public static function addScript($path, $type = "text/javascript") {
        if (!str_starts_with($path, "http")) {
            $filemtime = filemtime($path);
        } else {
            $filemtime = 0;
        }
        $document = JFactory::getDocument();
        $document->addScript($path . "?rev=" . $filemtime, array('type' => $type));
    }

    public static function addStyleSheet($path, $type = "text/css") {
        if (!str_starts_with($path, "http")) {
            $filemtime = filemtime($path);
        } else {
            $filemtime = 0;
        }
        $document = JFactory::getDocument();
        $document->addStyleSheet($path . "?rev=" . $filemtime, array('type' => $type));
    }
}
