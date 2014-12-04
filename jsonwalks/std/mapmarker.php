<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdMapmarker extends RJsonwalksDisplaybase {

    private $map;
    private $xmin, $xmax;
    private $ymin, $ymax;

    function DisplayWalks($walks) {
        if (isset($this->map)==false){
            echo "// RJsonwalksStdMapmarker: No map defined, use setMap function.";
            return;
        }
        $this->setMapLimits($walks);
        $items = $walks->allWalks();

        foreach ($items as $walk) {
            $marker = new RJsonwalksMapmarker();
            $marker->x = $walk->startLocation->easting;
            $marker->y = $walk->startLocation->northing;

            If ($walk->startLocation->exact) {
                if ($walk->status == "Cancelled") {
                    $marker->image = "marker_red.png";
                } else {
                    $marker->image = "marker_blue.png";
                }
                $marker->xsize = 30;
                $marker->ysize = 39;
            } else {
                if ($walk->status == "Cancelled") {
                    $marker->image = "round-marker-lrg-red.png";
                } else {
                    $marker->image = "round-marker-lrg-blue.png";
                }
                $marker->xsize = 30;
                $marker->ysize = 30;
            }
            $marker->html = "<b>";
            $marker->html.="<a href=\'" . $walk->detailsPageUrl . "\' target=\'_blank\'>";
            $marker->html.=$walk->walkDate->format('D, jS F');
            $marker->html.="<br/>" . $walk->title;
            $marker->html.="<br/>" . $walk->distanceMiles . "m/" . $walk->distanceKm . "km";
            $marker->html .= "</a></b>";

            $this->map->addMarker($marker);
        }
    }

    private function setMapLimits($walks) {
        $items = $walks->allWalks();
        $first = true;

        foreach ($items as $walk) {

            $x = $walk->startLocation->easting;
            $y = $walk->startLocation->northing;
            if ($first) {
                $this->xmin = $x;
                $this->xmax = $x;
                $this->ymin = $y;
                $this->ymax = $y;
                $first = false;
            } else {
                $this->UpdateLimits($x, $y);
            }
        }
        if ($first == false) {
            $zoom = 2;
            $x = ($this->xmin + $this->xmax) / 2;
            $y = ($this->ymin + $this->ymax) / 2;
            $this->map->setCentremapandzoomlevel($x, $y, $zoom);
        } else {
            echo "// RJsonwalksStdMapmarker: No walks found";
        }
    }

    function setMap($map) {
        $this->map = $map;
    }

    private function UpdateLimits($x, $y) {
        if ($x < $this->xmin) {
            $this->xmin = $x;
        }
        if ($x > $this->xmax) {
            $this->xmax = $x;
        }
        if ($y < $this->ymin) {
            $this->ymin = $y;
        }
        if ($y > $this->ymax) {
            $this->ymax = $y;
        }
    }

}
