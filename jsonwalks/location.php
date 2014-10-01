<?php

class  RJsonwalksLocation {

    public $description;
    public $gridref;
    public $longitude;
    public $latitude;
    public $postcode;
    public $postcodeLatitude;
    public $postcodeLongitude;
    public $exact;

    function __construct($value) {
        $this->description = $value->description;
        $this->gridref = $value->gridRef;
        $this->latitude = $value->latitude;
        $this->longitude = $value->longitude;
        $this->postcode = $value->postcode;
        $this->postcodeLatitude = $value->postcodeLatitude;
        $this->postcodeLongitude = $value->postcodeLongitude;
        $this->exact = $value->showExact=="true";
    }

    function __destruct() {
        
    }

}
