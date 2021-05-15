<?php

/**
 * Description of RJsonwalksStdWalktable3col
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksSr02Table2 extends RJsonwalksStdWalktable {

    private $tableFormat = [
        ['title' => 'Date/Time', 'items' => ["{dowddmm}", "{;startTime}"]],
        ['title' => 'Leader/Contact', 'items' => ["{xContact}", "{;telephone1}", "{;telephone2}"]],
        ['title' => 'Details', 'items' => ["{title}", "{;description}", "{lf}", "{Grid Ref: }", "{startGR}", "{ Postcode: }", "{startPC}", "{;additionalNotes}"]],
        ['title' => 'Distance', 'items' => ["{distance}", "{;xNationalGrade}", "{xSymbol}"]]
    ];

    public function __construct() {
        parent::__construct();
        parent::customFormat($this->tableFormat);
        parent::setRowClass($this, 'rowClass');
        RJsonwalksWalk::setCustomValues($this, "customValue");
        $document = JFactory::getDocument();
        $document->addStyleSheet("libraries/ramblers/jsonwalks/sr02/style.css");
        parent::setWalksClass("sr02prog");
    }

    public function customValue($option, $walk) {
        $response = new stdClass();
        $response->found = true;
        $response->out = "";
        switch ($option) {
            case "{xSymbol}":
                /* Picnic or Pub icon */
                if (stristr($walk->additionalNotes, "picnic")) {
                    $response->out = '<img src="libraries/ramblers/jsonwalks/sr02/Sandwich-icon.png" title="Picnic Required" width="24" height="24" align="left"/>';
                    break;
                }
                if (stristr($walk->additionalNotes, "pub")) {
                    $response->out = '<img src="libraries/ramblers/jsonwalks/sr02/beer.png" title="Pub Lunch" width="24" height="24" align="left"/>';
                }
                break;
            case "{xNationalGrade}":
                $response->out = strtoupper($walk->nationalGrade);
                break;
            case "{xContact}":
                $response->out = "<b>" . $walk->contactName . "</b>";
                break;
            default:
                $response->found = false;
                break;
        }

        return $response;
    }

    public function rowClass($walk) {
        $class = "leisurely";
        $day = $walk->walkDate->format('l');
        if (($walk->isLinear) && ($day == "Wednesday")) {
            $class = "sr02linear";
        } else {
            switch ($walk->nationalGrade) {
                case "Easy" :
                    $class = "sr02easy";
                    break;
                case "Leisurely" :
                    $class = "sr02leisurely";
                    break;
                case "Moderate" :
                    $class = "sr02moderate";
                    break;
                case "Strenuous" :
                    $class = "sr02strenuous";
                    break;
            }
        }
        return $class;
    }

}
