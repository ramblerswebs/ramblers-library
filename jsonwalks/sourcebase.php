<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of feedbase
 *
 * @author chris
 */
abstract class RJsonwalksSourcebase {
    
    protected $groups;
    protected $type;

    abstract protected function getWalks($walk);

    public function __construct($type, $groups) {
        $this->type = $type;
        $this->groups = $groups;
    }

    protected function CacheLocation() {
        if (!defined('DS')) {
            define('DS', DIRECTORY_SEPARATOR);
        }
        return 'cache' . DS . 'ra_feed';
    }
}

abstract class SourceOfWalk {

    const Unknown = '?';
    const GWEM = 'gwem';
    const WManager = 'wm';
    const WEditor = 'we';

}
