<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of logfile
 *
 * @author Chris
 */
class RAccountsLogfile {

    const CACHE = "../cache01/cache";
    const RW = "ramblers-webs.org.uk";

    private $exists = false;
    private $jsonobject = null;
    private $domain;
    private $today;

    public function __construct($domain) {
        $this->domain = $domain;
        if ($domain == self::RW) {
            $file = "../webstatus.ramblers.webs.json.log";
        } else {
            $file = self::CACHE . "/webstatus." . $domain . ".json.log";
        }
        $this->exists = file_exists($file);
        $this->readFile($file);
        $this->today = new datetime();
    }

    private function readFile($file) {
        if (!$this->exists) {
            return;
        }
        $content = file_get_contents($file);
        if ($content === false) {
            $content = NULL;
        }
        switch ($content) {
            case NULL:
                break;
            case "[]":
                break;
            default:
                $json = json_decode($content);
                if (json_last_error() == JSON_ERROR_NONE) {

                    $this->jsonobject = $json;
                    unset($json);
                }
        }
    }

    public function getFileDate() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject->creationdate)) {
                return $this->jsonobject->creationdate;
            }
            return "Unknown";
        }
        return "...";
    }

    public function isOlder($interval) {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject->creationdate)) {
                $datetext = $this->jsonobject->creationdate;
                $created = DateTime::createFromFormat("Y-m-d H:i:s", $datetext);
                if ($created->add($interval) < $this->today) {
                    return true;
                }
            } else {
                return true;
            }
        }
        return false;
    }

    public function getFile($file) {
        $key = $this->jsonobject->path . $file;
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject->files->$key)) {
                return self::process($this->jsonobject->files->$key, 200);
            }
        }
        return "...";
    }

    public function Exists() {
        return $this->exists;
    }

    static function process($text, $length) {
        $out = substr($text, 0, $length);
        $out = str_replace("\n", "<br/>", $out);
        return $out;
    }

}
