<?php

/**
 * @version		1.0
 * @package		Process WM walk and convert into internal format
 * @author              Chris Vaughan 
 * @copyright           Copyright (c) 2023 Chris Vaughan. All rights reserved.
 * @license		
 */
// no direct access
defined('_JEXEC') or die('Restricted access');

class RJsonwalksSourcewalksmanager extends RJsonwalksSourcebase {

    private $srfr;
    private $groups;
    private $readwalks = false;
    private $readevents = false;
    private $wellbeingWalks = false;

    const TIMEFORMAT = "Y-m-d\TH:i:s";

    public function __construct($type = "") {
        parent::__construct(SourceOfWalk::WManager);
    }

    public function _initialise($groups, $readwalks, $readevents, $wellbeingWalks) {
        $this->groups = $groups;
        $this->readwalks = $readwalks;
        $this->readevents = $readevents;
        $this->wellbeingWalks = $wellbeingWalks;
    }

    public function getWalks($walks) {
        $feed = new RJsonwalksWmFeed();
        $items = $feed->getGroupFutureItems($this->groups, $this->readwalks, $this->readevents, $this->wellbeingWalks);

        foreach ($items as $item) {
            $walk = new RJsonwalksWalk();
            $this->convertToInternalFormat($walk, $item);
            $walks->addWalk($walk);
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

    public function convertToInternalFormat($walk, $item) {
        $admin = new RJsonwalksWalkAdmin();
        $admin->source = SourceOfWalk::WManager;
        $admin->id = $item->id;
        switch ($item->status) {
            case "confirmed":
                $admin->status = "Published";
                break;
            case "cancelled":
                $admin->status = "Cancelled";
                $admin->cancellationReason = $item->cancellation_reason;
                break;
            default:
        }

        $admin->groupCode = $item->group_code;
        $admin->groupName = $item->group_name;
        $dateUpdated = substr($item->date_updated, 0, 19);
        $dateCreated = substr($item->date_created, 0, 19);
        $admin->dateUpdated = DateTime::createFromFormat(self::TIMEFORMAT, $dateUpdated);
        $admin->dateCreated = DateTime::createFromFormat(self::TIMEFORMAT, $dateCreated);
        $admin->displayUrl = $item->url;
        switch ($item->item_type) {
            case "group-walk":
                $admin->type = TypeOfWalk::GroupWalk;
                break;
            case "group-event":
                $admin->type = TypeOfWalk::GroupEvent;
                break;
            case "wellbeing-walk":
                $admin->type = TypeOfWalk::WellbeingWalk;
                break;
            default:
                $app = JFactory::getApplication();
                $app->enqueueMessage("Processing walks - invalid item_type: " . $item->item_type, 'Error');
        }
        $walk->setAdmin($admin);

        $basics = new RJsonwalksWalkBasics();
        $basics->walkDate = DateTime::createFromFormat(self::TIMEFORMAT, $item->start_date_time);
        $basics->title = $item->title;
        $basics->descriptionHtml = $item->description;
        if ($item->item_type === "group-walk") {
            $basics->additionalNotes = $item->additional_details;
        }
        $walk->setBasics($basics);
        $walk->checkCancelledStatus();
        switch ($admin->type) {
            case TypeOfWalk::GroupWalk:
            case TypeOfWalk::WellbeingWalk:
                $singleWalk = new RJsonwalksWalkWalk();
                if ($item->shape == "linear") {
                    $singleWalk->shape = ShapeOfWalk::Linear;
                } else {
                    $singleWalk->shape = ShapeOfWalk::Circular;
                }
                $singleWalk->nationalGrade = 'None';
                if ($item->difficulty !== null) {
                    $singleWalk->nationalGrade = $item->difficulty->description;
                }
                $singleWalk->localGrade = "";
                $singleWalk->distanceKm = 0;
                $singleWalk->pace = ""; //$item->pace;
                $singleWalk->ascentMetres = null; //$item->ascentMetres;
                if ($item->distance_km !== null) {
                    $singleWalk->distanceKm = $item->distance_km;
                }
                if ($item->ascent_metres !== null) {
                    $singleWalk->ascentMetres = $item->ascent_metres;
                }
                $walk->setWalk($singleWalk);

                // Add contact details
                $contact = new RJsonwalksWalkContact();
                $contact->contactName = "";                                    // walk_leaders
                $contact->contactForm = "";
                $contact->telephone1 = "";
                $contact->walkLeader = "";
                if (property_exists($item, "walk_leader")) {
                    if (!is_array($item->walk_leader)) {
                        $contact->contactName = $item->walk_leader->name;
                        $contact->contactForm = $item->walk_leader->email_form;
                        $contact->telephone1 = ($item->walk_leader->telephone == null) ? "" : $item->walk_leader->telephone;
                        $contact->walkLeader = "";
                    }
                }
                $contact->telephone2 = "";
                $walk->setContact($contact);

                // Add Meeting location
                if ($item->meeting_location !== null) {
                    $loc = new RJsonwalksWalkLocation();
                    $this->processLocation($loc, $item->meeting_location);
                    $publish = true;
                    $time = explode("T", $item->meeting_date_time)[1];
                    $meetitem = new RJsonwalksWalkMeeting($time, $publish, $loc);
                    $walk->setMeeting($meetitem);
                }

                // Add Start location
                if ($item->start_location) {
                    $loc = new RJsonwalksWalkLocation();
                    $this->processLocation($loc, $item->start_location);
                    $publish = true;
                    if (str_contains($item->start_location->description, 'only indicative')) {
                        $publish = false;
                    }
                    $time = explode("T", $item->start_date_time)[1];
                    $startitem = new RJsonwalksWalkStart($time, $publish, $loc);
                    $walk->setStart($startitem);
                }

                // Add End location
                if ($item->end_location) {
                    $loc = new RJsonwalksWalkLocation();
                    $this->processLocation($loc, $item->end_location);
                    $publish = true;
                    $time = explode("T", $item->end_date_time)[1];
                    $enditem = new RJsonwalksWalkFinish($time, $publish, $loc);
                    $walk->setFinish($enditem);
                }

                // Add flags
                $flags = new RJsonwalksWalkFlags();
                $flags->addWalksManagerFlags("Facilities", $item->facilities);
                $flags->addWalksManagerFlags("Transport", $item->transport);
                $flags->addWalksManagerFlags("Accessibility", $item->accessibility);

                $walk->setFlags($flags);

                break;
            case TypeOfWalk::GroupEvent:
                // add dummy walk
                $singleWalk = new RJsonwalksWalkWalk();
                $singleWalk->shape = ShapeOfWalk::Circular;
                $singleWalk->nationalGrade = 'None';
                $singleWalk->localGrade = "";
                $singleWalk->distanceKm = 0;
                $singleWalk->pace = ""; //$item->pace;
                $singleWalk->ascentMetres = null; //$item->ascentMetres;
                $walk->setWalk($singleWalk);

                // Add contact details
                $contact = new RJsonwalksWalkContact();
                if (property_exists($item, "event_organiser")) {
                    $contact->contactName = $item->event_organiser->name;                                    // walk_leaders
                    $contact->contactForm = $item->event_organiser->email_form;
                    $contact->telephone1 = ($item->event_organiser->telephone == null) ? "" : $item->event_organiser->telephone;
                    $contact->walkLeader = "";                              // walk_leaders         
                } else {
                    $contact->contactName = "";                                    // walk_leaders
                    $contact->contactForm = "";
                    $contact->telephone1 = "";
                    $contact->walkLeader = "";                // walk_leaders         
                }
                $contact->telephone2 = "";
                $walk->setContact($contact);

                // Add location
                if ($item->location) {
                    $loc = new RJsonwalksWalkLocation();
                    $this->processLocation($loc, $item->location);
                    $publish = true;
                    if (str_contains($item->location->description, 'only indicative')) {
                        $publish = false;
                    }
                    $time = explode("T", $item->start_date_time)[1];
                    $startitem = new RJsonwalksWalkStart($time, $publish, $loc);
                    $walk->setStart($startitem);
                }
                break;
        }

        // Add Media
        if ($item->media) {
            $walk->setMedia($item->media);
        }
    }

    private function processLocation($loc, $location) {
        $loc->name = $location->description;
        $loc->gridref = $location->grid_reference_6;
        $loc->latitude = $location->latitude;
        $loc->longitude = $location->longitude;
        $loc->w3w = $location->w3w;
        $loc->postcode=new RJsonwalksWalkPostcode();
        if (property_exists($location, 'postcode')) {
            $loc->postcode->text = $location->postcode;
        }
    }

}
