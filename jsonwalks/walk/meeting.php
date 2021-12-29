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
class RJsonwalksWalkMeeting {
   
    public $location;
    public $time;
    Public $travel="";
    
    public function __construct($time, $travel,$location) {
        $this->time=$time;
        $this->travel=$travel;
        $this->location=$location;
    }

}
