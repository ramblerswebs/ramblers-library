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
    private $walkClass = "walk";
    public $link = true;
    public $addDescription = true;
    public $addGroupName = false;

    const BR = "<br />";

    function DisplayWalks($walks) {
        echo "</p>";
         $printOn = JRequest::getVar('print') == 1;
            if ($printOn) {
                $doc = JFactory::getDocument();
                $style = 'table { border-collapse: collapse;} table, td, th { border: 1px solid #657291;}td { padding: 5px;}';
                $doc->addStyleDeclaration($style);
            }
        $walks->sort(RJsonwalksWalk::SORT_DATE, NULL, NULL);
        $items = $walks->allWalks();
        if ($this->tableClass != "") {
            echo "<table class='$this->tableClass'>";
        } else {
            echo "<table>";
        }
        if ($walks->hasMeetPlace()) {
            echo RHtml::addTableHeader(array("Date", "Meet", "Start", "Title", "Distance", "Grade", "Contact"));
            foreach ($items as $walk) {
                $this->displayWalkForProgrammeTable($walk, true);
            }
        } else {
            echo RHtml::addTableHeader(array("Date", "Start", "Title", "Distance", "Grade", "Contact"));
            foreach ($items as $walk) {
                $this->displayWalkForProgrammeTable($walk, false);
            }
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

    private function displayWalkForProgrammeTable($walk, $hasMeet) {
        $group="";
        if ($this->addGroupName){
            $group="<br />". $walk->groupName;
        }
        $date = "<div class='" . $this->walkClass . $walk->status . "'><b>" . $walk->walkDate->format('l, jS F') . "</b>".$group."</div>";

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
        if ($this->link) {
            $text = "<a href='" . $walk->detailsPageUrl . "' target='_blank' >" . $walk->title . "</a>";
        } else {
            $text = $walk->title;
        }
        $title = "<div class='" . $walk->status . "'>" . $text . " </div>";
        if ($this->addDescription) {
            $title .= $walk->description;
        }

        $dist = $walk->distanceMiles . "m / " . $walk->distanceKm . "km";
        $contact = "";
        if ($walk->isLeader) {
            $contact = "Leader";
        } else {
            $contact = "Contact";
        }
        if ($walk->contactName <> "") {
            $contact .= "<br />" . $walk->contactName;
        }
        if ($walk->email <> "") {
            $contact .= "<br />" . $walk->email;
        }
        if ($walk->telephone1 <> "") {
            $contact .= "<br />" . $walk->telephone1;
        }
        if ($walk->telephone2 <> "") {
            $contact .= "<br />" . $walk->telephone2;
        }
        $grade = $walk->nationalGrade . self::BR . $walk->localGrade;
        if ($hasMeet) {
            echo RHtml::addTableRow(array($date, $meet, $start, $title, $dist, $grade, $contact));
        } else {
            echo RHtml::addTableRow(array($date, $start, $title, $dist, $grade, $contact));
        }
    }

}
