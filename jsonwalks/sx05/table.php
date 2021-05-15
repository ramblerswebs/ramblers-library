<?php

/**
 * Description of RJsonwalksSx05Table
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksSx05Table extends RJsonwalksStdWalktable {

    private $tableFormat = [
        ['title' => 'Date', 'items' => ["{dowdd}"]],
        ['title' => 'Start', 'items' => ["{start}", "{;startGR}", "{;startPC}"]],
        ['title' => 'Ttile', 'items' => ["{title}"]],
        ['title' => 'hfdf', 'items' => ["{distance}", "{;description}"]],
        ['title' => 'qwerty', 'items' => ["{duration}","{;nationalGrade}","{;localGrade}"]],
        ['title' => 'Contact', 'items' => ["{contactname}", "{;telephone1}", "{;telephone2}"], 'class' => 'nowrap']];

    public function __construct() {
        parent::__construct();
        parent::customFormat($this->tableFormat);
    }

}
