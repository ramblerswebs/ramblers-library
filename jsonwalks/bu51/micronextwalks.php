<?php

// no direct access
defined("_JEXEC") or die("Restricted access");

/**
 * RJsonwalksBU51Micronextwalks
 *
 * Subclass of RJsonwalksStdSimplelist for BU51 micro site
 * Displays upcoming walks with specified fields,
 * linking each entry to a detail page via walkid parameter.
 * Adds page parameter and link wrapper.
 */
class RJsonwalksBU51Micronextwalks extends RJsonwalksStdSimplelist {

    public $walksClass = "bu51-nextwalks";
    public $walkClass = "bu51-nextwalk";
    public $feedClass = "walksfeed"; // not used
    // Fields: date, time, title, startPC, nationalGrade, distance
    private $listFormat = [
        "{mediathumbl}", "{dowShortddmm}", " ", "{startTime}",
        "{,title}", "{,startPC}", "{,nationalGrade}", "{,distance}"
    ];
    // Number of walks to display
    private $nowalks = 5;
    // Detail page URL (e.g. 'walkdetail.php')
    protected $pageName = '/walks/our-walks';

    public function __construct() {
        if (!defined('RJW_NO_LEAFLET'))
            define('RJW_NO_LEAFLET', true);
        parent::__construct();
        // Apply custom field format
        $this->customFormat = $this->listFormat;
        // Load BU51 stylesheet
        // RLoad::addStyleSheet("media/lib_ramblers/jsonwalks/bu51/bu51style.css");
        // Disable grid refs and descriptions
        // $this->addGridRef = false;
        //$this->addStartGridRef = false;
        //$this->addDescription = false;
    }

    /**
     * Set the detail page for walk links
     * @param string $page
     */
    public function setPageName($page) {
        $this->pageName = $page;
    }

    /**
     * Set how many walks to retain
     * @param int $no
     */
    public function noWalks($no) {
        $this->nowalks = $no;
    }

    /**
     * Display walks: limit count, then call parent display, but wrap each line in a link
     */
    public function DisplayWalks($walks) {
        // Limit the collection
        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_TIME, RJsonwalksWalk::SORT_DISTANCE);
        $all = $walks->allWalks();
        $items = array_slice($all, 0, $this->nowalks);

        echo "<div class='" . $this->walksClass . "'>" . PHP_EOL;
        foreach ($items as $walk) {
            $id = $walk->getIntValue('admin', 'id');
            $text = $walk->getWalkValues($this->listFormat, false);
            $url = $this->pageName . '?walkid=' . $id . '#futurewalks';
            echo "<div class='" . $this->walkClass . " clear'><a href='" . $url . "'>" . $text . "</a></div>" . PHP_EOL;
        }
        echo "</div>" . PHP_EOL;
    }
}
