<?php

// no direct access
defined('_JEXEC') or die('Restricted access');

class RJsonwalksWalk extends REvent {

// administration items
    public $id;                     // database ID of walk on Walks Finder
    public $status;                 // whether the walk is published, cancelled etc
    public $groupCode;              // group code e.g. SR01
    public $groupName;              // the group name e.g. Derby & South Derbyshire
    public $dateUpdated;            // date of the walk as a datetime object
    public $dateCreated;            // date of the walk as a datetime object
    public $cancellationReason;     // text reason walk cancelled
// basic walk details
    public $walkDate;               // date of the walk as a datetime object
    Public $dayofweek;              // day of the week as text
    public $day;                    // the day number as text
    public $month;                  // the month as text
    public $title;                  // title of the walk
    public $description = "";       // description of walk with html tags removed
    public $descriptionHtml = "";   // description of walk with html tags
    public $additionalNotes = "";   // the additional notes field as text
    public $detailsPageUrl = "";    // url to access the ramblers.org.uk page for this walk
// contact
    public $isLeader = false;       // is the contact info for the leader of the walk
    public $walkLeader = "";        // walk leader if isLeader is false
    public $contactName = "";       // contact name
    public $email = "";             // email address for contact
    // private $emailAddr = "";             // email address for contact
    public $telephone1 = "";        // first telephone number of contact
    public $telephone2 = "";        // second telephone number of contact
// meeting place
    public $hasMeetPlace = false;   // true or false
    public $meetLocation;           // a [[RJsonwalksLocation]] object if hasMeetPlace=true
// starting place
    public $startLocation;          // a [[RJsonwalksLocation]] object for the start
// finish place
    public $isLinear = false;       // true if walk has a finishing place otherwise false
    public $finishLocation;         // a [[RJsonwalksLocation]] object if isLinear=true
    // not always provided so check if null
    public $finishTime;             // finishTime as dateTime or null
// grades ,length
    public $nationalGrade = "";     // national grade as full word
    public $localGrade = "";        // local grade
    public $distanceMiles;          // distance of walk as number in miles
    public $distanceKm;             // distance of walk as number in kilometres
    public $pace;                   // the pace of the walk or null
    Public $ascentMetres;           // the ascent in metres or null
    Public $ascentFeet;             // the ascent in feet or null
    Public $strands;                // RJsonwalksItems object or null
    Public $festivals;              // RJsonwalksItems object or null
    public $suitability;            // RJsonwalksItems object or null
    public $surroundings;           // RJsonwalksItems object or null
    public $theme;                  // RJsonwalksItems object or null
    public $specialStatus;          // RJsonwalksItems object or null
    public $facilities;             // RJsonwalksItems object or null
    public $media;                  //array of image infomation
// extra derived values
    private $sortTime;
    private $icsDayEvents = false;
    private static $withMonth = ["{dowShortddmm}", "{dowddmm}", "{dowddmmyyyy}"];
    private static $customValuesClass = null;
    private static $customValuesMethod = null;

    const SORT_DATE = 0;
    const SORT_CONTACT = 1;
    const SORT_NATIONALGRADE = 2;
    const SORT_LOCALGRADE = 3;
    const SORT_DISTANCE = 4;
    const SORT_TELEPHONE1 = 5;
    const SORT_TELEPHONE2 = 6;
    const SORT_TIME = 7;
    const TIMEFORMAT = "Y-m-d\TH:i:s";

