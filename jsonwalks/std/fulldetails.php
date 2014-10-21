<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdFulldetails extends RJsonwalksDisplaybase {

    private $walksClass = "walks";
    private $walkClass = "walk";
    public $nationalGradeHelp = "";
    public $localGradeHelp = "";
    public $nationalGradeTarget = "_parent";
    public $localGradeTarget = "_parent";
    public $popupLink = true;
    public $displayGroup = true;  // should the Group name be displayed

    function DisplayWalks($walks) {
        $document = JFactory::getDocument();
        JHtml::_('jquery.framework');
        $document->addStyleSheet(JURI::base() . 'ramblers/jsonwalks/std/accordian/style/style4.css');
        $document->addScript(JURI::base() . 'ramblers/jsonwalks/std/accordian/js/ra-accordion.js', "text/javascript");
        $walks->sort(RJsonwalksWalk::SORT_DATE, NULL, NULL);
        $items = $walks->allWalks();

        echo "<div class='" . $this->walksClass . "' >" . PHP_EOL;
        echo ' <script type="text/javascript">' . PHP_EOL;
        echo 'jQuery(function($) {' . PHP_EOL;
        echo "$('#accordion_ra1_id007').raAccordion({" . PHP_EOL;
        echo 'hidefirst: 1 });' . PHP_EOL;
        echo '});' . PHP_EOL;
        echo '</script>' . PHP_EOL;
        echo '<div id="accordion_ra1_id007" class="ra-accordion ra-accordion-style4 ">';
        foreach ($items as $walk) {
            $thiscontact = $walk->contactName . "  " . $walk->telephone1;

            echo '<div class="ra-accordion-item">';
            echo '<div class="toggler">';
            echo '<span><span>';

            $this->displayWalkSummary($walk);
            echo '</span></span>';
            echo '</div>';
            echo '<div class="clr"></div>';
            echo '<div class="ra-accordion-container" style="display: none;">';
            echo '<div class="ra-accordion-inner">';
            $this->displayWalkDetails($walk);
            echo "<hr/>" . PHP_EOL;
            echo '</div></div>';

            echo "</div>" . PHP_EOL;
        }
        echo "</div>" . PHP_EOL;
        echo '</div></div>';
    }

    function setWalksClass($class) {
        $this->walksClass = $class;
    }

    function setWalkClass($class) {
        $this->walkClass = $class;
    }

    private function displayWalkSummary($walk) {

        $text = "<b>" . $walk->walkDate->format('l, jS F Y') . "</b>" . PHP_EOL;

        $text .= ", " . $walk->title . " ";
        $text .= ", " . $walk->distanceMiles . "m / " . $walk->distanceKm . "km";
        echo "<div class='" . $this->walkClass . $walk->status . "' ><div>" . PHP_EOL;
        echo $text . PHP_EOL;
        echo "</div></div>" . PHP_EOL;
    }

    private function displayWalkDetails($walk) {

        echo "<div class='walkstdfulldetails'>";
         if ($this->displayGroup) {
            echo "<div class='group'><b>Group</b>: " . $walk->groupName . "</div>";
        }
        echo "<div class='basics'>";
        echo "<div class='description'><b>Description</b>: " . $walk->description . "</div>";
      
        if ($walk->additionalNotes != "") {
            echo "<div class='additionalnotes'><b>Additional Notes</b>: " . $walk->additionalNotes . "</div>";
        }
        echo "<div class='distance'><b>Distance</b>: " . $walk->distanceMiles . "m / " . $walk->distanceKm . "km" . "</div>";
        if ($walk->isLinear) {
            echo "<b>Linear Walk</b>";
        } else {
            echo "<b>Circular walk</b>";
        }
        echo "</div>";
        if ($walk->hasMeetPlace) {
            echo "<div class='meetplace'>";
            $out = $this->addLocationInfo("Meeting", $walk->meetLocation);
            echo $out;
            echo "</div>";
        } else {
            echo "<div class='nomeetplace'><b>No meeting place specified</b>";
            echo "</div>";
        }
        if ($walk->startLocation->exact) {
            echo "<div class='startplace'>";
        } else {
            echo "<div class='nostartplace'><b>No start place - Rough location only</b>: ";
        }
        echo $this->addLocationInfo("Start", $walk->startLocation);

        echo "</div>";

        if ($walk->isLinear) {
            echo "<div class='finishplace'>";
            echo $this->addLocationInfo("Finish", $walk->finishLocation);
            echo "</div>";
        }
        echo "<div class='difficulty'><b>Difficulty</b>: ";
        $link = $walk->nationalGrade;
        if ($this->nationalGradeHelp != "") {
            $link = "<a href='" . $this->nationalGradeHelp . "' target='" . $this->nationalGradeTarget . "'>" . $link . "</a>";
        }
        echo "<div class='nationalgrade'><b>National Grade</b>: " . $link . "</div>";
        if ($walk->localGrade != "") {
            $link = $walk->localGrade;
            if ($this->localGradeHelp != "") {
                $link = "<a href='" . $this->localGradeHelp . "' target='" . $this->localGradeTarget . "'>" . $link . "</a>";
            } echo "<div class='localgrade'><b>Local Grade</b>: " . $link . "</div>";
        }
        if ($walk->pace != null) {
            echo "<div class='pace'><b>Pace</b>: " . $walk->pace . "</div>";
        }
        if ($walk->ascentFeet != null) {
            echo "<div class='ascent'><b>Ascent</b>: " . $walk->ascentFeet . " ft " . $walk->ascentMetres . " ms</div>";
        }
        echo "</div>";

        echo "<div class='walkcontact'><b>Contact</b>: ";
        echo "<div class='contactname'><b>Name</b>: " . $walk->contactName . "</div>";
        if ($walk->email != "") {
            echo "<div class='email'><b>Email</b>: " . $walk->email . "</div>";
        }
        if ($walk->telephone1 . $walk->telephone2 != "") {
            $text = "<div class='telphone'><b>Telephone</b>: ";
            If ($walk->telephone1 != "") {
                $text.= $walk->telephone1;
                if ($walk->telephone2 != "") {
                    $text.= ", ";
                }
            }
            if ($walk->telephone2 != "") {
                $text.= $walk->telephone2;
            }
            $text.="</div>";
            echo $text;
        }
        echo "</div>";

        echo "</div>";
    }

    private function addLocationInfo($title, $location) {

        if ($location->exact) {
            $out = "<div class='place'><b>" . $title . " Place</b>: " . $location->description . " - ";
            $out.=$this->getGoogleMapUrl("Map", $location->latitude . "," . $location->longitude, "_blank", $this->popupLink);
            $out.= "</div>";
            $out.= "<div class='time'><b>Time</b>: " . $location->time->format('ga') . "</div>";
            $out.= "<div class='gridref'><b>Grid Ref</b>: " . $location->gridref . "</div>";
            $out.= "<div class='logitude'><b>Logitude</b>: " . $location->longitude . "</div>";
            $out.= "<div class='latitude'><b>Latitude</b>: " . $location->latitude . "</div>";
        } else {
            $out = "<div class='place'>Location shown is an indication of where the walk will be and <b>NOT</b> the start place:  - ";
            $out.=$this->getGoogleMapUrl("Map", $location->latitude . "," . $location->longitude, "_blank", $this->popupLink);
            $out.= "</div>";
        }

        if ($location->postcode != "") {
            $note = " - [Postcodes in some areas may not be close to the desired location, please check before using]";
            $out.= "<div class='postcode'><b>Postcode</b>: " . $location->postcode . " ";
            $out.=$this->getGoogleMapUrl("Map", $location->postcode, "_blank", $this->popupLink);
            $out.= $note . "</div>";
        }
        return $out;
    }

    private function getGoogleMapUrl($text, $search, $target, $popup) {
        if ($popup) {
            $out = "[<span class='rapopup' onClick=\"javascript:window.open('http://maps.google.com/maps?q=" . $search . "', '_blank','toolbar=yes,left=50,top=50,width=800,height=600');\">" . $text . "</span>]";
            ;
        } else {
            $out = "[<a href='http://maps.google.com/maps?q=" . $search . "' target='" . $target . "'>" . $text . "</a>]</div>";
        }

        return $out;
    }

}
