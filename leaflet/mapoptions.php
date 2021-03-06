<?php

/**
 * Description of mapoptions
 *
 * @author Chris Vaughan
 */
class RLeafletMapoptions {

    public $cluster = false;
    public $fullscreen = false;
    public $google = false;
    public $search = false;
    public $locationsearch = false;
    public $osgrid = false;
    public $mouseposition = false;
    public $postcodes = false;
    public $fitbounds = false;
    public $draw = false;
    public $print = false;
    public $displayElevation = false;
    public $smartRoute = true;
    public $bing = false;
    public $ramblersPlaces = false;
    public $topoMapDefault = false;
    public $controlcontainer=false;

    public function __construct() {
        
    }

    public function text() {
        $options = "";
        //   $this->print = false;
       if (RLicense::isBingKeyMapSet()) {
            $options .= "ramblersMap.bingkey='" . RLicense::getBingMapKey() . "';" . PHP_EOL;
            $options .= "ramblersMap.options.bing = true;" . PHP_EOL;
        }
        if (RLicense::isGoogleKeyMapSet()) {
            $options .= "ramblersMap.googlekey='" . RLicense::getGoogleMapKey() . "';" . PHP_EOL;
            $options .= "ramblersMap.options.google = true;" . PHP_EOL;
        }
         if (RLicense::isOpenRoutingServiceKeySet()) {
            $options .= "ramblersMap.ORSkey='" . RLicense::getOpenRoutingServiceKey() . "';" . PHP_EOL;
        }
        if ($this->cluster) {
            $options .= "ramblersMap.options.cluster = true;" . PHP_EOL;
        }
        if ($this->fullscreen) {
            $options .= "ramblersMap.options.fullscreen = true;" . PHP_EOL;
        }
        if ($this->google) {
            $options .= "ramblersMap.options.google = true;" . PHP_EOL;
        }
        if ($this->search) {
            $options .= "ramblersMap.options.search = true;" . PHP_EOL;
        }
        if ($this->locationsearch) {
            $options .= "ramblersMap.options.locationsearch = true;" . PHP_EOL;
        }
        if ($this->osgrid) {
            $options .= "ramblersMap.options.osgrid = true;" . PHP_EOL;
        }
        if ($this->mouseposition) {
            $options .= "ramblersMap.options.mouseposition = true;" . PHP_EOL;
        }
        if ($this->postcodes) {
            $options .= "ramblersMap.options.postcodes = true;" . PHP_EOL;
        }
        if ($this->fitbounds) {
            $options .= "ramblersMap.options.fitbounds = true;" . PHP_EOL;
        }
        if ($this->draw) {
            $options .= "ramblersMap.options.draw = true;" . PHP_EOL;
        }
        if ($this->print) {
            $options .= "ramblersMap.options.print = true;" . PHP_EOL;
        }
        if ($this->displayElevation) {
            $options .= "ramblersMap.options.displayElevation = true;" . PHP_EOL;
        }
        if ($this->smartRoute) {
            $options .= "ramblersMap.options.smartRoute = true;" . PHP_EOL;
        }
        if ($this->ramblersPlaces) {
            $options .= "ramblersMap.options.ramblersPlaces = true;" . PHP_EOL;
        }
        if ($this->topoMapDefault) {
            $options .= "ramblersMap.options.topoMapDefault = true;" . PHP_EOL;
        }
           if ($this->controlcontainer) {
            $options .= "ramblersMap.options.controlcontainer = true;" . PHP_EOL;
        }
       
        return $options;
    }
}