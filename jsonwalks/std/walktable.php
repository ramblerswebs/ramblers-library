<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdWalktable extends RJsonwalksDisplaybase {

    private $tableClass = "";
    private $walksClass = "walks";
    private $walkClass = "walk";

    const BR = "<br />";

    function DisplayWalks($walks) {
        echo "</p>";
        $walks->sort(RJsonwalksWalk::SORT_DATE, NULL, NULL);
        $items = $walks->allWalks();
        if ($this->tableClass != "") {
            echo "<table class='$this->tableClass'>";
        } else {
            echo "<table>";
        }
        echo RHtml::addTableHeader(array("Date", "Meet", "Start", "Title", "Distance", "Grade", "Leader"));
        foreach ($items as $walk) {
            $this->displayWalkForProgrammeTable($walk, false);
        }
        echo "</table>" . PHP_EOL;
    }

    function setTableClass($class) {
        $this->tableClass = $class;
    }

    function setWalksClass($class) {
        $this->walksClass = $class;
    }

    function setWalkClass($class) {
        $this->walkClass = $class;
    }

    private function displayWalkForProgrammeTable($walk) {

        $date = "<b>" . $walk->walkDate->format('l, jS F') . "</b>" . PHP_EOL;

        if ($walk->hasMeetPlace) {
            $meet = $walk->meetTime->format('ga') . " at " . $walk->meetLocation->description;
        } else {
            $meet = ".";
        }
        if ($walk->startPlaceExact) {
            $start = $walk->startTime->format('ga') . " at " . $walk->startLocation->description;
        } else {
            $start = ".";
        }

        $title = $walk->title . " ";
        $dist = $walk->distanceMiles . "m / " . $walk->distanceKm . "km";
        if ($walk->isLeader) {
            $contact = $walk->contactName . " " . $walk->telephone1;
        } else {
            $contact = $walk->contactName . " " . $walk->telephone1;
        }
        $grade = $walk->nationalGrade . self::BR . $walk->localGrade;

        echo RHtml::addTableRow(array($date, $meet, $start, $title, $dist, $grade, $contact));
    }

}
