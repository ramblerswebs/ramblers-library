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
class RAccountsAccount {

    const DEV_DOMAINDETAILS = "index.php?option=com_content&view=article&id=202";
    const PROD_DOMAINDETAILS = "index.php?option=com_content&view=article&id=254";
    const FORMAT_SINGLE = 0;
    const FORMAT_NOLOGFILE = 1;
    const FORMAT_LOGFILE = 2;
    const FORMAT_BASIC = 3;
    const FORMAT_FOLDERS = 4;
    const FORMAT_CONFIG = 5;
    const FORMAT_AKEEBA = 6;
    const FORMAT_NOJOOMLA = 7;
    const FORMAT_SPF = 8;

    private $status;
    private $domain;
    private $log;
    private $timeperiod;

    public function __construct($domain, $status) {
        $this->domain = trim($domain);
        $this->status = $status;
        $this->log = new RAccountsLogfile($domain);
        $this->timeperiod = new DateInterval("P2D");
    }

    Public static function formatsArray() {
        $items = [1, 2, 3, 4, 5, 6, 7, 8];
        return $items;
    }

    public function getColumns($format) {
        $array = array();
        switch ($format) {
            case self::FORMAT_NOLOGFILE:
                if ($this->log->Exists()) {
                    return Null;
                }
                $array[] = $this->domainLink();
                $array[] = $this->status;
                 $array[] = $this->whoisLink();
                break;
            case self::FORMAT_LOGFILE:
                if (!$this->log->Exists()) {
                    return null;
                }
                $array[] = $this->domainLink();
                $array[] = $this->status;
                $array[] = $this->log->getHCPVersion();
                $array[] = $this->log->getWebMonitorVersion();
                // $array[] = $this->log->getReportFormat();
                $array[] = $this->log->getFileSize();
                $array[] = $this->log->getFileDate();
                $array[] = $this->log->getTimeDiff();
                $array[] = $this->log->getNoFilesScanned();
                $array[] = $this->log->getTotalSizeScanned();
                $array[] = $this->log->getLatestFile();
                $array[] = $this->detailsLink()."<br/>". $this->whoisLink();
                break;
            case self::FORMAT_BASIC:
                if (!$this->log->Exists()) {
                    return null;
                }
                $array[] = $this->domainLink() . "<br/>  " . $this->log->getFileDate();
                $array[] = $this->log->getFile(RAccountsLogfile::FILE_HTACCESS);
                $array[] = $this->log->getFile(RAccountsLogfile::FILE_PHPINI);
                $array[] = $this->log->getFile(RAccountsLogfile::FILE_PUBLICHTACCESS);
                $array[] = $this->log->getFile(RAccountsLogfile::FILE_PUBLICPHPINI);
                break;
            case self::FORMAT_FOLDERS:
                if (!$this->log->Exists()) {
                    return null;
                }
                $array[] = $this->domainLink() . "<br/>  " . $this->log->getFileDate();
                $folders = $this->log->getFolders();
                $array[] = $this->formatFolder($folders);
                $array[] = $this->log->getCMSFolders();
                $array[] = $this->log->getCMSVersions();
                break;
            case self::FORMAT_AKEEBA:
                if (!$this->log->Exists()) {
                    return null;
                }
                if ($this->log->hasJoomla()) {
                    $report = $this->log->getReportFormat();
                    if ($report = 1.02) {
                        $array[] = $this->domainLink() . "<br/>  " . $this->log->getFileDate();
                        $array[] = $this->status;
                        $array[] = $this->log->getBackupFolder();
                        $array[] = $this->log->getBackupNo();
                        $array[] = $this->log->getBackupSize();
                        $array[] = $this->log->getBackupFile();
                    }
                }
                break;
            case self::FORMAT_CONFIG:
                if (!$this->log->Exists()) {
                    return null;
                }
                if ($this->log->hasJoomla()) {
                    $array[] = $this->domainLink() . "<br/>  " . $this->log->getFileDate();
                    $array[] = $this->status;
                    $array[] = $this->log->getConfigFolder();
                    $array[] = $this->log->getConfigSitename();
                    $array[] = $this->log->getJoomlaVersion();
                    $array[] = $this->log->getConfigCaching();
                    $array[] = $this->log->getConfigGZip();
                    $array[] = $this->log->getConfigSef();
                    $array[] = $this->log->getConfigSef_rewrite();
                    $array[] = $this->log->getConfigSef_suffix();
                }
                break;
            case self::FORMAT_NOJOOMLA:
                if (!$this->log->Exists()) {
                    return null;
                }
                if (!$this->log->hasJoomla()) {
                    $array[] = $this->domainLink() . "<br/>  " . $this->log->getFileDate();
                    $array[] = $this->status;
                }
                break;
            case self::FORMAT_SPF:
                $result = dns_get_record($this->domain, DNS_TXT);
                $spf = "Not found";
                if ($result !== false) {
                    if (isset($result[0])) {
                        $col0 = $result[0];
                        if (isset($col0['txt'])) {
                            $spf = $col0['txt'];
                        }
                    }
                }
                $array[] = $this->domainLink();
                $array[] = $this->status;
                $array[] = $spf;
                break;
            default:
                return Null;
                break;
        }
        return $array;
    }

