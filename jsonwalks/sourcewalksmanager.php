<?php

/**
 * @version		0.0
 * @package		Process WM walk and convert into internal format
 * @author              Chris Vaughan Ramblers-webs.org.uk
 * @copyright           Copyright (c) 2021 Chris Vaughan. All rights reserved.
 * @license		
 */
// no direct access
defined('_JEXEC') or die('Restricted access');
define("WALKSFEED", "https://walks-manager.ramblers.org.uk/api/volunteers/walksevents?types=group-walk");
define("TESTWALKSFEED", "https://uat-be.ramblers.nomensa.xyz/api/volunteers/walksevents?types=group-walk");

class RJsonwalksSourcewalksmanager extends RJsonwalksSourcebase {

    private $rafeedurl = '';
    private $srfr;
    private $lastGroupUpdate;

    //   private $groups;

    const TIMEFORMAT = "Y-m-d\TH:i:s";

    public function __construct($groups) {
        parent::__construct(SourceOfWalk::WManager, $groups);
        $this->rafeedurl = $this->getWMUrl();
        $org = new RJsonwalksGroups($groups);
        $this->lastGroupUpdate = $org->getUpdateDate();
    }

    public function getWalks($walks) {

        $CacheTime = 15; // minutes
        $time = getdate();
        if ($time["hours"] < 7) {
            $CacheTime = 7200; // 12 hours, rely on cache between midnight and 7am
        }
        $cacheLocation = $this->CacheLocation();
        $this->srfr = new RFeedhelper($cacheLocation, $CacheTime);
        $this->srfr->setReadTimeout(15);
        // need to find date/time of last update and clear ask feedhelper to read feed
        $json = $this->readFeed($this->rafeedurl);
        If ($json !== null) {
            foreach ($json->data as $item) {
                $walk = new RJsonwalksWalk();
                $this->convertToInternalFormat($walk, $item);
                $walks->addWalk($walk);
            }
        }
        return;
    }

    private function readFeed($rafeedurl) {
//        $properties = array("id", "status", "difficulty", "strands", "linkedEvent", "festivals",
//            "walkContact", "linkedWalks", "linkedRoute", "title", "description", "groupCode", "groupName",
//            "additionalNotes", "date", "distanceKM", "distanceMiles", "finishTime", "suitability",
//            "surroundings", "theme", "specialStatus", "facilities", "pace", "ascentMetres", "ascentFeet",
//            "gradeLocal", "attendanceMembers", "attendanceNonMembers", "attendanceChildren", "cancellationReason",
//            "dateUpdated", "dateCreated", "media", "points", "groupInvite", "isLinear", "url");

        $result = $this->srfr->getFeed($rafeedurl, "Group Walks Programme");
        $json = RErrors::checkJsonFeed($rafeedurl, "Walks", $result, null);
        return $json;
    }

    public function getWMUrl() {
        $feedurl = "";
        if ($this->groups !== null) {
            $feedurl = TESTWALKSFEED;
            //   $feedurl = $feedurl . '&groups=' . $this->groups;
        }

        return $feedurl;
    }

