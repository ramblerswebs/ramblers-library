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
    private $feedfilename;

    function __construct($cacheLocation, $cacheTime) {
        if (isset($cacheLocation)) {
            $this->cacheTime = $cacheTime * 60;
            $this->cacheFolderPath = JPATH_SITE . DS . $cacheLocation;
        } else {
            die("Invalid call to JRamblersFeedhelper");
        }
    }

    function getFeed($feedfilename) {

        //echo '<pre>Feed  '; var_dump($feedfilename); echo '</pre>';
        // API
        $mainframe = JFactory::getApplication();
        $this->feedfilename = $feedfilename;

        // Check if the cache folder exists
        if (file_exists($this->cacheFolderPath) && is_dir($this->cacheFolderPath)) {
            // all OK
        } else {
            mkdir($this->cacheFolderPath);
        }
        $feed = self::readFile();
        return $feed;
    }

    // Get feed
    function readFile() {
        // Set max_execution_time to 120
        ini_set('max_execution_time', 120);

        //echo '<pre>open '; var_dump($feedfilename); echo '</pre>';
        $feed = self::getFile();
        //echo '<pre>feed'; var_dump($feed); echo '</pre>';
        $result = JFile::read($feed);

        return $result;
    }

    // Get remote file
    function getFile() {

        jimport('joomla.filesystem.file');



        if (file_exists($this->cacheFolderPath) && is_dir($this->cacheFolderPath)) {
            // all OK
        } else {
            mkdir($this->cacheFolderPath);
        }

        $url = trim($this->feedfilename);
        //echo '<pre>url  '; var_dump($url); echo '</pre>';
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

        // Check if a cached copy exists otherwise create it
        if (file_exists($tmpFile) && is_readable($tmpFile) && (filemtime($tmpFile) + $this->cacheTime) > time()) {

            $result = $tmpFile;
        } else {
            // Get file
            if (substr($url, 0, 4) == "http") {
                // remote file
                if (ini_get('allow_url_fopen')) {
                    // file_get_contents
                    $fgcOutput = file_get_contents($url);
                    //echo '<pre>fgcOutput '; var_dump($fgcOutput ); echo '</pre>';

                    JFile::write($tmpFile, $fgcOutput);
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
                        JFile::write($tmpFile, '');
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

    function clearCache() {

        // Check if the cache folder exists
        if (file_exists($this->cacheFolderPath) && is_dir($this->cacheFolderPath)) {
            // clear files from folder
            $files = glob($this->cacheFolderPath . '/*'); // get all file names
            echo "<h2>Feed cache has been cleared</h2>";
            foreach ($files as $file) { // iterate files
                if (is_file($file)) {
                    unlink($file); // delete file}
                }
            }
        }
    }

// END CLASS
}
