<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdSimplelist extends RJsonwalksDisplaybase {

    private $walksClass = "walks";
    private $walkClass = "walk";
    private $customFormat = null;
    public $addGridRef = true;
    public $addStartGridRef = false;
    public $addDescription = false;
    private $listFormat = ["{dowdd}",
        "{,meet}", "{,meetGR}",
        "{,start}", "{,startGR}",
        "{,title}", "{,description}",
        "{,distance}",
        "{,contactname}",
        "{,telephone}"];

    // const BR = "<br />";
    public function customFormat($format) {
        $this->customFormat = $format;
    }

    public function DisplayWalks($walks) {
        // remove description
        if (!$this->addDescription) {
            foreach (array_keys($this->listFormat, "{,description}", true) as $key) {
                unset($this->listFormat[$key]);
            }
        }
        // remove Start GR
        if (!$this->addStartGridRef) {
            foreach (array_keys($this->listFormat, "{,meetGR}", true) as $key) {
                unset($this->listFormat[$key]);
            }
        }
        // Remove both GRs
        if (!$this->addGridRef) {
            foreach (array_keys($this->listFormat, "{,meetGR}", true) as $key) {
                unset($this->listFormat[$key]);
            }
            foreach (array_keys($this->listFormat, "{,startGR}", true) as $key) {
                unset($this->listFormat[$key]);
            }
        }
        if ($this->customFormat !== null) {
            $this->listFormat = $this->customFormat;
        }
        
        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_TIME, RJsonwalksWalk::SORT_DISTANCE);
        $items = $walks->allWalks();
         $groupByMonth = RJsonwalksWalk::groupByMonth($this->listFormat);
        $lastValue="";
        $odd = true;
        echo "<div class='" . $this->walksClass . "' >" . PHP_EOL;
        foreach ($items as $walk) {
            $thismonth = $walk->getMonthGroup();
            if ($thismonth <> $lastValue) {
                $lastValue = $thismonth;
                if ($groupByMonth) {
                    echo "<h2>" . $thismonth . "</h2>" . PHP_EOL;
                    $odd = false;
                }
            }
            if ($odd) {
                $this->displayWalk($walk, 'odd');
            } else {
                $this->displayWalk($walk, 'even');
            }
            $odd = !$odd;
        }
        echo "</div>" . PHP_EOL;
    }

    public function setWalksClass($class) {
        $this->walksClass = $class;
    }

    public function setWalkClass($class) {
        $this->walkClass = $class;
    }

    private function displayWalk($walk, $oddeven) {
        $text = $walk->getWalkValues( $this->listFormat);
        echo "<div class='" . $this->walkClass . $walk->status . " " . $oddeven . "' >" . PHP_EOL;
        echo "<span>" . $text . "</span>" . PHP_EOL;
        echo "</div>" . PHP_EOL;
    }

}
