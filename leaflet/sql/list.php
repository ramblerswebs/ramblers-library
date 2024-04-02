<?php

/**
 * Description of list
 *
 * @author Chris Vaughan
 */
class RLeafletSqlList extends RLeafletMap {

    private $tableName = "";
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
        $this->list = new RLeafletTableColumns();
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
            $column= new RLeafletTableColumn($option["heading"]);
            $this->list->addColumn($column);
            $column->addOptions($option["options"]);
            $column->columnName = $option["column"];
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
            $columns = $this->list->getColumns();
            foreach ($columns as $column) {
                if (property_exists($row, $column->columnName)) {
                    $col = $column->columnName;
                    $value = $row->$col;
                    $column->addValue($value);
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
}
