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

    public function addRecord($command, $content = "", $html = false) {
        if ($html) {
            $before = "<!DOCTYPE html><html><head><title></title></head><body>";
            $after = "</body></html>";
            $content = str_replace("\\n", "<br/>", $content);
            $lines = str_split($command . htmlentities($before) . htmlentities($content) . htmlentities($after), 73);
        } else {
            $content = str_replace("&nbsp;", " ", $content);
            $content = str_replace("<p>", "", $content);
            $content = str_replace("</p>", "\\n", $content);
            $content = str_replace("&ndash;", "-", $content);
            $content = strip_tags($content);
            $content = html_entity_decode($content, ENT_QUOTES | ENT_HTML5);
            $lines = str_split($command . $content, 73);
        }
        $blank = "";
        foreach ($lines as $line) {
            if (trim($line) <> "") {
                $this->isc.=$blank . $line . "\r\n";
                $blank = " ";
            }
        }
    }

    // Escapes a string of characters
    public static function escapeString($string) {
        return preg_replace('/([\,;])/', '\\\$1', $string);
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
        $this->isc.= "PRODID:ramblers-webs v1.1\r\n";
    }

    function __destruct() {
        
    }

}
