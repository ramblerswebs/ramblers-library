<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of list
 *
 * @author Chris Vaughan
 */
class RLeafletCsvList extends RLeafletMap {

    private $filename = "";
    private $list;

    public function __construct($filename) {
        parent::__construct();
        $this->filename = $filename;
    }

    public function display() {
        $this->readCSV();
        $list = json_encode($this->list);

        $this->addMapScript($list);
        $this->help_page = "https://maphelp.ramblers-webs.org.uk/list-of-walking-routes.html";
        $this->options->cluster = true;
        $this->options->displayElevation = false;
        $this->options->fullscreen = true;
        $this->options->filter = true;
        $this->options->locationsearch = true;
        $this->options->osgrid = true;
        $this->options->mouseposition = true;
        $this->options->postcodes = true;
        $this->options->fitbounds = true;
        $this->options->print = true;
        //    RLicense::BingMapKey(false);

        echo "<table id='gpxoptions' ><tr><td class='ra-tab' id='Map' style='display:none;' onclick=\"javascript:ra_format('Map')\">Map</td><td class='ra-tab active' id='List' onclick=\"javascript:ra_format('List')\">List</td></tr></table>";
        echo "<div id='gpxouter' >";
        echo "<div id='csvmap' style='display:none;'>";
        echo "<p> </p>";
        //echo "<div id = \"gpxheader\" ><h4>Click on any walk to display route</h4></div>";
        $text = " ramblersCsvList =new RamblersCsvList; addCsvItems();";
        $text .= "displayCsvData();";
        parent::addContent($text);
        parent::display();
        $document = JFactory::getDocument();
        $document->addScript("ramblers/leaflet/csv/ramblerscsvlist.js", "text/javascript");
        $document->addStyleSheet("ramblers/leaflet/csv/csvlist.css", "text/css");
        //     $document->addStyleSheet('ramblers/jsonwalks/css/ramblerswalks.css');
        $document->addScript("ramblers/vendors/jplist-es6-master/dist/1.2.0/jplist.min.js", "text/javascript");
        //   <!-- IE 10+ / Edge support via babel-polyfill: https://babeljs.io/docs/en/babel-polyfill/ --> 
        $document->addScript("https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.26.0/polyfill.min.js", "text/javascript");

        echo "<br/>";
        echo "<div id='csvRecord'></div>";
        echo "</div>";
        echo "<div id='csvlist' >";

        echo "<div id='ra-pagination1'></div>";

        echo "<div id=\"dataTab\">Program error if this does not vanish!</div>";
        echo "</div>";
        echo "</div>";


        $a = 1;
    }

    private function readCSV() {
        $row = 1;
        $item = null;
        $this->list = new RLeafletCsvItems();
        echo "<table>";
        if (($handle = fopen($this->filename, "r")) !== FALSE) {
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                $num = count($data);
                if ($row == 1) {
                    //            echo RHtml::addTableHeader($data);
                } else {
                    //            echo RHtml::addTableRow($data);
                }

                for ($col = 0; $col < $num; $col++) {
                    $value = $data[$col];
                    if ($row == 1) {
                        $item = new RLeafletCsvItem($value);
                        $this->list->addItem($item);
                    } else {
                        $item = $this->list->getItem($col);
                        if ($item == null) {
                            echo "<p>Column " . $col . " has no header title</p>";
                        } else {
                            if ($row == 2) {
                                $item->addOptions($value);
                            } else {
                                $item->addValue($value);
                            }
                        }
                    }
                }

                $row++;
            }
            if ($item != null) {
                $this->list->rows = count($item->values);
            }

            //      echo "</table>";
        }
        fclose($handle);
    }

    private function addMapScript($list) {
        $script = "function addCsvItems() {"
                . "ramblersCsvList.list=" . $list . ";}";
        $document = JFactory::getDocument();
        $document->addScriptDeclaration($script, "text/javascript");
    }

}
