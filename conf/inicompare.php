<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class RConfInicompare {

    private $config1;

    public function __construct($text1) {
        $this->config1 = $this->loadstring($text1);
    }

    public function compare($text2) {
        $config2 = $this->loadstring($text2);
        $nodifferences = 0;

        foreach ($this->config1 as $var => $val) {
            if (isset($config2[$var])) {
                if ($val == $config2[$var]) {
                    continue;
                }
                $nodifferences += 1;
            } else {
                $nodifferences += 1;
            }
        }
        if ($nodifferences == 0) {
            return RConfCompare::SAME;
        }
        return RConfCompare::DIFFERENT;
    }

    private function loadstring($text) {

        $lines = explode("\n", $text);
        $config = [];
        foreach ($lines as $line) {
            $line = trim($line);
            $line = rtrim($line, ";");
            $line = trim($line);
            if (trim($line) == "") {
                continue;
            }
            if ($line[0] == ';') {
                continue;
            }
            if ($line[0] == '[') {
                continue;
            }

            $var = explode('=', $line);
            $count = count($var);

            switch ($count) {
                case 1:
                    $config[trim($var[0])] = "";
                    break;
                case 2:
                    $config[trim($var[0])] = trim($var[1]);
                    break;

                default:
                    $config[trim($var[0])] = trim($var[1]) . trim($var[2]);
                    break;
            }
        }
        return $config;
    }

}
