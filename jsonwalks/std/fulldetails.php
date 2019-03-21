<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdDisplay extends RJsonwalksDisplaybase {

    public $nationalGradeHelp = "";
    public $localGradeHelp = "";
    public $nationalGradeTarget = "_parent";
    public $localGradeTarget = "_parent";
    private $legendposition = "top";
    public $addContacttoHeader = false;
    public $displayGroup = null;  // should the Group name be displayed
    public $displayClass = "pantone7474white";
    private $walksClass = "walks";
    private $walkClass = "walk";
    private $map = null;

    public function DisplayWalks($walks) {
        if ($this->printOn) {
            echo "<p>Web master please disable this print option</p>";
            echo "<p>Use: Please use the Print option next to the pagination controls</p>";
            return;
        }
// echo "<span class='grade'>this some text <span class='grade easy'/> and some more";
// echo "<p>....  <span data-descr='Easy'><span class='grade easy middle' onclick='javascript:dGH()'></span></span><span> with a few</span></p>";
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
        $display->DisplayWalks($walks);  // display cancelled walks information
        $document->addScript("ramblers/jsonwalks/std/display.js", "text/javascript");
        $document->addScript("ramblers/vendors/jplist-es6-master/dist/1.2.0/jplist.min.js", "text/javascript");

        $text = "ramblerswalks='" . addslashes(json_encode($items)) . "'";
        //  echo $text;
        $out = "window.addEventListener('load', function(event) {
            ramblerswalksDetails = new RamblersWalksDetails();
            ramblerswalksDetails.displayClass='" . $this->displayClass . "';
    FullDetailsLoad();
  });
                function addContent() {" . $text . "};";
        $document->addScriptDeclaration($out, "text/javascript");
        echo "<div id='raprint' ></div>";
        echo "<div id='raoptions' ></div><p></p>";
        echo "<div id='rapagination-1' ></div>";
        echo "<div id='rawalks' >Page error - No walks</div>";
        echo "<div id='rapagination-2' ></div>";
        // send walks as json file
        // write json to display a number of them
        $this->map = new RLeafletMap();
        $this->map->help_page = "https://maphelp.ramblers-webs.org.uk/";
        $this->map->leafletLoad = false;
        $options = $this->map->options;
        $options->cluster = true;
        $options->displayElevation = true;
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
    }

    private function displayMap() {
        $legend = '<p><strong>Zoom</strong> in to see where our walks are going to be. <strong>Click</strong> on a walk to see details.</p>
<p><img src="ramblers/images/marker-start.png" alt="Walk start" height="26" width="16">&nbsp; Start locations&nbsp; <img src="ramblers/images/marker-cancelled.png" alt="Cancelled walk" height="26" width="16"> Cancelled walk&nbsp; <img src="ramblers/images/marker-area.png" alt="Walking area" height="26" width="16"> Walk in that area.</p>';
  
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
                $number+=1;
            }
        }
        return $number;
    }

}
