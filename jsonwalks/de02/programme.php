<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksDe02Programme extends RJsonwalksStdSimplelist {

    private $listFormat = [ "{dowdd}",
        "{,title}",
        "{,description}",
        "{,distance}",
        "{,contactname}",
        "{,telephone}",
        "{,telephone2}"];

    public function __construct() {
        parent::__construct();
        parent::customFormat($this->listFormat);
    }

    public function DisplayWalks($walks) {
        parent::DisplayWalks($walks);
    }

}
