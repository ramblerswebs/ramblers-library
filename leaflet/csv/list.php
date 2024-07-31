<?php

/**
 * Description of list
 *
 * @author Chris Vaughan
 */
class RLeafletCsvList extends RLeafletMap {

    private $filename = "";
    private $list;
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
        RLoad::addScript("https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.12.1/polyfill.min.js", "text/javascript");
    }

    private function readCSV() {
        $row = 1;
        $column = null;
        $this->list = new RLeafletTableColumns();
        if (($handle = fopen($this->filename, "r")) !== FALSE) {
            while (($data = fgetcsv($handle, null, ",")) !== FALSE) {
                $num = count($data);
                for ($col = 0; $col < $num; $col++) {
                    $value = $data[$col];
                    if ($row === 1) {
                        $column = new RLeafletTableColumn($value);
                        $this->list->addColumn($column);
                    } else {
                        $column = $this->list->getColumn($col);
                        if ($column == null) {
                            echo "<p>Column " . $col . " has no header title</p>";
                        } else {
                            if ($row == 2) {
                                $column->addOptions($value);
                            } else {
                                $column->addValue($value);
                            }
                        }
                    }
                }

                $row++;
            }
            fclose($handle);
            $this->list->removeIgnoredColumns();
        } else {
            return false;
        }
        return true;
    }
}
