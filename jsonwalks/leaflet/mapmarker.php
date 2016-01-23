<?php

/**
 * Description of mapmarker
 *
 * @author Chris Vaughan
 */
class RJsonwalksLeafletMapmarker extends RJsonwalksDisplaybase {

    private $map;
    private $bounds;
    private $walkClass = "walk";

    function __construct() {
        $this->map = new RJsonwalksLeafletMap;
    }

    function DisplayWalks($walks) {
        if (isset($this->map)) {
            $items = $walks->allWalks();
            $this->bounds = $walks->getBounds(RJsonwalksWalks::LATLONG);
            $text = "";
            foreach ($items as $walk) {
                $marker = $this->addMarker($walk);
                $text.=$marker . PHP_EOL;
            }
            $this->map->addMarkers($text);
            $boundstext = "
    var bounds = [[" . $this->bounds['xmin'] . "," . $this->bounds['ymin'] . "],[" . $this->bounds['xmax'] . "," . $this->bounds['ymax'] . ",]];
    // zoom the map to the rectangle bounds
    map.fitBounds(bounds);";
            $this->map->addBounds($boundstext);
            $this->map->display();
        }
    }

    //  function setMap($map) {
    //      $this->map = $map;
    //  }

    private function addMarker($walk) {

        $date = $walk->walkDate->format('l, jS F');
        $title = $walk->title;
        $dist = $walk->distanceMiles . "mile / " . $walk->distanceKm . "km";
        $gr = $walk->startLocation->gridref;
        $long = $walk->startLocation->longitude;
        $lat = $walk->startLocation->latitude;
        $url = $walk->detailsPageUrl;
        if ($walk->startLocation->exact) {
            $icon = "markerStart";
        } else {
            $icon = "markerArea";
        }
        if ($walk->isCancelled()) {
            $icon = "markerCancelled";
        }
        $marker = "addWalk(markerList,'" . $this->walkClass . $walk->status . "', '" . $date . "', '" . $title . "', '" . $dist . "', '" . $gr . "', " . $lat . ", " . $long . ", '" . $url . "', " . $icon . ");";
        return $marker;
    }

}
