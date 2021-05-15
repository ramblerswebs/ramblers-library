<?php

/**
 * Description of RLeafletMap
 *   Not called by users
 *
 * @author Chris Vaughan
 */
class RLeafletMap {

    private $script = null;
    public $debugoptions = false;
    public $defaultMap = "";
    //  public $mapStyle = " #leafletmap { height: 500px; width:100%;}";
    public $mapHeight = "100%";
    public $mapWidth = "500px";
    public $options;
    public $help_page = "https://maphelp.ramblers-webs.org.uk/";
    private $helpBase = "https://maphelp.ramblers-webs.org.uk/";
    public $leafletLoad = true;

    function __construct() {
        $this->options = new RLeafletMapoptions();
        $this->script = new RJsScript($this->options);
    }

    public function setCommand($command) {
        $this->script->setCommand($command);
    }

    public function setDataObject($value) {
        $this->script->setDataObject($value);
    }

    public function display() {
        $this->options->helpPage = $this->helpBase . $this->help_page;
        $options = $this->options;
        // set mapping options
        if ($this->defaultMap == "Topo") {
            $options->topoMapDefault = true;
        }
        $this->script->add($options);
    }
}