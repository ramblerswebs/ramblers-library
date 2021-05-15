<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class RJsScript {

    private $command = 'noDirectAction';
    private $dataObject = null;

    public function __construct() {
        
    }

    public function setCommand($command) {
        $this->command = $command;
    }

    public function setDataObject($value) {
        $this->dataObject = $value;
    }

    public function add($options) {
        $document = JFactory::getDocument();
        $options->setLicenses();
        if ($this->command !== "noDirectAction") {
            echo "<div id='" . $options->divId . "'></div>" . PHP_EOL;
        }
        $text = "window.addEventListener('load', function () {" . PHP_EOL;
        $text .= "var mapOptions='" . addslashes(json_encode($options)) . "';" . PHP_EOL;
        // set data object for this command      
        if ($this->dataObject !== null) {
            $text .= "var data='" . addslashes(json_encode($this->dataObject)) . "';" . PHP_EOL;
        } else {
            $text .= "var data=null;" . PHP_EOL;
        }

        $text .= $this->command . "(mapOptions,data)});" . PHP_EOL;
        $document->addScriptDeclaration($text, "text/javascript");

        $this->addScriptsandStyles($options);
    }

    private function addScriptsandStyles($options) {

        JHtml::_('jquery.framework');

        $document = JFactory::getDocument();
        $document->addScript("libraries/ramblers/js/ra.js", "text/javascript");
        // Leaflet
        $document->addStyleSheet("libraries/ramblers/vendors/leaflet1.7/leaflet.css", "text/css");
        $document->addScript("libraries/ramblers/vendors/leaflet1.7/leaflet.js", "text/javascript");
        $document->addScript("libraries/ramblers/leaflet/ramblersleaflet.js", "text/javascript");
        $document->addStyleSheet("libraries/ramblers/leaflet/ramblersleaflet.css", "text/css");

//        if ($options->locationsearch) {
//            $document->addStyleSheet("libraries/ramblers/leaflet/Control.Locationsearch.css", "text/css");
//            $document->addScript("libraries/ramblers/leaflet/Control.Locationsearch.js", "text/javascript");
//        }
        if ($options->fullscreen) {
            $path = "libraries/ramblers/vendors/Leaflet.fullscreen-1.0.2/dist/";
            $document->addScript($path . "Leaflet.fullscreen.min.js", "text/javascript");
            $document->addStyleSheet($path . "leaflet.fullscreen.css", "text/css");
        }

        if ($options->rightclick) {
            // Mapcodes        
            //     $document->addScript("libraries/ramblers/vendors/mapcode-js-2.4.1/mapcode.js", "text/javascript");
            //     $document->addScript("libraries/ramblers/vendors/mapcode-js-2.4.1/ndata.js", "text/javascript");
        }

        if ($options->displayElevation) {
            // elevation
            $document->addScript("https://d3js.org/d3.v3.min.js", "text/javascript");
            $path = "libraries/ramblers/vendors/Leaflet.Elevation-0.0.4-ra/";
            $document->addScript($path . "leaflet.elevation-0.0.4.src.js", "text/javascript");
            $document->addStyleSheet($path . "elevation.css", "text/css");
            $document->addScript("libraries/ramblers/vendors/leaflet-gpx-1.3.1/gpx.js", "text/javascript");
        }
        if (RLicense::isGoogleKeyMapSet()) {
            // Google
            $document->addScript("https://maps.googleapis.com/maps/api/js?key=" . RLicense::getGoogleMapKey(), "text/javascript", true, true);
            $document->addScript("libraries/ramblers/vendors/Leaflet.GridLayer.GoogleMutant/Leaflet.GoogleMutant.js", "text/javascript");
            $document->addScript("libraries/ramblers/vendors/es6-promise-vv4.2.3/dist/es6-promise.auto.js", "text/javascript");
            //    $document->map->replaceString("// [set addGoogle]", "ramblersMap.options.google=true;");
        }
        if ($options->cluster) {
            // clustering
            $path = "libraries/ramblers/vendors/Leaflet.markercluster-1.4.1/dist/";
            $document->addStyleSheet($path . "MarkerCluster.css", "text/css");
            $document->addStyleSheet($path . "MarkerCluster.Default.css", "text/css");
            $document->addScript($path . "leaflet.markercluster.js", "text/javascript");
        }
        if ($options->mouseposition or $options->rightclick) {
            $document->addScript("libraries/ramblers/leaflet/L.Control.Mouse.js", "text/javascript");
            $document->addStyleSheet("libraries/ramblers/leaflet/L.Control.Mouse.css", "text/css");
        }

        if ($options->mouseposition or $options->osgrid or $options->rightclick) {
            // grid ref to/from lat/long
            $document->addScript("libraries/ramblers/vendors/geodesy/vector3d.js", "text/javascript");
            $document->addScript("libraries/ramblers/vendors/geodesy/latlon-ellipsoidal.js", "text/javascript");
            $document->addScript("libraries/ramblers/vendors/geodesy/osgridref.js", "text/javascript");
        }

        if (RLicense::isBingKeyMapSet()) {
            // Bing maps
            $document->addScript("libraries/ramblers/vendors/bing/bing.js", "text/javascript");
        }

        if ($options->print) {
            $path = "libraries/ramblers/vendors/leaflet.browser.print-1/src/";
            $document->addScript($path . "leaflet.browser.print.js", "text/javascript");
            $document->addScript($path . "leaflet.browser.print.sizes.js", "text/javascript");
            $document->addScript($path . "leaflet.browser.print.utils.js", "text/javascript");
        }
        $document->addScript("libraries/ramblers/js/ra.js", "text/javascript");
        $document->addScript("libraries/ramblers/js/raMap.js", "text/javascript");
        $document->addScript("libraries/ramblers/js/raWalk.js", "text/javascript");
        $document->addScript("libraries/ramblers/js/raLocation.js", "text/javascript");
        $document->addScript("libraries/ramblers/leaflet/ra-map-mylocation.js", "text/javascript");

        $document->addScript("libraries/ramblers/leaflet/ra-container.js", "text/javascript");


        // tools
        $document->addStyleSheet("libraries/ramblers/leaflet/ra-map-tools.css", "text/css");
        $document->addScript("libraries/ramblers/leaflet/ra-map-tools.js", "text/javascript");
        $document->addScript("libraries/ramblers/js/feedhandler.js", "text/javascript");
    }

}
