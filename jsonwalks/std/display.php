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
    public $displayClass = "pantone7474white";
    public $paginationTop = true;
    public $paginationBottom = true;
    public $noPagination = false;
    public $displayDetailsPrompt = true;
    public $filterCancelled = true;
    private $map = null;
    public $jplistName = "display";

    public function DisplayWalks($walks) {
        if ($this->printOn) {
            echo "<p>Web master please disable this print option</p>";
            echo "<p>User: Please use the Print option next to the pagination controls</p>";
            return;
        }
        $items = $walks->allWalks();
        $document = JFactory::getDocument();
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
        $cancelledOutput = "";
        if ($number > 3) {
            echo "<div class='cancelledWalks' style='margin-bottom:10px;'>";
            echo "Sorry: We have had to cancel " . $number . " walks, full list at the bottom of the page.";
            echo "</div>";
            $cancelledOutput = $display->getWalksOutput($walks);
        } else {
            $display->DisplayWalks($walks);  // display cancelled walks information
        }
        $document->addScript("libraries/ramblers/jsonwalks/std/display.js", "text/javascript");
        $document->addScript("libraries/ramblers/vendors/jplist-es6-master/dist/1.2.0/jplist.min.js", "text/javascript");
        if ($this->filterCancelled) {
            $walks->filterCancelled();
        }
        $items = $walks->allWalks();
        $text = "ramblerswalks='" . addslashes(json_encode(array_values($items))) . "'";
        //  echo $text;
        $out = "window.addEventListener('load', function(event) {";
        $out .= "ramblerswalksDetails = new RamblersWalksDetails();";
        $out .= "ramblerswalksDetails.displayClass='" . $this->displayClass . "';";
        $out .= "ramblerswalksDetails.jplistName='" . $this->jplistName . "';";
        $out .= "ramblerswalksDetails.noPagination='" . $this->noPagination . "';";
        $out .= "ramblerswalksDetails.displayDetailsPrompt='" . $this->displayDetailsPrompt . "';";
        $out .= "DisplayLoad(); });function addContent() {" . $text . "};";
        $document->addScriptDeclaration($out, "text/javascript");
        echo "<div id='raouter'>";
        echo "<div id='raoptions' ></div>";
        echo "<div id='rainner'>";
        if ($this->paginationTop) {
            echo "<div id='rapagination-1' ></div>";
        } else {
            echo "<div id='rapagination-1' style='display:none' ></div>";
        }
        echo "<div id='rawalks' >Processing data - this should be replaced shortly.</div>";
        if ($this->paginationBottom) {
            echo "<div id='rapagination-2' ></div>";
        } else {
            echo "<div id='rapagination-2' style='display:none' ></div>";
        }

        $this->map = new RLeafletMap();
        $this->map->help_page = "ledwalks.html";
        $this->map->leafletLoad = false;
        $options = $this->map->options;
        $options->cluster = true;
        $options->displayElevation = false;
        $options->fullscreen = true;
        $options->search = true;
        $options->locationsearch = true;
        $options->osgrid = true;
        $options->mouseposition = true;
        $options->postcodes = true;
        $options->fitbounds = false;
        $options->print = true;
        echo "<div id='ra-map' >";
        $this->displayMap();
        echo "</div>";
        echo "</div></div>";
        if ($number > 3) {    // display cancelled walks if too many
            echo "<p style='height:20px;'></p>";
            echo $cancelledOutput;  // display cancelled walks information
        }
    }

    private function displayMap() {
        $legend = '<p><strong>Zoom</strong> in to see where our walks are going to be. <strong>Click</strong> on a walk to see details.</p>
<p><img src="libraries/ramblers/images/marker-start.png" alt="Walk start" height="26" width="16">&nbsp; Start locations&nbsp; <img src="libraries/ramblers/images/marker-cancelled.png" alt="Cancelled walk" height="26" width="16"> Cancelled walk&nbsp; <img src="libraries/ramblers/images/marker-area.png" alt="Walking area" height="26" width="16"> Walk in that area.</p>';
        if (isset($this->map)) {
            if (strpos($this->legendposition, "top") !== false) {
                echo $legend;
            }
            $this->map->display();
            if (strpos($this->legendposition, "bottom") !== false) {
                echo $legend;
            }
        }
        $this->addGotoWalk();
    }

    private function addGotoWalk() {
        if (array_key_exists("walk", $_GET)) {
            $walk = $_GET["walk"];
            if ($walk != null) {
                if (is_numeric($walk)) {
                    $add = "<script type=\"text/javascript\">window.onload = function () {
                gotoWalk($walk);};</script>";
                    echo $add;
                }
            }
        }
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
