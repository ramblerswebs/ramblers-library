<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdSimplelist extends RJsonwalksDisplaybase {

    private $lastValue = "";
    private $walksClass = "walks";
    private $walkClass = "walk";

   // const BR = "<br />";

    function DisplayWalks($walks) {

        $walks->sort(JRamblersWalksfeedWalk::SORT_DATE, NULL, NULL);
        $items = $walks->allWalks();
        echo "<div class='" . $this->walksClass . "' >" . PHP_EOL;
        foreach ($items as $walk) {
            $thismonth = $walk->walkDate->format('F');
            if ($thismonth <> $this->lastValue) {
                $this->lastValue = $thismonth;
                echo "<h2>" . $thismonth . "</h2>" . PHP_EOL;
            }

            $this->displayWalk($walk);
        }
        echo "</div>" . PHP_EOL;
    }

    function setWalksClass($class) {
        $this->walksClass = $class;
    }

    function setWalkClass($class) {
        $this->walkClass = $class;
    }

    private function displayWalk($walk) {

        $text = "<b>" . $walk->walkDate->format('l, jS') . "</b>" . PHP_EOL;
        if ($walk->hasMeetingPlace) {
            $text .= ", " . $walk->meetingTime->format('ga') . " at " . $walk->meetingLocation->description;
        }
        if ($walk->startingPlaceExact) {
            $text .= ", " . $walk->startTime->format('ga') . " at " . $walk->startLocation->description;
        }

        $text .= ", " . $walk->title . " ";
        $text .= ", " . $walk->distanceMiles . "m / " . $walk->distanceKm . "km";
        if ($walk->isLeader) {
            $text.=", Leader " . $walk->contactName . " " . $walk->telephone1;
        } else {
            $text.=", Contact " . $walk->contactName . " " . $walk->telephone1;
        }
        echo "<div class='" . $this->walkClass . "' >" . PHP_EOL;
        echo "<p>" . $text . "</p>" . PHP_EOL;
        echo "</div>" . PHP_EOL;
    }

}
