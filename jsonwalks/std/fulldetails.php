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
    public $popupLink = true; // not used now!
    public $displayGroup = false;  // should the Group name be displayed
    private $printOn = false;

    function DisplayWalks($walks) {
        $document = JFactory::getDocument();
        $this->printOn = JRequest::getVar('print') == 1;
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
            echo '<div class="ra-accordion-item ' . $this->walkClass . $walk->status . '">';
            if ($this->printOn) {
                echo '<div class="printfulldetails">';
            } else {
                echo '<div class="toggler">';
            }
            echo '<span><span>';

            $this->displayWalkSummary($walk);
            echo '</span></span>';
            echo '</div>';
            echo '<div class="clr"></div>';
            if ($this->printOn) {
                echo '<div class="ra-fulldetails-container style="display: block;">';
                echo '<div class="ra-fulldetails-inner">';
            } else {
                echo '<div class="ra-accordion-container" style="display: none;">';
                echo '<div class="ra-accordion-inner">';
            }
            $this->displayWalkDetails($walk);
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
        //  echo "<div class='" . $this->walkClass . $walk->status . "' ><div>" . PHP_EOL;
        echo $text . PHP_EOL;
        //  echo "</div></div>" . PHP_EOL;
    }

    function displayWalkDetails($walk) {

        echo "<div class='walkstdfulldetails'>";
        if ($this->displayGroup) {
            echo "<div class='group'><b>Group</b>: " . $walk->groupName . "</div>";
        }
        echo "<div class='basics'>";
        if ($this->printOn) {
            
        } else {
            echo "<div class='description'><b>" . $walk->walkDate->format('l, jS F Y') . PHP_EOL;
            echo "<br/>" . $walk->title . "</b></div>";
        }

        if ($walk->description != "") {
            echo "<div class='description'> " . $walk->description . "</div>";
        }
        if ($walk->additionalNotes != "") {
            echo "<div class='additionalnotes'><b>Additional Notes</b>: " . $walk->additionalNotes . "</div>";
        }
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
            if ($walk->finishLocation != null) {
                echo $this->addLocationInfo("Finish", $walk->finishLocation);
            } else {
                echo "<span class='walkerror' >ERROR: No finish location supplied</span>";
            }
            echo "</div>";
        }
        echo "<div class='difficulty'><b>Difficulty</b>: ";
        echo $this->withDiv("distance", "<b>Distance</b>: " . $walk->distanceMiles . "m / " . $walk->distanceKm . "km");
        $link = $walk->nationalGrade;
        if ($this->nationalGradeHelp != "") {
            $link = "<a href='" . $this->nationalGradeHelp . "' target='" . $this->nationalGradeTarget . "'>" . $link . "</a>";
        }
        echo $this->withDiv("nationalgrade", "<b>National Grade</b>: " . $link);

        if ($walk->localGrade != "") {
            $link = $walk->localGrade;
            if ($this->localGradeHelp != "") {
                $link = "<a href='" . $this->localGradeHelp . "' target='" . $this->localGradeTarget . "'>" . $link . "</a>";
            }
            echo $this->withDiv("localgrade", "<b>Local Grade</b>: " . $link);
        }
        if ($walk->pace != null) {
            echo $this->withDiv("pace", "<b>Pace</b>: " . $walk->pace);
        }
        if ($walk->ascentFeet != null) {
            echo $this->withDiv("ascent", "<b>Ascent</b>: " . $walk->ascentFeet . " ft " . $walk->ascentMetres . " ms");
        }
        echo "</div>";
        if ($walk->isLeader == false) {
            echo "<div class='walkcontact'><b>Contact</b>: ";
        } else {
            echo "<div class='walkcontact'><b>Contact Leader</b>: ";
        }
        echo $this->withDiv("contactname", "<b>Name</b>: " . $walk->contactName);
        if ($walk->email != "") {

            echo $this->withDiv("email", "<b>Email</b>: " . $walk->email);
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
            echo $this->withDiv("telephone", $text);
        }
        if ($walk->isLeader == false) {
            if ($walk->walkLeader != "") {
                echo "<div class='walkleader'><b>Walk Leader</b>: " . $walk->walkLeader . "</div>";
            }
        }
        echo "</div>";
        $this->addItemInfo("strands", "", $walk->strands);
        $this->addItemInfo("festivals", "Festivals", $walk->festivals);
        echo "<div class='walkdates'>";
        $class = "";
        if ($this->printOn) {
            $class = "printon";
        }
        if ($this->displayGroup == false) {
            echo "<div class='groupfootnote " . $class . "'>Group: " . $walk->groupName . "</div>";
        }
        echo "<div class='updated " . $class . "'>Last update: " . $walk->dateUpdated->format('l, jS F Y') . "</div>";
        echo "</div>";

        echo "</div>";
    }

    private function addLocationInfo($title, $location) {

        if ($location->exact) {
            $note = "Click Google Directions to see map and directions from your current location";
            $out = "<div class='place'><b>" . $title . " Place</b>:<abbr title='" . $note . "'> " . $location->description . " ";
            if (!$this->printOn) {
                $out.=$this->getDirectionsMap("Google directions", $location);
            }
            if ($this->printOn) {
                $out.= $this->withDiv("time", "<b>Time</b>: " . $location->timeHHMMshort);
            }
            $out.= "</abbr></div>";
            if (!$this->printOn) {
                $out.= $this->withDiv("time", "<b>Time</b>: " . $location->timeHHMMshort);
            }

            $gr = "<abbr title='Click Map to see Ordnance Survey map of location'><b>Grid Ref</b>: " . $location->gridref . " ";
            if (!$this->printOn) {
                $gr.=$this->getOSMap("OS Map", $location);
            }
            $gr.= "</abbr>";
            $out.= $this->withDiv("gridref", $gr);
            $out.= $this->withDiv("latlong", "<b>Latitude</b>: " . $location->latitude . " , <b>Longitude</b>: " . $location->longitude);

            if ($location->postcode != "") {
                $out.= $this->displayPostcode($location);
            }
        } else {
            $out = "<div class='place'>";
            if (!$this->printOn) {
                $out .= "Location shown is an indication of where the walk will be and <b>NOT</b> the start place: ";
                $out.=$this->getAreaMap("Map of area", $location);
            }
            $out.= "</div>";
        }

        return $out;
    }

    function withDiv($class, $text) {
        $out = "";
        if ($this->printOn) {
            $out.="&nbsp;&nbsp;&nbsp;" . $text;
        } else {
            $out.= "<div class='" . $class . "'>";
            $out.=$text;
            $out.= "</div>";
        }
        return $out;
    }

    function displayPostcode($location) {
        $lat1 = $location->postcodeLatitude;
        $lon1 = $location->postcodeLongitude;
        $lat2 = $location->latitude;
        $lon2 = $location->longitude;
        $dist = 1000 * round(RGeometryGreatcircle::distance($lat1, $lon1, $lat2, $lon2, "KM"), 3); // metres
        $direction = RGeometryGreatcircle::direction($lat1, $lon1, $lat2, $lon2);
        If ($dist < 100) {
            $note = "Postcode is within 100m of location";
            $link = "";
            $distclass = " distclose";
        } else {
            if ($dist < 500) {
                $distclass = " distnear";
            } else {
                $distclass = " distfar";
            }
            $note = $location->type . " place is " . $dist . " metres " . $direction . " of postcode. ";
            $note.= "Click to display the locations of the Postcode(P) and " . $location->type . " locations";
            $note2 = $dist . " metres " . RGeometryGreatcircle::directionAbbr($direction);
            $link = $this->getPostcodeMap($note2, $location);
        }
        $pc = "<abbr title='" . $note . "'><b>Postcode</b>: " . $location->postcode . " ";
        $pc.=$link;
        $pc.= "</abbr>";
        $out = $this->withDiv("postcode " . $distclass, $pc);
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

    private function getDirectionsMap($text, $location) {
        $code = "https://www.google.com/maps/dir/Current+Location/[lat],[long]";
        $code = str_replace("[lat]", $location->latitude, $code);
        $code = str_replace("[long]", $location->longitude, $code);

        $out = "<span class='mappopup' onClick=\"javascript:window.open('" . $code . "', '_blank','toolbar=yes,scrollbars=yes,left=50,top=50,width=800,height=600');\">[" . $text . "]</span>";
        return $out;
    }

    private function getOSMap($text, $location) {
        $code = "http://streetmap.co.uk/loc/[lat],[long]&amp;Z=115";
        $code = str_replace("[lat]", $location->latitude, $code);
        $code = str_replace("[long]", $location->longitude, $code);
        $out = "<span class='mappopup' onClick=\"javascript:window.open('" . $code . "', '_blank','toolbar=yes,scrollbars=yes,left=50,top=50,width=800,height=600');\">[" . $text . "]</span>";
        return $out;
    }

    private function getAreaMap($text, $location) {
        $code = "http://maps.google.com/maps?z=13&amp;t=h&amp;ll=[lat],[long]";
        $code = str_replace("[lat]", $location->latitude, $code);
        $code = str_replace("[long]", $location->longitude, $code);
        $out = "<span class='mappopup' onClick=\"javascript:window.open('" . $code . "', '_blank','toolbar=yes,scrollbars=yes,left=50,top=50,width=800,height=600');\">[" . $text . "]</span>";
        return $out;
    }

    private function getPostcodeMap($text, $location) {
        // $code = "https://maps.googleapis.com/maps/api/staticmap?center=[latcentre],[longcentre]&size=512x512&path=color:0xff0000ff|weight:5|[lat1],[long1]|[lat2],[long2]&markers=color:blue|label:P|[lat1],[long1]&markers=color:green|label:[Lab]|[lat2],[long2]";
        $code = "https://maps.googleapis.com/maps/api/staticmap?center=[latcentre],[longcentre]&amp;size=512x512&amp;markers=color:blue|label:P|[lat1],[long1]&amp;markers=color:green|label:[Lab]|[lat2],[long2]";
        $centreLatitude = ($location->latitude + $location->postcodeLatitude) / 2;
        $centreLongitude = ($location->longitude + $location->postcodeLongitude) / 2;
        $code = str_replace("[lat1]", $location->postcodeLatitude, $code);
        $code = str_replace("[long1]", $location->postcodeLongitude, $code);
        $code = str_replace("[lat2]", $location->latitude, $code);
        $code = str_replace("[long2]", $location->longitude, $code);
        $code = str_replace("[latcentre]", $centreLatitude, $code);
        $code = str_replace("[longcentre]", $centreLongitude, $code);
        $lab = substr($location->type, 0, 1);
        $code = str_replace("[Lab]", $lab, $code);

        $out = "<span class='mappopup' onClick=\"javascript:window.open('" . $code . "', '_blank','toolbar=yes,scrollbars=yes,left=50,top=50,width=600,height=600');\">[" . $text . "]</span>";
        return $out;
    }

}
