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
    const FILE_PHPINI = 0;
    const FILE_HTACCESS = 1;
    const FILE_PUBLICPHPINI = 2;
    const FILE_PUBLICHTACCESS = 3;

    private $exists = false;
    private $jsonobject = null;
    private $domain;
    private $today;
    private $filesize = 0;

    public function __construct($domain) {
        $this->domain = $domain;
        $file = self::CACHE . "/webstatus." . $domain . ".json.log";
        $this->exists = file_exists($file);
        $this->readFile($file);
        $this->today = new datetime();
    }

    private function readFile($file) {
        if (!$this->exists) {
            return;
        }
        $this->filesize = filesize($file);
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

    public function getFileSize() {
        return number_format($this->filesize);
    }

    public function getReportFormat() {
        if (isset($this->jsonobject->reportversion)) {
            return $this->jsonobject->reportversion;
        }
        return "...";
    }

    public function getWebMonitorVersion() {
        if (isset($this->jsonobject->webmonitorversion)) {
            return $this->jsonobject->webmonitorversion;
        }
        return "...";
    }

    public function getIP() {
        $ipfromdomain = gethostbyname($this->domain);
        return $ipfromdomain;
    }

    public function getHCPVersion() {
        $path = $this->jsonobject->path;
        $domain = $this->jsonobject->domain;
        $pos = strpos($path, $domain);
        if ($pos === false) {
            return "New";
        } else {
            return "Old";
        }
    }

    public function getNoFilesScanned() {
        if (isset($this->jsonobject->nofilesscanned)) {
            return number_format($this->jsonobject->nofilesscanned);
        }
        return "...";
    }

    public function getTotalSizeScanned() {
        if (isset($this->jsonobject->totalsizescanned)) {
            return number_format($this->jsonobject->totalsizescanned);
        }
        return "...";
    }

    public function getLatestFile() {
        if (isset($this->jsonobject->latestfile)) {
            return $this->jsonobject->latestfile;
        }
        return "...";
    }

    public function getFileDate() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject->creationdate)) {
                $value = DateTime::createFromFormat('Y-m-d H:i:s', $this->jsonobject->creationdate);
                $date = new DateTime();
                $interval = new DateInterval('P2D');
                $date->sub($interval);
                $item = $this->jsonobject->creationdate;
                if ($value < $date) {
                    $item = "<div style='color:red'>" . $item . "</div>";
                }
                return $item;
            }
            return "Unknown";
        }
        return "...";
    }

    public function getFolders() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject->directories)) {
                $out = array();
                foreach ($this->jsonobject->directories as $item) {
                    $parts = explode("/", $item);
                    $out[] = end($parts);
                }
                return $out;
            }
            return ["None"];
        }
        return ["..."];
    }

    public function hasJoomla() {
        if ($this->jsonobject == NULL) {
            return false;
        }
        if (!isset($this->jsonobject->config)) {
            return false;
        }
        $count = 0;
        foreach ($this->jsonobject->config as $item) {
            $count+=1;
        }
        return $count <> 0;
        ;
    }

    public function getConfigFolder() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject->config)) {
                $out = "";
                foreach ($this->jsonobject->config as $item) {
                    $parts = explode(",", $item);
                    if ($parts[1] == "sitename") {
                        $out.=$parts[0] . "<br/>";
                    }
                }
                return $out;
            }
            return "";
        }
        return "";
    }

    public function getConfigSitename() {
        return $this->getConfigName("sitename");
    }

    public function getConfigCaching() {
        return $this->getConfigName("caching");
    }

    public function getConfigGZip() {
        return $this->getConfigName("gzip");
    }

    public function getConfigSef() {
        return $this->getConfigName("sef");
    }

    public function getConfigSef_rewrite() {
        return $this->getConfigName("sef_rewrite");
    }

    public function getConfigSef_suffix() {
        return $this->getConfigName("sef_suffix");
    }

    public function getConfigName($which) {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject->config)) {
                $out = "";
                foreach ($this->jsonobject->config as $item) {
                    $parts = explode(",", $item);
                    if (trim($parts[1]) == $which) {
                        $out.=$parts[2] . "<br/>";
                    }
                }
                return $out;
            }
            return "not set";
        }
        return "...";
    }

    public function getBackupFolder() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject->joomlabackups)) {
                $out = "";
                foreach ($this->jsonobject->joomlabackups as $item) {
                    if (strpos($item->file, 'site') !== false) {
                        $out.=$item->folder . "<br/>";
                    }
                }
                return $out;
            }
            return "";
        }
        return "";
    }

    public function getBackupNo() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject->joomlabackups)) {
                $out = "";
                foreach ($this->jsonobject->joomlabackups as $item) {
                    if (strpos($item->file, 'site') !== false) {
                        $out.=$item->nofiles . "<br/>";
                    }
                }
                return $out;
            }
            return "";
        }
        return "";
    }

    public function getBackupSize() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject->joomlabackups)) {
                $out = "";
                foreach ($this->jsonobject->joomlabackups as $item) {
                    if (strpos($item->file, 'site') !== false) {
                        $out.=number_format($item->totalsize) . "<br/>";
                    }
                }
                return $out;
            }
            return "";
        }
        return "";
    }

    public function getBackupFile() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject->joomlabackups)) {
                $out = "";
                foreach ($this->jsonobject->joomlabackups as $item) {
                    if (strpos($item->file, 'site') !== false) {
                        $out.=self::getBackupDiv($item->file);
                    }
                }
                return $out;
            }
            return "";
        }
        return "";
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

    public function getFile($which) {

        switch ($which) {
            case self::FILE_PHPINI:
                $file = "php.ini";
                $expected = "";
                break;
            case self::FILE_HTACCESS:
                $file = ".htaccess";
                $expected = "SetEnv DEFAULT_PHP_VERSION 7\n";
                break;
            case self::FILE_PUBLICPHPINI:
                $file = "public_html/php.ini";
                $expected = "upload_max_filesize = 20M;\npost_max_size = 20M;\nmax_execution_time = 60;\noutput_buffering=0;";
                break;
            case self::FILE_PUBLICHTACCESS:
                $file = "public_html/.htaccess";
                $expected = "RewriteEngine On\nRewriteCond %{REQUEST_FILENAME} !\.(cgi)$\nRewritecond %{http_host} ^" . $this->domain . "\nRewriteRule ^(.*) http://www." . $this->domain . "/$1";
                break;

            default:
                return "Error";
                break;
        }
        if ($this->jsonobject <> NULL) {
            $key = $this->jsonobject->path . $file;
            if (isset($this->jsonobject->files->$key)) {
                $value = $this->jsonobject->files->$key;
                return self::isSame($value, $expected);
            }
        }
        return "...";
    }

    static function isSame($value, $expected) {
        if ($value === $expected) {
            return "Identical";
        }
        $value = str_replace(" ;", ";", $value);
        if (trim($value) === trim($expected)) {
            return "As expected";
        }
        if (strtolower(trim($value)) == strtolower(trim($expected))) {
            return "As expected - case difference";
        }
        return self::process($value, 200);
        ;
    }

    public function Exists() {
        return $this->exists;
    }

    private static function process($text, $length) {
        $out = substr($text, 0, $length);
        $out = str_replace("\n", "<br/>", $out);
        return $out;
    }

    private static function getBackupDiv($file) {
        $dt = substr($file, -19, 15);
        $datecreated = DateTime::createFromFormat('Ymd-His', $dt);
        $date = new DateTime();
        $interval = new DateInterval('P7D');
        $date->sub($interval);
        $item = $file;
        if ($datecreated < $date) {
            $item = "<div style='color:#ababab'>" . $file . "</div>";
        } else {
            $item = "<div>" . $file . "</div>";
        }
        $interval = new DateInterval('P113D');
        $date->sub($interval);

        if ($datecreated < $date) {
            $item = "<div style='color:red'>" . $file . "</div>";
        }
        return $item;
    }

}
