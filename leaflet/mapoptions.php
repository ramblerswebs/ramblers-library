<?php

/**
 * Description of mapoptions
 *
 * @author Chris Vaughan
 */
class RLeafletMapoptions {

    public $divId = "";
    public $base = "";
    public $mapHeight = "500px";
    public $mapWidth = "100%";
    public $helpPage = "";
    public $cluster = false;
    public $fullscreen = false;
    public $google = false;
    public $search = false;
    public $locationsearch = false;
    public $osgrid = false;
    public $mouseposition = false;
    public $rightclick = false;
    public $maptools = false;
    public $mylocation = false;
    public $fitbounds = false;
    public $draw = false;
    public $print = false;
    public $displayElevation = false;
    public $smartRoute = false;
    public $bing = false;
    public $bingkey = null;
    public $ORSkey = null;
    public $ramblersPlaces = false;
    public $topoMapDefault = false;
    public $controlcontainer = false;
    public $copyright = true;
    public $initialview = null;
    public $calendar = false;

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
