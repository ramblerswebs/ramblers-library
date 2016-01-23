<?php

class RJsonwalksWalks {

    private $arrayofwalks;
    private $sortorder1;
    private $sortorder2;
    private $sortorder3;
    private $newinterval = 7;

    const LATLONG = 0;
    const GRIDREF = 1;

    public function __construct($json) {
        $this->arrayofwalks = array();
        if ($json != NULL) {
            foreach ($json as $value) {
                $walk = new RJsonwalksWalk($value);
                $this->arrayofwalks[] = $walk;
            }
            $this->setNewWalks($this->newinterval);
        }
    }

    public function addWalk($walk) {
        $this->arrayofwalks[] = $walk;
    }

    public function hasMeetPlace() {
        foreach ($this->arrayofwalks as $walk) {
            if ($walk->hasMeetPlace) {
                return true;
            }
        }
        return false;
    }

    public function setNewWalks($days) {
        $interval = "P" . $days . "D";
        $date = new DateTime(NULL);
        $interval = new DateInterval($interval);
        $date->sub($interval);
        $items = $this->allWalks();

        foreach ($items as $walk) {
            $walk->setNewWalk($date);
        }
    }

    public function filterGroups($groups) {
        foreach ($this->arrayofwalks as $key => $walk) {
            if ($walk->notInGroup($value, $groups)) {
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

    public function filterStrands($containsText) {
        foreach ($this->arrayofwalks as $key => $walk) {
            if ($this->notInItems($walk->strands, $containsText)) {
                unset($this->arrayofwalks[$key]);
            }
        }
    }

    public function filterFestivals($containsText) {
        foreach ($this->arrayofwalks as $key => $walk) {
            if ($this->notInItems($walk->festivals, $containsText)) {
                unset($this->arrayofwalks[$key]);
            }
        }
    }

    private function notInItems($items, $text) {
        if ($items == NULL) {
            return true;
        }
        foreach ($items->getItems() as $item) {
            if ($this->contains(strtolower($text), strtolower($item->getName()))) {
                return false;
            }
        }
        return true;
    }

    private function contains($needle, $haystack) {
        return strpos($haystack, $needle) !== false;
    }

    public function filterDayofweek($days) {
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

    public function noWalks($no) {
        $i = 1;
        foreach ($this->arrayofwalks as $key => $value) {
            $i+=1;
            if ($i > $no) {
                unset($this->arrayofwalks[$key]);
            }
        }
    }

    public function walksInFuture($period) {
        $today = new DateTime(NULL);
        $interval = new DateInterval($period);
        $today->add($interval);
        foreach ($this->arrayofwalks as $key => $value) {
            $date = $value->walkDate;
            if ($date > $today) {
                unset($this->arrayofwalks[$key]);
            }
        }
    }

    public function sort($sortorder1, $sortorder2, $sortorder3) {
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

    public function getBounds($type) {
        $items = $this->allWalks();
        $bounds = array();
        $bounds['xmin'] = 49.860440;
        $bounds['xmax'] = 59.676368;
        $bounds['ymin'] = 2.076597;
        $bounds['ymax'] = -6.041947;
        $first = true;

        foreach ($items as $walk) {
            if ($type == self::GRIDREF) {
                $x = $walk->startLocation->easting;
                $y = $walk->startLocation->northing;
            } else {
                $x = $walk->startLocation->latitude;
                $y = $walk->startLocation->longitude;
            }

            if ($first) {
                $bounds['xmin'] = $x;
                $bounds['xmax'] = $x;
                $bounds['ymin'] = $y;
                $bounds['ymax'] = $y;
                $first = false;
            } else {
                if ($x < $bounds['xmin']) {
                    $bounds['xmin'] = $x;
                }
                if ($x > $bounds['xmax']) {
                    $bounds['xmax'] = $x;
                }
                if ($y < $bounds['ymin']) {
                    $bounds['ymin'] = $y;
                }
                if ($y > $bounds['ymax']) {
                    $bounds['ymax'] = $y;
                }
            }
        }
        return $bounds;
    }

    public function allWalks() {
        return $this->arrayofwalks;
    }

    public function totalWalks() {
        $no = count($this->arrayofwalks);
        return $no;
    }

    public function events() {
        $arrayevents = array();
        foreach ($this->arrayofwalks as $key => $value) {
            $arrayevents[] = $value->event();
        }
        return $arrayevents;
    }

    public function __destruct() {
        
    }

}
