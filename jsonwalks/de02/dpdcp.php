<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksDe02Dpdcp extends RJsonwalksDisplaybase {

    private $map;

    function DisplayWalks($walks) {
        $marker = new RJsonwalksMapmarker();
        $marker->x = 434967;
        $marker->y = 338042;

        $marker->image = "marker_green.png";

        $marker->xsize = 30;
        $marker->ysize = 39;

        $marker->html = "<b>";
        $marker->html = "Darley Park Drive car park, DPDCP, is where many of our walks use as a meeting place. "
                . "We then car share from there to the start of the walk";

        $marker->html .= "</b>";

        $this->map->addMarker($marker);
    }

    function setMap($map) {
        $this->map = $map;
    }

}
