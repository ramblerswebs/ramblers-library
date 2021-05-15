<?php

/**
 * Description of RJsonwalksStdWalktable3col
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksSx05Programme extends RJsonwalksStdWalktable {

    private $tableFormat = [
        ['title' => 'Date', 'items' => ["{dowdd}", "{;startGR}", "{;startPC}", "{;distance}"]],
        ['title' => 'Meet', 'items' => ["{meet}", "{;start}", "{;title}", "{;description}"]],
        ['title' => 'Contact', 'items' => ["{contactname}", "{;telephone1}", "{;telephone2}"], 'class' => 'nowrap']];

    public function __construct() {
        parent::__construct();
        parent::customFormat($this->tableFormat);
        parent::setMonthlyReminder($this, 'reminder');
    }

    public function reminder($thisMonth) {
        $outdate = '';
        switch ($thisMonth) {
            case "January":
            case "December":
                $outdate = "<tr><td colspan='3'>";
                $outdate .= "<h4>TIME TO START PLANNING YOUR WALKS FOR THE SUMMER PROGRAMME";
                $outdate .= "</td></tr>";
                echo $outdate;
                break;
            case "June":
            case "July":
                $outdate = "<tr><td colspan='3'>";
                $outdate .= "<h4>TIME TO START PLANNING YOUR WALKS FOR THE WINTER PROGRAMME";
                $outdate .= "</td></tr>";
                echo $outdate;
                break;
        }
    }
}