    private function convertToInternalFormat($walk, $item) {

        try {

            $admin = new RJsonwalksWalkAdmin();
            $admin->source = SourceOfWalk::WManager;
            $admin->id = $item->id;
            switch ($item->status) {
                case "confirmed":
                    $admin->status = "published";
                    break;
                case "concelled":
                    $admin->status = "cancelled";
                    $admin->cancellationReason = $item->cancellation_reason;
                    break;
                default:
            }

            $admin->groupCode = $item->group_code;
            $admin->groupName = $item->group_name;
            $dateUpdated = substr($item->date_updated, 0, 19);
            $dateCreated = substr($item->date - created, 0, 19);
            $admin->dateUpdated = DateTime::createFromFormat(self::TIMEFORMAT, $dateUpdated);
            $admin->dateCreated = DateTime::createFromFormat(self::TIMEFORMAT, $dateCreated);
            $admin->displayUrl = $item->url;
            $walk->setAdmin($admin);

            $basics = new RJsonwalksWalkBasics();
            $basics->walkDate = DateTime::createFromFormat(self::TIMEFORMAT, $item->date);
            $basics->title = $item->title;
            $basics->descriptionHtml = $item->description;
            $basics->additionalNotes = $item->additionalNotes;

            $walk->setBasics($basics);
            $walk->checkCancelledStatus();

            switch ($item->finishTime) {
                case null:
                    $walk->finishTime = null;
                    break;
                case "00:00:00":
                    $walk->finishTime = null;
                    break;
                default:
                    $day = $walk->walkDate->format('Ymd ');
                    $walk->finishTime = DateTime::createFromFormat('Ymd H:i:s', $day . $item->finishTime);
                    break;
            }

            $singleWalk = new RJsonwalksWalkWalk();
            if ($item->isLinear) {
                $singleWalk->shape = ShapeOfWalk::Linear;
            } else {
                $singleWalk->shape = ShapeOfWalk::Circular;
            }
            $singleWalk->nationalGrade = $item->difficulty->text;
            $singleWalk->localGrade = $item->gradeLocal;
            $singleWalk->distanceKm = $item->distanceKM;
            $singleWalk->pace = $item->pace;
            $singleWalk->ascentMetres = $item->ascentMetres;
            $walk->setWalk($singleWalk);

// contact details
            if ($item->walkContact != null) {
                $contact = new RJsonwalksWalkContact();
                $contact->isLeader = $item->walkContact->isWalkLeader == "true";
                $contact->contactName = trim($item->walkContact->contact->displayName);
                // $walk->emailAddr = $item->walkContact->contact->email;
                if (strlen($item->walkContact->contact->email) > 0) {
                    $contact->email = $item->walkContact->contact->email;
                }
                $contact->telephone1 = $item->walkContact->contact->telephone1;
                $contact->telephone2 = $item->walkContact->contact->telephone2;
                $contact->walkLeader = $item->walkLeader;
                $walk->setContact($contact);
            }
//            // read strands
//            if (count($item->strands->items) > 0) {
//                $walk->strands = new RJsonwalksItems($item->strands);
//            }

            $flags = new RJsonwalksWalkFlags();
            $flags->addGWEMFlags("Festivals", $item->festivals);
            $flags->addGWEMFlags("Facilities", $item->facilities);
            $flags->addGWEMFlags("Suitability", $item->suitability);
            $flags->addGWEMFlags("Surroundings", $item->surroundings);
            $flags->addGWEMFlags("Theme", $item->theme);
            $flags->addGWEMFlags("Special Status", $item->specialStatus);
            $walk->setFlags($flags);

// process meeting and starting locations
            $this->processPoints($walk, $item->points);
            //  $walk->createExtraData();
            $walk->media = $walk->getMedia($item);
        } catch (Exception $ex) {
            $this->errorFound = 2;
        }
    }

    private function processPoints($walk, $points) {
        $walk->hasMeetPlace = false;
        foreach ($points as $value) {
            if ($value->typeString == "Meeting") {
                $meet = $value;
                $loc = new RJsonwalksWalkLocation();
                $loc->name = $meet->description;
                $loc->gridref = $meet->gridRef;
                $loc->latitude = $meet->latitude;
                $loc->longitude = $meet->longitude;
                if (property_exists($meet, 'postcode')) {
                    $loc->postcode = $meet->postcode;
                    $loc->postcodeLatitude = $meet->postcodeLatitude;
                    $loc->postcodeLongitude = $meet->postcodeLongitude;
                }
                $meeting = new RJsonwalksWalkMeeting($meet->time, '', $loc);
                $walk->setMeeting($meeting);
            }
            if ($value->typeString == "Start") {
                $start = $value;
                $publish = $start->showExact;
                $time = $start->time;
                $loc = new RJsonwalksWalkLocation();
                $loc->name = $start->description;
                $loc->gridref = $start->gridRef;
                $loc->latitude = $start->latitude;
                $loc->longitude = $start->longitude;
                if (property_exists($start, 'postcode')) {
                    $loc->postcode = $start->postcode;
                    $loc->postcodeLatitude = $start->postcodeLatitude;
                    $loc->postcodeLongitude = $start->postcodeLongitude;
                }
                $startitem = new RJsonwalksWalkStart($time, $publish, $loc);
                $walk->setStart($startitem);
            }
            if ($value->typeString == "End") {
                $end = $value;
                $loc = new RJsonwalksWalkLocation();
                $loc->name = $end->description;
                $loc->gridref = $end->gridRef;
                $loc->latitude = $end->latitude;
                $loc->longitude = $end->longitude;
                if (property_exists($end, 'postcode')) {
                    $loc->postcode = $end->postcode;
                    $loc->postcodeLatitude = $end->postcodeLatitude;
                    $loc->postcodeLongitude = $end->postcodeLongitude;
                }
                $finish = new RJsonwalksWalkFinish($end->time, '', $loc);
                $walk->setFinish($finish);
            }
        }
    }

}
