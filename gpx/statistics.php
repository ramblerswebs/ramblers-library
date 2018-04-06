<?php

/**
 * Description of statistics
 *
 * @author Chris Vaughan
 */
class RGpxStatistics {

    private $folder;
    private $jsonfile;

    CONST JSONFILE = "0000gpx_statistics_file.json";

    public function __construct($folder) {
        $this->folder = $folder;
        if (!file_exists($folder)) {
            $text = "Folder does not exist: " . $folder . ". Unable to list contents";
            JFactory::getApplication()->enqueueMessage($text);
            echo "<b>Not able to list contents of folder: " . $folder . "<b>";
            return;
        }
        $lastModFile = $this->latestFile();
        if ($lastModFile !== self::JSONFILE) {
            $this->jsonfile = new RGpxJsonlog($this->folder . "/" . self::JSONFILE);
            $this->processFolder();
            $this->jsonfile->storeItems();
        }
    }

    private function latestFile() {
        $dir = $this->folder . DIRECTORY_SEPARATOR;
        $lastMod = 0;
        $lastModFile = '';
        foreach (scandir($dir) as $entry) {
            if (is_file($dir . $entry) && filectime($dir . $entry) > $lastMod) {
                $lastMod = filectime($dir . $entry);
                $lastModFile = $entry;
            }
        }
        return $lastModFile;
    }

    public function getJson() {
        $file = $this->folder . "/" . self::JSONFILE;
        if (file_exists($file)) {
            $contents = file_get_contents($file);
                        return $contents;
        }
        return null;
    }

    private function processFolder() {
        $files = scandir($this->folder, SCANDIR_SORT_ASCENDING);
        // for each GPX file
        //       get stats and create new record

        foreach ($files as $file) {
            if ($this->endsWith($file, ".gpx")) {
                $stat = $this->processGPXFile($file);
                $this->jsonfile->addItem("id".$stat->id, $stat);
            }
        }
    }

    private function processGPXFile($file) {
        $stat = new RGpxStatistic();
        $gpx = new RGpxFile($this->folder . "/" . $file);
        $stat->filename = $file;
        $stat->title = $this->getTitlefromName($file);
        $stat->description = $this->getDescription($file);
        $stat->longitude = $gpx->longitude;
        $stat->latitude = $gpx->latitude;
        $stat->distance = $gpx->distance;
        $stat->cumulativeElevationGain = $gpx->cumulativeElevationGain;
        $stat->minAltitude = $gpx->minAltitude;
        $stat->maxAltitude = $gpx->maxAltitude;
        $stat->tracks = $gpx->tracks;
        $stat->routes = $gpx->routes;
        return $stat;
    }

    private function getDescription($file) {
        $desc = "";
        $descfile = $this->folder . "/" . $file . ".txt";
        if (file_exists($descfile)) {
            $desc = file_get_contents($descfile);
            $desc = strip_tags($desc, '<br><br/>');
        }
        return $desc;
    }
    private function getTitlefromName($file){
        $title=substr($file,0,-4);
        $title=  str_replace("_"," ", $title);
        $title=  str_replace("-",", ", $title);
        return $title;
    }

    private function endsWith($haystack, $needle) {
        if (strlen($needle) > strlen($haystack)) {
            return false;
        }
        // search forward starting from end minus needle length characters
        return $needle === "" || strpos($haystack, $needle, strlen($haystack) - strlen($needle)) !== FALSE;
    }

}
