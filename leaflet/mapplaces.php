<?php

/**
 *  This function displays all meeting and starting location that are valid
 *    i.e. 1 start or greater
 * 
 *
 * @author Chris Vaughan
 */
class RLeafletMapplaces extends RLeafletMap {

    public function __construct() {
        parent::__construct();
    }

    public function display() {
        parent::setCommand('ra.display.places');

        $this->help_page = "places-help-home.html";
        $this->options->fullscreen = true;
        $this->options->mouseposition = true;
        $this->options->rightclick = true;
        $this->options->fitbounds = true;
        $this->options->displayElevation = true;
        $this->options->cluster = false;
        $this->options->mylocation = true;
        $this->options->settings = true;
        $this->options->draw = false;
        $this->options->print = true;
       // $this->options->ramblersPlaces = true;
    
        parent::display();

        RLoad::addScript("libraries/ramblers/leaflet/ra-display-places.js", "text/javascript");
    //    RLoad::addStyleSheet("libraries/ramblers/leaflet/ra-gpx-tools.css", "text/css");
        RLoad::addStyleSheet('libraries/ramblers/jsonwalks/css/ramblerslibrary.css');

    //    $document = JFactory::getDocument();
    //    $path = "libraries/ramblers/vendors/Leaflet.draw-1.0.4/dist/";
    //    $document->addStyleSheet($path . "leaflet.draw.css", "text/css");
    }
}