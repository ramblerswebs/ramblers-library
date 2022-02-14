<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
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
    public $jplistName = "display";
    private $id;
    private $customListFormat = null;
    private $customTableFormat = null;
    private $customGradesFormat = null;
    private $customCalendarFormat = null;
    private $customTabOrder = null;

    public function DisplayWalks($walks) {
        //  $tabOrder = ['Grades', 'Table', 'List', 'Map'];
        //   $this->setTabOrder($tabOrder);

        $this->id = uniqid(rand());
        if ($this->printOn) {
             echo "<p>User: Please use the Print option next to the pagination controls</p>";
             echo "<p></p>";
             echo "<p>Web master please disable this print option</p>";
          return;
        }
        $this->map = new RLeafletMap();
        $this->map->setCommand("ra.display.walksTabs");
        $this->map->help_page = "ledwalks.html";
        $this->map->leafletLoad = false;
        $options = $this->map->options;
        $options->cluster = true;
        $options->displayElevation = false;
        $options->fullscreen = true;
        $options->search = true;
        $options->locationsearch = true;
        $options->mylocation = true;
        $options->osgrid = true;
        $options->mouseposition = true;
        $options->postcodes = true;
        $options->fitbounds = false;
        $options->copyright = true;
        $options->maptools = true;
        $options->rightclick = true;
        $options->print = true;
        $options->calendar = true;
        //  $this->map->addScriptsandStyles($options);

        $items = $walks->allWalks();
        $display = new RJsonwalksStdCancelledwalks();
        $number = $this->noCancelledWalks($items);

// Display anyway
        $diagnostics = 0;
        if ($diagnostics == 1) {
            echo '<div class="cancelledWalks">';
            echo "<h3>Cancelled walks - Diagnostics</h3>";
            echo "<h4>Number of cancelled walks: " . $number . "</h4>";
            echo '</div><p></p>';
        }
        //     $cancelledOutput = "";
        if ($number > 3) {
            echo "<div class='cancelledWalks' style='margin-bottom:10px;'>";
            //           echo "Sorry: We have had to cancel " . $number . " walks, full list at the bottom of the page.";
            echo "Sorry: We have had to cancel " . $number . " walks.";
            echo "</div>";
            //      $cancelledOutput = $display->getWalksOutput($walks);
        } else {
            $display->DisplayWalks($walks);  // display cancelled walks information
        }
        $data = new class {
            
        };
        $data->walks = array_values($items);
        //  $data->walks = [];
        $data->displayClass = $this->displayClass;
        $data->jplistName = $this->jplistName;
        $data->noPagination = $this->noPagination;
        $data->displayDetailsPrompt = $this->displayDetailsPrompt;
        $data->legendposition = $this->legendposition;
        $data->customGradesFormat = $this->customGradesFormat;
        $data->customCalendarFormat = $this->customCalendarFormat;
        $data->customListFormat = $this->customListFormat;
        $data->customTableFormat = $this->customTableFormat;
        $data->customTabOrder = $this->customTabOrder;

        $this->map->setDataObject($data);
        $this->map->display();
        RLoad::addScript("libraries/ramblers/jsonwalks/std/display.js", "text/javascript");
        $document = JFactory::getDocument();
        $document->addScript("libraries/ramblers/vendors/jplist-es6-master/dist/1.2.0/jplist.min.js", "text/javascript");
        $document->addScript("libraries/ramblers/vendors/FileSaver-js-1.3.8/src/FileSaver.js", "text/javascript");
        $schema = new RJsonwalksAddschema();
        $schema->display($walks);
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
