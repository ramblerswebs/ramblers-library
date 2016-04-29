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
    const FORMAT_OLDLOGFILE = 2;
    const FORMAT_EXISTS = 3;

    private $status;
    private $domain;
    private $log;
    private $timeperiod;

    public function __construct($domain, $status) {
        $this->domain = $domain;
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
                $array[] = $this->domain;
                $array[] = $this->status;
                break;
            case self::FORMAT_OLDLOGFILE:
                if (!$this->log->Exists()) {
                    return null;
                }
                if (!$this->log->isOlder($this->timeperiod)) {
                    return null;
                }
                $array[] = $this->domain;
                $array[] = $this->status;
                $array[] = $this->log->getFileDate();
                break;
            case self::FORMAT_EXISTS:
                if (!$this->log->Exists()) {
                    return null;
                }
                $array[] = $this->domain . "<br/>  " . $this->status . "<br/>  " . $this->log->getFileDate();
                $array[] = $this->log->getFile(".htaccess");
                $array[] = $this->log->getFile("php.ini");
                $array[] = $this->log->getFile("public_html/.htaccess");
                $array[] = $this->log->getFile("public_html/php.ini");
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
                return ["Domain", "Status"];
                break;
            case self::FORMAT_OLDLOGFILE:
                return ["Domain", "Status", "Date"];
                break;
            case self::FORMAT_EXISTS:
                return ["Domain<br/>  Status<br/>  Date", ".htaccess", "php.ini", "public_html/.htaccess", "public_html/php.ini"];
                break;

            default:
                return Null;
                break;
        }
        return $array;
    }

}
