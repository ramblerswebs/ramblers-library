<?php

/**
 * Description of jsonlogfile
 *
 * @author Chris Vaughan
 */
class RGpxJsonlog {

    private $file;
    private $items;
    private $items_processed;

    public function __construct($file) {
        $this->file = $file;
        if (file_exists($file)) {
            $string = file_get_contents($file);
        } else {
            $string = false;
        }

        if ($string === false) {
            $this->items = [];
        } else {
            $this->items = json_decode($string, true);
            if ($this->items === null) {
                // error
                $this->items = [];
            }
        }
        $this->items_processed = false;
    }

    public function addItem($name, $item) {
        $this->items[] = $item;
        $this->items_processed = true;
    }

        Public function storeItems() {
        if ($this->items_processed) {
          //  $myJSON = json_encode($this->items, JSON_PRETTY_PRINT);
            $myJSON = json_encode($this->items);
            //echo $myJSON;
            file_put_contents($this->file, $myJSON);
        }
    }

}
