<?php

/**
 * Description of RLeafletWalkseditor
 *
 * @author Chris Vaughan
 */
class RLeafletWalkseditor extends RLeafletMap {

    //   public $submit = "";
    //   public $content = "";
    //   public $date = "";
    public $fields = [];

    public function __construct() {
        parent::__construct();
    }

    public function editWalk() {
        //  $this->help_page = "https://maphelp.ramblers-webs.org.uk/draw-walking-route.html";
        $this->options->fullscreen = true;
        $this->options->search = true;
        $this->options->locationsearch = true;
        $this->options->osgrid = true;
        $this->options->mouseposition = true;
        $this->options->postcodes = true;
        $this->options->fitbounds = false;
        $this->options->displayElevation = false;
        $this->options->cluster = false;
        $this->options->draw = false;
        $this->options->print = true;
        $this->options->ramblersPlaces = true;
        $this->options->controlcontainer = true;
        $document = JFactory::getDocument();
        $document->addScript("libraries/ramblers/js/ramblerswalks.js", "text/javascript");
        $path = "libraries/ramblers/leaflet/walkseditor/";
        $document->addScript($path . "loader.js", "text/javascript");
        $document->addScript($path . "clocklet.min.js", "text/javascript");
        $document->addStyleSheet($path . "clocklet.min.css", "text/css");
        $document->addScript($path . "tabs.js", "text/javascript");
        $document->addScript($path . "walkcontroller.js", "text/javascript");
        $document->addScript($path . "mapdisplay.js", "text/javascript");
        $document->addScript($path . "inputfields.js", "text/javascript");
        $document->addScript($path . "raGeneral.js", "text/javascript");
        $document->addScript($path . "walkeditor.js", "text/javascript");
        $document->addScript($path . "maplocation.js", "text/javascript");
        $document->addScript($path . "feedhandler.js", "text/javascript");
        $document->addScript($path . "walkpreview.js", "text/javascript");
        $document->addStyleSheet($path . "style.css", "text/css");
        parent::addScriptsandStyles($this->options);
        $optionstext = $this->options->text();
        if ($this->help_page != "") {
            $optionstext .= "ramblersMap.maphelppage='" . $this->help_page . "';";
        }
        $optionstext = " ramblersMap = new RamblersLeafletMap('');" . $optionstext;
        $fields = json_encode($this->fields);
        $base = "ramblersBase.base='" . JURI::base(false) . "';";

        $args = "'" . $fields . "'";
        $script = $optionstext . "window.onload = function () {ramblersBase = new RamblersBase();"
                . $base . "loadEditWalk(" . $args . ");};";
        $document->addScriptDeclaration($script, "text/javascript");

        echo '<div id="js-outer-content"></div>';
        echo "<br/>";
    }

    public function viewWalk() {
        //  $this->help_page = "https://maphelp.ramblers-webs.org.uk/draw-walking-route.html";
        $this->options->fullscreen = true;
        $this->options->search = true;
        $this->options->locationsearch = true;
        $this->options->osgrid = true;
        $this->options->mouseposition = true;
        $this->options->postcodes = true;
        $this->options->fitbounds = false;
        $this->options->displayElevation = false;
        $this->options->cluster = false;
        $this->options->draw = false;
        $this->options->print = true;
        $this->options->ramblersPlaces = true;
        $this->options->controlcontainer = true;
        $document = JFactory::getDocument();
        $document->addScript("libraries/ramblers/js/ramblerswalks.js", "text/javascript");
        $path = "libraries/ramblers/leaflet/walkseditor/";
        $document->addScript($path . "loader.js", "text/javascript");
        $document->addScript($path . "tabs.js", "text/javascript");
        $document->addScript($path . "walkcontroller.js", "text/javascript");
        $document->addScript($path . "mapdisplay.js", "text/javascript");
        $document->addScript($path . "inputfields.js", "text/javascript");
        $document->addScript($path . "raGeneral.js", "text/javascript");
        $document->addScript($path . "walkpreview.js", "text/javascript");
        $document->addStyleSheet($path . "style.css", "text/css");
        parent::addScriptsandStyles($this->options);
        $optionstext = $this->options->text();
        if ($this->help_page != "") {
            $optionstext .= "ramblersMap.maphelppage='" . $this->help_page . "';";
        }
     $optionstext = " ramblersMap = new RamblersLeafletMap('');" . $optionstext;
        $fields = json_encode($this->fields);
        $base = "ramblersBase.base='" . JURI::base(false) . "';";

        $args = "'" . $fields . "'";
        $script = $optionstext . "window.onload = function () {ramblersBase = new RamblersBase();"
                . $base . "loadViewWalk(" . $args . ");};";
        $document->addScriptDeclaration($script, "text/javascript");

        echo '<div id="js-outer-content"></div>';
        echo "<br/>";
    }

    public function editPlace() {
        //  $this->help_page = "https://maphelp.ramblers-webs.org.uk/draw-walking-route.html";
        $this->options->fullscreen = true;
        $this->options->search = true;
        $this->options->locationsearch = true;
        $this->options->osgrid = true;
        $this->options->mouseposition = true;
        $this->options->postcodes = true;
        $this->options->fitbounds = false;
        $this->options->displayElevation = false;
        $this->options->cluster = false;
        $this->options->draw = false;
        $this->options->print = true;
        $this->options->ramblersPlaces = true;
        $this->options->controlcontainer = true;
        $document = JFactory::getDocument();
        $document->addScript("libraries/ramblers/js/ramblerswalks.js", "text/javascript");
        $path = "libraries/ramblers/leaflet/walkseditor/";
        $document->addScript($path . "loader.js", "text/javascript");
        $document->addScript($path . "placeEditor.js", "text/javascript");
         $document->addScript($path . "feedhandler.js", "text/javascript");
        $document->addScript($path . "mapdisplay.js", "text/javascript");
        $document->addScript($path . "inputfields.js", "text/javascript");
        $document->addScript($path . "raGeneral.js", "text/javascript");
        $document->addScript($path . "maplocation.js", "text/javascript");
       
        $document->addStyleSheet($path . "style.css", "text/css");
        parent::addScriptsandStyles($this->options);
        $optionstext = $this->options->text();
        if ($this->help_page != "") {
            $optionstext .= "ramblersMap.maphelppage='" . $this->help_page . "';";
        }
        $optionstext = " ramblersMap = new RamblersLeafletMap('');" . $optionstext;
        $fields = json_encode($this->fields);
        $base = "ramblersBase.base='" . JURI::base(false) . "';";

        $args = "'" . $fields . "'";
        $script = $optionstext . "window.onload = function () {ramblersBase = new RamblersBase();"
                . $base . "loadEditPlace(" . $args . ");};";
        $document->addScriptDeclaration($script, "text/javascript");

        echo '<div id="js-outer-content"></div>';
        echo "<br/>";
    }

}
