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
    public $startText = "Number of walks: ";
    public $endText = "";

    function DisplayWalks($walks) {

        $no = $this->nowalks($walks);
        echo "<" . $this->tag . ">" . $startText . $no . $endText . "</" . $this->tag . ">" . PHP_EOL;
    }

    private function nowalks($walks) {
        return count($walks->allWalks());
    }

}
