<?php

/**
 * Description of mapmarker
 *
 * @author Chris Vaughan
 */
class RLeafletGpxMap extends RLeafletMap {

    public $linecolour = "#782327";
    public $imperial = false;
    public $addDownloadLink = "Users"; // "None" - no link, "Users" - users link, "Public" - guest link

    public function __construct() {
        parent::__construct();
    }

    public function displayPath($gpx) {
        $document = JFactory::getDocument();
        $document->addScript("ramblers/leaflet/gpx/maplist.js", "text/javascript");
        $opts = new RLeafletMapoptions();
        $opts->cluster = false;
        $this->options->cluster = false;
        $this->addElevation = true;
        if ($this->imperial) {
            $imperial = "true";
        } else {
            $imperial = "false";
        }
        $file = JURI::root() . $gpx;
//   echo $file;

        if (file_exists($gpx)) {
            $path_parts = pathinfo($gpx);
            if (strtolower($path_parts['extension']) != "gpx") {
                $application = JFactory::getApplication();
                $application->enqueueMessage(JText::_('GPX: Route file is not a gpx file: ' . $file), 'error');
                echo "<p><b>Unable to display gpx file</b></p>";
            }
        } else {
            $application = JFactory::getApplication();
            $application->enqueueMessage(JText::_('GPX: Route file not found: ' . $file), 'error');
            echo "<p><b>Unable to display gpx file</b></p>";
        }

        if (file_exists($gpx)) {
            $text = "  ramblersGpx=new RamblersLeafletGpx();"
                    . "displayGPX( '$gpx', '$this->linecolour', $imperial)";
            parent::addContent($text);
        } else {
            parent::addContent("");
        }
        parent::display();
        if (file_exists($gpx)) {
            $link = false;
            switch ($this->addDownloadLink) {
                case "Users":
                case 1:
                    If ($this->loggedon()) {
                        $link = true;
                    } else {
                        echo "<br/><p>Please log on to our site to be able to download GPX file or this walk</p>";
                    }
                    break;
                case "Public" :
                case 2:
                    $link = true;
                default:
                    break;
            }
            if ($link) {
                echo "<br/><p><a id='gpxdownload' href='$gpx'><b>Download</b> the gpx file for this walk</a></p>";
            }
        }
    }

    private function loggedon() {
        $user = JFactory::getUser(); //gets user object
        If ($user != null) {
            return $user->id != 0;
        }
        return false;
    }

}
