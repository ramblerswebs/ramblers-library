<?php

// no direct access
defined('_JEXEC') or die('Restricted access');

class RJsonwalksWalk {

    const EVENT = 'itemscope itemprop=event itemtype="http://schema.org/Event"';
    const PLACE = 'itemscope itemprop=event itemtype="http://schema.org/Place"';
    const GEOCOORDS = 'itemscope itemtype="http://schema.org/GeoCoordinates"';
    const GEOSHAPE = 'itemscope itemtype="http://schema.org/GeoShape"';

    // administration items
    public $id;                     // database ID of walk on Walks Finder
    public $status;                 // whether the walk is published, cancelled etc
    public $groupCode;              // group code e.g. SR01
    public $groupName;              // the group name e.g. Derby & South Derbyshire
    public $dateUpdated;            // date of the walk as a datetime object
    public $dateCreated;            // date of the walk as a datetime object
    public $cancellationReason;     // text reason walk cancelled
    // basic walk details
    public $walkDate;               // date of the walk as a datettime object
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
    // grades length
    public $nationalGrade = "";     // national grade as full word
    public $localGrade = "";        // local grade
    public $distanceMiles;          // distance of walk as number in miles
    public $distanceKm;             // distance of walk as number in kilometres
    public $pace;                   // the pace of the walk or null
    Public $ascentMetres;           // the ascent in metres or null
    Public $ascentFeet;             // the ascent in feet or null
    Public $strands;                // RJsonwalksItems object or null 
    Public $festivals;              // RJsonwalksItems object or null 
    // extra derived values
    public $placeTag;
    public $eventTag;

    const SORT_DATE = 0;
    const SORT_CONTACT = 1;
    const SORT_NATIONALGRADE = 2;
    const SORT_LOCALGRADE = 3;
    const SORT_DISTANCE = 4;
    const SORT_TELEPHONE1 = 5;
    const SORT_TELEPHONE2 = 6;
    const SORT_TIME = 7;
    const TIMEFORMAT = "Y-m-d\TH:i:s";

    private $sortTime;

    function __construct($item) {

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
            $this->title = htmlspecialchars($item->title);
            $this->title = str_replace("'", "&apos;", $item->title);
            $this->descriptionHtml = $item->description;
            $this->description = $item->description;
            $this->description = str_replace("\r", "", $this->description);
            $this->description = str_replace("\n", "", $this->description);
            $this->description = str_replace("&nbsp;", " ", $this->description);
            $this->description = strip_tags($this->description);
            $this->description = trim($this->description);

            $this->additionalNotes = $item->additionalNotes;
            $this->isLinear = $item->isLinear == "true";
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
                $this->contactName = $item->walkContact->contact->displayName;
                $this->email = $item->walkContact->contact->email;
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
            // pocess meeting and starting locations
            $this->processPoints($item->points);
            $this->createExtraData();
        } catch (Exception $ex) {
            $this->errorFound = 2;
        }
    }

    function getValue($type) {
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

    function setNewWalk($date) {
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
        $this->eventTag = self::EVENT;
        $this->getSchemaPlaceTag();
        if ($this->meetLocation != NULL) {
            $this->sortTime = $this->meetLocation->time;
        }
        if ($this->sortTime == NULL) {
            $this->sortTime = $this->startLocation->time;
        }
    }

    private function getSchemaPlaceTag() {

        $tag = "<div itemprop=location " . self::PLACE . " ><div style='display: none;' itemprop=name>" . $this->startLocation->description . "</div>";
        $latitude = $this->startLocation->latitude;
        $longitude = $this->startLocation->longitude;
        if ($this->startLocation->exact) {
            $tag.= "<span itemprop=geo " . self::GEOCOORDS . ">  ";
            $tag.= "<meta itemprop=latitude content='" . $latitude . "' />";
            $tag.= "<meta itemprop=longitude content='" . $longitude . "' />";
        } else {
            $tag.= "<span itemprop=geo " . self::GEOSHAPE . ">  ";
            $tag.= "<meta itemprop=circle content='" . $latitude . "," . $longitude . ",1000' /> ";
        }

        $tag.= "</span> ";
        $tag.= "</div>";
        $this->placeTag = $tag;
    }

    private function processPoints($points) {
        $this->hasMeetPlace = false;
        foreach ($points as $value) {
            if ($value->typeString == "Meeting") {
                $this->hasMeetPlace = true;
                $this->meetLocation = new RJsonwalksLocation($value);
            }
            if ($value->typeString == "Start") {
                $this->startLocation = new RJsonwalksLocation($value);
            }
            if ($value->typeString == "End") {
                $this->finishLocation = new RJsonwalksLocation($value);
            }
        }
    }

    function __destruct() {
        
    }

}
