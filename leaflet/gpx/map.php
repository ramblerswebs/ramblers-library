<?php

/**
 * Description of mapmarker
 *
 * @author Chris Vaughan
 */
class RLeafletGpxMap extends RLeafletMap {

    public $linecolour = "#782327";
    public $imperial = false;
    public $addDownloadLink = 1; // 0 - no link, 1 - users link, 2 - guest link

    public function __construct() {
        parent::__construct();
    }

    public function displayPath($gpx) {
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
            $text = "displayGPX(ramblersMap, '$gpx', '$this->linecolour', $imperial)";
            parent::addContent($text);
        } else {
            parent::addContent("");
        }
        parent::display();
        if (file_exists($gpx)) {
            $link = false;
            switch ($this->addDownloadLink) {
                case 1:
                    If ($this->loggedon()) {
                        $link = true;
                    } else{
                        echo "<br/><p>Please log on to our site to be able to download GPX file or this walk</p>";
                    }
                    break;
                case 2:
                    $link = true;
                default:
                    break;
            }
            if ($link) {
                echo "<br/><p><a href=$gpx><b>Download</b> the gpx file for this walk</a></p>";
            }
        }
    }

    function loggedon() {
        $user = JFactory::getUser(); //gets user object
        If ($user != null) {
            return $user->id != 0;
        }
        return false;
    }

}
