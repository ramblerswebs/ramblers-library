<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of htaccesscompare
 *
 * @author Chris Vaughan
 */
class RConfHtaccesscompare {

    private $config1;

    public function __construct($text1) {
        $this->config1 = $this->loadstring($text1);
    }

    public function compare($text2) {
        $config2 = $this->loadstring($text2);
        $count1 = count($this->config1);
        $count2 = count($config2);
        if ($count1 > $count2) {
            foreach ($config2 as $key => $value) {
                $value2 = $this->config1[$key];
                if ($value != $value2) {
                    return RConfCompare::DIFFERENT;
                }
            }
            return RConfCompare::ADDITIONAL;
        }
        if ($count1 != $count2) {
            return RConfCompare::DIFFERENT;
        }
        foreach ($this->config1 as $key => $value) {
            $value2 = $config2[$key];
            if ($value != $value2) {
                return RConfCompare::DIFFERENT;
            }
        }
        return RConfCompare::SAME;
    }

    private function loadstring($text) {
        $lines = explode("\n", $text);
        $config = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line == "") {
                continue;
            }
            if ($line[0] == '#') {
                continue;
            }
            $line = str_replace("  ", " ", $line);
            $config[] = $line;
        }
        return $config;
    }

}
