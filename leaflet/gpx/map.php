<?php

/**
 * Description of RLeafletGpxMap
 *
 * @author Chris Vaughan
 */
class RLeafletGpxMap extends RLeafletMap {

    public $linecolour = "#782327";
    public $imperial = false;
    public $addDownloadLink = "Users"; // "None" - no link, "Users" - users link, "Public" - guest link
    private $data = null;

    public function displayPath($gpx) {
        RLoad::addScript("media/lib_ramblers/leaflet/gpx/maplist.js", "text/javascript");
        RLoad::addStyleSheet('media/lib_ramblers/css/ramblerslibrary.css');
        $this->help_page = "singleroute.html";
        $this->options->fullscreen = true;
        $this->options->cluster = false;
        $this->options->mouseposition = true;
        $this->options->settings = true;
        $this->options->mylocation = true;
        $this->options->rightclick = true;
        $this->options->fitbounds = true;
        $this->options->displayElevation = true;
        $this->options->print = true;

        $this->data = new class {
            
        };
        if ($this->imperial) {
            $this->data->imperial = "true";
        } else {
            $this->data->imperial = "false";
        }
        $this->data->linecolour = $this->linecolour;
        $file = JURI::root() . $gpx;
//   echo $file;
        $this->data->gpxfile = null;
        if (file_exists($gpx)) {
            $path_parts = pathinfo($gpx);
            if (strtolower($path_parts['extension']) != "gpx") {
                $app = JApplicationCms::getInstance('site');
                $app->enqueueMessage(JText::_('GPX: Route file is not a gpx file: ' . $file), 'error');
                echo "<p><b>Unable to display gpx file</b></p>";
            } else {
                $this->data->gpxfile = $gpx;
            }
        } else {
            $app = JApplicationCms::getInstance('site');
            $app->enqueueMessage(JText::_('GPX: Route file not found: ' . $file), 'error');
            echo "<p><b>Unable to display gpx file</b></p>";
        }
        $detailsDivId = "details-" . $this->options->divId;
        $this->data->detailsDivId = $detailsDivId;
        if (file_exists($gpx)) {
            echo "<div id='" . $detailsDivId . "'></div>";
            $link = false;
            switch ($this->addDownloadLink) {
                case "Users":
                case 1:
                    If ($this->loggedon()) {
                        $link = true;
                    } else {
                        echo "Please log on to this site to be able to download GPX file of this walk<p></p>";
                    }
                    break;
                case "Public" :
                case 2:
                    $link = true;
                default:
                    break;
            }
            if ($link) {
                echo '<b>Download route:</b> <a href="' . $gpx . '"><img alt="gpx" src="media/lib_ramblers/images/orange-gpx-32.png" width="20" height="20"></a><br/><br/>';
            }
        }

        parent::setCommand('ra.display.gpxSingle');
        parent::setDataObject($this->data);
        parent::display();
    }

    private function loggedon() {
        $user = JFactory::getUser(); //gets user object
        If ($user != null) {
            return $user->id != 0;
        }
        return false;
    }

}
