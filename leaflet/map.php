<?php

/**
 * Description of RLeafletMap
 *   Not called by users
 *
 * @author Chris Vaughan
 */
class RLeafletMap {

    private $map;
    public $debugoptions = false;
    public $mapStyle;
    public $mapHeight;
    public $mapWidth;
    public $options;
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
        $options = $this->options;
        JHtml::_('jquery.framework');

        $document = JFactory::getDocument();
        // Leaflet
        $document->addStyleSheet("ramblers/vendors/leaflet1.3.1/leaflet.css", "text/css");
        $document->addScript("ramblers/vendors/leaflet1.3.1/leaflet.js", "text/javascript");
        $document->addScript("ramblers/leaflet/leaflet/ramblersleaflet.js", "text/javascript");
        $document->addStyleSheet("ramblers/leaflet/leaflet/ramblersleaflet.css", "text/css");
        if ($options->search) {
            $document->addStyleSheet("ramblers/leaflet/geocoder/Control.Geocoder.css", "text/css");
            $document->addScript("ramblers/leaflet/geocoder/Control.Geocoder.js", "text/javascript");
        }
        if ($options->locationsearch) {
            $document->addStyleSheet("ramblers/leaflet/locationsearch/Control.Locationsearch.css", "text/css");
            $document->addScript("ramblers/leaflet/locationsearch/Control.Locationsearch.js", "text/javascript");
        }
        if ($options->fullscreen) {
            $path = "ramblers/vendors/Leaflet.fullscreen-1.0.2/dist/";
            $document->addScript($path . "Leaflet.fullscreen.min.js", "text/javascript");
            $document->addStyleSheet($path . "leaflet.fullscreen.css", "text/css");
        }

        if ($options->postcodes) {
            // Mapcodes        
            $document->addScript("ramblers/vendors/mapcode-js-2.4.0/mapcode.js", "text/javascript");
            $document->addScript("ramblers/vendors/mapcode-js-2.4.0/ndata.js", "text/javascript");
        }

        if ($this->addElevation) {
            // elevation
            $document->addScript("https://d3js.org/d3.v3.min.js", "text/javascript");
            $document->addStyleSheet("ramblers/leaflet/gpx/elevation.css", "text/css");
            $document->addScript("ramblers/leaflet/gpx/leaflet.elevation-0.0.4.src.js", "text/javascript");
            $document->addScript("ramblers/leaflet/gpx/gpx.js", "text/javascript");
        }
        if (RLicense::isGoogleKeyMapSet()) {
            // Google
            $document->addScript("https://maps.googleapis.com/maps/api/js?key=" . RLicense::getGoogleMapKey(), "text/javascript", true, true);
            $document->addScript("ramblers/vendors/Leaflet.GridLayer.GoogleMutant/Leaflet.GoogleMutant.js", "text/javascript");
            $document->addScript("ramblers/vendors/es6-promise-vv4.2.3/dist/es6-promise.auto.js", "text/javascript");
            $this->map->replaceString("// [set addGoogle]", "ramblersMap.options.google=true;");
        }
        if ($options->cluster) {
            // clustering
            $path = "ramblers/vendors/Leaflet.markercluster-1.3.0/dist/";
            $document->addStyleSheet($path . "MarkerCluster.css", "text/css");
            $document->addStyleSheet($path . "MarkerCluster.Default.css", "text/css");
            $document->addScript($path . "leaflet.markercluster-src.js", "text/javascript");
        }
        if ($options->mouseposition or $options->postcodes) {
            $document->addScript("ramblers/leaflet/mouse/L.Control.Mouse.js", "text/javascript");
            $document->addStyleSheet("ramblers/leaflet/mouse/L.Control.Mouse.css", "text/css");
        }

        if ($options->mouseposition or $options->osgrid or $options->postcodes) {
            // grid ref to/from lat/long
            $document->addScript("ramblers/vendors/geodesy/vector3d.js", "text/javascript");
            $document->addScript("ramblers/vendors/geodesy/latlon-ellipsoidal.js", "text/javascript");
            $document->addScript("ramblers/vendors/geodesy/osgridref.js", "text/javascript");
        }

        $mapStyle = " #leafletmap { height: " . $this->mapHeight . "; width:" . $this->mapWidth . ";}";
        $document->addStyleDeclaration($mapStyle);

        $base = JURI::base();
        $this->map->replaceString("[base]", $base);
        $optionstext = $options->text();

        $this->map->replaceString("// [set MapOptions]", $optionstext);
        if ($this->debugoptions) {
            echo $optionstext;
        }
        if ($options->cluster) {
            echo "<div id='ra-cluster-progress'><div id='ra-cluster-progress-bar'></div></div> " . PHP_EOL;
        }
        echo "<div id='ra-error-text'></div> " . PHP_EOL;
        echo "<div class='map-container'>" . PHP_EOL;


        echo "<div id='leafletmap'></div>" . PHP_EOL;
        echo "<script type='text/javascript'>";
        echo $this->map->getContents();
        echo "</script>" . PHP_EOL;
        echo "</div>" . PHP_EOL;
        echo "<p class='mapcopyright'>OS data © Crown copyright and database 2018;   Royal Mail data © Royal Mail copyright and Database 2018</p>";
    }

}
