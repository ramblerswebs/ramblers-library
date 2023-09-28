<?php

// 
/**
 * @version		1.0
 * @package		Process WM walk and convert into internal format
 * @author              Chris Vaughan 
 * @copyright           Copyright (c) 2023 Chris Vaughan. All rights reserved.
 * @license		
 */
// no direct access
defined('_JEXEC') or die('Restricted access');

class RJsonwalksSourcewalksmanagerarea extends RJsonwalksSourcewalksmanager {

    private $latitude = null;
    private $longitude = null;
    private $km = null;
    private $readwalks = false;
    private $readevents = false;
    private $wellbeingWalks = false;

    public function __construct($type = "") {
        parent::__construct(SourceOfWalk::WManager);
    }

    public function _initialiseArea($lat, $long, $km, $readwalks, $readevents, $wellbeingWalks) {
        $this->latitude = $lat;
        $this->longitude = $long;
        $this->km = $km;
        $this->readwalks = $readwalks;
        $this->readevents = $readevents;
        $this->wellbeingWalks = $wellbeingWalks;
    }

    public function getWalks($walks) {
        $feed = new RJsonwalksWmFeed();
        $latitude = $this->latitude;
        $longitude = $this->longitude;
        $distance = $this->km;
        $items = $feed->getItemsWithinArea($latitude, $longitude, $distance, $this->readwalks, $this->readevents, $this->wellbeingWalks);

        foreach ($items as $item) {
            $walk = new RJsonwalksWalk();
            $this->convertToInternalFormat($walk, $item);
            $walks->addWalk($walk);
        }
        return;
    }

}
