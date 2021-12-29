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
class RJsonwalksWalkStart {

    public $time;
    public $publish;
    public $location;

    public function __construct($time, $publish,  $location) {
        $this->time = $time;
        $this->publish = $publish;
        $this->location = $location;
    }

}
