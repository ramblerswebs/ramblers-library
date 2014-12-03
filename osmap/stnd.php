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

var osMap, screenOverlay, mapOV, postcodeService;
var pos, size, offset, infoWindowAnchor, icon, content, popUpSize;

function initmapbuilder() 
    {

       //initiate the map
       var options = {resolutions: [2500, 1000, 500, 200, 100, 50, 25, 10, 5, 4, 2.5, 2, 1] };
       osMap = new OpenSpace.Map("map", options);
       var e=document.getElementById("map");';
    }

    function display() {
        $document = JFactory::getDocument();
        $script = 'https://openspace.ordnancesurvey.co.uk/osmapapi/openspace.js?key=';
        $script.=$this->key;
        $document->addScript($script, "text/javascript");
        $document->addScript(JURI::base() . "/ramblers/js/ramblers.js");
        $document->addScript('https://openspace.ordnancesurvey.co.uk/osmapapi/script/mapbuilder/basicmap.js', "text/javascript");
        $document->addScript('https://openspace.ordnancesurvey.co.uk/osmapapi/script/mapbuilder/searchbox.js', "text/javascript");
        //   $loadscript = JURI::base() . 'ramblers/osmap/osmap.js';
        //    $document->addScript($loadscript, "text/javascript");
        $document->addScriptDeclaration($this->mapStyle . "\r\n"
                . "}");
        echo '<img src="' . JURI::base() . 'ramblers/osmap/osimages.jpg" onload="initmapbuilder()" width="81" height="20">';
        echo '<div id="map" style="' . $this->style . '"></div>';
      //  echo '<div id="myDiv"><h2>Let AJAX change this text</h2></div>';
      //  echo '<button type="button" onclick="displayWalk()">Change Content</button>';
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

    public function setCentremapandzoomlevel($x, $y, $zoom) {
        $this->mapStyle.="
        //set the center of the map and the zoom level
        osMap.setCenter(new OpenSpace.MapPoint(" . $x . "," . $y . ")," . $zoom . ");";
    }

    public function addMarker($marker) {
        $this->mapStyle.=$marker->Script();
    }

    public function addClustercontrol() {
        $this->mapStyle.="
        clusterControl = new OpenSpace.Control.ClusterManager();
        osMap.addControl(clusterControl);
        clusterControl.activate();";
    }

    public function addGridRefDisplay() {
        $this->mapStyle.="
        NGSs = new NatGridSquares(); // converts between east,north and Grid Ref (SK123456)

        // Adding the Grid Coordinates (mouse over map) box 
        screenOverlay = new OpenSpace.Layer.ScreenOverlay(\"coords\");
        var leftPos = osMap.div.clientWidth - 116;
        screenOverlay.setPosition(new OpenLayers.Pixel(leftPos, 5));
        osMap.addLayer(screenOverlay);
        var gridProjection = new OpenSpace.GridProjection();

        var points = new Array(); 

        // set up code to show the current grid ref square
        var style_green = {
                strokeColor: \"#444444\",
                strokeOpacity: 0.3,
                strokeWidth: 1,
                fillColor: \"#FF0000\",
                fillOpacity: 0.3
         };
        //push points into an array variable(named 'points')
			
         points[0]=new OpenLayers.Geometry.Point(0, 0);
         points[1]=new OpenLayers.Geometry.Point(0, 10000);
         points[2]=new OpenLayers.Geometry.Point(10000, 10000);
         points[3]=new OpenLayers.Geometry.Point(10000, 0);
         points[4]=new OpenLayers.Geometry.Point(0, 0);
  
         //create a polygon feature from the array of points and using the style from above
         var linearRing = new OpenLayers.Geometry.LinearRing(points);
         var polygonFeature = new OpenLayers.Feature.Vector(linearRing, null, style_green);
         //   vectorLayer.addFeatures([polygonFeature]);
         //add it to the map
         osMap.addFeatures(polygonFeature);


         osMap.events.register(\"mousemove\", osMap, function(e) {
         var zoom = osMap.getZoom();
         var pt = osMap.getLonLatFromViewPortPx(e.xy);
         var gridRef = NGSs.toGridRef(zoom,pt.lon,pt.lat);
         if (gridRef != \"Invalid\") {
  
            var size = NGSs.gridsqSize(zoom);
            var ptBL = NGSs.gridsqPt(zoom,pt.lon,pt.lat);
  
            osMap.removeFeatures(polygonFeature); 
            var points= new Array();
            points[0]=new OpenLayers.Geometry.Point(ptBL.lon,ptBL.lat);
            points[1]=new OpenLayers.Geometry.Point(ptBL.lon,ptBL.lat+size);
            points[2]=new OpenLayers.Geometry.Point(ptBL.lon+size,ptBL.lat+size);
            points[3]=new OpenLayers.Geometry.Point(ptBL.lon+size,ptBL.lat);
            points[4]=new OpenLayers.Geometry.Point(ptBL.lon,ptBL.lat);
      
           //create a polygon feature from the array of points and using the style from above
           var linearRing = new OpenLayers.Geometry.LinearRing(points);
           polygonFeature = new OpenLayers.Feature.Vector(linearRing, null, style_green);
	
           osMap.addFeatures([polygonFeature]);
          }
	
         screenOverlay.setHTML(\"<DIV style='width: 100px; height: 47px; padding: 4px; color: white; background-color: #666; line-height: 15px; font-size: 12px; font-family: Arial, Helvetica, sans-serif; '>\" +
         \"GR: \" + gridRef + \"<BR>\" +
         \"East: \" + (pt.lon).toFixed(0) + \"<BR>\" +
         \"North: \" + (pt.lat).toFixed(0) + \"<BR>\" +
         \" </DIV>\");
}
);";
    }

}
