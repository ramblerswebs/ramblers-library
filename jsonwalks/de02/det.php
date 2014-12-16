<?php

/**
 * Output aimed at the Derby Evening Telegraph newspaper
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksDe02Det extends RJsonwalksDisplaybase {

    const BR = "<br />";

    function DisplayWalks($walks) {
        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_DISTANCE, NULL);
        $items = $walks->allWalks();
        foreach ($items as $walk) {
            $this->displayWalk($walk);
        }
    }

    private function displayWalk($walk) {
        If ($walk->status == "cancelled") {
            echo "<p><b>THIS WALK IS CANCELLED</b></p>";
        }
        $out = "<b>" . $walk->walkDate->format('l, jS F Y') . " - " . $walk->title . "</b><br />" . PHP_EOL;
        $out .= "Join " . $walk->groupName . " Ramblers for a " . $walk->nationalGrade;
        $out .= " " . $walk->distanceMiles . " mile / " . $walk->distanceKm . " km walk<br/>";
        if ($walk->description != "") {
            $out.= $walk->description . "<br/>";
        }
        if ($walk->hasMeetPlace) {
            $out .= "Meet at " . $walk->meetLocation->timeHHMMshort . " at " . $walk->meetLocation->description;
            $out .= " [OS Map Ref: " . $walk->meetLocation->gridref . "]<br />";
        }
        if ($walk->startLocation->exact) {
            $out .= "Start at " . $walk->startLocation->timeHHMMshort . " at " . $walk->startLocation->description;
            $out .= " [OS Map Ref: " . $walk->startLocation->gridref . "]<br />";
        }

        if ($walk->isLeader) {
            $out.="Leader ";
        } else {
            $out.="Contact ";
        }
        $out.= $walk->contactName;
        if ($walk->telephone1 != "") {
            $out.= " " . $walk->telephone1;
        } else {
            if ($walk->telephone2 != "") {
                $out.= " " . $walk->telephone2;
            }
        }
        $out = str_replace(" cp ", " car park ", $out);
        $out = str_replace(" c.p. ", " car park ", $out);
        echo $out;
        echo "<br/>http://www.derbyramblers.org.uk/";
        echo "<br/>Contact us to make sure the walk is suitable for you";

        echo "<br />";
        echo "<hr />";
        echo "<br />";
    }

}
