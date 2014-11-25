<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksDe02Programme extends RJsonwalksDisplaybase {

    private $lastValue = "";
    private $walksClass = "de02walks";
    private $walkClass = "de02walk";
    public $addDescription = true;

    const BR = "<br />";

    function DisplayWalks($walks) {
        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_DISTANCE, NULL);
        $items = $walks->allWalks();
        echo "<div class='" . $this->walksClass . "' >" . PHP_EOL;
        foreach ($items as $walk) {
            $thismonth = $walk->walkDate->format('F');
            if ($thismonth <> $this->lastValue) {
                if ($this->lastValue <> "") {
                    echo "</table>" . PHP_EOL;
                }
                $this->lastValue = $thismonth;
                echo "<h2>" . $thismonth . "</h2>" . PHP_EOL;
                echo "<table>" . PHP_EOL;
            }

            $this->displayWalk($walk);
        }
        echo "</table>" . PHP_EOL;
        echo "</div>" . PHP_EOL;
    }

    function setWalksClass($class) {
        $this->walksClass = $class;
    }

    function setWalkClass($class) {
        $this->walkClass = $class;
    }

    private function displayWalk($walk) {
        $col1 = $this->getGradeImage($walk->localGrade);

        $col2 = "<b>" . $walk->walkDate->format('l, jS') . "</b>" . PHP_EOL;
        if ($walk->hasMeetPlace) {
            $col2 .= ", " . $walk->meetLocation->timeHHMMshort . " at " . $walk->meetLocation->description;
        }
        if ($walk->startLocation->exact) {
            $col2 .= ", " . $walk->startLocation->timeHHMMshort . " at " . $walk->startLocation->description;
            $col2 .= " [". $walk->startLocation->gridref."]";
        }

        $col2 .= ", " . $walk->title;
        if ($this->addDescription) {
            if ($walk->description != "") {
                $col2.=", ".$walk->description;
            }
        }
        $col2 .= ", " . $walk->distanceMiles . "m/" . $walk->distanceKm . "km";
        if ($walk->isLeader) {
            $col2.=", Leader " ;
        } else {
            $col2.=", Contact " ;
        }
         $col2.= $walk->contactName ;
         if ($walk->telephone1 != "") {
            $col2.= " " . $walk->telephone1;
        } else {
            if ($walk->telephone2 != "") {
                $col2.= " " . $walk->telephone2;
            }
        }
        $col2 = "<div class='" . $this->walkClass . $walk->status . "'>" . $col2 . "</div>";
        echo RHtml::addTableRow(array($col1, $col2));
    }

    private function getGradeImage($grade) {
        $g = strtolower($grade);
        $image = "";
        switch ($g) {
            case $this->contains_substr($g, "white"):
                $image = "bootwhite.jpg";
                break;
            case $this->contains_substr($g, "gray"):
                $image = "bootgray.jpg";
                break;
            case $this->contains_substr($g, "grey"):
                $image = "bootgray.jpg";
                break;
            case $this->contains_substr($g, "black"):
                $image = "bootblack.jpg";
                break;
            case $this->contains_substr($g, "two"):
                $image = "boottwoblack.jpg";
                break;
        }
        if ($image == "")
            return $grade;
        return '<img border="0" src="ramblers/jsonwalks/de02/images/' . $image . '" width="20" height="20">';
    }

    function contains_substr($mainStr, $str, $loc = false) {
        if ($loc === false)
            return (strpos($mainStr, $str) !== false);
        if (strlen($mainStr) < strlen($str))
            return false;
        if (($loc + strlen($str)) > strlen($mainStr))
            return false;
        return (strcmp(substr($mainStr, $loc, strlen($str)), $str) == 0);
    }

}
