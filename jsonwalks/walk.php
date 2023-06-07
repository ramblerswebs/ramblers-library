<?php

// no direct access
defined('_JEXEC') or die('Restricted access');

class RJsonwalksWalk extends REvent {

// administration items
    public $source = SourceOfWalk::Unknown;  // where the walk was created
    public $id;                     // database ID of walk on Walks Finder as string
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
    public $contactForm = "";       // Contact form from Ramblers CO
    public $external_url = "";      // External URL provided
    public $key = "";               // ENCRYPTED email address for contact 
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
    Public $flags = [];                  // flags to describe walk 
//    Public $strands;                // RJsonwalksItems object or null
//    Public $festivals;              // RJsonwalksItems object or null
//    public $suitability;            // RJsonwalksItems object or null
//    public $surroundings;           // RJsonwalksItems object or null
//    public $theme;                  // RJsonwalksItems object or null
//    public $specialStatus;          // RJsonwalksItems object or null
//    public $facilities;             // RJsonwalksItems object or null
    public $media = [];                  // array of image infomation
// extra derived values
    private $sortTime;
    private $icsDayEvents = false;
    private static $withMonth = ["{dowShortddmm}", "{dowddmm}", "{dowddmmyyyy}"];
    private static $customValuesClass = null;
    private static $customValuesMethod = null;

    const DISPLAYWALKFUNCTION = "ra.walk.displayWalkID";
    const SORT_DATE = 0;
    const SORT_CONTACT = 1;
    const SORT_NATIONALGRADE = 2;
    const SORT_LOCALGRADE = 3;
    const SORT_DISTANCE = 4;
    const SORT_TELEPHONE1 = 5;
    const SORT_TELEPHONE2 = 6;
    const SORT_TIME = 7;
    const TIMEFORMAT = "Y-m-d\TH:i:s";

    //

    public function __construct() {
        
    }

    public function setAdmin($admin) {
        $this->source = $admin->source; // admin details
        $this->id = strval($admin->id); // admin details
        $this->status = $admin->status;
        $this->groupCode = $admin->groupCode;
        $this->groupName = $admin->groupName;
        $this->dateUpdated = $admin->dateUpdated;
        $this->dateCreated = $admin->dateCreated;
        $this->cancellationReason = $admin->cancellationReason;
        $this->detailsPageUrl = $admin->displayUrl;
    }

    public function setBasics($basics) {

        $this->walkDate = $basics->walkDate;
        $this->title = RHtml::removeNonBasicTags($basics->title);
        $this->description = RHtml::removeNonBasicTags($basics->descriptionHtml);
        $this->description = RHtml::convert_mails($this->description);
        $this->descriptionHtml = $basics->descriptionHtml;
        $this->descriptionHtml = RHtml::convert_mails($this->descriptionHtml);
        $this->additionalNotes = $basics->additionalNotes;
        $this->external_url = $basics->external_url;
    }

    public function setWalk($walk) {
        if ($walk->shape == ShapeOfWalk::Linear) {
            $this->isLinear = true;
        } else {
            $this->isLinear = false;
        }
        $this->nationalGrade = $walk->nationalGrade;
        $this->localGrade = $walk->localGrade;
        $this->distanceKm = $walk->distanceKm;
        $this->distanceMiles = $walk->distanceKm * 0.621371;
        $this->distanceKm = round($this->distanceKm, 1);
        $this->distanceMiles = round($this->distanceMiles, 1);
        $this->pace = $walk->pace;
        if ($walk->ascentMetres !== null) {
            $this->ascentMetres = $walk->ascentMetres;
            $this->ascentFeet = round($walk->ascentMetres * 3.28084);
        }
    }

    public function setMeeting($meet) {
        $this->hasMeetPlace = true;
        $this->meetLocation = new RJsonwalksLocation();
        $this->meetLocation->setLocation('Meeting', $meet, $this->walkDate);
    }

    public function setStart($start) {
        $this->startLocation = new RJsonwalksLocation();
        $this->startLocation->setLocation('Start', $start, $this->walkDate);
    }

    public function setFinish($finish) {
        $this->finishLocation = new RJsonwalksLocation();
        $this->finishLocation->setLocation('End', $finish, $this->walkDate);
    }

    public function setContact($walk) {

        $this->isLeader = $walk->isLeader;
        $this->contactName = $walk->contactName;
        if ($walk->email !== "") {
            $this->email = 'yes';
            $this->key = $this->encrypt($walk->email);
        }
        if ($walk->contactForm != "") {
            $this->email = 'yes';
            $this->contactForm = $walk->contactForm;
        }
        $this->telephone1 = $walk->telephone1;
        $this->telephone2 = $walk->telephone2;
        $this->walkLeader = $walk->walkLeader;
    }

