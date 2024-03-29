<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksBU51Micronextwalks extends RJsonwalksStdSimplelist {

    public $walkClass = "bu51-nextwalk";
    public $feedClass = "walksfeed"; // not used?
    private $listFormat = ["{dowShortddmm}", " ","{startTime}",
        "{,title}", "{,startPC}", "{,nationalGrade}", "{,distance}"];
    private $nowalks = 5;

    public function __construct() {
        parent::__construct();
        parent::customFormat($this->listFormat);
        parent::setWalksClass($this->walkClass);
        RLoad::addStyleSheet("media/lib_ramblers/jsonwalks/bu51/bu51style.css", "text/css");
    }

    public function noWalks($no) {
        $this->nowalks = $no;
    }

    public function DisplayWalks($walks) {
        $walks->noWalks($this->nowalks);
        parent::DisplayWalks($walks);
    }

}
