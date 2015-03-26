<?php

class RDirectoryList {

    protected $handle;
    private $names;
    private $fileTypes;

    const ASC = 1;
    const DESC = 2;

    public function __construct($fileTypes) {
        $this->fileTypes = $fileTypes;
    }

    public function listItems($folder, $sort=self::ASC) {
        $this->names = array();
        if (!file_exists($folder)){
            $text= "Folder does not exist: ".$folder.". Unable to list contents";
            JFactory::getApplication()->enqueueMessage($text);
            echo "<b>Not able to list contents of folder<b>";
            return;
        }
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
    if ($sort==self::ASC){
        asort($this->names);
    }
    if ($sort==self::DESC){
        arsort($this->names);
    }
        echo "<ul>";
        foreach ($this->names as $value) {
            foreach ($this->fileTypes as $type) {
                if ($this->endsWith($value, $type)) {
                    $text=$value;
                    $text=str_replace("-"," ",$text);
                    $text=str_replace("_"," ",$text);
                    echo "<li><a href='" . JURI::base() . $folder . "/" . $value . "' target='_blank'>" . $text . "</a></li>\n";
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
