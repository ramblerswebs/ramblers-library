<?php

/**
 * @version		0.0
 * @package		Simple JSON Feed reader
 * @author              Chris Vaughan Ramblers-webs.org.uk
 * @copyright           Copyright (c) 2021 Chris Vaughan. All rights reserved.
 * @license		GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */
// no direct access
defined('_JEXEC') or die('Restricted access');

class RJsonwalksFeed {

    private $walks = [];
    private $options;

    public function __construct($options) {

        // see if options is a string or object
        // if string then find the parameters and set ip a feedoptions object
        $isURL = false;

        $okay = false;
        if (is_string($options)) {
            $this->options = new RJsonwalksFeedoptions($options);
            $isURL = true;
            $okay = true;
        }
        if (is_object($options)) {
            $this->options = $options;
            $okay = true;
        }
        if (!$okay) {
            $app = JFactory::getApplication();
            $app->enqueueMessage('Input to RJsonwalksFeed is not valid', 'error');
            return;
        }
        // now have a feed options object
        $this->walks = new RJsonwalksWalks(NULL);

        $this->options->getWalks($this->walks);
        if ($isURL) {
            $days = $this->options->getDays();
            if ($days !== null) {
                $this->filterDayofweek($days);
            }
            $distance = $this->options->getDistance();
            if ($distance !== null) {
                $this->filterWalksDistance($distance[0], $distance[1]);
            }
            $limit = $this->options->getLimit();
            if ($limit !== null) {
                $this->noWalks($limit);
            }
        }
    }

    private function startsWith($string, $startString) {
        $len = strlen($startString);
        return (substr($string, 0, $len) === $startString);
    }

    public function setNewWalks($days) {
        $this->walks->setNewWalks($days);
    }

    public function setDisplayLimit($no) {
        $app = JFactory::getApplication();
        $app->enqueueMessage('setDisplayLimit is no longer supported - please use RJsonwalksStdDisplay', 'error');
    }

    public function filterCancelled() {
        $this->walks->filterCancelled();
    }

    public function filterStatus($status) {
        $this->walks->filterStatus($status);
    }

    public function filterWalksDistance($minDistance, $maxDistance) {
        $this->walks->filterDistance(floatval($minDistance), floatval($maxDistance));
    }

    public function filterDistanceFrom($easting, $northing, $distanceKm) {
        $app = JFactory::getApplication();
        $app->enqueueMessage('filterDistanceFrom no longer supported', 'error');
        //   $this->walks->filterDistanceFrom($easting, $northing, $distanceKm);
    }

    public function filterDistanceFromLatLong($lat, $lon, $distanceKm) {
        $this->walks->filterDistanceFromLatLong(floatval($lat), floatval($lon), floatval($distanceKm));
    }

    public function filterGroups($filter) {
        $this->walks->filterGroups($filter);
    }

    public function filterStrands($filter) {
        $this->walks->filterStrands($filter);
    }

    public function filterTitle($filter, $option = 'remove') {
        $this->walks->filterTitle($filter, $option);
    }

    public function filterTitleContains($filter, $option = 'remove') {
        $this->walks->filterTitleContains($filter, $option);
    }

    public function filterNationalGrade($grades) {
        $this->walks->filterNationalGrade($grades);
    }

    public function filterFestivals($filter) {
        $this->walks->filterFestivals($filter);
    }

    public function noFestivals() {
        $this->walks->noFestivals();
    }

    public function allFestivals() {
        $this->walks->allFestivals();
    }

    public function filterDateRange($datefrom, $dateto) {
        if (!is_a($datefrom, 'DateTime')) {
            echo "filterDateRange: first parameter is NOT Datetime";
            return;
        }
        if (!is_a($dateto, 'DateTime')) {
            echo "filterDateRange: second parameter is NOT Datetime";
            return;
        }
        $dateto->setTime(0, 0, 0);
        $datefrom->setTime(0, 0, 0);
        $this->walks->filterDateRange($datefrom, $dateto);
    }

    public function filterDayofweek($days) {
        $this->walks->filterDayofweek($days);
    }

    public function limitNumberWalks($no) {
        $this->walks->limitNumberWalks($no);
    }

    public function noWalks($no) {
        // deprecated
        $this->limitNumberWalks($no);
    }

    public function numberWalks() {
        return count($this->walks->allWalks());
    }

    public function walksInFuture($period) {
        $this->walks->walksInFuture($period);
    }

    public function noCancelledWalks() {
        $number = 0;
        $items = $this->walks->allWalks();
        foreach ($items as $walk) {
            if ($walk->isCancelled()) {
                $number += 1;
            }
        }
        return $number;
    }

    public function display($displayclass) {
        if ($this->walks == null) {
            echo "No walks found";
            return;
        }
        RLoad::addStyleSheet('media/lib_ramblers/css/ramblerslibrary.css');
        $version = new JVersion();
        // Joomla4 Update to use correct call.
        if (version_compare($version->getShortVersion(), '4.0', '<')) {
            $printOn = JRequest::getVar('print') == 1;
        } else {
            $jinput = JFactory::getApplication()->getInput();
            $printOn = $jinput->getVar('print') == 1;
        }
        if ($printOn) {
            $style = 'BODY {color: #000000;}';
            $document = JFactory::getDocument();
            $document->addStyleDeclaration($style);
        }
        $displayclass->DisplayWalks($this->walks);
    }

    public function displayIcsDownload($name, $pretext, $linktext, $posttext) {
        $events = new REventGroup(); // create a group of events
        $events->addWalks($this); // add walks to the group of events
        $display = new REventDownload();
        $display->setPreText($pretext);
        $display->setLinkText($linktext);
        $display->setPostText($posttext);
        $display->Display("de02walks", $events); // display walks information
// is this line correct and is function used
    }

    public function getWalks() {
        return $this->walks;
    }

    public function clearCache() {
        
    }

    public function filterFeed($filter) { // filter by component filter subform
        if ($filter->titlecontains !== '') {
            $this->filterTitleContains($filter->titlecontains, "keep");
        }
        if ($filter->titledoesntcontains !== '') {
            $this->filterTitleContains($filter->titledoesntcontains, "remove");
        }
        if ($filter->titleequals !== '') {
            $this->filterTitle($filter->titleequals, "keep");
        }
        if ($filter->titledoesntequal !== '') {
            $this->filterTitle($filter->titledoesntequal, "remove");
        }
        $limit = intval($filter->limit);
        if ($limit > 0) {
            $this->noWalks($limit);
        }
        $dist = floatval($filter->filterdistance);
        if ($dist > 0) {
            $this->filterDistanceFromLatLong(floatval($filter->filtercentrelatitude), floatval($filter->filtercentrelongitude), $dist);
        }
        if (count($filter->filternationalgrades) > 0) {
            $this->filterNationalGrade($filter->filternationalgrades);
        }
        if (count($filter->filterdaysofweek) > 0) {
            $this->filterDayofweek($filter->filterdaysofweek);
        }
        if ($filter->filterstrand !== '') {
            $this->filterStrands($filter->filterstrand);
        }
    }

}
