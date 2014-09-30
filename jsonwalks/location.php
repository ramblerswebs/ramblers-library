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
        $this->description = $value->Description;
        $this->gridref = $value->GridRef;
        $this->latitude = $value->Latitude;
        $this->longitude = $value->Longitude;
        $this->postcode = $value->Postcode;
        $this->postcodeLatitude = $value->PostcodeLatitude;
        $this->postcodeLongitude = $value->PostcodeLongitude;
        $this->exact = $value->Display=="true";
    }

    function __destruct() {
        
    }

}
