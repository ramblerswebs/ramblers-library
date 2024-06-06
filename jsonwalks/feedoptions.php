<?php

/**
 * Description of feedoptions
 *
 * @author chris
 */
class RJsonwalksFeedoptions {

    private $limit = null;  // IS NOW DEPRECATED
    private $distance = null; // IS NOW DEPRECATED
    private $days = null;  // IS NOW DEPRECATED
    private $sources = [];

    public function __construct($value = null) {
        // input can be a list of groups or a null string
        // a full url IS NOW DEPRECATED
        // 
        if ($value === null) {
            return;
        }
        $value = strtolower($value);
        if ($this->startsWith(strtolower($value), 'http')) {
            $app = JFactory::getApplication();
            $app->enqueueMessage('Deprecated: Use of old style walks feed URL is no longer supported', 'information');
            $groups = $this->processGWEMurl($value);
            If ($groups === false) {
                $app->enqueueMessage('Error: URL must specify one or more groups', 'error');
                return;
            }
        } else {
            $groups = $value;
        }
        $this->addWalksMangerGroupWalks($groups);
    }

    private function processGWEMurl($value) {
        $parts = parse_url($value);
        if ($parts === false) {
            echo 'Invalid GWEM url supplied';
            return false;
        }
        if (($parts['path'] !== "/api/volunteers/walksevents") && ($parts['path'] !== "/api/lbs/walks")) {
            echo 'Invalid GWEM url supplied';
            return false;
        }
        $query = $parts['query'];
        $queryParts = null;
        parse_str($query, $queryParts);
        $groups = $queryParts['groups'];
        If ($groups === null or $groups === '') {
            echo "No groups supplied in GWEM feed";
            return false;
        }
        if (array_key_exists('distance', $queryParts)) {
            $this->distance = $queryParts['distance'];
        }
        if (array_key_exists('limit', $queryParts)) {
            $this->limit = $queryParts['limit'];
        }
        if (array_key_exists('days', $queryParts)) {
            $this->days = $queryParts['days'];
        }

        return $groups;
    }

    public function addWalksMangerGroupWalks($groups) {
        $readwalks = true;
        $readevents = true;
        $wellbeingWalks = false;
        $source = new RJsonwalksSourcewalksmanager();
        $source->_initialise($groups, $readwalks, $readevents, $wellbeingWalks);
        $this->sources[] = $source;
    }

    public function addWalksMangerWellbeingWalks($groups) {
        $readwalks = false;
        $readevents = false;
        $wellbeingWalks = true;
        $source = new RJsonwalksSourcewalksmanager();
        $source->_initialise($groups, $readwalks, $readevents, $wellbeingWalks);
        $this->sources[] = $source;
    }

    public function addWalksManagerGroupsInArea($lat, $long, $km) {
        $readwalks = true;
        $readevents = true;
        $wellbeingWalks = false;
        $source = new RJsonwalksSourcewalksmanagerarea();
        $source->_initialiseArea($lat, $long, $km, $readwalks, $readevents, $wellbeingWalks);
        $this->sources[] = $source;
    }

    public function addWalksManagerWellbeingInArea($lat, $long, $km) {
        $readwalks = false;
        $readevents = false;
        $wellbeingWalks = true;
        $source = new RJsonwalksSourcewalksmanagerarea();
        $source->_initialiseArea($lat, $long, $km, $readwalks, $readevents, $wellbeingWalks);
        $this->sources[] = $source;
    }

    public function addWalksEditorWalks($groupCode, $groupName, $site) {
        if (str_contains($site,"<")) {
            $app = JFactory::getApplication();
            $app->enqueueMessage(JText::_("Site parameter must not contain html tags: " . $site), "error");
        } else {
            $source = new RJsonwalksSourcewalkseditor();
            $source->_initialise($groupCode, $groupName, $site);
            $this->sources[] = $source;
        }
    }

    public function getWalks($walks) {
        foreach ($this->sources as $source) {
            $source->getWalks($walks);
        }
        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_TIME, RJsonwalksWalk::SORT_DISTANCE);
        return;
    }

    public function setLimit($limit) { // IS NOW DEPRECATED
        $app = JFactory::getApplication();
        $app->enqueueMessage('Deprecated: Use of setLimit() function of RJsonwalksFeedoptions is no longer supported', 'information');
        $this->limit = $limit;
    }

    public function getLimit() { // IS NOW DEPRECATED
        return $this->limit;
    }

    public function getDistance() { // IS NOW DEPRECATED
        if ($this->distance !== null) {
            $distance = explode('-', $this->distance);
            return $distance;
        }
        return $this->distance;
    }

    public function getDays() { // IS NOW DEPRECATED
        if ($this->days !== null) {
            $days = explode(',', $this->days);
            return $days;
        }
        return $this->days;
    }

    private function startsWith($string, $startString) {
        $len = strlen($startString);
        return (substr($string, 0, $len) === $startString);
    }
}
