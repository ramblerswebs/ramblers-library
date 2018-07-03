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
    private $help;

    public function __construct() {
        parent::__construct();
        $template = "ramblers/leaflet/ra-gpx-draw-help.html";
        $this->help = new RHtmlTemplate($template);
    }

    public function setCenter($lat, $long, $zoom) {
        $this->lat = $lat;
        $this->long = $long;
        $this->zoom = $zoom;
    }

    public function display() {
        $this->options->fullscreen = true;
        $this->options->search = true;
        $this->options->locationsearch = true;
        $this->options->osgrid = true;
        $this->options->mouseposition = true;
        $this->options->postcodes = true;
        $this->options->fitbounds = true;
        $this->options->displayElevation = true;
        $this->options->cluster = false;
        $this->options->draw = true;
        $this->options->print = true;
        $this->options->bing = true;
        $this->options->ramblersPlaces = true;
 //       $this->help->insertTemplate();
        $text = "addDrawControl($this->lat,$this->long,$this->zoom)";
        parent::addContent($text);
        parent::display();
        echo "<br/>";
    }

}
