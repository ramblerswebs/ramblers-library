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

    const BR = "<br />";

    function DisplayWalks($walks) {
        $document = JFactory::getDocument();
        JHtml::_('jquery.framework');
        $document->addStyleSheet(JURI::base() . 'modules/mod_sp_accordion/style/style2.css');
        $document->addScript(JURI::base() . 'modules/mod_sp_accordion/js/sp-accordion.js', "text/javascript");
        echo "</p><h1>", "List of walks </h1>";
        $walks->sort(RJsonwalksWalks::SORT_DATE, NULL, NULL);
        $items = $walks->allWalks();

        echo "<div class='" . $this->walksClass . "' >" . PHP_EOL;
        echo ' <script type="text/javascript">' . PHP_EOL;
        echo 'jQuery(function($) {' . PHP_EOL;
        echo "$('#accordion_sp1_id007').spAccordion({" . PHP_EOL;
        echo 'hidefirst: 1 });' . PHP_EOL;
        echo '});' . PHP_EOL;
        echo '</script>' . PHP_EOL;
        echo '<div id="accordion_sp1_id007" class="sp-accordion sp-accordion-style2 ">';
        foreach ($items as $walk) {
            $thiscontact = $walk->contactName . "  " . $walk->telephone1;

            echo '<div class="sp-accordion-item">';
            echo '<div class="toggler">';
            echo '<span><span>';

            $this->displayWalkSummary($walk);
            echo '</span></span>';
            echo '</div>';
            echo '<div class="clr"></div>';
            echo '<div class="sp-accordion-container" style="display: none;">';
            echo '<div class="sp-accordion-inner">';
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

        //    if ($walk->hasMeetingPlace) {
        //       $text .= ", " . $walk->meetingTime->format('ga') . " at " . $walk->meetingLocation->description;
        //   }
        //   if ($walk->startingPlaceExact) {
        //       $text .= ", " . $walk->startTime->format('ga') . " at " . $walk->startLocation->description;
        //   }

        $text .= ", " . $walk->title . " ";
        $text .= ", " . $walk->distanceMiles . "m / " . $walk->distanceKm . "km";
        //   if ($walk->isLeader) {
        //       $text.=", Leader " . $walk->contactName . " " . $walk->telephone1;
        //   } else {
        //       $text.=", Contact " . $walk->contactName . " " . $walk->telephone1;
        //   }
        //   echo "<div class='" . $this->walkClass . "' >" . PHP_EOL;
        echo $text . PHP_EOL;
        //  echo "</div>" . PHP_EOL;
    }

    private function displayWalkDetails($walk) {
        // $out = "<h2>" . $walk->walkDate->format('l, jS F Y') . "</h2>" . self::BR . PHP_EOL;
        $out = "";
        $out.="<table>";
        $out.= RHtml::addTableRow(array("<b>Title</b>: ", $walk->title));
        $out.= RHtml::addTableRow(array("<b>Description</b>: ", $walk->description));
        $out.= RHtml::addTableRow(array("<b>Distance</b>: ", $walk->distanceMiles . "m / " . $walk->distanceKm . "km"));
        $out.= RHtml::addTableRow(array("<b>Meeting Place</b>: ", ""), "highlightrow");
        if ($walk->hasMeetingPlace) {
            $out.= RHtml::addTableRow(array("<b>Time</b>: ", $walk->meetingTime->format('ga')));
            $out.= RHtml::addTableRow(array("", $this->locationTable($walk->meetingLocation)));
        } else {
            $out.= RHtml::addTableRow(array(" ", "No meeting place specified"));
        }
        $out.= RHtml::addTableRow(array("<b>Starting Place</b>: ", ""), "highlightrow");
        if ($walk->startingPlaceExact) {
            $out .= RHtml::addTableRow(array("<b>Time</b>: ", $walk->startTime->format('ga')));
        } else {
            $out.=RHtml::addTableRow(array("", "Not start place - Rough location only"));
        }
        $out.= RHtml::addTableRow(array("", $this->locationTable($walk->startLocation)));
        if ($walk->isLinear) {
            $out.= RHtml::addTableRow(array("<b>Linear/Circular</b>: ", "Linear walk - End Place"), "highlightrow");
            $out.= RHtml::addTableRow(array("", $this->locationTable($walk->endLocation)));
        } else {
            $out.= RHtml::addTableRow(array("<b>Linear/Circular</b>: ", "Circular walk"));
        }

        $out.= RHtml::addTableRow(array("<b>Difficulty</b>: ", ""), "highlightrow");
        $out.= RHtml::addTableRow(array("<b>National Grade</b>: ", $walk->nationalGrade));
        $out.= RHtml::addTableRow(array("<b>Local Grade</b>: ", $walk->localGrade));
        $out.= RHtml::addTableRow(array("<b>Pace</b>: ", $walk->pace));
        $out.= RHtml::addTableRow(array("<b>Ascent<b>: ", $walk->ascentMetres . " metres"));
        $out.= RHtml::addTableRow(array(" ", $walk->ascentFeet . " feet"));
        $out.="</table>";
        // $out .= "<b>Title</b>: " . $walk->title . self::BR . PHP_EOL;
        //   $out .= "<b>Description</b>: " . $walk->description . self::BR . PHP_EOL;
        //   $out .= "<b>Distance</b>: " . $walk->distanceMiles . "m / " . $walk->distanceKm . "km" . self::BR . PHP_EOL;
        //   if ($walk->startingPlaceExact) {
        //       $out .= "<b>Starting Place</b>: " . $walk->startTime->format('ga') . " at " . $walk->startLocation->description . self::BR . PHP_EOL;
        //   } else {
        //       $out.="No starting place specified" . self::BR . PHP_EOL;
        //   }
        //   $out .= "<b>National Grade</b>: " . $walk->nationalGrade . self::BR . PHP_EOL;
        //  $out .= "<b>Local Grade</b>: " . $walk->localGrade . self::BR . PHP_EOL;
        // $out.="<p></p>";

        echo $out;
    }

    private function locationTable($location) {
        return "";
        $out = RHtml::addTableRow(array("<b>Place</b>: ", $location->description));
        $out.= RHtml::addTableRow(array("<b>Grid Ref</b>: ", $location->gridref));
        $out.= RHtml::addTableRow(array("<b>Logitude</b>: ", $location->longitude));
        $out.= RHtml::addTableRow(array("<b>Latitude</b>: ", $location->latitude));
        $out.= RHtml::addTableRow(array("<b>Postcode</b>: ", $location->postcode));

        return $out;
    }

}
