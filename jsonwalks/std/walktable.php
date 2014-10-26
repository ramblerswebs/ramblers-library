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
        $date = "<div class='" . $this->walkClass .$walk->status. "'><b>" . $walk->walkDate->format('l, jS F') . "</b></div>";

        if ($walk->hasMeetPlace) {
            $meet = $walk->meetLocation->timeHHMMshort . " at " . $walk->meetLocation->description;
        } else {
            $meet = ".";
        }
        if ($walk->startLocation->exact) {
            $start = $walk->startLocation->timeHHMMshort . " at " . $walk->startLocation->description;
        } else {
            $start = ".";
        }

        $title = "<div class='" . $walk->status . "'>" . $walk->title . " </div>";
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
