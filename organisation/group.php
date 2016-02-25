<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of area
 *
 * @author Chris
 */
class ROrganisationGroup {

    public $scope;
    public $code;
    public $name;
    public $url;
    public $description;
    public $latitude;
    public $longitude;
    public $markerClass = "group";

    public function __construct($item) {
        $this->scope = $item->scope;
        $this->code = $item->groupCode;
        $this->name = $item->name;
        $this->url = $item->url;
        $this->description = $item->description;
        $this->latitude = $item->latitude;
        $this->longitude = $item->longitude;
    }

    public function getLink($showLink) {
        if ($showLink) {
            return "<a href='" . $this->url . "' target='_blank' >" . $this->name . "</a>";
        } else {
            return $this->name;
        }
    }

    public function addMapMarker() {

        $title = str_replace("'", "", $this->name);
        if ($title <> $this->name) {
            $a = 1;
        }
        $long = $this->longitude;
        $lat = $this->latitude;
        $url = $this->url;
        switch ($this->scope) {
            case "A":
                $icon = "walkingarea";
                break;
            case "G":
                $icon = "walkinggroup";
                break;
            default:
                $icon = "walkingspecial";
                break;
        }
        $marker = "addGroup(markerList,'" . $this->markerClass . $this->scope . "', '" . $title . "', " . $lat . ", " . $long . ", '" . $url . "', " . $icon . ");";

        return $marker;
    }

}
