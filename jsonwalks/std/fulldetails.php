<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdFulldetails extends RJsonwalksStdSimplelist {

    public $nationalGradeHelp = ""; // not used now!
    public $localGradeHelp = ""; // not used now!
    public $nationalGradeTarget = "_parent"; // not used now!
    public $localGradeTarget = "_parent"; // not used now!
    public $popupLink = true; // not used now!
    public $addContacttoHeader = false;
    public $displayGroup = null;  // not used now
    private $listFormat = ["{gradeimg}", "{dowddmm}",
        "{,title}",
        "{,distance}",
        "{,contactname}",
        "{,telephone}"];

    public function __construct() {
        parent::__construct();
        parent::customFormat($this->listFormat);
    }

    public function DisplayWalks($walks) {
        parent::DisplayWalks($walks);
    }

}
