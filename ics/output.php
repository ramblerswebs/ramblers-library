<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of file
 *
 * @author Admin
 */
class RIcsOutput {

    private $isc;

    function __construct() {
        $this->addHeader();
    }

    public function text() {
        return $this->isc . "END:VCALENDAR";
    }

    public function addRecord($content) {
        $this->isc.=$this->fold($content);
    }

    public function addSequence($dateUpdated) {
        $date = new DateTime('2010-01-01');
        $interval = $date->diff($dateUpdated);
        $days = $interval->days;
        $this->sequence = strval($days);
        $this->addRecord("SEQUENCE:" . $this->sequence);
    }

    private function addHeader() {
        $this->isc = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nMETHOD:PUBLISH\r\n";
        $this->isc.= "PRODID:ramblers-webs v1.0\r\n";
        $this->isc.= "VERSION:2.0\r\n";
    }

    private function fold($text) {
        if (strlen($text) <= 75) {
            return $text . "\r\n";
        }
        // split, wrap and trim trailing separator
        return substr(chunk_split($text, 73, "\r\n "), 0, -3) . "\r\n";
    }

    function __destruct() {
        
    }

}
