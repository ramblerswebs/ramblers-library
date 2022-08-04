<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksBU51Fulldetails extends RJsonwalksStdSimplelist {

    public $walkClass = "bu51Nextwalk";
    public $feedClass = "walksfeed"; // not used?
    private $listFormat = ["{gradeimg}", "{title}", "{lf}",
        "{dowddmmyyyy}", "{[ meet at ]meetTime}", "{[ start at ]startTime}", "{[ estimated finish at ]finishTime}",
        "{,distance}", "{,nationalGrade}","{,type}","{ walk}"];
    private $nowalks = 20;

    public function __construct() {
        parent::__construct();
        parent::customFormat($this->listFormat);
        parent::setWalksClass($this->walkClass);
        RLoad::addStyleSheet("libraries/ramblers/jsonwalks/bu51/bu51style.css", "text/css");
    }

    public function noWalks($no) {
        $this->nowalks = $no;
    }

    public function DisplayWalks($walks) {
        $walks->noWalks($this->nowalks);
        parent::DisplayWalks($walks);
    }

}
