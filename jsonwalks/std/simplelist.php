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

        $walks->sort(RJsonwalksWalk::SORT_DATE, NULL, NULL);
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
        if ($walk->hasMeetPlace) {
            $text .= ", " . $walk->meetLocation->time->format('g:i a') . " at " . $walk->meetLocation->description;
        }
        if ($walk->startLocation->exact) {
            $text .= ", " . $walk->startLocation->time->format('g:i a') . " at " . $walk->startLocation->description;
        }

        $text .= ", " . $walk->title . " ";
        $text .= ", " . $walk->distanceMiles . "m / " . $walk->distanceKm . "km";
        if ($walk->isLeader) {
            $text.=", Leader " . $walk->contactName . " " . $walk->telephone1;
        } else {
            $text.=", Contact " . $walk->contactName . " " . $walk->telephone1;
        }
        echo "<div class='" . $this->walkClass .$walk->status. "' >" . PHP_EOL;
        echo "<p>" . $text . "</p>" . PHP_EOL;
        echo "</div>" . PHP_EOL;
    }

}
