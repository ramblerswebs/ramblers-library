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

    public function __construct($filename = "tmp/walks-download") {
        parent::__construct();
        $this->filename = $filename . (new DateTime())->format('YmdHis') . ".csv";
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
                fputcsv($handle, $fields);
            }
            fclose($handle);
            $this->createButton();
        }
    }

    private function displayWalkCSV($walk) {
        $array = [];
        $array[] = $walk->getIntValue("admin", "id");
        $array[] = $walk->getIntValue("basics", "walkDate")->format('d/m/Y');

        $array[] = $walk->getIntValue("basics", "title");
        $array[] = $walk->getIntValue("admin", "groupName");
        $array[] = $walk->getIntValue("walks", "shape");

        $array[] = $walk->getWalkValue("{xstartPC}");
        $array[] = $walk->getWalkValue("{startGR}");
        $array[] = $walk->getWalkValue("{startPlace}");
        $array[] = $walk->getIntValue("start", "textTime");

        $array[] = $walk->getWalkValue("{meetPC}");
        $array[] = $walk->getWalkValue("{meetGR}");
        $array[] = $walk->getWalkValue("{meetPlace}");
        $array[] = $walk->getIntValue("meeting", "textTime");

        $array[] = ""; // restriction
        $array[] = $walk->getintValue("walks", "nationalGrade");
        $array[] = $walk->getintValue("walks", "distanceMiles");
        $array[] = $walk->getintValue("walks", "distanceKm");

        $array[] = ""; // walking time

        $array[] = $walk->getintValue("finish", "textTime");
        $array[] = $walk->getWalkValue("{finishPC}");
        $array[] = $walk->getWalkValue("{finishGR}");
        $array[] = $walk->getWalkValue("{finishPlace}");

        $array[] = ""; //forename
        $array[] = ""; //surname
        $array[] = $walk->getIntValue("contacts", "contactName");

        $array[] = ""; // email
        $array[] = $walk->getIntValue("contacts", "telephone1");
        $array[] = $walk->getIntValue("contacts", "telephone2");

        $array[] = ""; // is leader

        $array[] =""; // walkLeader;
        $array[] = ""; //strand
        $array[] = ""; //strand id
        $array[] = ""; //festival
        $array[] = ""; //festival id
        $description= $walk->getIntValue("basics", "descriptionHtml");
        if ($this->removeHTML) {
            $array[] = html_entity_decode(strip_tags($description));
        } else {
            $array[] = $description;
        }
        $array[] = $walk->getIntValue("basics", "additionalNotes");
        $array[] = $walk->getIntValue("walks", "pace");
        $array[] = $walk->getIntValue("walks", "ascent");
        $array[] = $walk->getIntValue("walks", "localGrade");
       
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
