<?php

/**
 * @version		0.0
 * @package		Process Walks Editor walks and convert to internal format
 * @author              Chris Vaughan Ramblers-webs.org.uk
 * @copyright           Copyright (c) 2021 Chris Vaughan. All rights reserved.
 * @license		GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */
// no direct access
defined('_JEXEC') or die('Restricted access');

class RJsonwalksSourcewalkseditor extends RJsonwalksSourcebase {

    private $rafeedurl;
    private $groupCode;
    private $groupName;
    private $site;
    private $feedPath = 'index.php?option=com_ra_walkseditor&task=walks.controller&format=json';

    const TIMEFORMAT = "Y-m-d";

    public function __construct($type = SourceOfWalk::WEditor) {
        parent::__construct(SourceOfWalk::WEditor);
    }

    public function _initialise($groupCode = null, $groupName = null, $site = null) {
        $this->groupCode = $groupCode;
        $this->groupName = $groupName;
        $this->site = $site;
    }

    public function getWalks($walks) {

        $this->rafeedurl = $this->site . $this->feedPath;
        $CacheTime = 5; // minutes
        $time = getdate();
        if ($time["hours"] < 7) {
            $CacheTime = 7200; // 12 hours, rely on cache between midnight and 7am
        }
        $cacheLocation = $this->CacheLocation();
        $this->srfr = new RFeedhelper($cacheLocation, $CacheTime);
        $this->srfr->setReadTimeout(15);
        $response = $this->readFeed($this->rafeedurl);
        $id = 1;
        If ($response->version === '1.0') {
            $newwalks = $response->walks;
            If ($newwalks !== null) {
                foreach ($newwalks as $item) {
                    $walk = new RJsonwalksWalk();
                    $this->convertToInternalFormat($walk, $item, $this->groupCode . "-" . strval($id));
                    $walks->addWalk($walk);
                    $id += 1;
                }
            } else {
                $app = JFactory::getApplication();
                $app->enqueueMessage('Walks Editor other than version 1.0 is not supported', 'error');
            }
        }
    }

    private function readFeed($rafeedurl) {
        $result = $this->srfr->getFeed($rafeedurl, "Group Walks Editor Programme");
        $json = $this->checkJsonFeed($rafeedurl, "Walks", $result);
        return $json->data;
    }

    private static function checkJsonFeed($feed, $feedTitle, $result) {
        $status = $result["status"];
        $contents = $result["contents"];

        switch ($contents) {
            case NULL:
                RErrors::notifyError($feedTitle . ' feed: Unable to read feed [Null response, Error 1]', $feed, 'error');
                break;
            case "":
                echo '<b>No ' . $feedTitle . ' found.</b> [Error 2]';
                break;
            case "[]":
                // echo '<b>Sorry no ' . $feedTitle . ' found</b>';
                break;
            default:
                $json = json_decode($contents);
                unset($contents);
                $error = json_last_error();
                if ($error == JSON_ERROR_NONE) {
                    return $json;
                } else {
                    $errormsg = json_last_error_msg();
                    RErrors::notifyError('Feed is not in Json format: ' . $errormsg . ' [Error 4]', $feed, 'error');
                }
                return null;
        }
    }

