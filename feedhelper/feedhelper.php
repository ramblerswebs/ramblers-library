<?php

//
//     @version		1.0
//     @package		Simple Feed Reader - runs under Jumi
//     @author                 Chris Vaughan
//     @copyright              Copyright (c) 2014 Chris Vaughan Derby & South Derbyshire Ramblers
//     @license		GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
//
//
// no direct access
defined('_JEXEC') or die('Restricted access');

class RFeedhelper {

    private $cacheFolderPath;
    private $cacheTime;
    private $status = self::OK;

    const OK = 0;
    const READFAILED = 1;
    const READEMPTY = 2;

    function __construct($cacheLocation, $cacheTime) {
        if (isset($cacheLocation)) {
            $this->cacheTime = $cacheTime * 60; // convert to seconds
            $this->cacheFolderPath = JPATH_SITE . DS . $cacheLocation;
        } else {
            die("Invalid call to RJsonwalksFeedhelper");
        }
    }

    function getFeed($feedfilename) {
        // Returns
        //   NULL is cannot read feed
        //   blank if feed empty
        //   contents if all ok
        $this->status = self::OK;
        $url = trim($feedfilename);
        $content = '';
        ini_set('max_execution_time', 120);
        $cachedFile = $this->createCachedFileFromUrl($feedfilename);
        if ($cachedFile <> '') {
            $content = file_get_contents($cachedFile);
            if ($content === false) {
                $content = '';
            }
        }
        switch ($this->status) {
            case self::OK:
                return $content;
                break;
            case self::READEMPTY:
                return '';
                break;
            case self::READFAILED:
                return NULL;
                break;
            default:
                return NULL;
                break;
        }
        return NULL;
    }


    // Get remote file
    private function createCachedFileFromUrl($feedfilename) {
        // Check if the cache folder exists
        if (file_exists($this->cacheFolderPath) && is_dir($this->cacheFolderPath)) {
            // all OK
        } else {
            mkdir($this->cacheFolderPath);
        }

        jimport('joomla.filesystem.file');

        $url = trim($feedfilename);
        $tmpFile = $this->getCacheName($url);

        // Check if a cached copy exists otherwise create it
        if (file_exists($tmpFile) && is_readable($tmpFile) && (filemtime($tmpFile) + $this->cacheTime) > time()) {
            $result = $tmpFile;
        } else {
            // Get file
            if (substr($url, 0, 4) == "http") {
                // remote file
                if (ini_get('allow_url_fopen')) {
                    // file_get_contents
                    if ($this->urlExists($url)) {
                        $fgcOutput = file_get_contents($url);
                        if ($fgcOutput === false) {
                            $status = self::READFAILED;
                            return '';
                        } else {
                            JFile::write($tmpFile, $fgcOutput);
                        }
                    } else {
                        $status = self::READFAILED;
                        return '';
                    }
                } elseif (in_array('curl', get_loaded_extensions())) {
                    // cURL
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $url);
                    curl_setopt($ch, CURLOPT_HEADER, false);
                    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                    $chOutput = curl_exec($ch);
                    curl_close($ch);
                    JFile::write($tmpFile, $chOutput);
                } else {
                    // fsockopen
                    $readURL = parse_url($url);
                    $relativePath = (isset($readURL['query'])) ? $readURL['path'] . "?" . $readURL['query'] : $readURL['path'];
                    $fp = fsockopen($readURL['host'], 80, $errno, $errstr, 5);
                    if (!$fp) {
                        $status = self::READFAILED;
                    } else {
                        $out = "GET " . $relativePath . " HTTP/1.1\r\n";
                        $out .= "Host: " . $readURL['host'] . "\r\n";
                        $out .= "Connection: Close\r\n\r\n";
                        fwrite($fp, $out);
                        $header = '';
                        $body = '';
                        do {
                            $header .= fgets($fp, 128);
                        } while (strpos($header, "\r\n\r\n") === false); // get the header data
                        while (!feof($fp))
                            $body .= fgets($fp, 128); // get the actual content
                        fclose($fp);
                        JFile::write($tmpFile, $body);
                    }
                }

                $result = $tmpFile;
            } else {

                // local file
                $result = $url;
            }
        }

        return $result;
    }

    private function urlExists($url) {
        $exists = true;
        $file_headers = @get_headers($url);
        if ($file_headers == false) {
            return false;
        }
        $InvalidHeaders = array('404', '403', '500');
        foreach ($InvalidHeaders as $HeaderVal) {
            if (strstr($file_headers[0], $HeaderVal)) {
                $exists = false;
                break;
            }
        }
        return $exists;
    }

    public function clearCache() {

        // Check if the cache folder exists
        if (file_exists($this->cacheFolderPath) && is_dir($this->cacheFolderPath)) {
            // clear files from folder
            $files = glob($this->cacheFolderPath . '/*'); // get all file names
            echo "<h2 class='feedrefresh'>Feed cache will be refreshed</h2>";
            foreach ($files as $file) { // iterate files
                if (is_file($file)) {
                    unlink($file); // delete file}
                }
            }
        }
    }

    private function getCacheName($feedfilename) {
        $url = trim($feedfilename);
        if (substr($url, 0, 4) == "http") {
            $turl = explode("?", $url);
            $matchComponents = array("#(http|https)\:\/\/#s", "#www\.#s");
            $replaceComponents = array("", "");
            $turl = preg_replace($matchComponents, $replaceComponents, $turl[0]);
            $turl = str_replace(array("/", "-", "."), array("_", "_", "_"), $turl);
            $tmpFile = $this->cacheFolderPath . DS . urlencode($turl) . '.cache';
            /* $turl = explode("?", $url); CEV replacement code to handle walksfeed options */
            $turl = $url;
            $matchComponents = array("#(http|https)\:\/\/#s", "#www\.#s");
            $replaceComponents = array("", "");
            $turl = preg_replace($matchComponents, $replaceComponents, $turl);
            $turl = str_replace(array("/", "-", "."), array("_", "_", "_"), $turl);
            $turl = str_replace(array("?", "&", ",", "="), array("_", "", "", ""), $turl);
            $tmpFile = $this->cacheFolderPath . DS . urlencode($turl) . '.cache';
            /* end of change */
        } else {
            $tmpFile = $this->cacheFolderPath . DS . 'cached_' . md5($url);
        }
        return $tmpFile;
    }

}
