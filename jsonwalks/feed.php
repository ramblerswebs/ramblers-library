<?php

/**
 * @version		0.0
 * @package		Simple JSON Feed reader
 * @author              Chris Vaughan Ramblers-webs.org.uk
 * @copyright           Copyright (c) 2014 Chris Vaughan. All rights reserved.
 * @license		GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */
// no direct access
defined('_JEXEC') or die('Restricted access');

class RJsonwalksFeed {

    private $walks;

    function __construct($rafeedurl) {
        $this->readFeed($rafeedurl);
    }

    private function readFeed($rafeedurl) {
        // $feedTimeout = 5;
        $CacheTime = 60; // minutes
        $cacheLocation = $this->CacheLocation();

// Fetch content
        $srfr = new RFeedhelper($cacheLocation, $CacheTime);

        $contents = $srfr->getFeed($rafeedurl);

        if ($contents != "") {
            $json = json_decode($contents);
            unset($contents);
            $this->walks = new JRamblersWalksfeedWalks($json);
            unset($json);
        } else {
            echo '<pre>RA Feed (' . $rafeedurl . ') not found , read error or is empty</pre>';
        }
    }

    function display($displayclass) {
        if ($this->walks == null) {
            echo "Walks array is empty";
        } else {
            $displayclass->DisplayWalks($this->walks);
        }
    }

    function clearCache() {
        $cacheFolderPath = $this->CacheLocation();
        // Check if the cache folder exists
        if (file_exists($cacheFolderPath) && is_dir($cacheFolderPath)) {
            // clear files from folder
            $files = glob($cacheFolderPath . '/*'); // get all file names
            echo "<h2>Feed cache has been cleared</h2>";
            foreach ($files as $file) { // iterate files
                if (is_file($file)) {
                    unlink($file); // delete file}
                }
            }
        }
    }

    private function CacheLocation() {
        if (!defined('DS')) {
            define('DS', DIRECTORY_SEPARATOR);
        }
        return 'cache' . DS . 'ra_feed';
    }

}
