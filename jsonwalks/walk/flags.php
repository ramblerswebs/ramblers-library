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
class RJsonwalksWalkFlags {

    public $items = [];       // is an array of flags describing the walk

    public function addGWEMFlags($section, $values) {
        if (property_exists($values, "items")) {
            foreach ($values->items as $value) {
                $flag = new RJsonwalksWalkFlag();
                $flag->section = $section;
                $flag->code = '';
                $flag->name = $value->text;
                $this->items[] = $flag;
            }    
        }
    }

    public function addWalksEditorFlags($section, $values) {
        foreach ($values as $value) {
            $flag = new RJsonwalksWalkFlag();
            $flag->section = $section;
            $flag->code = '';
            $flag->name = $value->name;
            $this->items[] = $flag;
        }
    }

}