    public function __construct($item) {

        try {
            $this->id = $item->id; // admin details
            $this->status = $item->status->value;
            $this->groupCode = $item->groupCode;
            $this->groupName = $item->groupName;
            $item->dateUpdated = substr($item->dateUpdated, 0, 19);
            $item->dateCreated = substr($item->dateCreated, 0, 19);
            $this->dateUpdated = DateTime::createFromFormat(self::TIMEFORMAT, $item->dateUpdated);
            $this->dateCreated = DateTime::createFromFormat(self::TIMEFORMAT, $item->dateCreated);
            $this->cancellationReason = $item->cancellationReason;
// basic walk details
            $this->walkDate = DateTime::createFromFormat(self::TIMEFORMAT, $item->date);

            $this->detailsPageUrl = $item->url;
            $this->title = RHtml::convertToText($item->title);
            $this->descriptionHtml = $item->description;
            $this->description = RHtml::convertToText($this->descriptionHtml);

            $this->additionalNotes = $item->additionalNotes;
            $this->isLinear = $item->isLinear == "true";
            switch ($item->finishTime) {
                case null:
                    $this->finishTime = null;
                    break;
                case "00:00:00":
                    $this->finishTime = null;
                    break;
                default:
                    $day = $this->walkDate->format('Ymd ');
                    $this->finishTime = DateTime::createFromFormat('Ymd H:i:s', $day . $item->finishTime);
                    break;
            }

            $this->nationalGrade = $item->difficulty->text;
            $this->localGrade = $item->gradeLocal;
            $this->distanceMiles = $item->distanceMiles;
            $this->distanceKm = $item->distanceKM;
            $this->pace = $item->pace;
            $this->ascentFeet = $item->ascentFeet;
            $this->ascentMetres = $item->ascentMetres;
// contact details
            if ($item->walkContact != null) {
                $this->isLeader = $item->walkContact->isWalkLeader == "true";
                $this->contactName = trim($item->walkContact->contact->displayName);
                // $this->emailAddr = $item->walkContact->contact->email;
                if (strlen($item->walkContact->contact->email) > 0) {
                    $this->email = "email available";
                }
//                $img='<img src="/library/images/symbol_at.png" alt="@ sign" />';
//                $this->email = str_replace("@", "$img", $this->emailAddr);
                $this->telephone1 = $item->walkContact->contact->telephone1;
                $this->telephone2 = $item->walkContact->contact->telephone2;
            }
            $this->walkLeader = $item->walkLeader;
// read strands
            if (count($item->strands->items) > 0) {
                $this->strands = new RJsonwalksItems($item->strands);
            }
// read festivals
            if (count($item->festivals->items) > 0) {
                $this->festivals = new RJsonwalksItems($item->festivals);
            }
// read suitability
            if (count($item->suitability->items) > 0) {
                $this->suitability = new RJsonwalksItems($item->suitability);
            }
// read surroundings
            if (count($item->surroundings->items) > 0) {
                $this->surroundings = new RJsonwalksItems($item->surroundings);
            }
// read theme
            if (count($item->theme->items) > 0) {
                $this->theme = new RJsonwalksItems($item->theme);
            }
// read specialStatus
            if (count($item->specialStatus->items) > 0) {
                $this->specialStatus = new RJsonwalksItems($item->specialStatus);
            }
            // read facilities
            if (count($item->facilities->items) > 0) {
                $this->facilities = new RJsonwalksItems($item->facilities);
            }
// pocess meeting and starting locations
            $this->processPoints($item->points);
            $this->createExtraData();
            $this->media = $this->getMedia($item);
        } catch (Exception $ex) {
            $this->errorFound = 2;
        }
    }

    public function addYear() {
        $walkyear = $this->walkDate->format('Y');
        $newDate = new DateTime();
        $newDate->add(new DateInterval('P300D'));
        //  $walkDate = new Date($this-> walkDate);
        if ($this->walkDate < $newDate) {
            return '';
        } else {
            return ' ' . $walkyear;
        }
    }

//    private function convert_mails($text) {
//        $emails = $this->fetch_mails($text);
//        foreach ($emails as $value) {
//            $img = '<img src="' . JURI::base(true) . 'libraries/images/symbol_at.png" alt="@ sign" />';
//            $email = str_replace("@", $img, $value);
//            $text = str_replace($value, $email, $text);
//        }
//        return $text;
//    }
//
//    private function fetch_mails($text) {
//
//        //String that recognizes an e-mail
//        $str = '/([a-z0-9_\.\-])+\@(([a-z0-9\-])+\.)+([a-z0-9]{2,4})+/i';
//        preg_match_all($str, $text, $out);
//        //return a blank array if not true otherwise insert the email in $out and return
//        return isset($out[0]) ? $out[0] : array();
//    }

    public function getEmail($option = 0, $withtitle = false) {
        switch ($option) {
            case 0:
                if (strlen($this->email) > 0) {
                    return "...";
                } else {
                    return "";
                }
            case 1:
            case 2:
            case 4:
                $printOn = JRequest::getVar('print') == 1;
                $link = "https://www.ramblers.org.uk/go-walking/find-a-walk-or-route/contact-walk-organiser.aspx?walkId=";
                if ($withtitle) {
                    return RHtml::withDiv("email", "<b>Email: </b><a href='" . $link . $this->id . "' target='_blank'>Contact via ramblers.org.uk</a>", $printOn);
                } else {
                    return RHtml::withDiv("email", "<a href='" . $link . $this->id . "' target='_blank'>Contact via ramblers.org.uk</a>", $printOn);
                }
            case 3:
                return "";
            default:
                return "Invalid option specified for \$display->emailDisplayFormat";
        }
    }

