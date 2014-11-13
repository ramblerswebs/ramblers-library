<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class ROsmapBasic {

    public $key;
    public $style="border: 1px solid black; width:540px; height:440px;";

    function __construct($key) {
        $this->key = $key;
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
        $document->addScriptDeclaration('
    function initmapbuilder()
{
//initiate the map
    var options = {resolutions: [2500, 1000, 500, 200, 100, 50, 25, 10, 5, 4, 2.5, 2, 1]};
    osMap = new OpenSpace.Map("map", options);
//configure map options (basicmap.js)
    setglobaloptions();
// add a box displaying co-ordinates (mouse over map to display) 
    makegrid();
//display an overview map
    mapOV.maximizeControl();
//add a postcode/gazetteer search box (see searchbox.js)
    addSearchBox(1);
//set the center of the map and the zoom level
    osMap.setCenter(new OpenSpace.MapPoint(254480.86952905, 683037.7682247), 7);
}
');
//</head>
        echo '<img src="'.JURI::base() . 'ramblers/osmap/osimages.jpg" onload="initmapbuilder()" width="81" height="20">';
        echo '<div id="map" style="'.$this->style.'"></div>';
      
    }

}
