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
        $template = "ramblers/leaflet/mapTemplate.html";
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

        $document->addStyleSheet("http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css", "text/css");
        $document->addStyleSheet("ramblers/css/MarkerCluster.css", "text/css");
        $document->addStyleSheet("ramblers/css/MarkerCluster.Default.css", "text/css");
        //  $document->addStyleSheet("ramblers/css/screen.css", "text/css");
        $document->addStyleSheet("ramblers/css/l.geosearch.css", "text/css");

        $document->addScript("http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js", "text/javascript");
        $document->addScript("http://maps.google.com/maps/api/js?v=3&sensor=false", "text/javascript");
        $document->addScript("ramblers/js/Google.js", "text/javascript");
        $document->addScript("ramblers/js/leaflet.markercluster-src.js", "text/javascript");
        $document->addScript("ramblers/js/l.control.geosearch.js", "text/javascript");
        $document->addScript("ramblers/js/l.geosearch.provider.openstreetmap.js", "text/javascript");
        $document->addScript("ramblers/js/leaflet.markercluster-src.js", "text/javascript");
        //   $document->addScript("ramblers/js/leaflet.markercluster.js", "text/javascript");
        $document->addScript("ramblers/js/ramblersleaflet.js", "text/javascript");
        $mapStyle = " #leafletmap { height: " . $this->mapHeight . "; width:" . $this->mapWidth . ";}";
        $document->addStyleDeclaration($mapStyle);
        $base = JURI::base();
        $this->map->replaceString("[base]", $base);
        $this->map->insertTemplate();
    }

}