    public function getValue($type) {
        switch ($type) {
            case self::SORT_CONTACT :
                return $this->contactName;
            case self::SORT_DATE:
                return $this->walkDate;
            case self::SORT_DISTANCE:
                return $this->distanceMiles;
            case self::SORT_LOCALGRADE:
                return $this->localGrade;
            case self::SORT_NATIONALGRADE:
                return $this->nationalGrade;
            case self::SORT_TELEPHONE1:
                return $this->telephone1;
            case self::SORT_TELEPHONE2:
                return $this->telephone2;
            case self::SORT_TIME:
                return $this->sortTime;
            default:
                return NULL;
        }
    }

    public function isCancelled() {
        return strtolower($this->status) == "cancelled";
    }

    public function setNewWalk($date) {
        if ($this->status == "New") {
            $this->status = "Published";
        }
        if ($this->status == "Published") {
            if ($this->dateUpdated > $date) {
                $this->status = "New";
            }
        }
    }

    private function createExtraData() {
        $this->dayofweek = $this->walkDate->format('l');
        $this->month = $this->walkDate->format('F');
        $this->day = $this->walkDate->format('jS');
        if ($this->meetLocation != NULL) {
            $this->sortTime = $this->meetLocation->time;
        }
        if ($this->sortTime == NULL) {
            $this->sortTime = $this->startLocation->time;
        }
    }

    private function processPoints($points) {
        $this->hasMeetPlace = false;
        foreach ($points as $value) {
            if ($value->typeString == "Meeting") {
                $this->hasMeetPlace = true;
                $this->meetLocation = new RJsonwalksLocation($value, $this->walkDate);
            }
            if ($value->typeString == "Start") {
                $this->startLocation = new RJsonwalksLocation($value, $this->walkDate);
            }
            if ($value->typeString == "End") {
                $this->finishLocation = new RJsonwalksLocation($value, $this->walkDate);
            }
        }
    }

    public function EventDate() {
        return $this->walkDate;
    }

    public function EventText() {
        $text = "";
        if ($this->hasMeetPlace) {
            $text .= $this->meetLocation->timeHHMMshort;
        }
        if ($this->startLocation->time != "") {
            if ($text != "") {
                $text .= "/";
            }
            $text .= $this->startLocation->timeHHMMshort;
        }
        $text = $text . ", " . $this->title;
        if ($this->distanceMiles > 0) {
            $text .= ", " . $this->distanceMiles . "mi/" . $this->distanceKm . "km";
        }
        return $text;
    }

    public function EventLink($display, $text) {
        return $this->_addWalkLink($this->id, $text);
    }

    public function EventLinks() {
        $out = "";
        If ($this->hasMeetPlace) {
            $out .= "Meet:" . $this->meetLocation->getOSMap("OS Map");
            $out .= " " . $this->meetLocation->getDirectionsMap("Directions");
        }

        $out .= " Start:" . $this->startLocation->getOSMap("OS Map");
        $out .= " " . $this->startLocation->getMap("Directions", "Area Map");
        return $out;
    }

    public function EventStatus() {
        return "walk" . $this->status;
    }