    public static function displayTitle($format) {
        $title = "";
        switch ($format) {
            case self::FORMAT_NOLOGFILE:
                $title = "No Logfile";
                break;
            case self::FORMAT_LOGFILE:
                $title = "Basic Logfile details";
                break;
            case self::FORMAT_BASIC:
                $title = "Basic Files";
                break;
            case self::FORMAT_FOLDERS:
                $title = "Public_html folders";
                break;
            case self::FORMAT_AKEEBA:
                $title = "Joomla/Akeeba backup files on server";
                break;
            case self::FORMAT_CONFIG:
                $title = "Joomla Config settings";
                break;
            case self::FORMAT_NOJOOMLA:
                $title = "Joomla not found";
                break;
            case self::FORMAT_SPF:
                $title = "SPF/TXT record";
                break;
        }
        echo "<h3>" . $title . "</h3>";
    }

    public static function getDefaults($format) {
        $array = array();
        switch ($format) {
            case self::FORMAT_NOLOGFILE:
                return Null;
                break;
            case self::FORMAT_LOGFILE:
                return null;
                break;
            case self::FORMAT_BASIC:
                $array[] = "DEFAULT VALUES";
                $array[] = str_replace("\n", "<br/>", RAccountsLogfile::OLD_DEFAULT_HTACCESS . "<br/>or<br/>" . RAccountsLogfile::NEW_DEFAULT_HTACCESS);
                $array[] = str_replace("\n", "<br/>", self::blank(RAccountsLogfile::OLD_DEFAULT_PHPINI) . "<br/>");
                $array[] = str_replace("\n", "<br/>", RAccountsLogfile::OLD_DEFAULT_PUBLIC_HTACCESS . "<br/>or<br/>" . RAccountsLogfile::NEW_DEFAULT_PUBLIC_HTACCESS);
                $array[] = str_replace("\n", "<br/>", RAccountsLogfile::OLD_DEFAULT_PUBLIC_PHPINI . "<br/>or<br/>" . self::blank(RAccountsLogfile::NEW_DEFAULT_PUBLIC_PHPINI));
                break;
            case self::FORMAT_FOLDERS:
                return null;
                break;
            case self::FORMAT_AKEEBA:
                return null;
                break;
            case self::FORMAT_CONFIG:
                return null;
                break;
            case self::FORMAT_NOJOOMLA:
                return null;
                break;
            case self::FORMAT_SPF:
                return null;
                break;
            default:
                return Null;
                break;
        }
        return $array;
    }

    private static function blank($value) {
        if ($value == "") {
            return 'blank';
        } else {
            return $value;
        }
    }

    public static function getHeader($format) {
        $array = array();
        switch ($format) {
            case self::FORMAT_NOLOGFILE:
                return ["Domain", "Status","Whois"];
                break;
            case self::FORMAT_LOGFILE:
                return ["Domain", "Status", "HCP", "Web Monitor", "File size", "Date", "Server Time Diff", "Files scanned", "Total size scanned", "Latest File", "Domain Details<br/>Whois"];
                break;
            case self::FORMAT_BASIC:
                return ["Domain<br/>  Date", ".htaccess", "php.ini", "public_html/.htaccess", "public_html/php.ini"];
                break;
            case self::FORMAT_FOLDERS:
                return ["Domain<br/>  Date", "Public_html/Folders", "CMS Folder", "CMS Version"];
                break;
            case self::FORMAT_AKEEBA:
                return ["Domain<br/>  Date", "Status", "Folder", "No", "Size", "File"];
                break;
            case self::FORMAT_CONFIG:
                return ["Domain<br/>  Date", "Status", "Folder", "Site name", "Version", "caching", "gzip", "sef", "sef_rewrite", "sef_suffix"];
                break;
            case self::FORMAT_NOJOOMLA:
                return ["Domain<br/>  Date", "Status"];
                break;
            case self::FORMAT_SPF:
                return ["Domain", "Status", "Txt/Spf Record"];
            default:
                return Null;
                break;
        }
        return $array;
    }

    private function whoisLink() {
        if ($this->endsWith($this->domain, ".uk")) {
            return "<a target='_blank' href='https://www.nominet.uk/whois/?query=" . $this->domain . "#whois-results'>Whois</a>";
        } else {
            return " ";
        }
    }

    private function beginsWith($str, $sub) {
        return ( substr($str, 0, strlen($sub)) === $sub );
    }

    private function endsWith($str, $sub) {
        return ( substr($str, strlen($str) - strlen($sub)) === $sub );
    }

    private function domainLink() {
        return "<a target='_blank' href='http://" . $this->domain . "'>" . $this->domain . "</a>";
    }

    private function detailsLink() {
        $host = JURI::base();
        if (strpos($host, 'localhost') !== false) {
            return "<a  href='" . self::DEV_DOMAINDETAILS . "&domain=" . $this->domain . "'>Details</a>";
        }
        return "<a  href='" . self::PROD_DOMAINDETAILS . "&domain=" . $this->domain . "'>Details</a>";
    }

    private function formatFolder($folders) {
        $lines = "";
        $line = "";
        foreach ($folders as $folder) {
            $len = strlen($line);
            if ($len == 0) {
                $line = $folder;
            } else {
                if ($len < 60) {
                    $line.=", " . $folder;
                } else {
                    $lines.= $line . "<br/>";
                    $line = $folder;
                }
            }
        }
        $lines.=$line;
        return $lines;
    }

}
