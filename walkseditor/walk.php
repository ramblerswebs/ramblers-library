<?php

/**
 * Description of walk
 *
 * @author Chris Vaughan
 */
class RWalkseditorWalk {

    private $walk = null;

    const TIMEFORMAT = "Y-m-d";

    public function __construct($json) {
        $this->walk = json_decode($json);
    }

    public function listView() {
        if ($this->walk === null) {
            return "No walk details supplied";
        }
        $out = "";
        if (property_exists($this->walk, 'basics')) {
//            if (property_exists($this->walk->basics, 'date')) {
//                $datetime = DateTime::createFromFormat(self::TIMEFORMAT, $this->walk->basics->date);
//                if (!$datetime) {
//                    $out .= "No Date";
//                } else {
//                    $out .= $datetime->format("D,jS M Y").", ";
//                }
//            } else {
//                $out .= "No Date";
//            }
            if (property_exists($this->walk->basics, 'title')) {
                $out .= $this->walk->basics->title;
            } else {
                $out .= "No title";
            }
        }

        return $out;
    }

    public function tableView($headings, $formats) {
        
    }

    public function fullView() {
        
    }

    private function getWalkValue($walk, $option, $addlink) {
        $BR = "<br/>";
        $out = "";
        $values = $this->getPrefix($option);
        $prefix = $values[0];
        $option = $values[1];
        switch ($option) {
            case "{lf}":
                $out = "<br/>";
                break;
            case "{group}":
                $out = $walk->groupName;
                break;
            case "{dowShortdd}":
                $out = $this->addWalkLink($walk, "<b>" . shortDoW($this->dayofweek()) . ", " . $walk->day() . "</b>", addlink, "");
                break;
            case "{dowShortddmm}":
                $out = $this->addWalkLink($walk, "<b>" . shortDoW($this->dayofweek()) . ", " . $walk->day() . " " . $walk->month() . "</b>", addlink, "");
                break;
            case "{dowShortddyyyy}":
                $out = $this->addWalkLink($walk, "<b>" . shortDoW($this->dayofweek()) . " " . $walk->walkDate->date->substr(0, 4) . "</b>", addlink, "");
                break;
            case "{dowdd}":
                $out = $this->addWalkLink($walk, "<b>" . $this->dayofweek() . ", " . $walk->day . "</b>", addlink, "");
                break;
            case "{dowddmm}":
                $out = "<b>" . $this->dayofweek() . ", " . $this->day . " " . $this->month . "</b>";
                $out = $this->addWalkLink($walk, "<b>" . $this->dayofweek() . ", " . $this->day() . " " . $this->month() . "</b>", addlink, "");
                break;
            case "{dowddmmyyyy}":
                $out = $this->addWalkLink($walk, "<b>" . $this->dayofweek() . ", " . $walk->day() . " " . $walk->month() . " " . $walk->walkDate->date->substr(0, 4) . "</b>", addlink, "");
                break;
            case "{meet}":
                if ($walk->hasMeetPlace()) {
                    $out = $walk->meetLocation->timeHHMMshort;
                    if ($walk->meetLocation->description) {
                        $out .= " at " . $walk->meetLocation->description;
                    }
                }
                break;
            case "{meetTime}":
                if ($walk->hasMeetPlace) {
                    $out = $walk->meetLocation->timeHHMMshort;
                }
                break;
            case "{meetPlace}":
                if ($walk->hasMeetPlace) {
                    $out = $walk->meetLocation->description;
                }
                break;
            case "{meetGR}":
                if ($walk->hasMeetPlace) {
                    $out = $walk->meetLocation->gridref;
                }
                break;
            case "{meetPC}":
                if ($walk->hasMeetPlace) {
                    $out = $walk->meetLocation->postcode;
                }
                break;
            case "{start}":
                if ($walk->startLocation->exact) {
                    $out = $walk->startLocation->timeHHMMshort;
                    if ($walk->startLocation->description) {
                        $out .= " at " . $walk->startLocation->description;
                    }
                }
                break;
            case "{startTime}":
                if ($walk->startLocation->exact) {
                    $out = $walk->startLocation->timeHHMMshort;
                }
                break;
            case "{startPlace}":
                if ($walk->startLocation->exact) {
                    if ($walk->startLocation->description) {
                        $out .= $walk->startLocation->description;
                    }
                }
                break;
            case "{startGR}":
                if ($walk->startLocation->exact) {
                    $out = $walk->startLocation->gridref;
                }
                break;
            case "{startPC}":
                if ($walk->startLocation->exact) {
                    $out = $walk->startLocation->postcode;
                }
                break;
            case "{title}":
                $out = $this->addWalkLink($walk, $walk->title, addlink, "");
                $out = "<b>" . $out . "</b>";
                break;
            case "{description}":
                $out = $walk->description;
                break;
            case "{difficulty}":
                $out = getWalkValue($walk, "{distance}", addlink);
                $out .= "<br/><span class='pointer " . str_replace(" ", "", $walk->nationalGrade) . "' onclick='javascript:dGH()'>" . $walk->nationalGrade . "</span>";
                if ($walk->localGrade !== "") {
                    $out .= "<br/>" . $walk->localGrade;
                }
                break;
            case "{distance}":
                if ($walk->distanceMiles > 0) {
                    $out = $walk->distanceMiles . "mi / " . $walk->distanceKm . "km";
                }
                break;
            case "{nationalGrade}":
                $out = "<span class='pointer " . str_replace(" ", "", $walk->nationalGrade) . "' onclick='javascript:dGH()'>" . $walk->nationalGrade . "</span>";
                break;
            case "{nGrade}":
                $out = "<span class='pointer " . str_replace(" ", "", $walk->nationalGrade) . "' onclick='javascript:dGH()'>" . $walk->nationalGrade->substr(0, 1) . "</span>";
                break;
            case "{localGrade}":
                $out = $walk->localGrade;
                break;
            case "{additionalNotes}":
                $out = $walk->additionalNotes;
                break;
            case "{contact}":
                $out = "";
                if ($walk->isLeader) {
                    $prefix .= "Leader";
                } else {
                    $prefix .= "Contact";
                }
                if ($walk->contactName !== "") {
                    $out .= " <strong>" . $walk->contactName . "</strong>";
                }
                if ($walk->email !== "") {
                    $out .= BR . getEmailLink($walk);
                }
                if ($walk->telephone1 !== "") {
                    $out .= BR . $walk->telephone1;
                }
                if ($walk->telephone2 !== "") {
                    $out .= BR . $walk->telephone2;
                }
                break;
            case "{contactname}":
                $contact = "";
                if ($walk->isLeader) {
                    $prefix .= "Leader ";
                } else {
                    $prefix .= "Contact ";
                }
                if ($walk->contactName !== "") {
                    $contact .= $walk->contactName;
                }
                $out = $contact;
                break;
            case "{telephone}":
            case "{telephone1}":
                if ($walk->telephone1 !== "") {
                    $out .= $walk->telephone1;
                }
                break;
            case "{telephone2}":
                if ($walk->telephone2 !== "") {
                    $out .= $walk->telephone2;
                }
                break;
            case "{email}":
            case "{emailat}":
                $contact = "";
                if ($walk->email !== "") {
                    $contact .= $walk->email;
                }
                $out = $contact;
                break;
            case "{emaillink}":
                $out = getEmailLink($walk);
                break;
            case "{mediathumbr}":
                $out = '';
                if ($walk->media->length > 0) {
                    $out = "<img class='mediathumbr' src='" . $walk->media[0]->url . "' >";
                    $out = $this->addWalkLink($walk, out, addlink, "");
                }
                break;
            case "{mediathumbl}":
                $out = '';
                if ($walk->media->length > 0) {
                    $out = "<img class='mediathumbl' src='" . $walk->media[0]->url . "' >";
                    $out = $this->addWalkLink($walk, out, addlink, "");
                }
                break;
            default:
                $option = $option->replace("{", "");
                $out = $option->replace("}", "");
        }
        if ($out !== "") {
            return $prefix . $out;
        }
        return "";
    }

