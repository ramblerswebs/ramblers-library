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

    const FORMAT_NOLOGFILE = 1;
    const FORMAT_LOGFILE = 2;
    const FORMAT_BASIC = 3;
    const FORMAT_FOLDERS = 4;
    const FORMAT_AKEEBA = 5;
    const FORMAT_CONFIG = 6;
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

    public function getColumns($format) {
        $array = array();
        switch ($format) {
            case self::FORMAT_NOLOGFILE:
                if ($this->log->Exists()) {
                    return Null;
                }
                $array[] = $this->domainLink();
                $array[] = $this->status;
                $array[] = gethostbyname($this->domain);
                break;
            case self::FORMAT_LOGFILE:
                if (!$this->log->Exists()) {
                    return null;
                }
                $array[] = $this->domainLink();
                $array[] = $this->status;
                $array[] = $this->log->getWebMonitorVersion();
                $array[] = $this->log->getReportFormat();
                $array[] = $this->log->getIP();
                $array[] = $this->log->getFileSize();
                $array[] = $this->log->getFileDate();
                $array[] = $this->log->getNoFilesScanned();
                $array[] = $this->log->getTotalSizeScanned();
                $array[] = $this->log->getLatestFile();
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
                $array[] = implode(", ", $folders);
                break;
            case self::FORMAT_AKEEBA:
                if (!$this->log->Exists()) {
                    return null;
                }
                if ($this->log->hasJoomla()) {
                    $report = $this->log->getReportFormat();
                    if ($report = 1.02) {
                        $array[] = $this->domainLink() . "<br/>  " . $this->log->getFileDate();
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
                $result = dns_get_record($this->domain,DNS_TXT);
                $spf = "Not found";
                if (isset($result[0])) {
                    $col0 = $result[0];
                    if (isset($col0['txt'])) {
                        $spf = $col0['txt'];
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

    public static function getHeader($format) {
        $array = array();
        switch ($format) {
            case self::FORMAT_NOLOGFILE:
                return ["Domain", "Status", "IP"];
                break;
            case self::FORMAT_LOGFILE:
                return ["Domain", "Status", "Web Monitor", "Report Format", "IP", "File size", "Date", "Files scanned", "Total size scanned", "Latest File"];
                break;
            case self::FORMAT_BASIC:
                return ["Domain<br/>  Date", ".htaccess", "php.ini", "public_html/.htaccess", "public_html/php.ini"];
                break;
            case self::FORMAT_FOLDERS:
                return ["Domain<br/>  Date", "Public_html/Folders"];
                break;
            case self::FORMAT_AKEEBA:
                return ["Domain<br/>  Date", "Folder", "No", "Size", "File"];
                break;
            case self::FORMAT_CONFIG:
                return ["Domain<br/>  Date", "Status", "Folder", "Site name", "caching", "gzip", "sef", "sef_rewrite", "sef_suffix"];
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

    private function domainLink() {
        return "<a target='_blank' href='http://" . $this->domain . "'>" . $this->domain . "</a>";
    }

}
