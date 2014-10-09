<?php

class RJsonwalksWalks {

    private $arrayofwalks;
    private $sortorder1;
    private $sortorder2;
    private $sortorder3;
    private $newinterval = 30;

    function __construct($json) {
        $this->arrayofwalks = array();
        foreach ($json as $value) {
            $walk = new RJsonwalksWalk($value);
            if (json_last_error() == JSON_ERROR_NONE) {
                $this->arrayofwalks[] = $walk;
            } else {
                echo "Feed is NOT in a JSON format";
            }
        }
        $this->setNewWalks($this->newinterval);
    }

    function setNewWalks($days) {
        $interval = "P" . $days . "D";
        $date = new DateTime(NULL);
        $interval = new DateInterval($interval);
        $date->sub($interval);
        $items = $this->allWalks();

        foreach ($items as $walk) {
            $walk->setNewWalk($date);
        }
    }

    function filterGroups($groups) {
        foreach ($this->arrayofwalks as $key => $value) {
            if ($this->notInGroup($value, $groups)) {
                unset($this->arrayofwalks[$key]);
            }
        }
    }

    private function notInGroup($walk, $groups) {
        foreach ($groups as $value) {
            if (strtolower($value) == strtolower($walk->groupCode)) {
                return false;
            }
        }
        return true;
    }

    function filterDayofweek($days) {
        foreach ($this->arrayofwalks as $key => $value) {
            if ($this->notInDayList($value, $days)) {
                unset($this->arrayofwalks[$key]);
            }
        }
    }

    private function notInDayList($walk, $days) {
        foreach ($days as $value) {
            if (strtolower($value) == strtolower($walk->dayofweek)) {
                return false;
            }
        }
        return true;
    }

    function noWalks($no) {
        $i = 1;
        foreach ($this->arrayofwalks as $key => $value) {
            $i+=1;
            if ($i > $no) {
                unset($this->arrayofwalks[$key]);
            }
        }
    }

    function sort($sortorder1, $sortorder2, $sortorder3) {
        $this->sortorder1 = $sortorder1;
        $this->sortorder2 = $sortorder2;
        $this->sortorder3 = $sortorder3;
        usort($this->arrayofwalks, array($this, "sortData1"));
    }

    private function sortData1($a, $b) {
        $val1 = $a->getValue($this->sortorder1);
        $val2 = $b->getValue($this->sortorder1);
        if ($val1 == $val2) {
            return $this->sortData2($a, $b);
        }
        return ($val1 < $val2 ) ? -1 : 1;
    }

    private function sortData2($a, $b) {
        $val1 = $a->getValue($this->sortorder2);
        $val2 = $b->getValue($this->sortorder2);
        if ($val1 == $val2) {
            return $this->sortData3($a, $b);
        }
        return ($val1 < $val2 ) ? -1 : 1;
    }

    private function sortData3($a, $b) {
        $val1 = $a->getValue($this->sortorder3);
        $val2 = $b->getValue($this->sortorder3);
        if ($val1 == $val2) {
            return 0;
        }
        return ($val1 < $val2 ) ? -1 : 1;
    }

    public function allWalks() {
        return $this->arrayofwalks;
    }

    function __destruct() {
        
    }

}
