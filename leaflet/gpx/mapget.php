<?php

/**
 * Description of RLeafletGpxMapget
 *    Display Gpx file on map but use file name from GET
 *
 * @author Chris Vaughan
 */
class RLeafletGpxMapget extends RLeafletGpxMap {

    Public $folder = "images";

    public function __construct() {
        parent::__construct();
    }

    public function displayPath($name = "") {
        $opts = new RLeafletGpxMap();
        $gpxname = $_GET['filter'];
        if ($this->folder != "") {
            $gpx = $this->folder . "/" . $gpxname . ".gpx";
        } else {
            $gpx = $gpxname . ".gpx";
        }
        if ($this->checkFilename($gpx)) {
            parent::displayPath($gpx);
        }
    }

    private function checkFilename($name) {
        if (!strpos($name, "://") === false) {
            $application = JFactory::getApplication();
            $application->enqueueMessage(JText::_('GPX: Route file name is invalid: ' . $name), 'error');
            echo "<p><b>Unable to display gpx file</b></p>";
            return false;
        }
        return true;
    }

}