    public function Event_ics($icsfile) {
        if ($this->hasMeetPlace) {
            $meetLocation = $this->meetLocation->getTextDescription();
            $meetLocation .= "; \\n";
        } else {
            $meetLocation = "";
        }
        $startLocation = $this->startLocation->getTextDescription();
        $before = $meetLocation . $startLocation . "\\nDescription: ";
        $after = "\\nContact: " . $this->contactName . " (" . $this->telephone1 . " " . $this->telephone2 . "); \\n";
        if ($this->localGrade <> "") {
            $after .= "Grade: " . $this->localGrade . "/" . $this->nationalGrade . "; \\n ";
        } else {
            $after .= "Grade: " . $this->nationalGrade . "; \\n ";
        }
        $after .= $this->detailsPageUrl;
        $after .= "\\nNote: Finish times are very approximate!";
        if ($this->additionalNotes != '') {
            $after .= "\\nNotes: " . strip_tags($this->additionalNotes);
        }
        $summary = $this->title;
        if ($this->distanceMiles > 0) {
            $summary .= ", " . $this->distanceMiles . "mi/" . $this->distanceKm . "km";
        }
        $now = new datetime();
        $icsfile->addRecord("BEGIN:VEVENT");
        $this->addIcsTimes($icsfile);
        $icsfile->addRecord("LOCATION:", $startLocation);
        $icsfile->addRecord("TRANSP:OPAQUE");
        $icsfile->addSequence($this->dateUpdated);
        $icsfile->addRecord("UID: walk" . $this->id . "-isc@ramblers-webs.org.uk");
        $icsfile->addRecord("ORGANIZER;CN=" . $this->groupName . ":mailto:ignore@ramblers-webs.org.uk");
        if ($this->isCancelled()) {
            $icsfile->addRecord("METHOD:CANCEL");
            $icsfile->addRecord("SUMMARY: CANCELLED ", RHtml::convertToText($summary));
            $icsfile->addRecord("DESCRIPTION: CANCELLED - REASON: ", RHtml::convertToText($this->cancellationReason) . " (" . $this->description . ")");
        } else {
            $icsfile->addRecord("SUMMARY:", RHtml::convertToText($summary));
            $icsfile->addRecord("DESCRIPTION:", $before . $this->description . $after);
            $icsfile->addRecord("X-ALT-DESC;FMTTYPE=text/html:", $before . $this->descriptionHtml . $after, true);
        }
        $icsfile->addRecord("CATEGORIES:", "Walk," . $this->groupName);
        $icsfile->addRecord("DTSTAMP;VALUE=DATE-TIME:", $this->dateTimetoUTC($now));
        $icsfile->addRecord("CREATED;VALUE=DATE-TIME:", $this->dateTimetoUTC($this->dateCreated));
        $icsfile->addRecord("LAST-MODIFIED;VALUE=DATE-TIME:", $this->dateTimetoUTC($this->dateUpdated));
        $icsfile->addRecord("PRIORITY:1");
        $icsfile->addRecord("URL;VALUE=URI:", $this->detailsPageUrl);
        $icsfile->addRecord("CLASS:PUBLIC");
        $icsfile->addRecord("END:VEVENT");
        return;
    }

    private function dateTimetoUTC($date) {
        $utcdate = new DateTime($date->format('Ymd His'));
        $utcdate->setTimezone(new DateTimeZone('UTC'));
        return $utcdate->format('Ymd\THis\Z');
    }

    private function addIcsTimes($icsfile) {
        if ($this->icsDayEvents) {
            $icsfile->addRecord("DTSTART;VALUE=DATE:" . $this->walkDate->format('Ymd'));
        } else {
            $time = $this->getFirstTime();
            if ($time <> null) {
                $icsfile->addRecord("DTSTART;VALUE=DATE-TIME:" . $time->format('Ymd\THis'));
                $time = $this->getFinishTime();
                if ($time <> null) {
                    $icsfile->addRecord("DTEND;VALUE=DATE-TIME:" . $time->format('Ymd\THis'));
                }
            } else {
                $icsfile->addRecord("DTSTART;VALUE=DATE:" . $this->walkDate->format('Ymd'));
            }
        }
    }

    private function getFirstTime() {
        $starttime = RJsonwalksLocation::firstTime($this->meetLocation, $this->startLocation);
        if ($starttime == "") {
            $starttime = null;
        }
        return $starttime;
    }

    private function getFinishTime() {
        if ($this->finishTime != null) {
            return $this->finishTime;
        }
        // calculate end time
        $lasttime = RJsonwalksLocation::lastTime($this->meetLocation, $this->startLocation);
        $durationFullMins = ceil($this->distanceMiles / 2) * 60;
        if ($this->startLocation->exact == false) {
            $durationFullMins += 60;
        }
        $intervalFormat = "PT" . $durationFullMins . "M";
        $interval = new DateInterval($intervalFormat);
        $lasttime = $lasttime->add($interval);
        return $lasttime;
    }

    public static function nationalGradesLink() {
        $out = '<p></p><p>Description of <a href="libraries/ramblers/pages/grades.html" class="jcepopup" data-mediabox="1">National Grades</a></p>';
        echo $out;
    }

