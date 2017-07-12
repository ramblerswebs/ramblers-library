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
    public $addContacttoHeader = false;
    public $popupLink = true; // not used now!
    public $displayGroup = false;  // should the Group name be displayed
    public $displayGradesIcon = true;
    private $printOn = false;
    private static $accordianId = 100;

    public function DisplayWalks($walks) {
        if ($this->displayGradesIcon) {
            RJsonwalksWalk::gradeSidebar();
            RJsonwalksWalk::gradeToolTips();
        }

        self::$accordianId +=1;
        $document = JFactory::getDocument();
        $this->printOn = JRequest::getVar('print') == 1;
        JHtml::_('jquery.framework');
        $document->addStyleSheet(JURI::base() . 'ramblers/jsonwalks/std/accordian/style/style4.css');
        $document->addScript(JURI::base() . 'ramblers/jsonwalks/std/accordian/js/ra-accordion.js', "text/javascript");
        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_TIME, RJsonwalksWalk::SORT_DISTANCE);
        $items = $walks->allWalks();
        $id = "accordion_ra1_id" . self::$accordianId;
        echo "<div class='" . $this->walksClass . "' >";
        echo '<script type="text/javascript">' . PHP_EOL;
        echo 'jQuery(function($) {' . PHP_EOL;
        echo "$('#" . $id . "').raAccordion({" . PHP_EOL;
        echo 'hidefirst: 1 });' . PHP_EOL;
        echo '});' . PHP_EOL;
        echo '</script>' . PHP_EOL;
        echo '<div id="' . $id . '" class="ra-accordion ra-accordion-style4 ">';
        foreach ($items as $walk) {
            echo '<div class="ra-accordion-item ' . $this->walkClass . $walk->status . '">' . PHP_EOL;
            if ($this->printOn) {
                echo '<div class="printfulldetails">' . PHP_EOL;
            } else {
                echo '<div class="toggler">' . PHP_EOL;
            }
            echo '<span><span>' . PHP_EOL;

            $this->displayWalkSummary($walk);
            echo '</span></span>' . PHP_EOL;
            echo '</div>' . PHP_EOL;
            echo '<div class="clr"></div>' . PHP_EOL;
            if ($this->printOn) {
                echo '<div class="ra-fulldetails-container style="display: block;">' . PHP_EOL;
                echo '<div class="ra-fulldetails-inner">' . PHP_EOL;
            } else {
                echo '<div class="ra-accordion-container" style="display: none;">' . PHP_EOL;
                echo '<div class="ra-accordion-inner">' . PHP_EOL;
            }
            $this->displayWalkDetails($walk);
            echo '</div></div>' . PHP_EOL;

            echo "</div>" . PHP_EOL;
        }
        // echo "</div>" . PHP_EOL;
        echo '</div></div>' . PHP_EOL;
    }

    public function setWalksClass($class) {
        $this->walksClass = $class;
    }

    public function setWalkClass($class) {
        $this->walkClass = $class;
    }

    private function displayWalkSummary($walk) {
        $text = $this->addGradeImage($walk);
        $text .= "<b> " . $walk->walkDate->format('l, jS F Y') . "</b>";

        $text .= ", " . $walk->title;
        if ($walk->distanceMiles > 0) {
            $text .= ", " . $walk->distanceMiles . "mile / " . $walk->distanceKm . "km";
        }
        if ($this->addContacttoHeader) {
            if ($walk->contactName <> "") {
                $text .= ", " . $walk->contactName;
            }
            if ($walk->telephone1 <> "") {
                $text .= ", " . $walk->telephone1;
            }
        }

        echo $text . PHP_EOL;
    }

    private function addGradeImage($walk) {
        $out = '';
        if ($this->displayGradesIcon) {
            $out .= ' <img src="' . $walk->getGradeImage() . '" alt="' . $walk->nationalGrade . '" style="width:25px;height:25px;" onmouseover="dispGrade(this)" onmouseout="noGrade(this)">';
        } else {
            $out .= ' <img src="ramblers/images/grades/base.jpg" alt="' . $walk->nationalGrade . '" style="width:25px;height:25px;" onmouseover="dispGrade(this)" onmouseout="noGrade(this)">';
        }
        return $out;
    }

    function displayWalkDetails($walk) {

        echo "<div class='walkstdfulldetails'>" . PHP_EOL;
        if ($this->displayGroup) {
            echo "<div class='group'><b>Group</b>: " . $walk->groupName . "</div>" . PHP_EOL;
        }
        if ($walk->isCancelled()) {
            echo "<div class='reason'>WALK CANCELLED: " . $walk->cancellationReason . "</div>" . PHP_EOL;
        }
        echo "<div class='basics'>" . PHP_EOL;
        if ($this->printOn) {
            
        } else {
            echo "<div class='description'><b>" . $walk->walkDate->format('l, jS F Y') . PHP_EOL;
            echo "<br/>" . $walk->title . "</b></div>" . PHP_EOL;
        }


        if ($walk->description != "") {
            echo "<div class='description'> " . $walk->descriptionHtml . "</div>" . PHP_EOL;
        }
        if ($walk->additionalNotes != "") {
            echo "<div class='additionalnotes'><b>Additional Notes</b>: " . $walk->additionalNotes . "</div>" . PHP_EOL;
        }
        if ($walk->isLinear) {
            echo "<b>Linear Walk</b>";
        } else {
            echo "<b>Circular walk</b>";
        }
        if ($walk->hasMeetPlace) {
            $out = "<div><b>Meeting time " . $walk->meetLocation->timeHHMMshort . "</b></div>";
            echo $out . PHP_EOL;
        }
        if ($walk->startLocation->exact) {
            $out = "<div><b>Start time " . $walk->startLocation->timeHHMMshort . "</b></div>";
            echo $out . PHP_EOL;
        }
        if ($walk->finishTime != null) {
            $out = "<div>(Estimated finish time " . $this->getShortTime($walk->finishTime) . ")</div>";
            echo $out . PHP_EOL;
        }
        echo "</div>";
        if ($walk->hasMeetPlace) {
            echo "<div class='meetplace'>";
            $out = $this->addLocationInfo("Meeting", $walk->meetLocation, $walk->detailsPageUrl);
            echo $out;
            echo "</div>" . PHP_EOL;
        } else {
            //echo "<div class='nomeetplace'><b>No meeting place specified</b>";
            //echo "</div>";
        }
        if ($walk->startLocation->exact) {
            echo "<div class='startplace'>";
        } else {
            echo "<div class='nostartplace'><b>No start place - Rough location only</b>: ";
        }
        echo $this->addLocationInfo("Start", $walk->startLocation, $walk->detailsPageUrl);

        echo "</div>" . PHP_EOL;

        if ($walk->isLinear) {
            echo "<div class='finishplace'>";
            if ($walk->finishLocation != null) {
                echo $this->addLocationInfo("Finish", $walk->finishLocation, $walk->detailsPageUrl);
            } else {
                echo "<span class='walkerror' >Linear walk but no finish location supplied</span>";
            }
            echo "</div>" . PHP_EOL;
        }
        echo "<div class='difficulty'><b>Difficulty</b>: ";
        if ($walk->distanceMiles > 0) {
            echo RHtml::withDiv("distance", "<b>Distance</b>: " . $walk->distanceMiles . "mile / " . $walk->distanceKm . "km", $this->printOn);
        }
        $link = $walk->nationalGrade;
        if ($this->nationalGradeHelp != "") {
            $link = "<a href='" . $this->nationalGradeHelp . "' target='" . $this->nationalGradeTarget . "'>" . $link . "</a>";
        }
        echo RHtml::withDiv("nationalgrade", "<b>National Grade</b>: " . $link, $this->printOn);

        if ($walk->localGrade != "") {
            $link = $walk->localGrade;
            if ($this->localGradeHelp != "") {
                $link = "<a href='" . $this->localGradeHelp . "' target='" . $this->localGradeTarget . "'>" . $link . "</a>";
            }
            echo RHtml::withDiv("localgrade", "<b>Local Grade</b>: " . $link, $this->printOn);
        }
        if ($walk->pace != null) {
            echo RHtml::withDiv("pace", "<b>Pace</b>: " . $walk->pace, $this->printOn);
        }
        if ($walk->ascentFeet != null) {
            echo RHtml::withDiv("ascent", "<b>Ascent</b>: " . $walk->ascentFeet . " ft " . $walk->ascentMetres . " ms", $this->printOn);
        }
        echo "</div>" . PHP_EOL;
        if ($walk->isLeader == false) {
            echo "<div class='walkcontact'><b>Contact</b>: ";
        } else {
            echo "<div class='walkcontact'><b>Contact Leader</b>: ";
        }
        echo RHtml::withDiv("contactname", "<b>Name</b>: " . $walk->contactName, $this->printOn);
        if ($walk->email != "") {

            echo RHtml::withDiv("email", "<b>Email</b>: " . $walk->email, $this->printOn);
        }
        if ($walk->telephone1 . $walk->telephone2 != "") {
            $text = "<b>Telephone</b>: ";
            If ($walk->telephone1 != "") {
                $text.= $walk->telephone1;
                if ($walk->telephone2 != "") {
                    $text.= ", ";
                }
            }
            if ($walk->telephone2 != "") {
                $text.= $walk->telephone2;
            }
            echo RHtml::withDiv("telephone", $text, $this->printOn);
        }
        if ($walk->isLeader == false) {
            if ($walk->walkLeader != "") {
                echo "<div class='walkleader'><b>Walk Leader</b>: " . $walk->walkLeader . "</div>" . PHP_EOL;
            }
        }
        echo "</div>" . PHP_EOL;
        $this->addItemInfo("strands", "", $walk->strands);
        $this->addItemInfo("festivals", "Festivals", $walk->festivals);
        echo "<div class='walkdates'>" . PHP_EOL;

        if (!$this->printOn) {
            echo "<div class='updated'><a href='" . $walk->detailsPageUrl . "' target='_blank' >View walk on Walks Finder</a></div>" . PHP_EOL;
        }
        $class = "";
        if ($this->printOn) {
            $class = "printon";
        }
        if ($this->displayGroup != false) {
            echo "<div class='groupfootnote " . $class . "'>Group: " . $walk->groupName . "</div>" . PHP_EOL;
        }
        echo "<div class='updated " . $class . "'>Last update: " . $walk->dateUpdated->format('l, jS F Y') . "</div>" . PHP_EOL;
        echo "</div>" . PHP_EOL;
        echo "</div>" . PHP_EOL;
    }

    private function addLocationInfo($title, $location, $detailsPageUrl) {

        if ($location->exact) {
            $note = "Click Google Directions to see map and directions from your current location";
            $out = "<div class='place'><b>" . $title . " Place</b>:<abbr title='" . $note . "'> " . $location->description . " ";
            if (!$this->printOn) {
                $out.=$location->getDirectionsMap("Google directions");
            }
            if ($this->printOn) {
                if ($location->time <> "") {
                    $out.= RHtml::withDiv("time", "<b>Time</b>: " . $location->timeHHMMshort, $this->printOn);
                }
            }
            $out.= "</abbr></div>";
            if (!$this->printOn) {
                if ($location->time <> "") {
                    $out.= RHtml::withDiv("time", "<b>Time</b>: " . $location->timeHHMMshort, $this->printOn);
                }
            }
            $gr = "<abbr title='Click Map to see Ordnance Survey map of location'><b>Grid Ref</b>: " . $location->gridref . " ";
            if (!$this->printOn) {
                $gr.=$location->getOSMap("OS Map");
            }
            $gr.= "</abbr>";
            $out.= RHtml::withDiv("gridref", $gr, $this->printOn);
            $out.= RHtml::withDiv("latlong", "<b>Latitude</b>: " . $location->latitude . " , <b>Longitude</b>: " . $location->longitude, $this->printOn);

            if ($location->postcode != "") {
                $out.= $location->displayPostcode($detailsPageUrl);
            }
        } else {
            $out = "<div class='place'>";
            if (!$this->printOn) {
                $out .= "Location shown is an indication of where the walk will be and <b>NOT</b> the start place: ";
                $out.=$location->getAreaMap("Map of area");
            }
            $out.= "</div>";
        }

        return $out;
    }

    function addItemInfo($class, $title, $value) {
        if ($value != null) {
            $items = $value->getItems();
            echo "<div class='" . $class . "'><b>" . $title . "</b>";
            foreach ($items as $item) {
                echo "<div class='item'><b>" . $item->getName() . "</b></div>";
            }
            echo "</div>";
        }
    }

    function getShortTime($time) {
        $timeHHMM = $time->format('g:i a');
        $timeHHMMshort = str_replace(":00", "", $timeHHMM);
        if ($timeHHMMshort == "12 am") {
            $time = "";
            $timeHHMM = "No time";
            $timeHHMMshort = "No time";
        }
        return $timeHHMMshort;
    }

}
