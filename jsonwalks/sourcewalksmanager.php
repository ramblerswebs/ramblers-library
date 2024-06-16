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

//    public function getWMUrl() {
//        $feedurl = "";
//        if ($this->groups !== null) {
//            $feedurl = TESTWALKSFEED;
////   $feedurl = $feedurl . '&groups=' . $this->groups;
//        }
//        return $feedurl;
//    }

    public function convertToInternalFormat($walk, $item) {

        $source = SourceOfWalk::WManager;
        $id = $item->id;
        $cancellationReason = "";
        switch ($item->status) {
            case "confirmed":
                $status = "Published";
                break;
            case "cancelled":
                $status = "Cancelled";
                $cancellationReason = $item->cancellation_reason;
                break;
            default:
        }
        $groupCode = $item->group_code;
        $groupName = $item->group_name;
        $dateUpdated = DateTime::createFromFormat(self::TIMEFORMAT, substr($item->date_updated, 0, 19));
        $dateCreated = DateTime::createFromFormat(self::TIMEFORMAT, substr($item->date_created, 0, 19));
        $nationalUrl = $item->url;
        switch ($item->item_type) {
            case "group-walk":
                $type = TypeOfWalk::GroupWalk;
                break;
            case "group-event":
                $type = TypeOfWalk::GroupEvent;
                break;
            case "wellbeing-walk":
                $type = TypeOfWalk::WellbeingWalk;
                break;
            default:
                $app = JFactory::getApplication();
                $app->enqueueMessage("Processing walks - invalid item_type: " . $item->item_type, 'Error');
                $type = TypeOfWalk::GroupEvent;
        }
        $admin = new RJsonwalksWalkAdmin($source, $type, $id, $groupCode, $groupName,
                $status, $cancellationReason, $nationalUrl, $dateUpdated, $dateCreated);
        $walk->addAdmin($admin);

        // Basics
        $walkDate = DateTime::createFromFormat(self::TIMEFORMAT, $item->start_date_time);
        $finishDate = DateTime::createFromFormat(self::TIMEFORMAT, $item->end_date_time);
        $title = $item->title;
        $descriptionHtml = $item->description;
        $additionalNotes = "";
        if ($item->item_type === "group-walk") {
            $additionalNotes = $item->additional_details;
        }
        $external_url = $item->external_url;

        $basics = new RJsonwalksWalkBasics($admin, $walkDate, $finishDate, $title, $descriptionHtml,
                $additionalNotes, $external_url);
        $walk->addBasics($basics);

        switch ($type) {
            case TypeOfWalk::GroupWalk:
            case TypeOfWalk::WellbeingWalk:
                // Walk
                $shape = $item->shape;
                $nationalGrade = 'Event';
                if ($item->difficulty !== null) {
                    $nationalGrade = $item->difficulty->description;
                }
                $localGrade = "";
                $distanceKm = 0;
                $pace = ""; //$item->pace;
                if ($item->distance_km !== null) {
                    $distanceKm = $item->distance_km;
                }
                $ascent = ""; //$item->ascentMetres;
                if ($item->ascent_metres !== null) {
                    $ascent = strval($item->ascent_feet) . " ft/" . strval($item->ascent_metres) . " m";
                }
                $singleWalk = new RJsonwalksWalkWalk($shape, $nationalGrade, $localGrade, $distanceKm, $pace, $ascent);
                $walk->addWalk($singleWalk);

                // Add contact details

                if (property_exists($item, "walk_leader")) {
                    if (!is_array($item->walk_leader)) {
                        $contactName = $item->walk_leader->name;
                        $contactForm = $item->walk_leader->email_form;
                        $telephone1 = ($item->walk_leader->telephone == null) ? "" : $item->walk_leader->telephone;
                        $telephone2 = "";
                        $email = "";
                        $isLeader = false;
                        $contact = new RJsonwalksWalkContact($item->id, $isLeader, $contactName, $email, $telephone1, $telephone2, $contactForm);
                        $walk->addContact($contact);
                    }
                }


                // Add Meeting location
                if ($item->meeting_location !== null) {
                    $time = DateTime::createFromFormat(self::TIMEFORMAT, $item->meeting_date_time);
                    $loc = $item->meeting_location;
                    $name = RHtml::convertToText($loc->description);
                    $gridref = $loc->grid_reference_6;
                    $latitude = $loc->latitude;
                    $longitude = $loc->longitude;
                    $w3w = $loc->w3w;
                    if ($w3w === null || $w3w === "") {
                        $w3w = "walks.manager.error";
                    }
                    $postcode = $loc->postcode;
                    $meeting = new RJsonwalksWalkTimelocation("Meeting", "", $time, $name,
                            $latitude, $longitude, $gridref, $w3w,
                            $postcode, 0, 0, null);
                    $walk->addMeeting($meeting);
                }

                // Add Start location
                if ($item->start_location) {
                    $time = DateTime::createFromFormat(self::TIMEFORMAT, $item->start_date_time);
                    $loc = $item->start_location;
                    $name = RHtml::convertToText($loc->description);
                    $gridref = $loc->grid_reference_6;
                    $latitude = $loc->latitude;
                    $longitude = $loc->longitude;
                    $w3w = $loc->w3w;
                    if ($w3w === null || $w3w === "") {
                        $w3w = "walks.manager.error";
                    }
                    $postcode = $loc->postcode;
                    $type = "Start";
                    if (str_contains(strtolower($name), 'location shown is only indicative')) {
                        $type = "Rough";
                    }
                    if (str_contains(strtolower($name), 'location shown is an indication')) {
                        $type = "Rough";
                    }
                    $start = new RJsonwalksWalkTimelocation($type, "", $time, $name,
                            $latitude, $longitude, $gridref, $w3w,
                            $postcode, 0, 0, null);
                    $walk->addStart($start);
                }

                // Add End location
                if ($item->end_location) {
                    $time = DateTime::createFromFormat(self::TIMEFORMAT, $item->end_date_time);
                    $loc = $item->end_location;
                    $name = RHtml::convertToText($loc->description);
                    $gridref = $loc->grid_reference_6;
                    $latitude = $loc->latitude;
                    $longitude = $loc->longitude;
                    $w3w = $loc->w3w;
                    if ($w3w === null || $w3w === "") {
                        $w3w = "walks.manager.error";
                    }
                    $postcode = $loc->postcode;
                    $finish = new RJsonwalksWalkTimelocation("Finish", "", $time, $name,
                            $latitude, $longitude, $gridref, $w3w,
                            $postcode, 0, 0, null);
                    $walk->addFinish($finish);
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
                $shape = "Event";
                $nationalGrade = 'Event';
                $localGrade = "";
                $distanceKm = 0;
                $pace = "";
                $ascent = "";
                $singleWalk = new RJsonwalksWalkWalk($shape, $nationalGrade, $localGrade, $distanceKm, $pace, $ascent);
                $walk->addWalk($singleWalk);

                // Add contact details

                if (property_exists($item, "event_organiser")) {
                    $contactName = $item->event_organiser->name;                                    // walk_leaders
                    $contactForm = $item->event_organiser->email_form;
                    $telephone1 = ($item->event_organiser->telephone == null) ? "" : $item->event_organiser->telephone;
                    $telephone2 = "";
                    $isLeader = false;
                    $email = "";
                    $contact = new RJsonwalksWalkContact($item->id, $isLeader, $contactName, $email, $telephone1, $telephone2, $contactForm);
                    $walk->addContact($contact);
                }

                // Add location
                if ($item->location) {
                    $time = DateTime::createFromFormat(self::TIMEFORMAT, $item->start_date_time);
                    $loc = $item->location;
                    $name = RHtml::convertToText($loc->description);
                    $gridref = $loc->grid_reference_6;
                    $latitude = $loc->latitude;
                    $longitude = $loc->longitude;
                    $w3w = $loc->w3w;
                    if ($w3w === null || $w3w === "") {
                        $w3w = "walks.manager.error";
                    }
                    $postcode = $loc->postcode;
                    $location = new RJsonwalksWalkTimelocation("Location", "", $time, $name,
                            $latitude, $longitude, $gridref, $w3w,
                            $postcode, 0, 0, null);
                    $walk->addStart($location);
                }
                break;
        }

        // Add Media
        if ($item->media !== null) {
            foreach ($item->media as $item) {
                $alt = $item->alt;
                foreach ($item->styles as $img) {
                    if ($img->style === "thumbnail") {
                        $thumb = $img->url;
                    }
                    if ($img->style === "medium") {
                        $medium = $img->url;
                    }
                }
                $newmedia = new RJsonwalksWalkMediaitem($alt, $thumb, $medium);
                $walk->addMedia($newmedia);
            }
        }
    }
}
