<?php

class RLoad {

    public static function addScript($path, $type = "text/javascript") {
        $filemtime = filemtime($path);
        $document = JFactory::getDocument();
        $document->addScript($path . "?rev=" . $filemtime, array('type'=>$type));
    }

    public static function addStyleSheet($path, $type = "text/css") {
        $filemtime = filemtime($path);
        $document = JFactory::getDocument();
        $document->addStyleSheet($path . "?rev=" .$filemtime, array('type'=>$type));
    }

}