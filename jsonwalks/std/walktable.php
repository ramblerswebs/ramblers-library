<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdWalktable extends RJsonwalksDisplaybase {

    private $walksClass = "walks";
    private $walkClass = "walk";
    private $tableClass='pantone5565';
    private $customFormat = null;
    private $monthlyReminderClass = null;
    private $monthlyReminderMethod = null;
    private $rowClassClass = null;
    private $rowClassMethod = null;
    public $link = true;
    public $addDescription = true;
    public $addGroupName = false;
    public $addLocation = true;
    private $tableFormat = [
        ['title' => 'Date', 'items' => ["{dowddmm}"]],
        ['title' => 'Meet', 'items' => ["{meet}", "{,meetGR}", "{,meetPC}"]],
        ['title' => 'Start', 'items' => ["{start}", "{,startGR}", "{,startPC}"]],
        ['title' => 'Title', 'items' => ["{title}","{mediathumbr}"]],
        ['title' => 'Distance', 'items' => ["{distance}"]],
        ['title' => 'Grade', 'items' => ["{grade+}"]],
        ['title' => 'Contact', 'items' => ["{contact}"]]];

    public function customFormat($format) {
        $this->customFormat = $format;
    }

    public function DisplayWalks($walks) {

        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_TIME, RJsonwalksWalk::SORT_DISTANCE);
        $items = $walks->allWalks();
        if ($this->customFormat !== null) {
            $this->tableFormat = $this->customFormat;
        }
        $groupByMonth = RJsonwalksWalk::groupByMonth($this->tableFormat);
        $odd = false;
        $lastValue = "";
        echo "<table class='" . $this->tableClass . "' >" . PHP_EOL;

        if (!$groupByMonth) {
            echo $this->displayTableHeader();
        }

        foreach ($items as $walk) {
            if ($groupByMonth) {
                $thismonth = $walk->getMonthGroup($walk);
                $displayMonth = $thismonth !== $lastValue;
                $lastValue = $thismonth;
                if ($displayMonth) {
                    if ($displayMonth) {
                        $out = "<tr><td>";
                        $out .= "<h3>" . $walk->month . $walk->addYear() . "</h3>";
                        $out .= "</td></tr>";
                        echo $out;
                    }
                    if ($this->monthlyReminderClass !== null) {
                        call_user_func(array($this->monthlyReminderClass, $this->monthlyReminderMethod), $thismonth);
                    }
                }
            }
            echo $this->displayWalk_Table($walk, $this->walkClass);
            $odd = !$odd;
        }
        echo "</table>" . PHP_EOL;
        $schema = new RJsonwalksAddschema();
        $schema->display($walks);
    }

    public function setMonthlyReminder($clss, $method) {
        $this->monthlyReminderClass = $clss;
        $this->monthlyReminderMethod = $method;
    }

    public function setRowClass($clss, $method) {
        $this->rowClassClass = $clss;
        $this->rowClassMethod = $method;
    }

    public function setWalksClass($class) {
        $this->walksClass = $class;
    }

    public function setWalkClass($class) {
        $this->walkClass = $class;
    }
    public function setTableClass($class){
        $this->tableClass=$class;
    }

    private function displayTableHeader() {
        $cols = $this->tableFormat;
        $out = "<tr>";
        foreach ($cols as $col) {
            $out .= "<th>" . $col['title'] . "</th>";
        }
        return $out . "</tr>";
    }

    private function displayWalk_Table($walk, $class) {
        $cols = $this->tableFormat;
        $nClass = $class;
        if ($this->rowClassClass !== null) {
            $nClass = call_user_func(array($this->rowClassClass, $this->rowClassMethod), $walk);
        }
        $out = "<tr class='" . $nClass . " walk" . $walk->status . "' >";

        foreach ($cols as $col) {
            if (array_key_exists('class', $col)) {
                $class = $col['class'];
                $out .= "<td " . $class . ">";
            } else {
                $out .= "<td>";
            }
            $items = $col['items'];
            $out .= $walk->addTooltip($walk->getWalkValues($items));
            $out .= "</td>";
        }
        $out .= "</tr>";
        return $out;
    }

}
