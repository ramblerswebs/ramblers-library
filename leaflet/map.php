<?php

/**
 * Description of RLeafletMap
 *   Not called by users
 *
 * @author Chris Vaughan
 */
class RLeafletMap {

    private $map;
    public $mapStyle;
    public $mapHeight;
    public $mapWidth;
    public  $options;
    protected $addElevation = false;

    public function __construct() {
        $template = "ramblers/leaflet/mapTemplate.js";
        $this->map = new RHtmlTemplate($template);
        $this->mapStyle = " #leafletmap { height: 500px; width:100%;}";
        $this->mapHeight = "500px";
        $this->mapWidth = "100%";
        $this->options = new RLeafletMapoptions();
    }

    public function addContent($text) {
//      $this->map->replaceString("// [[Add markers here]]", $text);
        $document = JFactory::getDocument();
        $out = "function addContent(ramblersMap) {" . $text . "}";
        $document->addScriptDeclaration($out, "text/javascript");
    }

    public function addBounds() {
        $this->map->replaceString("// [FitBounds]", "ramblersMap.map.fitBounds(ramblersMap.markersCG.getBounds());");
    }

    public function display() {
$options=$this->options;
        JHtml::_('jquery.framework');

        $document = JFactory::getDocument();
        // Leaflet
        $document->addStyleSheet("ramblers/leaflet/leaflet/leaflet.css", "text/css");
        $document->addScript("ramblers/leaflet/leaflet/leaflet.js", "text/javascript");
        $document->addScript("ramblers/leaflet/leaflet/ramblersleaflet.js", "text/javascript");
        $document->addStyleSheet("ramblers/leaflet/leaflet/ramblersleaflet.css", "text/css");
        if ($options->search) {
            $document->addStyleSheet("ramblers/leaflet/geocoder/Control.Geocoder.css", "text/css");
            $document->addScript("ramblers/leaflet/geocoder/Control.Geocoder.js", "text/javascript");
        }

        if ($options->postcodes) {
            // Mapcodes        
            $document->addScript("ramblers/leaflet/mapcode/mapcode.js", "text/javascript");
            $document->addScript("ramblers/leaflet/mapcode/ndata.js", "text/javascript");
        }

        if ($this->addElevation) {
            // elevation
            $document->addScript("http://d3js.org/d3.v3.min.js", "text/javascript");
            $document->addStyleSheet("ramblers/leaflet/gpx/elevation.css", "text/css");
            $document->addScript("ramblers/leaflet/gpx/leaflet.elevation-0.0.4.src.js", "text/javascript");
            $document->addScript("ramblers/leaflet/gpx/gpx.js", "text/javascript");
        }
        if (RLicense::isGoogleKeyMapSet()) {
            // Google
            $document->addScript("https://maps.googleapis.com/maps/api/js?key=" . RLicense::getGoogleMapKey(), "text/javascript",true,true);
            $document->addScript("ramblers/leaflet/google/Leaflet.GoogleMutant.js", "text/javascript");
          //  $document->addScript("ramblers/leaflet/google/es6-promise.auto.js", "text/javascript");
            $this->map->replaceString("// [set addGoogle]", "ramblersMap.options.google=true;");
        }
        if ($options->cluster) {
            // clustering
            $document->addStyleSheet("ramblers/leaflet/clustering/MarkerCluster.css", "text/css");
            $document->addStyleSheet("ramblers/leaflet/clustering/MarkerCluster.Default.css", "text/css");
            $document->addScript("ramblers/leaflet/clustering/MarkerCluster.js", "text/javascript");
            $document->addScript("ramblers/leaflet/clustering/MarkerClusterGroup.js", "text/javascript");
            $document->addScript("ramblers/leaflet/clustering/DistanceGrid.js", "text/javascript");
            $document->addScript("ramblers/leaflet/clustering/MarkerCluster.QuickHull.js", "text/javascript");
            $document->addScript("ramblers/leaflet/clustering/MarkerCluster.Spiderfier.js", "text/javascript");
            $document->addScript("ramblers/leaflet/clustering/MarkerOpacity.js", "text/javascript");
        }
        if ($options->mouseposition or $options->postcodes) {
            $document->addScript("ramblers/leaflet/mouse/L.Control.Mouse.js", "text/javascript");
        }
        if ($options->mouseposition) {
            // Mouse position
            $document->addStyleSheet("ramblers/leaflet/mouse/L.Control.Mouse.css", "text/css");
        }
        if ($options->mouseposition or $options->osgrid or $options->postcodes) {
            // grid ref to/from lat/long
            $document->addScript("ramblers/leaflet/geodesy/vector3d.js", "text/javascript");
            $document->addScript("ramblers/leaflet/geodesy/latlon-ellipsoidal.js", "text/javascript");
            $document->addScript("ramblers/leaflet/geodesy/osgridref.js", "text/javascript");
        }

        $mapStyle = " #leafletmap { height: " . $this->mapHeight . "; width:" . $this->mapWidth . ";}";
        $document->addStyleDeclaration($mapStyle);

        $base = JURI::base();
        $this->map->replaceString("[base]", $base);
        $optionstext = $options->text();
        
        $this->map->replaceString("// [set MapOptions]", $optionstext);
        echo $optionstext;
        echo "<div id='ra-cluster-progress'><div id='ra-cluster-progress-bar'></div></div> " . PHP_EOL;
        echo "<div id='ra-error-text'></div> " . PHP_EOL;
        echo "<div class='map-container'>" . PHP_EOL;


        echo "<div id='leafletmap'></div>" . PHP_EOL;
        echo "<script type='text/javascript'>";
        echo $this->map->getContents();
        echo "</script>" . PHP_EOL;
        echo "</div>" . PHP_EOL;
    }

}
