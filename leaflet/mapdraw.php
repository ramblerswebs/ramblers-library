<?php

/**
 * Description of mapdraw
 *
 * @author Chris Vaughan
 */
class RLeafletMapdraw extends RLeafletMap {

    public $displayDescription = true;

    public function __construct() {
        parent::__construct();
        $this->options->setinitialviewView(52.89, -1.48, 10);
    }

    public function setCenter($lat, $long, $zoom) {
        $this->options->setinitialviewView($lat, $long, $zoom);
    }

    public function display() {
        parent::setCommand('ra.display.plotRoute');
        $this->help_page = "plot-walking-route.html";
        $this->options->fullscreen = true;

        $this->options->mouseposition = true;
        $this->options->rightclick = true;
        $this->options->fitbounds = true;
        $this->options->displayElevation = true;
        $this->options->cluster = null;
        $this->options->mylocation = true;
        $this->options->settings = true;
        $this->options->print = true;

        parent::display();

        RLoad::addScript("media/lib_ramblers/leaflet/ra.display.plotRoute.js", "text/javascript");
        RLoad::addStyleSheet("media/lib_ramblers/leaflet/ra-gpx-tools.css", "text/css");
        RLoad::addStyleSheet('media/lib_ramblers/css/ramblerslibrary.css');
        RLoad::addScript("media/lib_ramblers/leaflet/L.Control.GpxUpload.js", "text/javascript");
        RLoad::addScript("media/lib_ramblers/leaflet/L.Control.GpxDownload.js", "text/javascript");
        RLoad::addScript("media/lib_ramblers/leaflet/L.Control.ReverseRoute.js", "text/javascript");
        RLoad::addScript("media/lib_ramblers/leaflet/L.Control.SmartRoute.js", "text/javascript");
        RLoad::addScript("media/lib_ramblers/leaflet/L.Control.GpxSimplify.js", "text/javascript");
        RLoad::addStyleSheet('media/lib_ramblers/css/ra.tabs.css');
        RLoad::addScript("media/lib_ramblers/js/ra.tabs.js");

        $document = JFactory::getDocument();
        $path = "media/lib_ramblers/vendors/Leaflet.draw-1.0.4/dist/";
        $document->addStyleSheet($path . "leaflet.draw.css", "text/css");
        RLoad::addScript($path . "leaflet.draw-src.js", "text/javascript");
        RLoad::addScript("media/lib_ramblers/vendors/simplify-js-1.2.3/simplify.js", "text/javascript");
        RLoad::addScript("media/lib_ramblers/vendors/FileSaver-js-1.3.8/src/FileSaver.js", "text/javascript");
    }
}
