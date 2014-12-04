<?php

// no direct access
defined('_JEXEC') or die('Restricted access');

class RJsonwalksLocation {

    public $description;        // text description of the location
    public $time;               // time as datetime object or "" if no time
    public $timeHHMM;           // time as string hh:mm am/pam or "No time"
    public $timeHHMMshort;      // time as $timeHHMM but without minutes if zero
    public $gridref;            // OS grid reference of the location
    public $easting;            // easting of the location
    public $northing;            // northing of the location
    public $longitude;          // Longitude of the location
    public $latitude;           // Latitude of the location
    public $postcode;           // either a postcode or null
    public $postcodeLatitude;   // Longitude of the postcode or null
    public $postcodeLongitude;  // Latitude of the postcode or null
    public $exact;              // true or false

    function __construct($value) {
        $this->description = $value->description;
        $this->time = DateTime::createFromFormat('H:i:s', $value->time);
        If ($this->time === false) {
            $this->time = "";
            $this->timeHHMM = "No time";
            $this->timeHHMMshort = "No time";
        } else {
            $this->timeHHMM = $this->time->format('g:i a');
            $this->timeHHMMshort = str_replace(":00", "", $this->timeHHMM);
        }
        $this->gridref = $value->gridRef;
        $this->easting = $value->easting;
        $this->northing = $value->northing;
        $this->latitude = $value->latitude;
        $this->longitude = $value->longitude;
        $this->postcode = $value->postcode;
        $this->postcodeLatitude = $value->postcodeLatitude;
        $this->postcodeLongitude = $value->postcodeLongitude;
        $this->exact = $value->showExact == "true";
    }

    function __destruct() {
        
    }

}
