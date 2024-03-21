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
class RLeafletSqlList extends RLeafletMap {

    private $tableName = "";
    private $diagnostic = false;
    private $validOptions = false;
    private $list = null;
    private $fields = [];
    public $paginationDefault = 10;

    public function __construct($tableName) {
        parent::__construct();
        $this->tableName = $tableName;
    }

    public function setOptions($options) {
        if (!is_array($options)) {
            echo "ERROR: RLeafletSqlList options  must be an array";
            return;
        }
        $this->list = new RLeafletCsvItems();
        foreach ($options as $option) {
            if (!array_key_exists("heading", $option)) {
                echo "ERROR: RLeafletSqlList options  does not contain heading field";
                return;
            }
            if (!array_key_exists("column", $option)) {
                echo "ERROR: RLeafletSqlList options  does not contain column field";
                return;
            }
            if (!array_key_exists("options", $option)) {
                echo "ERROR: RLeafletSqlList options  does not contain options field";
                return;
            }
            $item = new RLeafletCsvItem($option["heading"]);
            $this->list->addItem($item);
            $item->addOptions($option["options"]);
            $item->columnName = $option["column"];
            $this->fields[] = $option["column"];
        }
        $this->validOptions = true;
    }

    public function display() {
        If (!$this->validOptions) {
            $app = JFactory::getApplication();
            $app->enqueueMessage(JText::_("RLeafletSqlList options are invalid"), 'error');
            return;
        }
        $result = $this->readSql();
        If (!$result) {
            $app = JFactory::getApplication();
            $app->enqueueMessage(JText::_("Unable to process the sql table "), 'error');
            return;
        }
        foreach ($result as $row) {
            $items = $this->list->getItems();
            foreach ($items as $item) {
                $a = 1;
                if (property_exists($row, $item->columnName)) {
                    $col = $item->columnName;
                    $value = $row->$col;
                    $item->addValue($value);
                }
            }
        }

        $this->help_page = "listofitemsm.html";
        $this->options->cluster = true;
        $this->options->fullscreen = true;
        $this->options->filter = true;
        $this->options->locationsearch = true;
        $this->options->osgrid = true;
        $this->options->mouseposition = true;
        $this->options->settings = true;
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
        RLoad::addScript("media/lib_ramblers/leaflet/csv/ramblerscsvlist.js", "text/javascript");
        RLoad::addStyleSheet("media/lib_ramblers/leaflet/csv/csvlist.css", "text/css");
        RLoad::addStyleSheet('media/lib_ramblers/css/ramblerslibrary.css');

        RLoad::addScript("media/lib_ramblers/vendors/jplist-es6-master/dist/1.2.0/jplist.min.js", "text/javascript");
        //   <!-- IE 10+ / Edge support via babel-polyfill: https://babeljs.io/docs/en/babel-polyfill/ --> 
        RLoad::addScript("https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.12.1a/polyfill.min.js", "text/javascript");
    }

    private function readSql() {
        // Get a db connection.
        $db = \JFactory::getDbo();
        // Create a new query object.
        $query = $db->getQuery(true);
        $query->select($db->quoteName($this->fields));
        $query->from($db->quoteName($this->tableName));
        //   $query->where($db->quoteName('status') . " = " . "'Published'", 'OR');
        //   $query->where($db->quoteName('status') . " = " . "'Cancelled'");
        //   $query->order('ordering ASC');
        // Reset the query using our newly populated query object.
        $db->setQuery($query);
        $results = $db->loadObjectList();
        return $results;
    }

    private function readDisplayOptions() {
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

//   private function readCSV() {
//        $row = 1;
//        $item = null;
//        $this->list = new RLeafletCsvItems();
//        if (($handle = fopen($this->filename, "r")) !== FALSE) {
//            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
//                $num = count($data);
//                if ($this->diagnostic) {
//                    if ($row === 1) {
//                        echo "<table>";
//                        echo RHtml::addTableHeader($data);
//                    } else {
//                        echo RHtml::addTableRow($data);
//                    }
//                }
//                for ($col = 0; $col < $num; $col++) {
//                    $value = $data[$col];
//                    if ($row === 1) {
//                        $item = new RLeafletCsvItem($value);
//                        $this->list->addItem($item);
//                    } else {
//                        $item = $this->list->getItem($col);
//                        if ($item == null) {
//                            echo "<p>Column " . $col . " has no header title</p>";
//                        } else {
//                            if ($row == 2) {
//                                $item->addOptions($value);
//                            } else {
//                                $item->addValue($value);
//                            }
//                        }
//                    }
//                }
//
//                $row++;
//            }
//            if ($item != null) {
//                $this->list->rows = count($item->values);
//            }
//            if ($this->diagnostic) {
//                echo "</table>";
//            }
//        } else {
//            return false;
//        }
//        fclose($handle);
//        return true;
//    }
}
