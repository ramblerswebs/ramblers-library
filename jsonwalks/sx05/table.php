<?php

/**
 * Description of RJsonwalksSx05Table
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksSx05Table extends RJsonwalksDisplaybase {

    private $lastValue = "";
    private $tableClass = "";
    private $walkClass = "walk";
    public $link = true;
    public $addLocation = true;

    const BR = "<br />";

    function DisplayWalks($walks) {
        echo "</p>";
        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_TIME, RJsonwalksWalk::SORT_DISTANCE);
        $items = $walks->allWalks();

        foreach ($items as $walk) {
            $thismonth = $walk->walkDate->format('F');
            if ($thismonth <> $this->lastValue) {
                if ($this->lastValue <> "") {
                    echo "</table>" . PHP_EOL;
                }
                $this->lastValue = $thismonth;
                echo "<h2>" . $thismonth . "</h2>" . PHP_EOL;
                echo "<table width='95%'>" . PHP_EOL;
            }

            $this->displayWalkForProgrammeTable($walk);
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

        $date = "<div class='" . $this->walkClass . $walk->status . "'><b>" . $walk->walkDate->format('l, jS') . "</b>";
        $date.= "</div>";

        // $description = "";
        //  if ($walk->hasMeetPlace) {
        //      $description .= $walk->meetLocation->description . " " . $walk->meetLocation->timeHHMMshort;
        //  }
        // if ($description != "") {
        //     $description.=", ";
        // }
        if ($walk->startLocation->exact) {
            $start = $walk->startLocation->timeHHMMshort . self::BR . $walk->startLocation->description . " ";
        }
        if ($this->link) {
            $title = "<a href='" . $walk->detailsPageUrl . "' target='_blank' >" . $walk->title . "</a>";
        } else {
            $title = $walk->title;
        }
        //  $title = "<div class='" . $walk->status . "'>" . $text . " </div>";

        $desc = $walk->distanceMiles . " miles" . self::BR . $walk->description;
        
        $durationcol=$walk->startLocation->getDuration($walk->finishTime);
        $durationcol .=  self::BR . $walk->localGrade;
        $contact = "";
        if ($walk->contactName <> "") {
            $contact .= $walk->contactName . self::BR;
        }
        if ($walk->telephone1 <> "") {
            $contact .= $walk->telephone1 . self::BR;
        }
        if ($walk->telephone2 <> "") {
            $contact .= $walk->telephone2 . self::BR;
        }
        $out = "<tr>";
        $out.="<td>" . $date . "</td>";
        $out.="<td>" . $start . "</td>";
        $out.="<td>" . $title . "</td>";

        $out.="<td>" . $desc . "</td>";
        $out.="<td>" . $durationcol . "</td>";
        $out.="<td>" . $contact . "</td>";

        $out.="</tr>" . PHP_EOL;
        echo $out;


        //   echo RHtml::addTableRow(array($date, $description, $contact));
    }

    private function addLocation($location) {
        $text = self::BR . $location->gridref . " / " . $location->postcode;
        return $text;
    }

}
