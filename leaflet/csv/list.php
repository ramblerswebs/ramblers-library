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
    private $diagnostic = false;
    public $paginationDefault = 10;

    public function __construct($filename) {
        parent::__construct();
        $this->filename = $filename;
    }

    public function display() {
        $ok = $this->readCSV();
        If (!$ok) {
            $app = JApplicationCms::getInstance('site');
            $app->enqueueMessage(JText::_("Unable to open/process the file: " . $this->filename), 'error');
            return;
        }

        $this->help_page = "listofitemsm.html";
        $this->options->cluster = true;
        $this->options->fullscreen = true;
        $this->options->filter = true;
        $this->options->locationsearch = true;
        $this->options->osgrid = true;
        $this->options->mouseposition = true;
        $this->options->maptools = true;
        $this->options->mylocation = true;
        $this->options->rightclick = true;
        $this->options->fitbounds = true;
        $this->options->print = true;

        $data = new class {
            
        };
        $data->list = $this->list;
        $data->paginationDefault = $this->paginationDefault;

        parent::setCommand('ra.display.csvList.display');
        parent::setDataObject($data);
        parent::display();
        RLoad::addScript("libraries/ramblers/leaflet/csv/ramblerscsvlist.js", "text/javascript");
        RLoad::addStyleSheet("libraries/ramblers/leaflet/csv/csvlist.css", "text/css");
        RLoad::addStyleSheet('libraries/ramblers/jsonwalks/css/ramblerslibrary.css');

        $document = JFactory::getDocument();
        $document->addScript("libraries/ramblers/vendors/jplist-es6-master/dist/1.2.0/jplist.min.js", "text/javascript");
        //   <!-- IE 10+ / Edge support via babel-polyfill: https://babeljs.io/docs/en/babel-polyfill/ --> 
        $document->addScript("https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.12.1a/polyfill.min.js", "text/javascript");
    }

    private function readCSV() {
        $row = 1;
        $item = null;
        $this->list = new RLeafletCsvItems();
        if (($handle = fopen($this->filename, "r")) !== FALSE) {
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                $num = count($data);
                if ($this->diagnostic) {
                    if ($row === 1) {
                        echo "<table>";
                        echo RHtml::addTableHeader($data);
                    } else {
                        echo RHtml::addTableRow($data);
                    }
                }
                for ($col = 0; $col < $num; $col++) {
                    $value = $data[$col];
                    if ($row === 1) {
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
            if ($this->diagnostic) {
                echo "</table>";
            }
        } else {
            return false;
        }
        fclose($handle);
        return true;
    }

}
