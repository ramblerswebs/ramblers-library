<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdCancelledwalks extends RJsonwalksDisplaybase {

    private $walksClass = "cancelledWalks";
    private $walkClass = "cancelledWalk";
    Public $message = "<h3>Sorry - the following walk(s) have been cancelled</h3>";

    function DisplayWalks($walks) {

        $walks->sort(RJsonwalksWalk::SORT_DATE, NULL, NULL);
        $items = $walks->allWalks();
        $walkslist = "";
        foreach ($items as $walk) {
            $walkslist .= $this->displayWalk($walk);
        }
        if ($walkslist != "") {
            echo "<div class='" . $this->walksClass . "' >" . PHP_EOL;
            echo $this->message;
            echo $walkslist;
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
        $out="";
        if ($walk->status == "Cancelled") {
            $out.= "<div class='" . $this->walkClass . "' >" . PHP_EOL;

            $out .= "<b>Walk: " . $walk->walkDate->format('F l, jS') . "</b>";
            if ($walk->hasMeetPlace) {
                $text = ", " . $walk->meetLocation->time->format('g:i a') . " at " . $walk->meetLocation->description;
            }
            if ($walk->startLocation->exact) {
                $text = ", " . $walk->startLocation->time->format('g:i a') . " at " . $walk->startLocation->description;
            }
            $out.=$text;
            $text = ", " . $walk->title . " ";
            $text .= ", " . $walk->distanceMiles . "m / " . $walk->distanceKm . "km";
            if ($walk->isLeader) {
                $text.=", Leader " . $walk->contactName . " " . $walk->telephone1;
            } else {
                $text.=", Contact " . $walk->contactName . " " . $walk->telephone1;
            }
            $out.= $text . PHP_EOL;
            $out.= "</div>" . PHP_EOL;
            $out.= "<div class='cancelreason' ><b>Reason:</b> " . $walk->cancellationReason . "</div>" . PHP_EOL;
        }
        return $out;
    }

}
