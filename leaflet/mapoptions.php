<?php

/**
 * Description of mapoptions
 *
 * @author Chris Vaughan
 */
class RLeafletMapoptions {

    public $cluster = true;
    public $fullscreen = true;
    public $google = true;
    public $search = true;
    public $locationsearch = true;
    public $osgrid = true;
    public $mouseposition = true;
    public $postcodes = true;
    public $fitbounds = true;

    public function __construct() {
        ;
    }

    public function text() {
        $options = "";
        if (!$this->cluster) {
            $options .= "ramblersMap.options.cluster = false;" . PHP_EOL;
        }
        if (!$this->fullscreen) {
            $options .= "ramblersMap.options.fullscreen = false;" . PHP_EOL;
        }
        if (!$this->google) {
            $options .= "ramblersMap.options.google = false;" . PHP_EOL;
        }
        if (!$this->search) {
            $options .= "ramblersMap.options.search = false;" . PHP_EOL;
        }
        if (!$this->locationsearch) {
            $options .= "ramblersMap.options.locationsearch = false;" . PHP_EOL;
        }
        if (!$this->osgrid) {
            $options .= "ramblersMap.options.osgrid = false;" . PHP_EOL;
        }
        if (!$this->mouseposition) {
            $options .= "ramblersMap.options.mouseposition = false;" . PHP_EOL;
        }
        if (!$this->postcodes) {
            $options .= "ramblersMap.options.postcodes = false;" . PHP_EOL;
        }
        if (!$this->fitbounds) {
            $options .= "ramblersMap.options.fitbounds = false;" . PHP_EOL;
        }
        return $options;
    }

}