    private function convertToInternalFormat($walk, $item, $id) {

        $admin = new RJsonwalksWalkAdmin();
        // admin details
        $admin->source = SourceOfWalk::WEditor;
        $admin->id = $id;
        $admin->status = $item->admin->status;
        $admin->groupCode = $this->groupCode;
        $admin->groupName = $this->groupName;
        $admin->dateUpdated = new DateTime();
        $admin->dateCreated = new DateTime();
        $admin->cancellationReason = $item->admin->cancelledReason;
        $admin->displayUrl = '';
        $admin->type = TypeOfWalk::GroupWalk;
        $walk->setAdmin($admin);

        $basics = new RJsonwalksWalkBasics();
        $basics->walkDate = new DateTime($item->basics->date);
        $basics->title = $item->basics->title;
        $basics->descriptionHtml = $item->basics->description;
        $basics->additionalNotes = $item->basics->notes;
        $walk->setBasics($basics);
        $walk->checkCancelledStatus();
        // meeting
        if ($item->meeting->type !== 'none') {
            $meet = $item->meeting->locations[0];
            $time = $meet->time . ":00";
            $loc = new RJsonwalksWalkLocation();
            $this->processLocation($loc,$meet);
//            $loc->name = $meet->name;
//            $loc->gridref = $meet->gridref8;
//            $loc->latitude = $meet->latitude;
//            $loc->longitude = $meet->longitude;
//            if (property_exists($meet, 'postcode')) {
//                $loc->postcode = $meet->postcode->value;
//                $loc->postcodeLatitude = $meet->postcode->latitude;
//                $loc->postcodeLongitude = $meet->postcode->longitude;
//            }
            $meeting = new RJsonwalksWalkMeeting($time, $item->meeting->type, $loc);
            $walk->setMeeting($meeting);
        }

        // start

        $publish = null;
        $time = null;
        $start = $item->start;
        $location = $start->location;
        if (property_exists($start->location, 'time')) {
            $time = $location->time . ":00";
        }

        switch ($start->type) {
            case 'start':
                $publish = true;
                break;
            case 'area':
                $publish = false;
                break;
        }
        $loc = new RJsonwalksWalkLocation(); 
        $this->processLocation($loc, $location);
//        $loc->name = $location->name;
//        $loc->gridref = $location->gridref8;
//        $loc->latitude = $location->latitude;
//        $loc->longitude = $location->longitude;
//        $loc->w3w = $location->w3w;
//        $loc->postcode = new RJsonwalksWalkPostcode();
//       
//        if (property_exists($location, 'postcode')) {
//            $loc->postcode = $location->postcode->value;
//            $loc->postcodeLatitude = $location->postcode->latitude;
//            $loc->postcodeLongitude = $location->postcode->longitude;
//        }
        $startitem = new RJsonwalksWalkStart($time, $publish, $loc);
        $walk->setStart($startitem);

        // walk
        $singleWalk = new RJsonwalksWalkWalk();
        $walkitem = $item->walks[0];
        if ($walkitem->type === 'linear') {
            $singleWalk->shape = ShapeOfWalk::Linear;
        } else {
            $singleWalk->shape = ShapeOfWalk::Circular;
        }
        $singleWalk->nationalGrade = $walkitem->natgrade;
        $singleWalk->localGrade = $walkitem->gradeLocal;
        if ($walkitem->units === 'miles') {
            $singleWalk->distanceKm = $walkitem->distance / 0.621371;
        } else {
            $singleWalk->distanceKm = $walkitem->distance;
        }

        $singleWalk->pace = '';
        $singleWalk->ascentMetres = null;
        $walk->setWalk($singleWalk);
        // contact

        $itemContact = $item->contact;
        $contact = new RJsonwalksWalkContact();
        $contact->isLeader = $itemContact->contactType == "isLeader";
        $contact->contactName = $itemContact->displayName;
        if (strlen($itemContact->email) > 0) {
            $contact->email = $itemContact->email;
        }
        $contact->telephone1 = $itemContact->telephone1;
        $contact->telephone2 = $itemContact->telephone2;

        $walk->setContact($contact);

        $flags = new RJsonwalksWalkFlags();
        if (property_exists($item, 'facilities')) {
            $flags->addWalksEditorFlags("Facilities", $item->facilities);
        }
        if (property_exists($item, 'transport')) {
            $flags->addWalksEditorFlags("Transport", $item->transport);
        }
        if (property_exists($item, 'accessibility')) {
            $flags->addWalksEditorFlags("Accessibility", $item->accessibility);
        }
        $walk->setFlags($flags);

        //     $walk->media = $walk->getMedia($item);
    }

    private function processLocation($loc, $location) {
        $loc->name = $location->name;
        $loc->gridref = $location->gridref8;
        $loc->latitude = $location->latitude;
        $loc->longitude = $location->longitude;
        $loc->w3w = $location->w3w;
        $loc->postcode = new RJsonwalksWalkPostcode();
        if (property_exists($location, 'postcode')) {
            $loc->postcode->text = $location->postcode;
            $loc->postcode->latitude = $location->postcode->latitude;
            $loc->postcode->longitude = $location->postcode->longitude;
        }
    }

    private function contains($needle, $haystack) {
        return strpos($haystack, $needle) !== false;
    }

}
