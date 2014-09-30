<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdWalkscount extends RJsonwalksDisplaybase {

    public $tag = "p";

    function DisplayWalks($walks) {
       
        $no = $this->nowalks($walks);
        echo "<" . $this->tag . ">Number of walks: " . $no . "</" . $this->tag . ">" . PHP_EOL;
    }

    private function nowalks($walks) {
        return count($walks->allWalks());
    }

}
