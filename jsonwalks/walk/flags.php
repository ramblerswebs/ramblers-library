<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of basics
 *
 * @author chris
 */
class RJsonwalksWalkFlags implements JsonSerializable {

    private $items = [];       // is an array of RJsonwalksWalkFlag describing the walk

    public function addWalksEditorFlags($section, $values) {
        foreach ($values as $value) {
            $flag = new RJsonwalksWalkFlag($section, "", $value->name);
            $this->items[] = $flag;
        }
    }

    public function addWalksManagerFlags($section, $values) {
        if ($values === null) {
            return;
        }
        foreach ($values as $value) {
            $flag = new RJsonwalksWalkFlag($section, $value->code, $value->description);
            $this->items[] = $flag;
        }
    }

    public function flagExists($flag) {
        $result = false;
        foreach ($this->items as $item) {
            if ($item->isFlag(($flag))) {
                $result = true;
            }
        }
        return $result;
    }
    
    public function jsonSerialize(): mixed {
        return $this->items;
    }

}
