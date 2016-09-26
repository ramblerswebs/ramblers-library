<?php

/**
 * Description of RJsonwalksLeafletMap
 *
 * @author Chris Vaughan
 */
class RLeafletMap {

    private $map;
    public $mapStyle;
    public $mapHeight;
    public $mapWidth;

    public function __construct() {
        $template = "ramblers/leaflet/mapTemplate.js";
        $this->map = new RHtmlTemplate($template);
        $this->mapStyle = " #leafletmap { height: 500px; width:100%;}";
        $this->mapHeight = "500px";
        $this->mapWidth = "100%";
    }

    public function addMarkers($text) {
        $this->map->replaceString("// [[Add markers here]]", $text);
    }

    public function addBounds($text) {
        $this->map->replaceString("// [FitBounds]", $text);
    }

    public function display() {
        $document = JFactory::getDocument();
        // Leaflet
        $document->addStyleSheet("ramblers/leaflet/leaflet/leaflet.css", "text/css");
        $document->addScript("ramblers/leaflet/leaflet/leaflet.js", "text/javascript");
        $document->addScript("ramblers/js/ramblersleaflet.js", "text/javascript");
        // search        
        $document->addStyleSheet("ramblers/leaflet/geosearch/l.geosearch.css", "text/css");
        $document->addScript("ramblers/leaflet/geosearch/l.control.geosearch.js", "text/javascript");
        $document->addScript("ramblers/leaflet/geosearch/l.geosearch.provider.openstreetmap.js", "text/javascript");

        $document->addScript("http://maps.google.com/maps/api/js?v=3&sensor=false", "text/javascript");
        $document->addScript("ramblers/leaflet/google/Google.js", "text/javascript");
        // clustering
        $document->addStyleSheet("ramblers/leaflet/cluster/MarkerCluster.css", "text/css");
        $document->addStyleSheet("ramblers/leaflet/cluster/MarkerCluster.Default.css", "text/css");
        $document->addScript("ramblers/leaflet/cluster/leaflet.markercluster.js", "text/javascript");
        // Mouse position
        $document->addScript("ramblers/leaflet/mouseposition/L.Control.MousePosition.js", "text/javascript");
        $document->addStyleSheet("ramblers/leaflet/mouseposition/L.Control.MousePosition.css", "text/css");
        // grid ref to/from lat/long
        $document->addScript("ramblers/leaflet/geodesy/vector3d.js", "text/javascript");
        $document->addScript("ramblers/leaflet/geodesy/latlon-ellipsoidal.js", "text/javascript");
        $document->addScript("ramblers/leaflet/geodesy/osgridref.js", "text/javascript");
        //
        $mapStyle = " #leafletmap { height: " . $this->mapHeight . "; width:" . $this->mapWidth . ";}";
        $document->addStyleDeclaration($mapStyle);
        // leaflet/joomla fix so that overlay pane is displayed
        $document->addStyleDeclaration(".leaflet-overlay-pane svg{max-width:none}");
        $document->addStyleDeclaration(".osgridref {font-weight: 700;font-size:125%;}");

        $base = JURI::base();
        $this->map->replaceString("[base]", $base);
        //       $document->addScriptDeclaration($this->map->getContents());
        echo " <div id='ra-cluster-progress'><div id='ra-cluster-progress-bar'></div></div> " . PHP_EOL;
        echo "<div class='map-container'>" . PHP_EOL;
        echo "<div id='leafletmap'>" . PHP_EOL;
        echo "<script type='text/javascript'>";
        echo $this->map->getContents();
        echo "</script>" . PHP_EOL;
        echo "</div>" . PHP_EOL;
        echo "</div>" . PHP_EOL;
    }

}
