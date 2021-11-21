<?php

/**
 * Description of WalksDisplay
 *
 * @author Paul Rhodes
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksBU51Tabs extends RJsonwalksStdDisplay {

    public $walkClass = "bu51Nextwalk";
    public $feedClass = "walksfeed"; // not used?
    public $tabOrder = ['List', 'Calendar', 'Map'];
    public $listFormat = ['{gradeimg}', '{title}', '{lf}',
        '{dowddmmyyyy}', '{[ meet at ]meetTime}', '{[ start at ]startTime}', '{[ estimated finish at ]finishTime}',
        '{,distance}', '{,nationalGrade}','{,type}','{ walk}'];

    public function __construct() {
        parent::__construct();
        
        parent::setTabOrder($this->tabOrder);
        parent::setCustomListFormat($this->listFormat);
   //     parent::setWalksClass($this->walkClass);
        RLoad::addStyleSheet("libraries/ramblers/jsonwalks/bu51/bu51style.css", "text/css");
    }

    public function DisplayWalks($walks) {
        parent::DisplayWalks($walks);
    }

}
