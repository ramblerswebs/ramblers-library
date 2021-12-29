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
class RJsonwalksWalkAdmin {

    public $source;                 // GWEM, Walks Editor or Walks Manager
    public $id;                     // database ID of walk on Walks Finder
    public $groupCode;              // group code e.g. SR01
    public $groupName;              // the group name e.g. Derby & South Derbyshire
    public $dateUpdated;            // date of the walk as a datetime object
    public $dateCreated;            // date of the walk as a datetime object
    public $status="";                 // whether the walk is published, cancelled etc
    public $cancellationReason="";     // text reason walk cancelled
    public $displayUrl = "";    // url to access the ramblers.org.uk page for this walk

    
    
}