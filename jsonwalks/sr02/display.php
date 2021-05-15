<?php

/**
 * Description of RJsonwalksStdWalktable3col
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksSr02Display extends RJsonwalksStdDisplay {

    private $tableFormat = [
        ['title' => 'Date/Time', 'items' => ["{dowddmm}", "{;startTime}"]],
        ['title' => 'Leader/Contact', 'items' => ["{xContact}", "{;telephone1}", "{;telephone2}"]],
        ['title' => 'Details', 'items' => ["{title}", "{;description}", "{lf}", "{Grid Ref: }", "{startGR}", "{ Postcode: }", "{startPC}", "{;additionalNotes}"]],
        ['title' => 'Distance', 'items' => ["{distance}", "{;xNationalGrade}", "{xSymbol}"]]
    ];
 

    public function __construct() {
        parent::__construct();
        parent::setCustomTableFormat($this->tableFormat);
//        parent::customFormat($this->tableFormat);
//        parent::setRowClass($this, 'rowClass');
//        RJsonwalksWalk::setCustomValues($this, "customValue");
        $document = JFactory::getDocument();
        
        $document->addScript("libraries/ramblers/jsonwalks/sr02/display.js", "text/javascript");
        $document->addStyleSheet("libraries/ramblers/jsonwalks/sr02/style.css");

    }

}