    private function shortDoW($day) {
        switch ($day) {
            case "Monday":
                return "Mon";
                break;
            case "Tuesday":
                return "Tues";
                break;
            case "Wednesday":
                return "Wed";
                break;
            case "Thursday":
                return "Thur";
                break;
            case "Friday":
                return "Fri";
                break;
            case "Saturday":
                return "Sat";
                break;
            case "Sunday":
                return "Sun";
                break;
        }
        return "";
    }

    private function getPrefix($option) {
        $prefix = "";
        $loop = true;
        do {
            switch (substr($option, 0, 2)) {
                case "{;":
                    $prefix .= "<br/>";
                    $option = str_replace("{;", "{", $option);
                    break;
                case "{,":
                    $prefix .= ", ";
                    $option = str_replace("{,", "{", $option);
                    break;
                case "{[":
                    $close->strpos($option, "]");
                    if ($close > 0) {
                        $prefix .= substr($option, 2, close - 2);
                        $option = "{" . substr($option . close + 1);
                    } else {
                        $prefix .= $option;
                        $option = "{}";
                    }
                    break;
                default:
                    $loop = false;
            }
        } while ($loop);
        return [$prefix, $option];
    }

    private function addWalkLink($walk, $text, $addlink, $class) {
        return $text;
    }

    private function dayofweek() {
        if (property_exists($this->walk, basics)) {
            if (property_exists($this->walk->basics, date)) {
                $days = array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
                $datetime = date($this->walk->basics->date);
                $day_num = date('w', strtotime($datetime));
                return $days[$day_num];
            }
        }
        return "Not set";
    }

    private function getProperty($levels) {
        $obj = $this->walk;
        if ($obj === null) {
            return null;
        }
        foreach ($levels as $level) {
            if (property_exists($obj, $level)) {
                $obj = $obj->$level;
            } else {
                return null;
            }
        }
        return $obj;
    }

    public function displayDate() {
        $item = $this->getProperty(['basics', 'date']);
        $out = "";
        if ($item !== null) {
            $date = substr($item, 0, 10);
            if ($date === "0000-00-00") {
                echo "No Date";
            } else {
                $datetime = DateTime::createFromFormat("Y-m-d", $date);
                echo $datetime->format("D, jS M Y");
            }
            $out .= $item;
        } else {
            $out .= "Not defined";
        }

        return $out;
    }

    public function displayTitle() {
        $item = $this->getProperty(['basics', 'title']);
        if ($item !== null) {
            return $item;
        } else {
            return "Not defined";
        }
    }

    public function displayContact() {
        $item = $this->getProperty(['contact', 'displayName']);
        if ($item !== null) {
            return $item;
        } else {
            return "No contact";
        }
    }

    public function displayDistance() {
        $items = $this->getProperty(['walks']);
        if ($items !== null) {
            $out = '';
            $first = true;
            foreach ($items as $item) {
                if (property_exists($item, 'distance')) {
                    if (!$first) {
                        $out .= ", ";
                    } else {
                        $first = false;
                    }
                    $out .= $item->distance;
                } else {
                    return "No walk distance";
                }
            }
        } else {
            return "No walks";
        }
        return $out;
    }

}
