<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdNextwalks extends RJsonwalksStdSimplelist {

    public $walkClass = "nextwalk";
    public $feedClass = "walksfeed"; // not used?
    private $listFormat = ["{gradeimg}","{dowddmm}",
        "{,title}", "{,distance}"];
    private $nowalks = 5;
    private $titles = array();

    public function __construct() {
        parent::__construct();
        parent::customFormat($this->listFormat);
        parent::setWalksClass($this->walkClass);
    }

    public function noWalks($no) {
        $this->nowalks = $no;
    }

    public function appendWalkTitle($group, $title)
    {
        // Remove the old entry if it already exists
        $group = strtoupper($group);
        if (isset($this->titles[$group])) unset($this->titles[$group]);
        $this->titles[$group] = $title;
    }

    public function DisplayWalks($walks) {
        $walks->noWalks($this->nowalks);
        $walks->appendWalkTitle($this->titles);
        parent::DisplayWalks($walks);
    }

}
