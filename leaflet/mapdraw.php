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
        $this->options->setinitialviewView($lat, $long, $zoom);
    }

    public function display() {
        parent::setCommand('ra.display.plotRoute');
        if ($this->displayDescription) {
            echo "<div id='ra-description' class='clearfix'>";
            if (RLicense::isOpenRoutingServiceKeySet()) {
                echo $intro = file_get_contents(JURI::base() . "libraries/ramblers/leaflet/drawintrosmart.html");
            } else {
                echo $intro = file_get_contents(JURI::base() . "libraries/ramblers/leaflet/drawintro.html");
            }
            echo "</div>";
        }

        $this->help_page = "plot-walking-route.html";
        $this->options->fullscreen = true;
      
        $this->options->mouseposition = true;
        $this->options->rightclick = true;
        $this->options->fitbounds = true;
        $this->options->displayElevation = true;
        $this->options->cluster = null;
        $this->options->mylocation = true;
        $this->options->settings = true;
    //    $this->options->draw = true;
        $this->options->print = true;
      //  $this->options->ramblersPlaces = true;
        $this->options->latitude = $this->lat;
        $this->options->longitude = $this->long;
        $this->options->zoom = $this->zoom;

        parent::display();

        RLoad::addScript("libraries/ramblers/leaflet/ra.display.plotRoute.js", "text/javascript");
        RLoad::addStyleSheet("libraries/ramblers/leaflet/ra-gpx-tools.css", "text/css");
        RLoad::addStyleSheet('libraries/ramblers/jsonwalks/css/ramblerslibrary.css');
        RLoad::addScript("libraries/ramblers/leaflet/L.Control.GpxUpload.js", "text/javascript");
        RLoad::addScript("libraries/ramblers/leaflet/L.Control.GpxDownload.js", "text/javascript");
        RLoad::addScript("libraries/ramblers/leaflet/L.Control.ReverseRoute.js", "text/javascript");
        RLoad::addScript("libraries/ramblers/leaflet/L.Control.SmartRoute.js", "text/javascript");
        RLoad::addScript("libraries/ramblers/leaflet/L.Control.GpxSimplify.js", "text/javascript");

        $document = JFactory::getDocument();
        $path = "libraries/ramblers/vendors/Leaflet.draw-0.4.14/dist/";
        $document->addStyleSheet($path . "leaflet.draw.css", "text/css");
        $document->addScript($path . "leaflet.draw-src.js", "text/javascript");
        $document->addScript("libraries/ramblers/vendors/simplify-js-1.2.3/simplify.js", "text/javascript");
        $document->addScript("libraries/ramblers/vendors/blurt-1.0.2/dist/js/blurt.min.js", "text/javascript");
        $document->addStyleSheet("libraries/ramblers/vendors/blurt-1.0.2/dist/css/blurt.min.css", "text/css");
        $document->addScript("libraries/ramblers/vendors/FileSaver-js-1.3.8/src/FileSaver.js", "text/javascript");
    }

}
