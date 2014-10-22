<?php

class RJsonwalksLocation {

    public $description;        // text description of the location
    public $time;               // time as datetime object
    public $gridref;            // OS grid reference of the location
    public $longitude;          // Longitude of the location
    public $latitude;           // Latitude of the location
    public $postcode;           // either a postcode or null
    public $postcodeLatitude;   // Longitude of the postcode or null
    public $postcodeLongitude;  // Latitude of the postcode or null
    public $exact;              // true or false

    function __construct($value) {
        $this->description = $value->description;
        $this->time = DateTime::createFromFormat('H:i:s', $value->time);
        $this->gridref = $value->gridRef;
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
