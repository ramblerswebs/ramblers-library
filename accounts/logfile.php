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
    const OLD_DEFAULT_PHPINI = "";
    const OLD_DEFAULT_HTACCESS = "SetEnv DEFAULT_PHP_VERSION 7\n";
    const OLD_DEFAULT_PUBLIC_PHPINI = "upload_max_filesize = 20M;\npost_max_size = 20M;\nmax_execution_time = 60;\noutput_buffering=0;";
    const OLD_DEFAULT_PUBLIC_HTACCESS = "RewriteEngine On\nRewriteCond %{REQUEST_FILENAME} !\.(cgi)$\nRewritecond %{http_host} ^THIS_DOMAIN\nRewriteRule ^(.*) http://www.THIS_DOMAIN/$1";
    const NEW_DEFAULT_PHPINI = "";
    const NEW_DEFAULT_HTACCESS = "#+PHPVersion\n#=\"php70\"\nAddHandler x-httpd-php70 .php\n#-PHPVersion";
    const NEW_DEFAULT_PUBLIC_PHPINI = "";
    const NEW_DEFAULT_PUBLIC_HTACCESS = "RewriteEngine On\nRewriteCond %{REQUEST_FILENAME} !\.(cgi)$\nRewritecond %{http_host} ^THIS_DOMAIN\nRewriteRule ^(.*) http://www.THIS_DOMAIN/$1\nRewriteEngine On\nRewriteCond %{HTTP_HOST} !^www\. [NC]\nRewriteRule ^(.*)$ http://www.%{HTTP_HOST}/$1 [R=301,L]";

    private $exists = false;
    private $jsonobject = null;
    private $domain;
    private $today;
    private $filesize = 0;
    private $servertimediff = null;

    public function __construct($domain) {
        $this->domain = $domain;
        $file = self::CACHE . "/webstatus." . $domain . ".json.log";
        $this->exists = file_exists($file);
        $this->readFile($file);
        $this->today = new datetime();
        $class = new DateInterval("P3M");
        if ($this->jsonobject != Null) {
            if (isset($this->jsonobject["timediff"])) {
                $data = $this->jsonobject["timediff"];

                foreach ($data as $key => $value) {
                    $class->{$key} = $value;
                }
            }
        }
        $this->servertimediff = $class;
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
                $json = json_decode($content, true);
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
        if (isset($this->jsonobject["reportversion"])) {
            return $this->jsonobject["reportversion"];
        }
        return "...";
    }

    public function getWebMonitorVersion() {
        if (isset($this->jsonobject["webmonitorversion"])) {
            return $this->jsonobject["webmonitorversion"];
        }
        return "...";
    }

    public function getTimeDiff() {
        return $this->formatDateDiff($this->servertimediff);
    }

    public function getIP() {
        $ipfromdomain = gethostbyname($this->domain);
        return $ipfromdomain;
    }

    public function getHCPVersion() {
        $path = $this->jsonobject["path"];
        $domain = $this->jsonobject["domain"];
        $pos = strpos($path, $domain);
        if ($pos === false) {
            return "New";
        } else {
            return "Old";
        }
    }

    public function getCMSFolders() {
        $out = "";
        if ($this->jsonobject <> NULL) {
            $remove = strlen($this->jsonobject["path"]);
            if (isset($this->jsonobject["wordpressversions"])) {
                foreach ($this->jsonobject["wordpressversions"] as $key => $item) {
                    $out.=substr($key, $remove) . "<br/>";
                }
            }

            if (isset($this->jsonobject["joomlaversions"])) {
                $array = $this->jsonobject["joomlaversions"];
                foreach ($array as $key => $item) {
                    $out.=substr($key, $remove) . "<br/>";
                }
            }
        }
        return $out;
    }

    public function getCMSVersions() {
        $out = "";
        if ($this->jsonobject <> NULL) {
            $remove = strlen($this->jsonobject["path"]);
            if (isset($this->jsonobject["wordpressversions"])) {
                foreach ($this->jsonobject["wordpressversions"] as $key => $item) {
                    $out.= "WordPress: " . $item . "<br/>";
                }
            }

            if (isset($this->jsonobject["joomlaversions"])) {
                $array = $this->jsonobject["joomlaversions"];
                foreach ($array as $key => $item) {
                    $out.="Joomla: " . $item . "<br/>";
                }
            }
        }
        return $out;
    }

    public function getJoomlaVersion() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject["joomlaversions"])) {
                $out = "";
                foreach ($this->jsonobject["joomlaversions"] as $item) {
                    $out.=$item . "<br/>";
                }
            }
            return $out;
        }
        return "not set";
    }

    public function getNoFilesScanned() {
        if (isset($this->jsonobject["nofilesscanned"])) {
            return number_format($this->jsonobject["nofilesscanned"]);
        }
        return "...";
    }

    public function getTotalSizeScanned() {
        if (isset($this->jsonobject["totalsizescanned"])) {
            return number_format($this->jsonobject["totalsizescanned"]);
        }
        return "...";
    }

    public function getLatestFile() {
        if (isset($this->jsonobject["latestfile"])) {
            return $this->jsonobject["latestfile"];
        }
        return "...";
    }

    public function getFileDate() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject["creationdate"])) {
                $value = DateTime::createFromFormat('Y-m-d H:i:s', $this->jsonobject["creationdate"]);
                $date = new DateTime();
                $interval = new DateInterval('P2D');
                $date->sub($interval);
                $item = $this->jsonobject["creationdate"];
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
            if (isset($this->jsonobject["directories"])) {
                $out = array();
                foreach ($this->jsonobject["directories"] as $item) {
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
        if (!isset($this->jsonobject["config"])) {
            return false;
        }
        $count = 0;
        foreach ($this->jsonobject["config"] as $item) {
            $count+=1;
        }
        return $count <> 0;
        ;
    }

    public function getConfigFolder() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject["config"])) {
                $out = "";
                foreach ($this->jsonobject["config"] as $item) {
                    $parts = explode(",", $item);
                    if ($parts[1] == "\$sitename") {
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
        return $this->getConfigName("\$sitename");
    }

    public function getConfigCaching() {
        return $this->getConfigName("\$caching");
    }

    public function getConfigGZip() {
        return $this->getConfigName("\$gzip");
    }

    public function getConfigSef() {
        return $this->getConfigName("\$sef");
    }

    public function getConfigSef_rewrite() {
        return $this->getConfigName("\$sef_rewrite");
    }

    public function getConfigSef_suffix() {
        return $this->getConfigName("\$sef_suffix");
    }

    public function getConfigName($which) {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject["config"])) {
                $out = "";
                foreach ($this->jsonobject["config"] as $item) {
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
            if (isset($this->jsonobject["joomlabackups"])) {
                $out = "";
                foreach ($this->jsonobject["joomlabackups"] as $item) {
                    //  if (strpos($item->file, 'site') !== false) {
                    //       $out.=$item->folder . "<br/>";
                    //   }

                    $out.=$item["folder"] . "<br/>";
                }
                return $out;
            }
            return "";
        }
        return "";
    }

    public function getBackupNo() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject["joomlabackups"])) {
                $out = "";
                foreach ($this->jsonobject["joomlabackups"] as $item) {
                    //   if (strpos($item->file, 'site') !== false) {
                    //      $out.=$item->nofiles . "<br/>";
                    //  }
                    //  if (strpos($item->file, 'site') !== false) {
                    $out.=$item["nofiles"] . "<br/>";
                    //  }
                }
                return $out;
            }
            return "";
        }
        return "";
    }

    public function getBackupSize() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject["joomlabackups"])) {
                $out = "";
                foreach ($this->jsonobject["joomlabackups"] as $item) {
                    // if (strpos($item->file, 'site') !== false) {
                    $out.=number_format($item["totalsize"]) . "<br/>";
                    // }
                }
                return $out;
            }
            return "";
        }
        return "";
    }

    public function getBackupFile() {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject["joomlabackups"])) {
                $out = "";
                foreach ($this->jsonobject["joomlabackups"] as $item) {
                    //  if (strpos($item->file, 'site') !== false) {
                    $out.=self::getBackupDiv($item["file"]);
                    //  }
                }
                return $out;
            }
            return "";
        }
        return "";
    }

    public function isOlder($interval) {
        if ($this->jsonobject <> NULL) {
            if (isset($this->jsonobject["creationdate"])) {
                $datetext = $this->jsonobject["creationdate"];
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
                $expected = [self::OLD_DEFAULT_PHPINI, self::NEW_DEFAULT_PHPINI];
                break;
            case self::FILE_HTACCESS:
                $file = ".htaccess";
                $expected = [self::OLD_DEFAULT_HTACCESS, self::NEW_DEFAULT_HTACCESS];
                break;
            case self::FILE_PUBLICPHPINI:
                $file = "public_html/php.ini";
                $expected = [self::OLD_DEFAULT_PUBLIC_PHPINI, self::NEW_DEFAULT_PUBLIC_PHPINI];
                break;
            case self::FILE_PUBLICHTACCESS:
                $file = "public_html/.htaccess";
                $expected = [self::OLD_DEFAULT_PUBLIC_HTACCESS, self::NEW_DEFAULT_PUBLIC_HTACCESS];
                $expected[0] = str_replace("THIS_DOMAIN", $this->domain, $expected[0]);
                $expected[1] = str_replace("THIS_DOMAIN", $this->domain, $expected[1]);
                break;

            default:
                return "Error";
                break;
        }
        if ($this->jsonobject <> NULL) {
            $key = $this->jsonobject["path"] . $file;
            if (isset($this->jsonobject["files"]["$key"])) {
                $value = $this->jsonobject["files"]["$key"];
                return self::isSame($value, $expected);
            }
        }
        return "...";
    }

    static function isSame($input, $expected) {
        $value = str_replace("\n\n", "\n", $input); // do not worry about extra blank lines
        foreach ($expected as $item) {
            if ($value === $item) {
                return "Default";
            }
            $value = str_replace(" ;", ";", $value);
            if (trim($value) === trim($item)) {
                return "Default";
            }
            if (strtolower(trim($value)) == strtolower(trim($item))) {
                return "Default - case difference";
            }
        }

        return self::process($value, 400);
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

    /**
     * A sweet interval formatting, will use the two biggest interval parts.
     * On small intervals, you get minutes and seconds.
     * On big intervals, you get months and days.
     * Only the two biggest parts are used.
     *
     * @return string
     */
    public function formatDateDiff($interval) {

        $doPlural = function($nb, $str) {
            return $nb > 1 ? $str . 's' : $str;
        }; // adds plurals

        $format = array();
        if ($interval->y !== 0) {
            $format[] = "%y " . $doPlural($interval->y, "year");
        }
        if ($interval->m !== 0) {
            $format[] = "%m " . $doPlural($interval->m, "month");
        }
        if ($interval->d !== 0) {
            $format[] = "%d " . $doPlural($interval->d, "day");
        }
        if ($interval->h !== 0) {
            $format[] = "%h " . $doPlural($interval->h, "hour");
        }
        if ($interval->i !== 0) {
            $format[] = "%i " . $doPlural($interval->i, "minute");
        }
        if ($interval->s !== 0) {
            if (!count($format)) {
                return "less than a minute ago";
            } else {
                $format[] = "%s " . $doPlural($interval->s, "second");
            }
        }

// We use the two biggest parts
        if (count($format) > 1) {
            $format = array_shift($format) . " and " . array_shift($format);
        } else {
            $format = array_pop($format);
        }

// Prepend 'since ' or whatever you like
        return $interval->format($format);
    }

}
