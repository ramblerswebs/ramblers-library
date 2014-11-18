<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class ROsmapStnd {

    public $key;
    public $style = "border: 1px solid black; width:540px; height:440px;";
    private $mapStyle = "";

    function __construct($key) {
        $this->key = $key;
        $this->mapStyle = '
//declare marker variables
var pos, size, offset, infoWindowAnchor, icon, content, popUpSize;

function initmapbuilder()
{

//initiate the map
    var options = {resolutions: [2500, 1000, 500, 200, 100, 50, 25, 10, 5, 4, 2.5, 2, 1]};
    osMap = new OpenSpace.Map("map", options);';
    }

    function display() {
        $document = JFactory::getDocument();
        $script = 'https://openspace.ordnancesurvey.co.uk/osmapapi/openspace.js?key=';
        $script.=$this->key;
        $document->addScript($script, "text/javascript");
        $document->addScript('https://openspace.ordnancesurvey.co.uk/osmapapi/script/mapbuilder/basicmap.js', "text/javascript");
        $document->addScript('https://openspace.ordnancesurvey.co.uk/osmapapi/script/mapbuilder/searchbox.js', "text/javascript");
        //   $loadscript = JURI::base() . 'ramblers/osmap/osmap.js';
        //    $document->addScript($loadscript, "text/javascript");
        $document->addScriptDeclaration($this->mapStyle . "}");
        echo '<img src="' . JURI::base() . 'ramblers/osmap/osimages.jpg" onload="initmapbuilder()" width="81" height="20">';
        echo '<div id="map" style="' . $this->style . '"></div>';
    }

    public function addSetglobaloptions() {
        $this->mapStyle.="
    //configure map options (basicmap.js)
    setglobaloptions();";
    }

    public function addMakegrid() {
        $this->mapStyle.="
    // add a box displaying co-ordinates (mouse over map to display) 
    makegrid();";
    }

    public function addOverviewmap() {
        $this->mapStyle.="
    //display an overview map
    mapOV.maximizeControl();";
    }

    public function addSearchbox() {
        $this->mapStyle.="
    //add a postcode/gazetteer search box (see searchbox.js)
    addSearchBox(1);";
    }

    public function setCentremapandzoomlevel() {
        $this->mapStyle.="
    //set the center of the map and the zoom level
    osMap.setCenter(new OpenSpace.MapPoint(254480.86952905, 683037.7682247), 7);";
    }

    public function addMarker(){
        $this->mapStyle.="
// add a marker
pos = new OpenSpace.MapPoint(442350,201010);
size = new OpenLayers.Size(30,39);
offset = new OpenLayers.Pixel(-15,-36);
infoWindowAnchor = new OpenLayers.Pixel(16,16);
icon = new OpenSpace.Icon('https://openspace.ordnancesurvey.co.uk/osmapapi/img_versions/img_1.0.1/OS/images/markers/marker-cross-med-blue.png', size, offset, null, infoWindowAnchor);
osMap.createMarker(pos, icon, null, null);";
                
    }
    public function addClustercontrol() {
        $this->mapStyle.="
clusterControl = new OpenSpace.Control.ClusterManager();
osMap.addControl(clusterControl);
clusterControl.activate();";
    }
}
