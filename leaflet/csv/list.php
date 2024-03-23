<?php

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
            $app = JFactory::getApplication();
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
        $this->options->settings = true;
        $this->options->mylocation = true;
        $this->options->rightclick = true;
        $this->options->fitbounds = true;
        $this->options->print = true;

        $data = new class {
            
        };
        $data->list = $this->list;
        $data->paginationDefault = $this->paginationDefault;

        parent::setCommand('ra.display.tableList.display');
        parent::setDataObject($data);
        parent::display();
        RLoad::addScript("media/lib_ramblers/leaflet/table/ramblerstable.js", "text/javascript");
        RLoad::addStyleSheet("media/lib_ramblers/leaflet/table/style.css", "text/css");
        RLoad::addStyleSheet('media/lib_ramblers/css/ramblerslibrary.css');

        RLoad::addScript("media/lib_ramblers/vendors/jplist-es6-master/dist/1.2.0/jplist.min.js", "text/javascript");
        //   <!-- IE 10+ / Edge support via babel-polyfill: https://babeljs.io/docs/en/babel-polyfill/ --> 
        RLoad::addScript("https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.12.1a/polyfill.min.js", "text/javascript");
    }

    private function readCSV() {
        $row = 1;
        $item = null;
        $this->list = new RLeafletTableItems();
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
                        $item = new RLeafletTableItem($value);
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
