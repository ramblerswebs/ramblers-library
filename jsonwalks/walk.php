<?php

class RJsonwalksWalk {

    const EVENT = 'itemscope itemprop=event itemtype="http://schema.org/Event"';
    const PLACE = 'itemscope itemprop=event itemtype="http://schema.org/Place"';
    const GEOCOORDS = 'itemscope itemtype="http://schema.org/GeoCoordinates"';
    const GEOSHAPE = 'itemscope itemtype="http://schema.org/GeoShape"';

    // administration items
    public $id;                  // database ID of walk
    public $status;              // whether the walk is published, cancelled etc
    public $groupCode;           // group code e.g. SR01
    public $groupName;           // the group name e.g. Derby & South Derbyshire
    public $updateDate;          // date of the walk as a datetime object
    public $createDate;          // date of the walk as a datetime object
    public $cancellationReason;  // text reason walk cancelled
    // basic walk details
    public $walkDate;            // date of the walk as a datettime object
    Public $dayofweek;           // day of the week as text
    public $day;                 // the day number as text
    public $month;               // the month as text
    public $title;               // title of the walk
    public $description;         // description of walk
    public $additionalNotes;     // the additional notes field as text
    public $detailsPageUrl;      // url to access the ramblers.org.uk page for this walk
    // contact
    public $isLeader;            // is the contact info for the leader of the walk
    public $contactName;         // contact name
    public $email;               // email address for contact
    public $telephone1;          // first telephone number of contact
    public $telephone2;          // second telephone number of contact
    // meeting place
    public $hasMeetPlace;        // true or false
    public $meetLocation;
    // starting place
    public $startLocation;
    // finish place
    public $isLinear;            // true if walk has a finishing place otherwise false
    public $finishLocation;
    // grades length
    public $nationalGrade;
    public $localGrade;
    public $distanceMiles;
    public $distanceKm;
    public $pace;
    Public $ascentMetres;
    Public $ascentFeet;
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

    function __construct($jsonitem) {
        $ok = $this->checkProperties($jsonitem);
        if ($jsonitem != NULL and $ok) {
            // admin details
            $this->is = $jsonitem->id;
            $this->status = $jsonitem->status->value;
            $this->groupCode = $jsonitem->groupCode;
            $this->groupName = $jsonitem->groupName;
            $this->updateDate = DateTime::createFromFormat(DateTime::ISO8601, $jsonitem->dateUpdated . "+0000");
            $this->createDate = DateTime::createFromFormat(DateTime::ISO8601, $jsonitem->dateCreated . "+0000");
            $this->cancellationReason = $jsonitem->cancellationReason;
            // basic walk details
            $this->walkDate = DateTime::createFromFormat(DateTime::ISO8601, $jsonitem->date . "+0000");
            $this->detailsPageUrl = $jsonitem->url;
            $this->title = $jsonitem->title;
            $this->description = $jsonitem->description;
            $this->additionalNotes = $jsonitem->additionalNotes;
            $this->isLinear = $jsonitem->isLinear == "true";
            $this->nationalGrade = $jsonitem->difficulty->text;
            $this->localGrade = $jsonitem->gradeLocal;
            $this->distanceMiles = $jsonitem->distanceMiles;
            $this->distanceKm = $jsonitem->distanceKM;
            $this->pace = $jsonitem->pace;
            $this->ascentFeet = $jsonitem->ascentFeet;
            $this->ascentMetres = $jsonitem->ascentMetres;
            // contact details
            $this->isLeader = $jsonitem->walkContact->isWalkLeader == "true";
            $this->contactName = $jsonitem->walkContact->contact->displayName;
            $this->email = $jsonitem->walkContact->contact->email;
            $this->telephone1 = $jsonitem->walkContact->contact->telephone1;
            $this->telephone2 = $jsonitem->walkContact->contact->telephone2;
            // pocess meeting and starting locations
            $this->processPoints($jsonitem->points);
            $this->createExtraData();
        } else {
            echo "Walk is either null or has invalid properties";
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
            default:
                return NULL;
        }
    }

    private function createExtraData() {
        $this->dayofweek = $this->walkDate->format('l');
        $this->month = $this->walkDate->format('F');
        $this->day = $this->walkDate->format('jS');
        $this->eventTag = self::EVENT;
        $this->getSchemaPlaceTag();
    }

    private function getSchemaPlaceTag() {
        return "";
        $tag = "<div itemprop=location " . self::PLACE . " ><div style='display: none;' itemprop=name>" . $this->startDesc . "</div>";
        $latitude = $this->startLocation->latitude;
        $longitude = $this->startLocation->longitude;
        if ($this->startPlaceExact) {
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
                // $this->meetTime = DateTime::createFromFormat('H:i:s', $value->time );
                $this->meetLocation = new RJsonwalksLocation($value);
            }
            if ($value->typeString == "Start") {
                //  $this->startTime = DateTime::createFromFormat('H:i:s', $value->time );
                $this->startLocation = new RJsonwalksLocation($value);
            }
            if ($value->typeString == "End") {
                //  $this->finishTime = DateTime::createFromFormat('H:i:s', $value->time );
                $this->finishLocation = new RJsonwalksLocation($value);
            }
        }
    }

    private function checkProperties($object) {

        //  property_exists
        return true;
    }

    function __destruct() {
        
    }

}
