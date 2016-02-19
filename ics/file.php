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
class RIcsFile extends RIcsOutput {

    private $cacheLinkname;
    private $cacheFilename;

    function __construct($filename) {
        parent::__construct();
        $this->CacheLocation($filename);
    }

    public function exists() {
        if (file_exists($this->cacheFilename)) {
            $last = filemtime($this->cacheFilename);
            $lastdate = new datetime();
            $lastdate->setTimestamp($last);
            $today = new DateTime();
            $lastdate = $lastdate->add(new DateInterval('PT01H')); // regenerate file after 1 hour
            return $today < $lastdate;
        } else {
            return false;
        }
    }

    public function write() {
        $text=parent::text();
        file_put_contents($this->cacheFilename, $text);
    }

    public function getFileLink($text) {
        return "<div class='icsdownload'><a href='" . $this->cacheLinkname . "' target='_blank'>" . $text . "</a></div>";
    }

    private function CacheLocation($filename) {
        if (!defined('DS')) {
            define('DS', DIRECTORY_SEPARATOR);
        }
        $cacheLocation = 'cache/ra_icsfiles/';
        $cacheFolderPath = JPATH_SITE . DS . 'cache' . DS . 'ra_icsfiles';
        if (!file_exists($cacheFolderPath)) {
            mkdir($cacheFolderPath);
        }
        $this->cacheLinkname = JURI::base() . $cacheLocation . $filename . ".ics";
        $this->cacheFilename = $cacheFolderPath . DS . $filename . ".ics";
    }

}
