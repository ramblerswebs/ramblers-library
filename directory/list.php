<?php

class RDirectoryList {

    protected $handle;
    private $names;
    private $fileTypes;

    public function __construct($fileTypes) {
        $this->fileTypes = $fileTypes;
        $this->names = array();
    }

    public function listItems($folder) {
        if ($handle = opendir($folder)) {
            while (false !== ($entry = readdir($handle))) {
                if ($entry != "." && $entry != "..") {
                    if (is_dir($entry)) {
                        
                    } else {
                        $this->names[] = $entry;
                    }
                }
            }
            closedir($handle);
        }
        asort($this->names);
        echo "<ul>";
        foreach ($this->names as $value) {
            foreach ($this->fileTypes as $type) {
                if ($this->endsWith($value, $type)) {
                    echo "<li><a href='" . JURI::base() . $folder . "/" . $value . "' target='_blank'>" . $value . "</a></li>\n";
                }
            }
        }
        echo "</ul>";
    }

    function endsWith($haystack, $needle) {
        // search forward starting from end minus needle length characters
        return $needle === "" || strpos($haystack, $needle, strlen($haystack) - strlen($needle)) !== FALSE;
    }

}
