<?php

// no direct access
defined('_JEXEC') or die('Restricted access');
/**
 * Description of items
 *
 * @author Chris Vaughan
 */
class RJsonwalksItem {
    //put your code here
    Private $name;
     function __construct($value) {

         $this->name=$value->text;
     }
     public function getName(){
         return $this->name;
     }
}
