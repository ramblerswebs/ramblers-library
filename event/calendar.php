<?php

/**
 * Description of WalksCalendar
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class REventCalendar extends RJsonwalksDisplaybase {

    private $size;
    private $mDisplayAll = false;
    private $monthFormat = "F 'y";

    function __construct($size) {
        parent::__construct();
        $this->size = $size;
    }

    function DisplayWalks($walks) {
        echo "REventCalendar: this way of using this class is not supported";
    }

    public function displayAll() {
        $this->mDisplayAll = true;
    }

    public function setMonthFormat($format) {
        if (is_string($format)) {
            $this->monthFormat = $format;
        }
    }

    function Display($events) {
        $document = JFactory::getDocument();
        $document->addStyleSheet('libraries/ramblers/calendar/calendar.css');
        $document->addScript("libraries/ramblers/js/ra.js", "text/javascript");
        //     $document->addScript("libraries/ramblers/js/ramblerswalks.js", "text/javascript");
        $cal = new RCalendar($this->size, $this->mDisplayAll);
        $cal->setMonthFormat($this->monthFormat);
        $cal->show($this, $events);
    }

}
