<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of compare
 *
 * @author Chris Vaughan
 */
abstract class RConfCompare {

    private $type;
    private $comparefilename;
    private $comparefiletext;
    private $result = "invalid";

    const DIFFERENT = "&#10008;";
    const ADDITIONAL = "ADDITIONAL Items";
    const SAME = "&#10004;";
    const IDENTICAL = "&#10004;";

    public function __construct() {
        
    }

    public function compare($text, $options) {
        $this->type = $options["compare"];
        $this->comparefilename = $options["path"];
        $this->readCompareFile();

        if ($this->comparefiletext == $text) {
            If ($text == "") {
                $this->result = "...";
            } else {
                $this->result = self::IDENTICAL;
            }
        } else {
            if (isset($options["replace"])) {
                if ($options["replace"] == true) {
                    $domain = $options["domain"];
                    $this->comparefiletext = str_replace("THIS_DOMAIN", $domain, $this->comparefiletext);
                }
            }

            $this->result = $this->comparetext($text, $this->comparefiletext);
        }
        $displaydetails = $options["displaydetails"];
        $folder = $options["folder"];
        if ($displaydetails) {
            if ($this->result == self::DIFFERENT or $this->result == self::ADDITIONAL) {
                $rows = min([10, max([$this->getCount1(), $this->getCount2()])]);
                $file = $options["file"];
                echo "<h4>" . $folder . "/" . $file . "</h4>";
                echo " <textarea rows='$rows' cols='80' style='width:auto;font-size: 85%;'>" . $text . "</textarea>";
                echo " <textarea rows='$rows' cols='80' style='width:auto;font-size: 85%;'>" . $this->comparefiletext . "</textarea>";
            }
        }
        return $this->result;
    }

    abstract function comparetext($text, $text2);

    abstract function getCount1();

    abstract function getCount2();

    private function readCompareFile() {
        if ($this->comparefilename == "") {
            $this->comparefiletext = "";
        } else {
            $this->comparefiletext = file_get_contents($this->comparefilename);
            if ($this->comparefiletext === false) {
                echo "Invalid comparison file: " . $this->comparefilename;
                $this->comparefiletext = "";
            }
        }
    }

}
