<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
use Joomla\CMS\Component\ComponentHelper;
use \Ramblers\Component\Ra_eventbooking\Site\Helper\Ra_eventbookingHelper;

// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdDisplay extends RJsonwalksDisplaybase {

    public $nationalGradeHelp = ""; // not used
    public $localGradeHelp = ""; // not used
    public $nationalGradeTarget = "_parent"; // not used
    public $localGradeTarget = "_parent"; // not used
    public $legendposition = "top";
    public $addContacttoHeader = false;  // not used
    public $displayGroup = null;  // should the Group name be displayed
    public $displayClass = "";
    public $paginationTop = true;
    public $paginationBottom = true;
    public $noPagination = false;
    public $displayDetailsPrompt = true;
    public $filterCancelled = true;
    private $map = null;
    private $id;
    private $customListFormat = null;
    private $customTableFormat = null;
    private $customGradesFormat = null;
    private $customCalendarFormat = null;
    private $customTabOrder = null;

    public function DisplayWalks($walks) {

        $this->id = uniqid(rand());
        $this->map = new RLeafletMap();
        $this->map->setCommand("ra.display.walksTabs");
        $this->map->help_page = "ledwalks.html";
        $this->map->leafletLoad = false;
        $options = $this->map->options;
        $options->cluster = true;
        $options->displayElevation = false;
        $options->mouseposition = true;
        $options->postcodes = true;
        $options->fitbounds = false;
        $options->settings = true;
        $options->rightclick = true;
        $options->calendar = true;
        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_TIME, RJsonwalksWalk::SORT_DISTANCE);

        $items = $walks->allWalks();
        $display = new RJsonwalksStdCancelledwalks();
        $number = $this->noCancelledWalks($items);
        if ($number > 3) {
            echo "<div class='cancelledWalks' style='margin-bottom:10px;'>";
            echo "Sorry: We have had to cancel " . $number . " walks.";
            echo "</div>";
        } else {
            $display->DisplayWalks($walks);  // display cancelled walks information
        }
        $data = new class {
            
        };
        $data->walks = array_values($items);

//  $data->walks = [];
        $data->displayClass = $this->displayClass;
        $data->noPagination = $this->noPagination;
        $data->displayDetailsPrompt = $this->displayDetailsPrompt;
        $data->legendposition = $this->legendposition;
        $data->customGradesFormat = $this->customGradesFormat;
        $data->customCalendarFormat = $this->customCalendarFormat;
        $data->customListFormat = $this->customListFormat;
        $data->customTableFormat = $this->customTableFormat;
        $data->customTabOrder = $this->customTabOrder;
        $data->displayBookingsTable = false;
        if (ComponentHelper::isEnabled('com_ra_eventbooking')) {
            $data->displayBookingsTable = Ra_eventbookingHelper::canEdit();
        }

        $this->map->setDataObject($data);
        $this->map->display();
        RLoad::addScript("media/lib_ramblers/jsonwalks/std/display.js");
        RLoad::addScript("media/lib_ramblers/vendors/cvList/cvList.js");
        RLoad::addStyleSheet("media/lib_ramblers/vendors/cvList/cvList.css");
        RLoad::addScript("media/lib_ramblers/js/ra.tabs.js");
        RLoad::addStyleSheet("media/lib_ramblers/css/ra.tabs.css");
        $schema = new RJsonwalksAddschema();
        $schema->display($walks);
    }

    public function setWalksClass($value) {
        $this->displayClass = $value;
    }

    public function setTabOrder($value) {
        $this->customTabOrder = $value;
    }

    public function setCustomListFormat($value) {
        $this->customListFormat = $value;
    }

    public function setCustomTableFormat($value) {
        $this->customTableFormat = $value;
    }

    public function setCustomGradesFormat($value) {
        $this->customGradesFormat = $value;
    }

    public function setCustomCalendarFormat($value) {
        $this->customCalendarFormat = $value;
    }

    private function addGotoWalk() {
        // no longer used
    }

    private function noCancelledWalks($walks) {
        $number = 0;
        foreach ($walks as $walk) {
            if ($walk->isCancelled()) {
                $number += 1;
            }
        }
        return $number;
    }
}
