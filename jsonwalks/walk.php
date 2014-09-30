<?php

class  RJsonwalksWalk {

    const EVENT = 'itemscope itemprop=event itemtype="http://schema.org/Event"';
    const PLACE = 'itemscope itemprop=event itemtype="http://schema.org/Place"';
    const GEOCOORDS = 'itemscope itemtype="http://schema.org/GeoCoordinates"';
    const GEOSHAPE = 'itemscope itemtype="http://schema.org/GeoShape"';

    public $id;       // database ID of walk
    // admin
    public $groupCode;       // database ID of walk
    public $groupName;       // database ID of walk
    public $updateDate;       // date of the walk as a datettime object
    public $createDate;       // date of the walk as a datettime object
    public $cancellationReason;
    // basic walk details
    public $walkDate;       // date of the walk as a datettime object
    Public $dayofweek;
    public $day;
    public $month;
    public $title;          // title of the walk
    public $description;    // description of walk
    public $detailsPageUrl; // url to access the ramblers.org.uk page for this walk
    public $isLinear;
    // contact
    public $isLeader;       // is the contact info for the leader of the walk
    public $contactName;    // contact name
    public $email;          // email address for contact
    public $telephone1;     // first telephone number of contact
    public $telephone2;     // second telephone number of contact
    // meeting place
    public $hasMeetingPlace;
    public $meetingTime;
    public $meetingPlaceExact;
    public $meetingLocation;
    // starting place
    public $startTime;
    public $startingPlaceExact;
    public $startLocation;
    // finish place
    public $endTime;
    public $endLocation;
    // grades length
    public $nationalGrade;
    public $localGrade;
    public $distanceMiles;
    public $distanceKm;
    public $pace;
    Public $ascentMetres;
    Public $ascentFeet;
    public $finishTime = null;
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
        //  $type = $jsonitem->type;
        if ($jsonitem != NULL) {
            // admin details
            $this->is = $jsonitem->VersionId;
            $this->groupCode = $jsonitem->GroupCode;
            $this->groupName = $jsonitem->GroupName;
            $this->updateDate = DateTime::createFromFormat(DateTime::ISO8601, $jsonitem->DateUpdated . "+0000");
            $this->createDate = DateTime::createFromFormat(DateTime::ISO8601, $jsonitem->DateCreated . "+0000");
            $this->cancellationReason = $jsonitem->CancellationReason;
            // basic walk details
            $this->walkDate = DateTime::createFromFormat(DateTime::ISO8601, $jsonitem->Date . "+0000");
            $this->detailsPageUrl = $jsonitem->Url;
            $this->title = $jsonitem->Title;
            $this->description = $jsonitem->Summary;
            $this->isLinear = $jsonitem->IsLinear == "True";
            $this->nationalGrade = $jsonitem->Difficulty->Text;
            $this->localGrade = $jsonitem->GradeLocal;
            $this->distanceMiles = $jsonitem->DistanceMiles;
            $this->distanceKm = $jsonitem->DistanceKM;
            $this->pace = $jsonitem->Pace;
            $this->ascentFeet = $jsonitem->AscentFeet;
            $this->ascentMetres = $jsonitem->AscentMetres;
            // contact details
            $this->isLeader = true;
            $this->contactName = $jsonitem->WalkContact->Contact->DisplayName;
            $this->email = $jsonitem->WalkContact->Contact->Email;
            $this->telephone1 = $jsonitem->WalkContact->Contact->Telephone1;
            $this->telephone2 = $jsonitem->WalkContact->Contact->Telephone2;
            // pocess meeting and starting locations
            $this->processPoints($jsonitem->Points);

            $this->meetingTime = DateTime::createFromFormat('H:i:s', "09:00:00");
            $this->startingPlaceExact = true;

            $this->startTime = DateTime::createFromFormat('H:i:s', "10:00:00");

            if ($this->title == null) {
                $this->title = "???";
            }
            if ($jsonitem->FinishTime != "null") {
                $this->finishTime = $jsonitem->FinishTime;
            }
            $this->createExtraData();
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

    function createExtraData() {
        $this->dayofweek = $this->walkDate->format('l');
        $this->month = $this->walkDate->format('F');
        $this->day = $this->walkDate->format('jS');
        $this->eventTag = self::EVENT;
        $this->getSchemaPlaceTag();
    }

    function getSchemaPlaceTag() {
        return "";
        $tag = "<div itemprop=location " . self::PLACE . " ><div style='display: none;' itemprop=name>" . $this->startDesc . "</div>";
        $latitude = $this->startLocation->latitude;
        $longitude = $this->startLocation->longitude;
        if ($this->startingPlaceExact) {
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
        $this->hasMeetingPlace = false;
        foreach ($points as $value) {
            if ($value->TypeString == "Meeting") {
                $this->hasMeetingPlace = true;
                $this->meetingLocation = new JRamblersWalksfeedLocation($value);
            }
            if ($value->TypeString == "Start") {
                // $this->meetingTime = DateTime::createFromFormat('l, d F Y H:i:s', $jsonitem->date . " 09:00:00");
                $this->startingPlaceExact = true;
                $this->startLocation = new JRamblersWalksfeedLocation($value);
            }
            if ($value->TypeString == "End") {
                // $this->endTime = DateTime::createFromFormat('l, d F Y H:i:s', $jsonitem->date . " 09:00:00");
                $this->endLocation = new JRamblersWalksfeedLocation($value);
            }
        }
    }

    function __destruct() {
        
    }

}