    public function setFlags($flags) {
        $this->flags = $flags->items;
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

    private function encrypt($simple_string) {
        // Store the cipher method
        $ciphering = "AES-128-CTR";

        // Use OpenSSl Encryption method
        $iv_length = openssl_cipher_iv_length($ciphering);
        $options = 0;

        // Non-NULL Initialization Vector for encryption
        $encryption_iv = '1234567891011121';

        // Store the encryption key
        $encryption_key = "GeeksforGeeks";

        // Use openssl_encrypt() function to encrypt the data
        $encryption = openssl_encrypt($simple_string, $ciphering,
                $encryption_key, $options, $encryption_iv);
        return $encryption;
    }

    public function getEmail($option = 0, $withtitle = false) {
        // can this be removed?
        if (strlen($this->email) > 0) {
            return "Yes";
        } else {
            return "";
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

    public function checkCancelledStatus() {
        $contains = $this->contains("cancelled", strtolower($this->title));
        $isC = $this->isCancelled();
        if ($isC && $contains) {
            return;
        }
        if ($contains) {
            $this->status = "Cancelled";
        }
        if ($isC) {
            if (!$contains) {
                $this->title = $this->title . "  CANCELLED";
            }
        }
    }

    public function isCancelled() {
        return strtolower($this->status) === "cancelled";
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

    public function createExtraData() {
        $this->dayofweek = $this->walkDate->format('l');
        $this->month = $this->walkDate->format('F');
        $this->day = $this->walkDate->format('jS');
        if ($this->meetLocation != NULL) {
            $this->sortTime = $this->meetLocation->time;
        }
        if (!is_null($this->sortTime)) {
            $this->sortTime = $this->startLocation->time;
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
        if ($this->startLocation != null)
        {
            if ($this->startLocation->time != "") {
                if ($text != "") {
                    $text .= "/";
                }
                $text .= $this->startLocation->timeHHMMshort;
            }
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
        if ($this->startLocation != null)
        {
            $out .= " Start:" . $this->startLocation->getOSMap("OS Map");
            $out .= " " . $this->startLocation->getMap("Directions", "Area Map");
        }
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
        $startLocation = ($this->startLocation != null) ? $this->startLocation->getTextDescription() : "";
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
        return $lasttime->add($interval);
    }

    private function getGradeSpan($class) {
        $tag = "";
        $img = $this->getGradeImg();
        switch ($this->nationalGrade) {
            case "Easy Access":
                $tag = "<span data-descr='Easy Access' class='grade " . $class . "' onclick='ra.walk.dGH()'>" . $img . "</span>";
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

    private function getGradeImg() {
        $base = JURI::base();
        $folder = JURI::base(true);
        $url = $folder . "/media/lib_ramblers/images/grades/";

        switch ($this->nationalGrade) {
            case "Easy Access":
                $url = "<img src='" . $url . "ea.png' alt='Easy Access' height='30' width='30'>";
                break;
            case "Easy":
                $url = "<img src='" . $url . "e.png' alt='Easy' height='30' width='30'>";
                break;
            case "Leisurely":
                $url = "<img src='" . $url . "l.png' alt='Leisurely' height='30' width='30'>";
                break;
            case "Moderate":
                $url = "<img src='" . $url . "m.png' alt='Moderate' height='30' width='30'>";
                break;
            case "Strenuous":
                $url = "<img src='" . $url . "s.png' alt='Strenuous' height='30' width='30'>";
                break;
            case "Technical":
                $url = "<img src='" . $url . "t.png' alt='Technical' height='30' width='30'>";
                break;
        }
        return $url;
    }

    public function distanceFromLatLong($lat, $long, $distanceKm) {
        return $this->startLocation->distanceFromLatLong($lat, $long, $distanceKm);
    }

//   private function endsWith($haystack, $needle) {
//        // search forward starting from end minus needle length characters
//        return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== false);
//    }

    public function getMedia($item) {
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
        $out = "";
        $lastItem = '';
        foreach ($items as $item) {

            $options = $this->getPrefix($item);

            $thisItem = $this->getWalkValue($options->walkValue);
            if ($lastItem !== '' && $thisItem !== '') {
                $out .= $options->previousPrefix;
            }
            if ($thisItem !== "") {
                $out .= $options->prefix;
            }
            $out .= $thisItem;
            $lastItem = $thisItem;
        }
        if ($out === '') {
            return $out;
        }
        if ($link) {
            return $this->addWalkLink($this->id, $out);
        } else {
            return $out;
        }
    }

    public function getWalkValue($option) {
        $BR = "<br/>";
        $out = "";
        switch ($option) {
            case "{lf}":
                $out = $BR;
                break;
            case "{group}":
                $out = $this->groupName;
                break;
            case "{dowShortdd}":
                $out = "<b>" . $this->walkDate->format('D, jS ') . "</b>";

                break;
            case "{dowShortddmm}":
                $out = "<b>" . $this->walkDate->format('D, jS F') . $this->addYear() . "</b>";
                break;
            case "{dowShortddyyyy}": // published in error
            case "{dowShortddmmyyyy}":
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
                    if ($this->meetLocation->postcode !== null) {
                        $out = $this->meetLocation->postcode;
                    }
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
                    if ($this->startLocation->postcode !== null) {
                        $out = $this->startLocation->postcode;
                    }
                }
                break;
            case "{startOLC}":
                break;
            case "{startMapCode}":
                break;
            case "{finishTime}":
                if ($this->finishTime) {
                    $out = $this->finishTime->format('g:ia');
                }
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
                $out .= $BR . "<span class='pointer " . str_replace("/ /g", "", $this->nationalGrade) . "' onclick='javascript:ra.walk.dGH()'>" . $this->nationalGrade . "</span>";
                if ($this->localGrade !== "") {
                    $out .= $BR . $this->localGrade;
                }
                break;
            case "{difficulty+}":
                $out = $this->getWalkValue("{distance}");
                //  $out .= "<div>" . $this->getGradeSpan("middle") . "</div>";
                $out .= $this->getGradeSpan("middle");
                $out .= "<span class='pointer " . str_replace("/ /g", "", $this->nationalGrade) . "' onclick='javascript:ra.walk.dGH()'>" . $this->nationalGrade . "</span>";
                if ($this->localGrade !== "") {
                    $out .= $BR . $this->localGrade;
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
                    $out .= $BR . $this->localGrade;
                }
                break;
            case "{grade+}":
                $out = $this->getGradeSpan("middle");
                $out .= "<span class='pointer " . str_replace("/ /g", "", $this->nationalGrade) . "' onclick='ra.walk.dGH()'>" . $this->nationalGrade . "</span>";
                if ($this->localGrade !== "") {
                    $out .= $BR . $this->localGrade;
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
                $titlePrefix = '';
                $out = "";
                if ($this->isLeader) {
                    $titlePrefix = "Leader ";
                } else {
                    $titlePrefix = "Contact ";
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
                if ($out !== '') {
                    $out = $titlePrefix . $out;
                }
                break;
            case "{contactname}":
                if ($this->contactName !== '') {
                    if ($this->isLeader) {
                        $out .= "Leader: ";
                    } else {
                        $out .= "Contact: ";
                    }
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
                if ($this->email !== "") {
                    $contact = $this->getEmailLink($this);
                }
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
        return $out;
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

    private function getEmailLink() {
        $link = "javascript:ra.walk.emailContact(\"" . $this->id . "\")";
        return "<span><a href='" . $link . "' >Email contact</a></span>";
    }

    private function getPrefix($walkOption) {
        $options = new StdClass();
        $options->previousPrefix = "";
        $options->prefix = "";
        $options->walkValue = $walkOption;
        $loop = true;
        do {
            switch (substr($options->walkValue, 0, 2)) {
                case "{;":
                    $options->prefix .= "<br/>";
                    $options->walkValue = str_replace("{;", "{", $options->walkValue);
                    break;
                case "{,":
                    $options->prefix .= ", ";
                    $options->walkValue = str_replace("{,", "{", $options->walkValue);
                    break;
                case "{[":
                    $close = strpos($options->walkValue, "]");
                    if ($close !== false) {
                        $options->prefix .= substr($options->walkValue, 2, $close - 2);
                        $options->walkValue = "{" . substr($options->walkValue, $close + 1);
                    } else {
                        $options->prefix .= $options->walkValue;
                        $options->walkValue = "{}";
                    }

                    break;
                case "{<":
                    $close = strpos($options->walkValue, ">");
                    if ($close !== false) {
                        $options->previousPrefix .= substr($options->walkValue, 2, $close - 2);
                        $options->walkValue = "{" . substr($options->walkValue, $close + 1);
                    } else {
                        $options->previousPrefix .= $options->walkValue;
                        $options->walkValue = "{}";
                    }

                    break;
                default:
                    $loop = false;
            }
        } while ($loop);
        return $options;
    }

    private function _addWalkLink($id, $text, $class = "") {
        if ($text !== '') {
            return "<span class='pointer " . $class . "' onclick=\"" . self::DISPLAYWALKFUNCTION . "(event,'" . $id . "')\">" . $text . "</span>";
        }
        return $text;
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

    public function addTooltip($text) {
        if ($this->isCancelled()) {
            return "<span data-descr='Walk Cancelled' class=' walkCancelled'>" . $text . "</span>";
        }
        if ($this->status === "New") {
            return "<span data-descr='Walk updated " . $this->dateUpdated->format('D, jS M') . "' class=' walkNew'>" . $text . "</span>";
        }
        return $text;
    }

    private function contains($needle, $haystack) {
        return strpos($haystack, $needle) !== false;
    }

    function __destruct() {
        
    }

}

abstract class ShapeOfWalk {

    const Linear = 0;
    const Circular = 1;
    const FigureofEight = 2;

}
