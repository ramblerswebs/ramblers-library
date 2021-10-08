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

    public function __construct($value) {
        $this->groups = $value;
    }

    public function setLimit($value) {
        $this->limit = $value;
    }

    public function setDistanceRange($value1, $value2) {
        $this->minDistance = $value1;
        $this->maxDistance = $value2;
    }

    public function setDays($value) {
        $this->days = $value;
    }

    public function getGwemUrl() {
        $gwemfeedurl = "";
        if ($this->groups !== null) {
            $gwemfeedurl = "https://www.ramblers.org.uk/api/lbs/walks?groups=" . $this->groups;
        }
        if ($this->days !== null) {
            $gwemfeedurl .= "&days=" . $this->days;
        }
        if ($this->minDistance !== null && $this->maxDistance !== null) {
            $gwemfeedurl .= "&distance=" . $this->minDistance . "-" . $this->maxDistance;
        }
        if ($this->limit !== null) {
            $gwemfeedurl .= "&limit=" . $this->limit;
        }
        return $gwemfeedurl;
    }

}
