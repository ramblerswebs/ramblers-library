<?php

/**
 * Description of RLeafletGpxMapget
 *    Display Gpx file on map but use file name from GET
 *
 * @author Chris Vaughan
 */
class RLeafletGpxMaplist extends RLeafletMap {

    public $linecolour = "#782327";
    public $imperial = false;
    Public $folder = "images";
    public $addDownloadLink = "Users"; // "None" - no link, "Users" - users link, "Public" - guest link
    public $descriptions = true; // set false if NO description files are to be supplied
    public $getMetaFromGPX = true;
    public $displayAsPreviousWalks = false;
    public $displayTitle = true;

    public function __construct() {
        parent::__construct();
    }

    public function display() {
        // get all names from folder
        $stats = new RGpxStatistics($this->folder, $this->getMetaFromGPX);
        $items = $stats->getJson();
        $this->data = new class {
            
        };
        $this->data->items = json_decode($items);
        $this->help_page = "listofroutes.html";

        $this->options->cluster = true;
        $this->options->displayElevation = true;
        $this->options->fullscreen = true;
        $this->options->search = true;
        $this->options->locationsearch = true;
        $this->options->osgrid = true;
        $this->options->mouseposition = true;
        $this->options->maptools = true;
        $this->options->mylocation = true;
        $this->options->rightclick = true;
        $this->options->fitbounds = true;
        $this->options->print = true;

        if ($this->imperial) {
            $imperial = "true";
        } else {
            $imperial = "false";
        }
        if ($this->displayTitle) {
            if ($this->displayAsPreviousWalks) {
                echo "<h2>Previous Walks</h2>";
            } else {
                echo "<h2>Walking Routes</h2>";
            }
        }

        $this->data->download = $this->downloadState();
        $this->data->folder = $this->folder;
        $this->data->linecolour = $this->linecolour;
        $this->data->displayAsPreviousWalks = $this->displayAsPreviousWalks;
        parent::setCommand('folderGpxRoutes');
        parent::setDataObject($this->data);
        parent::display();

        RLoad::addScript("libraries/ramblers/leaflet/gpx/maplist.js", "text/javascript");
        RLoad::addStyleSheet('libraries/ramblers/jsonwalks/css/ramblerslibrary.css');

        $document = JFactory::getDocument();
        $document->addScript("libraries/ramblers/vendors/jplist-es6-master/dist/1.2.0/jplist.min.js", "text/javascript");
        //   <!-- IE 10+ / Edge support via babel-polyfill: https://babeljs.io/docs/en/babel-polyfill/ --> 
        $document->addScript("https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.26.0/polyfill.min.js", "text/javascript");
    }

    private function loggedon() {
        $user = JFactory::getUser(); //gets user object
        If ($user != null) {
            return $user->id != 0;
        }
        return false;
    }

//    private function hasDescriptions($items) {
//        return true;
//        foreach ($items as $item) {
//            if ($item->description !== '') {
//                return true;
//            }
//        }
//        return false;
//    }

    private function downloadState() {
        $state = 0; // no download link
        switch ($this->addDownloadLink) {
            case "Users":
            case 1:
                If ($this->loggedon()) {
                    $state = 2; // display link
                } else {
                    $state = 1; // need to be logged on
                }
                break;
            case "Public" :
            case 2:
                $state = 2;  // display link
            default:
                break;
        }
        return $state;
    }

}
