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
        $items = $walks->allWalks();
        $first = true;


        foreach ($items as $walk) {
            If ($walk->startLocation->exact) {
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
                $image = "marker_blue.png";
                $html = "<b>";
                $html.="<br/><a href=\'" . $walk->detailsPageUrl . "\' target=\'_blank\'>";
                $html.=$walk->walkDate->format('D, jS F');
                $html.="<br/>" . $walk->title;
                $html.="<br/>" . $walk->distanceMiles . "m/" . $walk->distanceKm . "km";
                $html .= "</b></a>";

                $this->map->addMarker($x, $y, $image, $html);
            }
            if ($first == false) {
                $zoom = 2;
                $x = ($this->xmin + $this->xmax) / 2;
                $y = ($this->ymin + $this->ymax) / 2;
                $this->map->setCentremapandzoomlevel($x, $y, $zoom);
            }
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
        //  echo $this->xmin."  ".$this->xmax."<br />";
    }

}
