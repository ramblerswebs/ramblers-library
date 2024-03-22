<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of item
 *
 * @author Chris Vaughan
 */
class RLeafletTableItem {

    public $name = "";
    public $sort = false;
    public $table = false;
    public $filter = false;
    public $popup = false;
    public $gridref = false;
    public $latitude = false;
    public $longitude = false;
 //   public $easting = false;
 //   public $northing = false;
    public $linkmarker = false;
    public $align = 'right';
    public $type = "text";
    public $jpclass = "";
    public $values = [];
    public $columnName = null; // used by sql option

    public function __construct($name) {
        $this->name = $name;
    }

    public function addValue($value) {
        $this->values[] = $value;
    }

    public function addOptions($value) {
        $options = explode(" ", $value);
        foreach ($options as $option) {
            switch (strtolower(trim($option))) {
                case "sort":
                    $this->sort = true;
                    break;
                case "table":
                    $this->table = true;
                    break;
                case "filter":
                    $this->filter = true;
                    break;
                case "popup":
                    $this->popup = true;
                    break;
                case "gridref":
                    $this->gridref = true;
                    break;
                case "latitude":
                    $this->latitude = true;
                    break;
                case "longitude":
                    $this->longitude = true;
                    break;
                case "easting":
 //                   $this->easting = true;
 //                   break;
                case "northing":
 //                   $this->northing = true;
                    break;
                case "int":
                case "integer":
                    $this->type = "number";
                    break;
                case "real":
                case "float":
                    $this->type = "number";
                    break;
                case "link":
                    $this->type = "link";
                    break;
                case "linkmarker":
                    $this->linkmarker = true;
                    break;
                case "left":
                    $this->align = 'left';
                    break;
                case "right":
                    $this->align = 'right';
                    break;
                case "centre":
                case "center":
                    $this->align = 'center';
                    break;
                case "":

                    break;
                default:
                    Echo "<p>Invalid options supplied:" . $option . "</p>";
            }
        }
    }
}
