<?php

/**
 * Description of WalksDisplay
 *    Create a csv file containing the walks and display a button to allow user to download csv file
 * 
 * @author Chris Vaughan
 * 
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdWalkcsv extends RJsonwalksDisplaybase {

    private $filename;
    private $buttonClass = "button-p1815";
    public $removeHTML = false;
    public $convertToASCII = false;

    public function __construct($filename = "tmp/walks-download.csv") {
        parent::__construct();
        $this->filename = $filename;
    }

    public function DisplayWalks($walks) {
        $handle = fopen($this->filename, 'w'); //open file for writing 
        If ($handle === false) {
            die('Cannot open file:  ' . $this->filename);
        } else {
            $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_TIME, RJsonwalksWalk::SORT_DISTANCE);
            $items = $walks->allWalks();
            $fields = $this->csvHeader();

            fputcsv($handle, $fields);
            foreach ($items as $walk) {
                $fields = $this->displayWalkCSV($walk);
                $fields = $this->convertToAscii($fields);
                fputcsv($handle, $fields);
            }
            fclose($handle);
            $this->createButton();
        }
    }

    private function convertToAscii($values) {
        if ($this->convertToASCII) {
            $fields = [];
            foreach ($values as $key => $value) {
                //  $fields[$key] = mb_convert_encoding($value, "ASCII", "UTF-8");
                $fields[$key] = iconv("UTF-8", "ASCII//IGNORE", $value);
            }
            return $fields;
        }
        return $values;
    }

    private function displayWalkCSV($walk) {
        $array = [];
        $array[] = $walk->id;
        $array[] = $walk->walkDate->format('d/m/Y');

        $array[] = $walk->title;
        $array[] = $walk->groupName;
        if ($walk->isLinear) {
            $array[] = "Linear";
        } else {
            $array[] = "Circular";
        }

        $location = $walk->startLocation;
        $array[] = $location->postcode;
        $array[] = $location->gridref;
        $array[] = $location->description;
        $array[] = $location->time->format('G:i:s');

        if ($walk->meetLocation != null) {
            $location = $walk->meetLocation;
            $array[] = $location->postcode;
            $array[] = $location->gridref;
            $array[] = $location->description;
            $array[] = $location->time->format('G:i:s');
        } else {
            $array[] = "";
            $array[] = "";
            $array[] = "";
            $array[] = "";
        }
        $array[] = ""; // restriction
        $array[] = $walk->nationalGrade;
        $array[] = $walk->distanceMiles;
        $array[] = $walk->distanceKm;
        $array[] = ""; // walking time
        if ($walk->finishLocation != null) {
            $location = $walk->finishLocation;
            $array[] = $location->time->format('G:i:s');
            $array[] = $location->postcode;
            $array[] = $location->gridref;
            $array[] = $location->description;
        } else {
            $array[] = "";
            $array[] = "";
            $array[] = "";
            $array[] = "";
        }
        $array[] = ""; //forename
        $array[] = ""; //surname
        $array[] = $walk->contactName;
        $array[] = $walk->email;
        $array[] = $walk->telephone1;
        $array[] = $walk->telephone2;
        if ($walk->isLeader) {
            $array[] = "Yes";
        } else {
            $array[] = "No";
        }
        $array[] = $walk->walkLeader;
        $array[] = ""; //strand
        $array[] = ""; //strand id
        $array[] = ""; //festival
        $array[] = ""; //festival id
        if ($this->removeHTML) {
            $array[] = html_entity_decode(strip_tags($walk->description));
        } else {
            $array[] = $walk->descriptionHtml;
        }
        $array[] = $walk->additionalNotes;
        $array[] = $walk->pace;
        $array[] = $walk->ascentFeet;
        $array[] = $walk->ascentMetres;
        $array[] = $walk->localGrade;
        $array[] = "";
        $array[] = "";
        $array[] = "";
        $array[] = "";
        $array[] = "";
        $array[] = "";
        $array[] = "";
        $array[] = "";
        $array[] = "";
        return $array;
    }

    private function csvHeader() {
        return ["Walk ID", "date", "title", "organising_group", "circular_or_linear", "start_postcode", "start_gridref", "start_details", "start_time", "meeting_postcode", "meeting_gridref", "meeting_details", "meeting_time", "restriction", "grade", "distance_miles", "distance_km", "walking_time", "finishing_time", "finish_postcode", "finish_gridref", "finish_details", "contact_forename", "contact_surname", "contact_display_name", "contact_email", "contact_tel1", "contact_tel2", "contact_is_walk_leader", "walk_leader", "strand", "strand_id", "festival", "festival_id", "summary", "description", "pace", "ascent_feet", "ascent_metres", "grade_local", "route_id", "linked_walk_ids", "linked_event_ids", "invited_group_code", "attendance_members", "attendance_non_members", "attendance_children", "weather", "notes"];
    }

    private function createButton() {
        echo '<a href="' . $this->filename . '" class="link-button ' . $this->buttonClass . '">Download walks CSV</a>';
    }

}
