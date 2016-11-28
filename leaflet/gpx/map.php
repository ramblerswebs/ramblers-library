<?php

/**
 * Description of mapmarker
 *
 * @author Chris Vaughan
 */
class RLeafletGpxMap extends RLeafletMap {

    public $linecolour = "#782327";
    public $imperial = false;

    public function __construct() {
        parent::__construct();
    }

    public function displayPath($gpx) {
        $this->addClusters=false;
        $this->addSearch=false;
        $this->addFullScreen=false;
 
        $this->addElevation = true;
        if ($this->imperial) {
            $imperial = "true";
        } else {
            $imperial = "false";
        }
        $file = JURI::root() . $gpx;
        //   echo $file;
        $text = ' var el = L.control.elevation({
    position: "topright",
    theme: "steelblue-theme", //default: lime-theme
    width: 600,
    height: 125,
    margins: {
        top: 10,
        right: 20,
        bottom: 30,
        left: 50
    },
    useHeightIndicator: true, //if false a marker is drawn at map position
    interpolation: "linear", //see https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-area_interpolate
    hoverNumber: {
        decimalsX: 1, //decimals on distance (always in km)
        decimalsY: 0, //deciamls on hehttps://www.npmjs.com/package/leaflet.coordinatesight (always in m)
        formatter: undefined //custom formatter function may be injected
    },
    xTicks: undefined, //number of ticks in x axis, calculated by default according to width
    yTicks: undefined, //number of ticks on y axis, calculated by default according to height
    collapsed: true,  //collapsed mode, show chart on click or mouseover
    imperial: ' . $imperial . '    //display imperial units instead of metric
});
        el.addTo(map);
        var g=new L.GPX(\'' . $file . '\', {async: true,
            polyline_options: {color: \'' . $this->linecolour . '\'},
            marker_options: {
			    startIconUrl: \'[base]ramblers/leaflet/gpx/images/pin-icon-start.png\',
			    endIconUrl: \'[base]ramblers/leaflet/gpx/images/pin-icon-end.png\',
			    shadowUrl: \'[base]ramblers/leaflet/gpx/images/pin-shadow.png\'
			  }});
        g.on(\'addline\',function(e){
         el.addData(e.line);
        });
        g.on(\'loaded\', function(e) {
            map.fitBounds(e.target.getBounds());
		});
        g.addTo(map)';
        parent::addMarkers($text);
        if (file_exists($gpx)) {
            parent::display();
        } else {
            $application = JFactory::getApplication();
            $application->enqueueMessage(JText::_('GPX: Route file not found: ' . $file), 'error');
            echo "<p><b>Unable to display gpx file</b></p>";
        }
    }

}
