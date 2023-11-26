<?php

/**
 * Description of EventDownload
 * This class provides a method of displaying a link so the use can download an iCalendar file
 * containing their events
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class REventFeed extends RIcsOutput {

    public function __construct() {
        
    }

    public function output($events) {
        $events->getIcalendarFile($this);
        return parent::text();
    }

    public function getText($events) {
        $icsfile = new RIcsOutput();
        $events->getIcalendarFile($icsfile);
        return $icsfile->text();
    }

}
