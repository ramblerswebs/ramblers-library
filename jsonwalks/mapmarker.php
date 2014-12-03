<?php

/**
 * Description of mapmarker
 *
 * @author Chris Vaughan
 */
class RJsonwalksMapmarker {

    public $html = "";     // html code to be popup on marker
    public $image = "";    // image file
    public $x = 0;         // x location of marker
    public $y = 0;         // y location of marker
    public $xsize = 16;    // width of marker
    public $ysize = 16;    // height of marker
    public $xpopup = 200;  // width of popup
    public $ypopup = 200;  // height of popup

    public function Script() {
        $out = "";
        $out.= "
        // add a marker
        pos = new OpenSpace.MapPoint(" . $this->x . "," . $this->y . ");
        size = new OpenLayers.Size(" . $this->xsize . "," . $this->ysize . ");
        offset = new OpenLayers.Pixel(-15,-36);";
        $out.=" infoWindowAnchor = new OpenLayers.Pixel(16,16);";
        $out.=" icon = new OpenSpace.Icon('https://openspace.ordnancesurvey.co.uk/osmapapi/img_versions/img_1.0.1/OS/images/markers/" . $this->image . "', size, offset, null, infoWindowAnchor);";
        $out.=" osMap.createMarker(pos, icon, '" . $this->html . "',  new OpenLayers.Size(".$this->xpopup.",".$this->ypopup."));";
        return $out;
    }

}
