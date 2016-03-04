<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of areas
 *
 * @author Chris
 */
class ROrganisation {

    public $groups;
    public $areas;
    public $showLinks = true;
    public $showCodes = true;
    public $showGroups = true;
    Public $centreGroup = "";
    public $mapZoom = -1;

    function __construct() {
        $this->load();
    }

    public function load() {
        $url = "http://www.ramblers.org.uk/api/lbs/groups/";
        $this->readFeed($url);
    }

    private function readFeed($rafeedurl) {
        $CacheTime = 3 * 4 * 7 * 60 * 24; // three months in minutes
        $cacheLocation = $this->CacheLocation();
        $srfr = new RFeedhelper($cacheLocation, $CacheTime);
        $contents = $srfr->getFeed($rafeedurl);
        switch ($contents) {
            case NULL:
                echo '<b>Groups feed: Unable to read feed: ' . $rafeedurl . '</b>';
                break;
            case "":
                echo '<b>Groups feed: No Groups found</b>';
                break;
            case "[]":
                echo '<b>Groups feed empty: No Groups found</b>';
                break;
            default:
                $json = json_decode($contents);
                unset($contents);
                $error = 0;
                if (json_last_error() == JSON_ERROR_NONE) {
                    foreach ($json as $value) {
                        $ok = $this->checkJsonProperties($value);
                        $error+=$ok;
                    }
                    if ($error > 0) {
                        echo '<br/><b>Groups feed: Json file format not supported</b>';
                    } else {
                        $this->convert($json);
                    }
                    unset($json);
                    break;
                } else {
                    echo '<br/><b>Groups feed: feed is not in Json format</b>';
                }
        }
    }

    private function convert($json) {
        $this->areas = array();
        $this->groups = array();
        foreach ($json as $item) {
            if ($item->scope == "A") {
                $group = new ROrganisationArea($item);
                $this->areas[$item->groupCode] = $group;
                $this->groups[$item->groupCode] = $group;
            }

            if ($item->scope <> "A") {
                $group = new ROrganisationGroup($item);
                $this->groups[$item->groupCode] = $group;

                $areacode = substr($item->groupCode, 0, 2);
                if (isset($this->areas[$areacode])) {
                    $area = $this->areas[$areacode];
                    $area->addGroup($group);
                }
            }
        }
        ksort($this->groups);
        ksort($this->areas);
        foreach ($this->areas as $area) {
            $area->sort();
        }
    }

    public function listAreas() {
        foreach ($this->areas as $area) {
            $code = "";
            if ($this->showCodes) {
                $code = "Area " . $area->code . ": ";
            }
            echo "<div class='ra_area'>" . $code . $area->getLink($this->showLinks) . "</div>";
            echo "<ul>";
            if ($this->showGroups) {
                $code = "";
                foreach ($area->groups as $group) {
                    if ($this->showCodes) {
                        switch ($group->scope) {
                            case "G":
                                $code = "Group " . $group->code . ":  ";
                                break;
                            case "S":
                                $code = "Special Group " . $group->code . ":  ";
                                break;
                            default:
                                $code = "Other Group " . $group->code . ":  ";
                                break;
                        }
                    }
                    Echo "<div class='ra_group'>" . $code . $group->getLink($this->showLinks) . "</div>";
                }
                echo "</ul>";
            }
        }
    }

    public function addMapMarkers($map) {
        if (isset($map)) {
            // Set Centre and zoom level
            $bounds = "";
            if ($this->mapZoom >= 0 and $this->mapZoom <= 18) {
                $bounds.="map.setZoom(" . $this->mapZoom . ");\r\n";
            }
            If ($this->centreGroup <> "") {
                if (isset($this->groups[$this->centreGroup])) {
                    $group = $this->groups[$this->centreGroup];
                    $bounds.="var latlng = new L.LatLng(" . $group->latitude . "," . $group->longitude . ");\r\n map.panTo(latlng);\r\n";
                }
            }
            $map->addBounds($bounds);
            $text = "";
            foreach ($this->groups as $key => $group) {
                $areatext = "";
                if ($group->scope <> "A") {
                    $areacode = substr($key, 0, 2);
                    $area = $this->areas[$areacode];
                    $areatext = "Area <br/><a href='" . $area->url . "' target='_blank'>" . $area->name . "</a><br/>";
                }
                $marker = $group->addMapMarker($areatext);
                $text.=$marker . PHP_EOL;
            }
            $map->addMarkers($text);
        }
    }

    public function centreMap($centreGroup) {
        $this->centreGroup = strtoupper($centreGroup);
    }

    public function setZoom($zoom) {
        $this->mapZoom = $zoom;
    }

    private function checkJsonProperties($item) {
        $properties = array("scope", "groupCode", "name", "url", "description", "latitude",
            "longitude");

        foreach ($properties as $value) {
            if (!$this->checkJsonProperty($item, $value)) {
                return 1;
            }
        }

        return 0;
    }

    private function checkJsonProperty($item, $property) {
        if (property_exists($item, $property)) {
            return true;
        }
        return false;
    }

    private function CacheLocation() {
        if (!defined('DS')) {
            define('DS', DIRECTORY_SEPARATOR);
        }
        return 'cache' . DS . 'ra_groups';
    }

}
