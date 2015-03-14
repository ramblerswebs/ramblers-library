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
            //  $thiscontact = $walk->contactName . "  " . $walk->telephone1;

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

    function displayWalkDetails($walk) {

        echo "<div class='walkstdfulldetails'>";
        if ($this->displayGroup) {
            echo "<div class='group'><b>Group</b>: " . $walk->groupName . "</div>";
        }
        echo "<div class='basics'>";
        echo "<div class='description'><b>" . $walk->walkDate->format('l, jS F Y') . PHP_EOL;
        echo "<br/>" . $walk->title . "</b></div>";
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
        echo "<div class='distance'><b>Distance</b>: " . $walk->distanceMiles . "m / " . $walk->distanceKm . "km" . "</div>";
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
        if ($walk->isLeader == false) {
            echo "<div class='walkcontact'><b>Contact</b>: ";
        } else {
            echo "<div class='walkcontact'><b>Contact Leader</b>: ";
        }
        echo "<div class='contactname'><b>Name</b>: " . $walk->contactName . "</div>";
        if ($walk->email != "") {
            echo "<div class='email'><b>Email</b>: " . $walk->email . "</div>";
        }
        if ($walk->telephone1 . $walk->telephone2 != "") {
            $text = "<div class='telephone'><b>Telephone</b>: ";
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
        if ($walk->isLeader == false) {
            if ($walk->walkLeader != "") {
                echo "<div class='walkleader'><b>Walk Leader</b>: " . $walk->walkLeader . "</div>";
            }
        }
        echo "</div>";
        $this->addItemInfo("strands", "", $walk->strands);
        $this->addItemInfo("festivals", "Festivals", $walk->festivals);
        echo "<div class='walkdates'>";
        if ($this->displayGroup == false) {
            echo "<div class='groupfootnote'>Group: " . $walk->groupName . "</div>";
        }
        echo "<div class='updated'>Last update: " . $walk->dateUpdated->format('l, jS F Y') . "</div>";
        echo "</div>";

        echo "</div>";
    }

    private function addLocationInfo($title, $location) {

        if ($location->exact) {
            $note = "Click Map & Directions to see Google map of directions from your current location";
            $out = "<div class='place'><b>" . $title . " Place</b>:<abbr title='" . $note . "'> " . $location->description . " ";
            $out.=$this->getDirectionsMap("Map & Directions", $location);
            $out.= "</abbr></div>";
            $out.= "<div class='time'><b>Time</b>: " . $location->timeHHMMshort . "</div>";
            $note = "Click Map to see Ordnance Survey map of location";
            $out.= "<div class='gridref'><abbr title='" . $note . "'><b>Grid Ref</b>: " . $location->gridref . " ";
            $out.=$this->getOSMap("OS Map", $location);
            $out.= "</abbr></div>";

            $out.= "<div class='latlong'><b>Latitude</b>: " . $location->latitude;
            $out.= " , <b>Longitude</b>: " . $location->longitude . "</div>";
            if ($location->postcode != "") {
                $out.= $this->displayPostcode($location);
            }
        } else {
            $out = "<div class='place'>Location shown is an indication of where the walk will be and <b>NOT</b> the start place: ";
            $out.=$this->getAreaMap("Map of area", $location);
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
            $note.= "Click Show to display the locations of the Postcode(P) and " . $location->type . " locations";
            $link = $this->getPostcodeMap("Show", $location);
        }
        $out = "<div class='postcode " . $distclass . "'><abbr title='" . $note . "'><b>Postcode</b>: " . $location->postcode . " ";
        $out.=$link;
        $out.= "</abbr></div>";
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
        // $code="https://www.google.com/maps/embed/v1/directions?key=API_KEY&origin=[Current+Location]&destination=[lat],[long]";
        $code = str_replace("[lat]", $location->latitude, $code);
        $code = str_replace("[long]", $location->longitude, $code);

        $out = "<span class='mappopup' onClick=\"javascript:window.open('" . $code . "', '_blank','toolbar=yes,scrollbars=yes,left=50,top=50,width=800,height=600');\">[" . $text . "]</span>";
        return $out;
    }

    private function getOSMap($text, $location) {
        $code = "http://streetmap.co.uk/loc/[lat],[long]&Z=115";
        $code = str_replace("[lat]", $location->latitude, $code);
        $code = str_replace("[long]", $location->longitude, $code);
        $out = "<span class='mappopup' onClick=\"javascript:window.open('" . $code . "', '_blank','toolbar=yes,scrollbars=yes,left=50,top=50,width=800,height=600');\">[" . $text . "]</span>";
        return $out;
    }

    private function getAreaMap($text, $location) {
        $code = "http://maps.google.com/maps?z=13&t=h&ll=[lat],[long]";
        $code = str_replace("[lat]", $location->latitude, $code);
        $code = str_replace("[long]", $location->longitude, $code);
        $out = "<span class='mappopup' onClick=\"javascript:window.open('" . $code . "', '_blank','toolbar=yes,scrollbars=yes,left=50,top=50,width=800,height=600');\">[" . $text . "]</span>";
        return $out;
    }

    private function getPostcodeMap($text, $location) {
        // $code = "https://maps.googleapis.com/maps/api/staticmap?center=[latcentre],[longcentre]&size=512x512&path=color:0xff0000ff|weight:5|[lat1],[long1]|[lat2],[long2]&markers=color:blue|label:P|[lat1],[long1]&markers=color:green|label:[Lab]|[lat2],[long2]";
        $code = "https://maps.googleapis.com/maps/api/staticmap?center=[latcentre],[longcentre]&size=512x512&markers=color:blue|label:P|[lat1],[long1]&markers=color:green|label:[Lab]|[lat2],[long2]";
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