    public function getGradeImage() {
        $image = "libraries/ramblers/images/grades/base.jpg";
        switch ($this->nationalGrade) {
            case "Easy Access":
                $image = "libraries/ramblers/images/grades/grade-ea.jpg";
                break;
            case "Easy":
                $image = "libraries/ramblers/images/grades/grade-e.jpg";
                break;
            case "Leisurely":
                $image = "libraries/ramblers/images/grades/grade-l.jpg";
                break;
            case "Moderate":
                $image = "libraries/ramblers/images/grades/grade-m.jpg";
                break;
            case "Strenuous":
                $image = "libraries/ramblers/images/grades/grade-s.jpg";
                break;
            case "Technical":
                $image = "libraries/ramblers/images/grades/grade-t.jpg";
                break;
            default:
                break;
        }
        return $image;
    }

    function getGradeSpan($class) {
        $tag = "";
        $img = $this->getGradeImg();
        switch ($this->nationalGrade) {
            case "Easy Access":
                $tag = "<span data-descr='Easy Access' class='grade " . $class . "'>' onclick='ra.walk.dGH()'>" . $img . "</span>";
                break;
            case "Easy":
                $tag = "<span data-descr='Easy' class='grade " . $class . "' onclick='ra.walk.dGH()'>" . $img . "</span>";
                break;
            case "Leisurely":
                $tag = "<span data-descr='Leisurely' class='grade " . $class . "' onclick='ra.walk.dGH()'>" . $img . "</span>";
                break;
            case "Moderate":
                $tag = "<span data-descr='Moderate' class='grade " . $class . "' onclick='ra.walk.dGH()'>" . $img . "</span>";
                break;
            case "Strenuous":
                $tag = "<span data-descr='Strenuous' class='grade " . $class . "' onclick='ra.walk.dGH()'>" . $img . "</span>";
                break;
            case "Technical":
                $tag = "<span data-descr='Technical' class='grade " . $class . "' onclick='ra.walk.dGH()'>" . $img . "</span>";
                break;
            default:
                break;
        }
        return $tag;
    }

    function getGradeImg() {
        $base = JURI::base();
        $folder = JURI::base(true);
        $url = $folder . "/libraries/ramblers/images/grades/";

        switch ($this->nationalGrade) {
            case "Easy Access":
                $url = "<img src='" . $url . "grade-ea30.jpg' alt='Easy Access' height='30' width='30'>";
                break;
            case "Easy":
                $url = "<img src='" . $url . "grade-e30.jpg' alt='Easy' height='30' width='30'>";
                break;
            case "Leisurely":
                $url = "<img src='" . $url . "grade-l30.jpg' alt='Leisurely' height='30' width='30'>";
                break;
            case "Moderate":
                $url = "<img src='" . $url . "grade-m30.jpg' alt='Moderate' height='30' width='30'>";
                break;
            case "Strenuous":
                $url = "<img src='" . $url . "grade-s30.jpg' alt='Strenuous' height='30' width='30'>";
                break;
            case "Technical":
                $url = "<img src='" . $url . "grade-t30.jpg' alt='Technical' height='30' width='30'>";
                break;
        }
        return $url;
    }

    public function distanceFrom($easting, $northing, $distanceKm) {
        return $this->startLocation->distanceFrom($easting, $northing, $distanceKm);
    }

