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

    public function addMapMarker($areatext) {

        $title = str_replace("'", "", $this->name);
        $text = "Unknown group";
        $long = $this->longitude;
        $lat = $this->latitude;
        $url = $this->url;
        switch ($this->scope) {
            case "A":
                $icon = "walkingarea";
                $text = "Ramblers Area";
                break;
            case "G":
                $icon = "walkinggroup";
                $text = $areatext."Group [".$this->code."]";
                break;
            default:
                $icon = "walkingspecial";
                $text = $areatext."Special Group [".$this->code."]";
                break;
        }
        $class = "group" . $this->scope;
        $popup = "<div class='" . $class . "'>" . $text . "<br/><a href='" . $url . "' target='_blank'>" .  $title .  "</a></div>";
        $marker = "addMarker(\"" . $popup . "\", " . $lat . ", " . $long . ", " . $icon . ");";

        return $marker;
    }

}
