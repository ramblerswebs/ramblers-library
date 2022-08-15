<?php

/**
 * Description of mapoptions
 *
 * @author Chris Vaughan
 */
class RLeafletMapoptions {

    // Map options

    public $divId = "";
    public $base = "";
    public $mapHeight = "500px";
    public $mapWidth = "100%";
    public $bingkey = null;
    public $ORSkey = null;
    public $helpPage = "";
    // the following can be true of false
    public $cluster = false;
    public $fitbounds = false;
    public $controlcontainer = false; // used by Walks Editor
    public $displayElevation = false;
    public $calendar = false;
    public $topoMapDefault = false;
    public $initialview = null;
      public $copyright = true;
  // always on
    public $fullscreen = true;
    public $settings = true;
    public $mylocation = true; 
    public $print = true;
    //// ************** these options have three values
    // null never display option
    // true always display option
    // false only display option on full screen
    public $mouseposition = false;
    public $rightclick = false;
    // ************** END these options have three values

    public function __construct() {
        $this->divId = uniqid(rand());
        $this->base = JURI::base();
    }

    public function setinitialviewView($latitude, $longitude, $zoom) {
        $this->initialview = (object) [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'zoom' => $zoom
        ];
    }

    public function setLicenses() {
        if (RLicense::isBingKeyMapSet()) {
            $this->bing = true;
            $this->bingkey = RLicense::getBingMapKey();
        }
        if (RLicense::isOpenRoutingServiceKeySet()) {
            $this->ORSkey = RLicense::getOpenRoutingServiceKey();
        }
    }

}
