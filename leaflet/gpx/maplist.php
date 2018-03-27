<?php

/**
 * Description of RLeafletGpxMapget
 *    Display Gpx file on map but use file name from GET
 *
 * @author Chris Vaughan
 */
class RLeafletGpxMaplist extends RLeafletGpxMap {

    Public $folder = "images";

    public function __construct() {
        parent::__construct();
    }

    public function displayPath($name = "") {
        $opts = new RLeafletGpxMap();
        $list = new dirList([".gpx"]);
        $list->listItems($this->folder);
        $gpx = $list->first;
        $this->addScripts();
        if ($list->first == null) {
            $text = "No GPX file found in folder: " . $folder;
            JFactory::getApplication()->enqueueMessage($text);
            echo "<b>No GPX file found in folder: " . $folder . " <b>";
        } else {
            echo "<h2 id=\"gpxtitle\" >$list->firsttitle</h2>";
            parent::displayPath($gpx);
            echo "</div>";
        }
    }

    private function addScripts() {

        $document = JFactory::getDocument();
        $out = "function updateGPX(ramblersMap,path,title) { document.getElementById('gpxtitle').innerText = title; displayGPX(ramblersMap, path, \"$this->linecolour\",$this->imperial); }";
        $document->addScriptDeclaration($out, "text/javascript");
    }

}

class dirList {

    protected $handle;
    private $names;
    private $fileTypes;
    public $first = null;
    public $firsttitle;
    public $columns = 3;

    const ASC = 1;
    const DESC = 2;

    public function __construct($fileTypes) {
        $this->fileTypes = $fileTypes;
    }

    public function listItems($folder, $sort = self::ASC) {
        echo "<div class='gpxlist'>";
        $this->names = array();
        if (!file_exists($folder)) {
            $text = "Folder does not exist: " . $folder . ". Unable to list contents";
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
        if ($sort == self::ASC) {
            asort($this->names);
        }
        if ($sort == self::DESC) {
            arsort($this->names);
        }
        $no = 0;
        foreach ($this->names as $value) {
            foreach ($this->fileTypes as $type) {
                if ($this->endsWith($value, $type)) {
                    $no+=1;
                }
            }
        }
        $no = $no / $this->columns;
        echo "<ul>";
        $i = 0;
        foreach ($this->names as $value) {
            foreach ($this->fileTypes as $type) {
                if ($this->endsWith($value, $type)) {
                    $i+=1;
                    $desc = "";
                    $descfile = $folder . "/" . $value . ".text";
                    if (file_exists($descfile)) {
                        $desc = " - " . file_get_contents($descfile);
                        $desc = strip_tags($desc, '<b><i><br><br/>');
                    }
                    $text = $value;
                    $text = str_replace("-", " ", $text);
                    $text = str_replace("_", " ", $text);
                    $text = substr($text, 0, -4);
                    $path = $folder . "/" . $value;
                    if ($this->first == null) {
                        $this->first = $path;
                        $this->firsttitle = $text;
                    }
                    //  echo "<a href='" . JURI::base() . $path . "' target='_blank'>" . $text . "</a>" . $desc . "";
                    echo "<li><a href=\"javascript:updateGPX(ramblersMap, '$path','$text');\">$text</a>$desc</li>\n";
                    if ($i > $no) {
                        $i = 0;
                     //   echo "</ul></div><div class='gpxlist'><ul>";
                    }
                }
            }
        }
        echo "</ul></div>";
    }

    private function endsWith($haystack, $needle) {
        // search forward starting from end minus needle length characters
        return $needle === "" || strpos($haystack, $needle, strlen($haystack) - strlen($needle)) !== FALSE;
    }

}
