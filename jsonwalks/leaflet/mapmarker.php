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

    public function __construct() {
        $this->map = new RLeafletMap;
    }

    public function mapHeight($height) {
        $this->map->mapHeight = $height;
    }

    public function mapWidth($width) {
        $this->map->mapWidth = $width;
    }

    public function DisplayWalks($walks) {
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

    private function addMarker($walk) {

        $date = $walk->walkDate->format('l, jS F');
        $title = addslashes($walk->title);
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
        $class = $this->walkClass . $walk->status;
        $walk = "<div class='" . $class . "'><b><a href=&quot;javascript:walkdetails('" . $url . "')&quot; >" . $date . "<br/>" . $title . "<br/>" . $dist . "</a></b></div>";
        $map = "<a href=&quot;javascript:streetmap('" . $gr . "')&quot; >[OS Map]</a>";
        $directions = "<a href=&quot;javascript:directions(" . $lat . "," . $long . ")&quot; >[Directions]</a>";
        //  var $directions = "<a href='https://maps.google.com?saddr=Current+Location&daddr=" + $lat + "," + $long + "' target='_blank'>[Directions]</a>";
        $photos = "<a href=&quot;javascript:photos('" . $gr . "')&quot; >[Photos]</a>";
        $popup = $walk . $map . $directions . $photos;
        // $popup = str_replace('"', "&quot;", $popup);
        $marker = 'addMarker(markerList,"' . $popup . '", ' . $lat . ', ' . $long . ', ' . $icon . ');';
        //     $marker = "addWalk(markerList,'" . $this->walkClass . $walk->status . "', '" . $date . "', '" . $title . "', '" . $dist . "', '" . $gr . "', " . $lat . ", " . $long . ", '" . $url . "', " . $icon . ");";
        return $marker;
    }

}
