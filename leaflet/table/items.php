<?php

/**
 * Description of items
 *
 * @author Chris Vaughan
 */
class RLeafletTableItems implements JsonSerializable {

    private $items = [];
    private $displayMap = false;
    private $paginateList = true;

    public function __construct() {
        
    }

    public function addItem($item) {
        $this->items[] = $item;
        $item->setJpClass("var" . count($this->items));
    }

    public function getItem($no) {
        if (array_key_exists($no, $this->items)) {
            return $this->items[$no];
        } else {
            return null;
        }
    }

    public function getItems() {
        return $this->items;
    }

    public function jsonSerialize(): mixed {
        return [
            'items' => $this->items,
            'displayMap' => $this->displayMap,
            'paginateList' => $this->paginateList
        ];
    }
}
