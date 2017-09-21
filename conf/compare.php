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
class RConfCompare {

    private $type;
    private $comparefilename;
    private $comparefiletext;
    private $result = "invalid";

    const DIFFERENT = "DIFFERENT";
    const ADDITIONAL = "ADDITIONAL Items";
    const SAME = "Same";
    const IDENTICAL = "Identical";

    public function __construct() {
        
    }

    public function compare($options, $text) {
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
            switch ($this->type) {
                case "ini":
                    $comp = new RConfInicompare($text);
                    $this->result = $comp->compare($this->comparefiletext);
                    break;
                case "htaccess":
                    $comp = new RConfHtaccesscompare($text);
                    $this->result = $comp->compare($this->comparefiletext);
                    break;
                default:
                    return $this->result;
            }
        }
        $displaydetails = $options["displaydetails"];
        $folder = $options["folder"];
        if ($displaydetails) {
            if ($this->result == self::DIFFERENT or $this->result == self::ADDITIONAL) {
                $file = $options["file"];
                echo "<h4>" . $folder . "/" . $file . "</h4>";
                echo " <textarea rows='10' cols='80' style='width:auto;font-size: 85%;'>" . $text . "</textarea>";
                echo " <textarea rows='10' cols='80' style='width:auto;font-size: 85%;'>" . $this->comparefiletext . "</textarea>";
            }
        }
        return $this->result;
    }

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
