<?php

/**
 * Description of feedoptions
 *
 * @author chris
 */
class RJsonwalksFeedoptions {

    private $groups = null;
    private $limit = null;
    private $minDistance = null;
    private $maxDistance = null;
    private $days = null;
    private $sources = [];

    public function __construct($value = "") {
        // input can be a list of groups 
        // a full url
        // or a null string
        if ($value === '') {
            return;
        }
        $value=strtolower($value);
        if ($this->startsWith(strtolower($value), 'http')) {
            $groups = $this->processGWEMurl($value);
            If ($groups === false) {
                return;
            }
            $source = new RJsonwalksSourcegwem($groups);
            $this->sources[] = $source;
        } else {
            $source = new RJsonwalksSourcegwem($value);
            $this->sources[] = $source;
        }
    }

    private function processGWEMurl($value) {
        $parts = parse_url($value);
        if ($parts === false) {
            echo 'Invalid GWEM url supplied';
            return false;
        }
        if ($parts['path'] !== "/api/lbs/walks") {
            echo 'Invalid GWEM url supplied';
            return false;
        }
        $query = $parts['query'];
        $queryParts=null;
        parse_str($query, $queryParts);
        $groups = $queryParts['groups'];
        If ($groups === null or $groups === '') {
            echo "No groups supplied in GWEM feed";
            return false;
        }

        return $groups;
    }

    public function addWalksEditorWalks($groupCode, $groupName, $site) {
        $source = new RJsonwalksSourcewalkseditor($groupCode, $groupName, $site);
        $this->sources[] = $source;
    }

    public function getWalks($walks) {
        foreach ($this->sources as $source) {
             $source->getWalks($walks);
        }
        $walks->sort('SORT_DATE','SORT_TIME','SORT_DISTANCE');
        
        // apply GWEM options
        // limit
        // distance
        // day of week
        
       //  $this->setNewWalks($this->newinterval);
        return;
    }

    public function setLimit($limit) {
        $this->limit = $limit;
    }

    private function startsWith($string, $startString) {
        $len = strlen($startString);
        return (substr($string, 0, $len) === $startString);
    }

// repeat for other gwem options
}