    function endsWith($haystack, $needle) {
        // search forward starting from end minus needle length characters
        return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== false);
    }

    private function getMedia($item) {
        $out = [];
        if (count($item->media) > 0) {
            foreach ($item->media as $value) {
                $out[] = $value;
            }
        }
        return $out;
    }

    public static function groupByMonth($items) {
        $check = "";
        foreach ($items as $value) {
            if (is_array($value)) {
                $check .= implode(",", $value['items']) . ",";
            } else {
                $check .= $value . ",";
            }
        }
        foreach (self::$withMonth as $value) {
            if (strpos($check, $value) !== false) {
                return false;
            }
        }
        return true;
    }

    public function getMonthGroup() {
        return $this->month . $this->addYear();
    }

    public static function setCustomValues($clss, $method) {
        self::$customValuesClass = $clss;
        self::$customValuesMethod = $method;
    }

    public function getWalkValues($items, $link = true) {
        $text = "";
        foreach ($items as $item) {
            $text .= $this->getWalkValue($item);
        }
        if ($link) {
            return $this->addWalkLink($this->id, $text, "");
        } else {
            return $text;
        }
    }

    public function getWalkValue($options) {
        $BR = "<br/>";
        $out = "";
        $values = $this->getPrefix($options);
        $prefix = $values[0];
        $option = $values[1];
        switch ($option) {
            case "{lf}":
                $out = "<br/>";
                break;
            case "{group}":
                $out = $this->groupName;
                break;
            case "{dowShortdd}":
                //       $out = "<b>" . $this->shortDoW($this->dayofweek) . ", " . $this->day . $this->addYear() . "</b>";
                $out = "<b>" . $this->walkDate->format('D, jS ') . "</b>";

                break;
            case "{dowShortddmm}":
                //     $out = "<b>" . $this->shortDoW($this->dayofweek) . ", " . $this->day . " " . $this->month . $this->addYear() . "</b>";
                $out = "<b>" . $this->walkDate->format('D, jS F') . $this->addYear() . "</b>";
                break;
            case "{dowShortddyyyy}": // published in error
            case "{dowShortddmmyyyy}":
                //      $out = "<b>" . $this->shortDoW($this->dayofweek) . $this->walkyear . "</b>";
                $out = "<b>" . $this->walkDate->format('D, jS F Y') . "</b>";
                break;
            case "{dowdd}":
                $out = "<b>" . $this->walkDate->format('l, jS') . "</b>";
                break;
            case "{dowddmm}":
                $out = "<b>" . $this->walkDate->format('l, jS F') . $this->addYear() . "</b>";
                break;
            case "{dowddmmyyyy}":
                $out = "<b>" . $this->walkDate->format('l, jS F Y') . "</b>";
                break;
            case "{meet}":
                if ($this->hasMeetPlace) {
                    $out = $this->meetLocation->timeHHMMshort;
                    if ($this->meetLocation->description) {
                        $out .= " at " . $this->meetLocation->description;
                    }
                }
                break;
            case "{meetTime}":
                if ($this->hasMeetPlace) {
                    $out = $this->meetLocation->timeHHMMshort;
                }
                break;
            case "{meetPlace}":
                if ($this->hasMeetPlace) {
                    $out = $this->meetLocation->description;
                }
                break;
            case "{meetGR}":
                if ($this->hasMeetPlace) {
                    $out = $this->meetLocation->gridref;
                }
                break;
            case "{meetPC}":
                if ($this->hasMeetPlace) {
                    $out = $this->meetLocation->postcode;
                }
                break;
            case "{meetOLC}":
                break;
            case "{meetMapCode}":
                break;
            case "{start}":
                if ($this->startLocation->exact) {
                    $out = $this->startLocation->timeHHMMshort;
                    if ($this->startLocation->description) {
                        $out .= " at " . $this->startLocation->description;
                    }
                }
                break;
            case "{startTime}":
                if ($this->startLocation->exact) {
                    $out = $this->startLocation->timeHHMMshort;
                }
                break;
            case "{startPlace}":
                if ($this->startLocation->exact) {
                    if ($this->startLocation->description) {
                        $out .= $this->startLocation->description;
                    }
                }
                break;
            case "{startGR}":
                if ($this->startLocation->exact) {
                    $out = $this->startLocation->gridref;
                }
                break;
            case "{startPC}":
                if ($this->startLocation->exact) {
                    $out = $this->startLocation->postcode;
                }
                break;
            case "{startOLC}":
                break;
            case "{startMapCode}":
                break;
            case "{title}":
                $out = $this->title;
                $out = "<b>" . $out . "</b>";
                break;
            case "{description}":
                $out = $this->description;
                break;
            case "{difficulty}":
                $out = $this->getWalkValue("{distance}");
                $out .= "<br/><span class='pointer " . str_replace("/ /g", "", $this->nationalGrade) . "' onclick='javascript:ra.walk.dGH()'>" . $this->nationalGrade . "</span>";
                if ($this->localGrade !== "") {
                    $out .= "<br/>" . $this->localGrade;
                }
                break;
            case "{difficulty+}":
                $out = $this->getWalkValue("{distance}");
                $out .= "<div>" . $this->getGradeSpan("middle") . "</div>";
                $out .= "<span class='pointer " . str_replace("/ /g", "", $this->nationalGrade) . "' onclick='javascript:ra.walk.dGH()'>" . $this->nationalGrade . "</span>";
                if ($this->localGrade !== "") {
                    $out .= "<br/>" . $this->localGrade;
                }
                break;
            case "{distance}":
                if ($this->distanceMiles > 0) {
                    $out = $this->distanceMiles . "mi / " . $this->distanceKm . "km";
                }
                break;
            case "{distanceMi}":
                if ($this->distanceMiles > 0) {
                    $out = $this->distanceMiles . "mi";
                }
                break;
            case "{distanceKm}":
                if ($this->distanceMiles > 0) {
                    $out = $this->distanceKm . "km";
                }
                break;
            case "{gradeimg}":
                $out = $this->getGradeSpan('middle');
                break;
            case "{gradeimgRight}":
                $out = $this->getGradeSpan('right');
                break;
            case "{grade}":
                $out = "<span class='pointer " . str_replace("/ /g", "", $this->nationalGrade) . "' onclick='ra.walk.dGH()'>" . $this->nationalGrade . "</span>";
                if ($this->localGrade !== "") {
                    $out .= "<br/>" . $this->localGrade;
                }
                break;
            case "{grade+}":
                $out = "<div>" . $this->getGradeSpan("middle") . "</div>";
                $out .= "<span class='pointer " . str_replace("/ /g", "", $this->nationalGrade) . "' onclick='ra.walk.dGH()'>" . $this->nationalGrade . "</span>";
                if ($this->localGrade !== "") {
                    $out .= "<br/>" . $this->localGrade;
                }
                break;
            case "{nationalGrade}":
                $out = "<span class='pointer " . str_replace("/ /g", "", $this->nationalGrade) . "' onclick='ra.walk.dGH()'>" . $this->nationalGrade . "</span>";
                break;
            case "{nationalGradeAbbr}":
                $out = "<span class='pointer " . str_replace("/ /g", "", $this->nationalGrade) . "' onclick='ra.walk.dGH()'>" . $this->gradeAbbr() . "</span>";
                break;
            case "{localGrade}":
                $out = $this->localGrade;
                break;
            case "{additionalNotes}":
                $out = $this->additionalNotes;
                break;
            case "{type}":
                if ($this->isLinear) {
                    $out = "Linear";
                } else {
                    $out = "Circular";
                }
                break;
            case "{contact}":
                $out = "";
                if ($this->isLeader) {
                    $out .= "Leader ";
                } else {
                    $out .= "Contact: ";
                }
                if ($this->contactName !== "") {
                    $out .= "<b>" . $this->contactName . "</b>";
                }
                if ($this->email !== "") {
                    $out .= $BR . $this->getEmailLink($this);
                }
                if ($this->telephone1 !== "") {
                    $out .= $BR . $this->telephone1;
                }
                if ($this->telephone2 !== "") {
                    $out .= $BR . $this->telephone2;
                }
                break;
            case "{contactname}":
                if ($this->isLeader) {
                    $prefix .= "Leader: ";
                } else {
                    $prefix .= "Contact: ";
                }
                $out = $this->contactName;
                break;
            case "{contactperson}":
                $out = $this->contactName;
                break;
            case "{telephone}":
            case "{telephone1}":
                if ($this->telephone1 !== "") {
                    $out .= $this->telephone1;
                }
                break;
            case "{telephone2}":
                if ($this->telephone2 !== "") {
                    $out .= $this->telephone2;
                }
                break;
            case "{email}":
            case "{emailat}":
                $contact = "";
                if ($this->email !== "") {
                    $contact .= $this->email;
                }
                $out = $contact;
                break;
            case "{emaillink}":
                if ($this->email !== "") {
                    $out = $this->getEmailLink($this);
                }
                break;
            case "{mediathumbr}":
                $out = '';
                if (count($this->media) > 0) {
                    $out = "<img class='mediathumbr' src='" . $this->media[0]->url . "' >";
                }
                break;
            case "{mediathumbl}":
                $out = '';
                if (count($this->media) > 0) {
                    $out = "<img class='mediathumbl' src='" . $this->media[0]->url . "' >";
                }
                break;
            case "{meetOSMap}":
                if ($this->hasMeetPlace) {
                    $lat = $this->meetLocation->latitude;
                    $long = $this->meetLocation->longitude;
                    $out = "<span><a href=&quot;javascript:ra.link.streetmap(" . $lat . "," . $long . ")&quot; >[OS Map]</a></span>";
                }
                break;
            case "{meetDirections}":
                if ($this->hasMeetPlace) {
                    $lat = $this->meetLocation->latitude;
                    $long = $this->meetLocation->longitude;
                    $out = "<span><a href=&quot;javascript:ra.loc.directions(" . $lat . "," . $long . ")&quot; >[Directions]</a></span>";
                }
                break;
            case "{startOSMap}":
                if ($this->hasMeetPlace) {
                    $lat = $this->startLocation->latitude;
                    $long = $this->startLocation->longitude;
                    $out = "<span><a href=&quot;javascript:ra.link.streetmap(" . $lat . "," . $long . ")&quot; >[OS Map]</a></span>";
                }
                break;
            case "{startDirections}":
                if ($this->hasMeetPlace) {
                    $lat = $this->startLocation->latitude;
                    $long = $this->startLocation->longitude;
                    $out = "<span><a href=&quot;javascript:ra.loc.directions(" . $lat . "," . $long . ")&quot; >[Directions]</a></span>";
                }
                break;
            default:
                $found = false;
                if (self::$customValuesClass !== null) {
                    $response = call_user_func(array(self::$customValuesClass, self::$customValuesMethod), $option, $this);
                    $found = $response->found;
                }
                if ($found) {
                    $out .= $response->out;
                } else {
                    $option = str_replace("{", "", $option);
                    $out = str_replace("}", "", $option);
                }
        }
        if ($out !== "") {
            return $prefix . $out;
        }
        return "";
    }

    private function gradeAbbr() {
        switch ($this->nationalGrade) {
            case "Easy Access":
                return "EA";
            case "Easy":
                return "E";
            case "Leisurely":
                return "L";
            case "Moderate":
                return "M";
            case "Strenuous":
                return "S";
            case "Technical":
                return "T";
            default:
                return "";
        }
    }

