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
    public $message = "<h3>Sorry - the following walk(s) have been cancelled</h3>";

    public function DisplayWalks($walks) {
        echo $this->getWalksOutput($walks);
    }

    public function getWalksOutput($walks) {
        $out = "";
        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_TIME, RJsonwalksWalk::SORT_DISTANCE);
        $items = $walks->allWalks();
        $walkslist = "";
        foreach ($items as $walk) {
            $walkslist .= $this->displayWalk($walk);
        }
        if ($walkslist != "") {
            $out .= "<div class='" . $this->walksClass . "' >" . PHP_EOL;
            $out .= $this->message;
            $out .=$walkslist;
            $out .= "</div><p></p>" . PHP_EOL;
        }
        return $out;
    }

    public function setWalksClass($class) {
        $this->walksClass = $class;
    }

    public function setWalkClass($class) {
        $this->walkClass = $class;
    }

    private function displayWalk($walk) {
        $out = "";
        if ($walk->isCancelled()) {
            $text = "";
            $out .= "<div class='" . $this->walkClass . "' >" . PHP_EOL;
            $out .= "<b>" . $walk->groupName . " " . "Walk: " . $walk->walkDate->format('l, jS F') . "</b>";
            if ($walk->hasMeetPlace) {
                $text = ", " . $walk->meetLocation->timeHHMMshort . " at " . $walk->meetLocation->description;
            }
            if ($walk->startLocation->exact) {
                $text = ", " . $walk->startLocation->timeHHMMshort . " at " . $walk->startLocation->description;
            }
            $out .= $text;
            $text = ", " . $walk->title . " ";
            $text .= ", " . $walk->distanceMiles . "mi / " . $walk->distanceKm . "km";
            if ($walk->isLeader) {
                $text .= ", Leader " . $walk->contactName . " " . $walk->telephone1;
            } else {
                $text .= ", Contact " . $walk->contactName . " " . $walk->telephone1;
            }
            $out .= $text . PHP_EOL;
            $out .= "<div class='cancelreason' ><b>Reason:</b> " . $walk->cancellationReason . "</div>" . PHP_EOL;
            $out .= "</div>" . PHP_EOL;
        }
        return $out;
    }

}
