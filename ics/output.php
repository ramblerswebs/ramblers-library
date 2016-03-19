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
        $record = htmlspecialchars_decode($content, ENT_QUOTES);
        $lines = str_split($record, 73);
        $blank = "";
        foreach ($lines as $line) {
            if (trim($line) <> "") {
                $this->isc.=$blank . $line . "\r\n";
                $blank = " ";
            }
        }
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

    function __destruct() {
        
    }

}
