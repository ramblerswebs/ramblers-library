<?php

/**
 * Description of Columns
 *
 * @author Chris Vaughan
 */
class RLeafletTableColumns implements JsonSerializable {

    private $columns = [];
    private $displayMap = false;
    private $paginateList = true;

    public function __construct() {
        
    }

    public function addColumn($column) {
        $this->columns[] = $column;
        $column->setJpClass("var" . count($this->columns));
    }

    public function getColumn($no) {
        if (array_key_exists($no, $this->columns)) {
            return $this->columns[$no];
        } else {
            return null;
        }
    }

    public function getColumns() {
        return $this->columns;
    }

    public function jsonSerialize(): mixed {
        return [
            'items' => $this->columns,
            'displayMap' => $this->displayMap,
            'paginateList' => $this->paginateList
        ];
    }
}
