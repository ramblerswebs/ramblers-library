<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of RJsonwalksDisplaybase
 *
 * @author Chris Vaughan
 */
abstract class RJsonwalksDisplaybase {

    protected $displayStartTime = false;
    protected $displayStartDescription = false;
    protected $printOn = false;
    protected $displayGrade = true;

    abstract protected function DisplayWalks($walks);

    public function __construct() {
        $this->printOn = JRequest::getVar('print') == 1;
    }

    public function alwaysDisplayStartTime($value) {
        $this->displayStartTime = $value;
    }

    public function alwaysDisplayStartDescription($value) {
        $this->displayStartDescription = $value;
    }

    public function displayGrade($value) {
        $this->displayGrade = $value;
    }

}
