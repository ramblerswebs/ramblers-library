<?php

/**
 * Description of WalksDisplay
 *
 * @author Paul Rhodes
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksBU51Tabs extends RJsonwalksStdDisplay {

    public $feedClass = "walksfeed"; // not used?
    public $tabOrder = ['List', 'Calendar', 'Map'];
    public $listFormat = ['{gradeimg}', '{title}', '{lf}',
        '{dowdd}', '{[ meet at ]meetTime}', '{[ start at ]startTime}', '{[ estimated finish at ]finishTime}',
        '{,distance}', '{,nationalGrade}', '{,shape}', '{ walk}'];

    public function __construct() {
        parent::__construct();
        parent::setTabOrder($this->tabOrder);
        parent::setCustomListFormat($this->listFormat);
        RLoad::addStyleSheet("media/lib_ramblers/jsonwalks/bu51/bu51style.css");
    }

    public function DisplayWalks($walks) {
        parent::DisplayWalks($walks);
    }
}
