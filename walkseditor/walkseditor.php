<?php

defined('_JEXEC') or die;

use \Joomla\CMS\Factory;

class RWalkseditor {

    public static function addScriptsandCss() {

        JHtml::_('jquery.framework');
        RLoad::addStyleSheet("libraries/ramblers/jsonwalks/css/ramblerslibrary.css", "text/css");

        $path = "libraries/ramblers/walkseditor/";
        //RLoad::addScript($path . "js/programmeitems.js", "text/javascript");
        RLoad::addScript($path . "js/walk.js", "text/javascript");
        RLoad::addScript($path . "js/inputfields.js", "text/javascript");
        RLoad::addScript($path . "js/loader.js", "text/javascript");
        RLoad::addScript($path . "js/maplocation.js", "text/javascript");
        RLoad::addScript($path . "js/placeEditor.js", "text/javascript");
        RLoad::addScript($path . "js/comp/viewAllWalks.js", "text/javascript");
        RLoad::addScript($path . "js/walkeditor.js", "text/javascript");
        RLoad::addScript($path . "js/walksEditorHelps.js", "text/javascript");
        RLoad::addStyleSheet($path . "css/style.css", "text/css");

      //  RLoad::addScript($path . "js/walksprogramme.js", "text/javascript");
        RLoad::addScript($path . "js/viewWalks.js", "text/javascript");
        $doc = Factory::getDocument();
        $doc->addScript("https://cdn.quilljs.com/1.3.6/quill.js");
        $doc->addStyleSheet("https://cdn.quilljs.com/1.3.6/quill.snow.css", "text/css");
    }

}
