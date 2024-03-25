<?php

/**
 * Description of item
 *
 * @author Chris Vaughan
 */
class RLeafletTableItem implements JsonSerializable {

    private $name = "";
    private $sort = false;
    private $table = false;
    private $filter = false;
    private $popup = false;
    private $gridref = false;
    private $latitude = false;
    private $longitude = false;
    //   public $easting = false;
    //   public $northing = false;
    private $linkmarker = false;
    private $align = 'right';
    private $type = "text";
    private $jpclass = "";
    private $values = [];
    public $columnName = null; // used by sql option

    public function __construct($name) {
        $this->name = $name;
    }
    public function setJpClass($value){
        $this->jpclass=$value;
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

    public function jsonSerialize(): mixed {
        return [
            'name' => $this->name,
            'sort' => $this->sort,
            'table' => $this->table,
            'filter' => $this->filter,
            'popup' => $this->popup,
            'gridref' => $this->gridref,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'linkmarker' => $this->linkmarker,
            'align' => $this->align,
            'type' => $this->type,
            'jpclass' => $this->jpclass,
            'values' => $this->values
        ];
    }
}
