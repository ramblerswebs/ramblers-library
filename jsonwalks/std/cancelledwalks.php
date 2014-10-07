<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdCancelledwalks extends RJsonwalksDisplaybase {

    private $walksClass = "walks";
    private $walkClass = "walk";
    private $walkslist = "";
    Public $message = "<p>The following walks have been cancelled</p>";

    // const BR = "<br />";

    function DisplayWalks($walks) {

        $walks->sort(RJsonwalksWalk::SORT_DATE, NULL, NULL);
        $items = $walks->allWalks();

        foreach ($items as $walk) {
            $this->displayWalk($walk);
        }
        if ($this->walkslist != "") {
            echo $this->message;
            echo "<div class='" . $this->walksClass . "' >" . PHP_EOL;
            echo $this->walkslist;
            echo "</div>" . PHP_EOL;
        }
    }

    function setWalksClass($class) {
        $this->walksClass = $class;
    }

    function setWalkClass($class) {
        $this->walkClass = $class;
    }

    private function displayWalk($walk) {
        if ($walk->status == "Cancelled") {

            $text = "<b>" . $walk->walkDate->format('F l, jS') . "</b>" . PHP_EOL;
            if ($walk->hasMeetPlace) {
                $text .= ", " . $walk->meetLocation->time->format('ga') . " at " . $walk->meetLocation->description;
            }
            if ($walk->startLocation->exact) {
                $text .= ", " . $walk->startLocation->time->format('ga') . " at " . $walk->startLocation->description;
            }
$this->walkslist.=$text;
            $text = ", " . $walk->title . " ";
            $text .= ", " . $walk->distanceMiles . "m / " . $walk->distanceKm . "km";
            if ($walk->isLeader) {
                $text.=", Leader " . $walk->contactName . " " . $walk->telephone1;
            } else {
                $text.=", Contact " . $walk->contactName . " " . $walk->telephone1;
            }
            $this->walkslist.= "<div class='" . $this->walkClass .$walk->status. "' >" . PHP_EOL;
            $this->walkslist.=  $text  . PHP_EOL;
            $this->walkslist.= "</div>" . PHP_EOL;
            $this->walkslist.= $walk->cancellationReason  . PHP_EOL;
        }
    }

}
