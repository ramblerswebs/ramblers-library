<?php

/**
 * Description of gpx
 *
 * @author Chris Vaughan
 */
class RGpxFile {

    public $longitude = 0;
    public $latitude = 0;
    public $distance = 0;
    public $cumulativeElevationGain = 0;
    public $minAltitude = 0;
    public $maxAltitude = 0;
    public $tracks = 0;
    public $routes = 0;
    private $file = null;
    private $registered = false;

    public function __construct($file) {
        $this->file = $file;
        $this->parse();
    }

    private function parse() {
        if (!$this->registered) {
            JLoader::registerNamespace('phpGPX', "ramblers\\gpx");
            $this->registered = true;
            require_once 'phpGPX/phpGPX.php';
        }

        $gpxfile = new phpGPX\phpGPX();
        $gpx = $gpxfile->load($this->file);

        // tracks
        if (count($gpx->tracks) > 0) {
            $track = $gpx->tracks[0];
            if (count($track->segments) > 0) {
                $segment = $track->segments[0];
                if (count($segment->points) > 0) {
                    $pt = $segment->points[0];
                    $this->longitude = $pt->longitude;
                    $this->latitude = $pt->latitude;
                }
            }
        }
        foreach ($gpx->tracks as $track) {
            $s = $track->stats;
            $this->tracks += 1;
            $this->distance += $s->distance;
            $this->cumulativeElevationGain += $s->cumulativeElevationGain;
            $this->minAltitude = $s->minAltitude;
            $this->maxAltitude = $s->maxAltitude;
        }
        // roues

        foreach ($gpx->routes as $route) {
            $this->routes += 1;
            $s = $route->stats;
            $this->distance += $s->distance;
            $this->cumulativeElevationGain += $s->cumulativeElevationGain;
            if (isset($s->minAltitude)) {
                $this->minAltitude = $s->minAltitude;
            }
            if (isset($s->maxAltitude)) {
                $this->maxAltitude = $s->maxAltitude;
            }
        }

        if (count($gpx->routes) > 0) {
            $route = $gpx->routes[0];
            if (count($route->points) > 0) {
                $pt = $route->points[0];
                $this->longitude = $pt->longitude;
                $this->latitude = $pt->latitude;
            }
        }
    }

}