// do we need this function?????????????????????????S
    private function shortDoW($day) {
        switch ($day) {
            case "Monday":
                return "Mon";
            case "Tuesday":
                return "Tues";
            case "Wednesday":
                return "Wed";
            case "Thursday":
                return "Thur";
            case "Friday":
                return "Fri";
            case "Saturday":
                return "Sat";
            case "Sunday":
                return "Sun";
        }
        return "";
    }

    private function getEmailLink() {
        $link = "http://www.ramblers.org.uk/go-walking/find-a-walk-or-route/contact-walk-organiser.aspx?walkId=";
        return "<a href='" . $link . $this->id . "' target='_blank'>Email contact via ramblers.org.uk</a>";
    }

    private function getPrefix($option) {
        $prefix = "";
        $loop = true;
//      do            {
        switch (substr($option, 0, 2)) {
            case "{;":
                $prefix .= "<br/>";
                $option = str_replace("{;", "{", $option);
                break;
            case "{,":
                $prefix = ", ";
                $option = str_replace("{,", "{", $option);
                break;
            case "{[":
                $close = strpos($option, "]");
                if ($close > 0) {
                    $prefix = substr($option, 2, $close - 2);
                    $option = "{" . substr($option, $close + 1);
                } else {
                    $prefix = $option;
                    $option = "{}";
                }
                break;
            default:
                $loop = false;
        }
//        } while ($loop);
        return [$prefix, $option];
    }

    private function _addWalkLink($id, $text, $class = "") {
        $DisplayWalkFunction = "ra.walk.displayWalkID";
        return "<span class='pointer " . $class . "' onclick=\"" . $DisplayWalkFunction . "(event," . $id . ")\">" . $text . "</span>";
    }

    private function addWalkLink($id, $text, $class = "") {
        // split into text before and after span
        $start = '';
        $st = strpos($text, "<span");
        $en = strpos($text, "/span>") + 6;
        if ($st > -1 && $en > $st) {
            if ($st > 0) {
                $start = $this->_addWalkLink($id, substr($text, 0, $st), $class);
            }
            $middle = substr($text, $st, $en - $st);
//  var _end = $text.substr(en);
            $end = $this->addWalkLink($id, substr($text, $en), $class);
            return $start . $middle . $end;
        } else {
            return $this->_addWalkLink($id, $text, $class);
        }
    }

    function __destruct() {
        
    }

}
