<?php

/**
 * Description of WalksDisplay
 *
 * @author Paul Rhodes
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksBU51Groupstabs extends RJsonwalksStdDisplay {

    public $walkClass = "bu51Nextwalk";
    public $feedClass = "walksfeed"; // not used?
    public $tabOrder = ['List', 'Map'];
    public $listFormat = ['{gradeimg}', '{group}', '{,title}', '{lf}',
        '{dowdd}', '{[ meet at ]meetTime}', '{[ start at ]startTime}', '{[ estimated finish at ]finishTime}',
        '{,distance}', '{,nationalGrade}','{,type}','{ walk}'];

    public function __construct() {
        parent::__construct();
        
        parent::setTabOrder($this->tabOrder);
        parent::setCustomListFormat($this->listFormat);
   //     parent::setWalksClass($this->walkClass);
        RLoad::addStyleSheet("media/lib_ramblers/jsonwalks/bu51/bu51style.css", "text/css");
    }

    public function DisplayWalks($walks) {
        parent::DisplayWalks($walks);
    }

}
