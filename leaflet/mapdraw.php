<?php

/**
 * Description of mapdraw
 *
 * @author Chris Vaughan
 */
class RLeafletMapdraw extends RLeafletMap {

    private $zoom = 10;
    private $lat = 52.89;
    private $long = -1.48;
    public $displayDescription = true;

    public function __construct() {
        parent::__construct();
    }

    public function setCenter($lat, $long, $zoom) {
        $this->lat = $lat;
        $this->long = $long;
        $this->zoom = $zoom;
    }

    public function display() {
        parent::setCommand('plotWalkingRoute');
        if ($this->displayDescription) {
            echo "<div id='ra-description' class='clearfix'>";
            if (RLicense::isOpenRoutingServiceKeySet()) {
                echo $intro = file_get_contents(JURI::base() . "libraries/ramblers/leaflet/drawintrosmart.html");
            } else {
                echo $intro = file_get_contents(JURI::base() . "libraries/ramblers/leaflet/drawintro.html");
            }
            echo "</div>";
        }

        $this->help_page = "draw-walking-route.html";
        $this->options->fullscreen = true;
        $this->options->search = true;
        $this->options->locationsearch = true;
        $this->options->osgrid = true;
        $this->options->mouseposition = true;
        $this->options->rightclick = true;
        $this->options->fitbounds = true;
        $this->options->displayElevation = true;
        $this->options->cluster = false;
        $this->options->mylocation = true;
        $this->options->maptools = true;
        $this->options->draw = true;
        $this->options->print = true;
        $this->options->ramblersPlaces = true;
        $this->options->latitude = $this->lat;
        $this->options->longitude = $this->long;
        $this->options->zoom = $this->zoom;

        parent::display();

        RLoad::addScript("libraries/ramblers/leaflet/ra-gpx-drawcontrol.js", "text/javascript");
        RLoad::addStyleSheet("libraries/ramblers/leaflet/ra-gpx-tools.css", "text/css");
        RLoad::addStyleSheet('libraries/ramblers/jsonwalks/css/ramblerswalks.css');
        RLoad::addScript("libraries/ramblers/leaflet/maplist.js", "text/javascript");
        RLoad::addScript("libraries/ramblers/leaflet/ra-gpx-upload.js", "text/javascript");
        RLoad::addScript("libraries/ramblers/leaflet/ra-gpx-download.js", "text/javascript");
        RLoad::addScript("libraries/ramblers/leaflet/ra-gpx-reverse-route.js", "text/javascript");
        RLoad::addScript("libraries/ramblers/leaflet/ra-gpx-smart-route.js", "text/javascript");
        RLoad::addScript("libraries/ramblers/leaflet/ra-gpx-simplify.js", "text/javascript");

        $document = JFactory::getDocument();
        $path = "libraries/ramblers/vendors/Leaflet.draw-1.0.4/dist/";
        $document->addStyleSheet($path . "leaflet.draw.css", "text/css");
        $document->addScript($path . "leaflet.draw-src.js", "text/javascript");
        $document->addScript("libraries/ramblers/vendors/simplify-js-1.2.3/simplify.js", "text/javascript");
        $document->addScript("libraries/ramblers/vendors/blurt-1.0.2/dist/js/blurt.min.js", "text/javascript");
        $document->addStyleSheet("libraries/ramblers/vendors/blurt-1.0.2/dist/css/blurt.min.css", "text/css");
        $document->addScript("libraries/ramblers/vendors/FileSaver-js-1.3.8/src/FileSaver.js", "text/javascript");
    }

}
