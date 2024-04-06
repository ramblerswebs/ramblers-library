<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdLeaderstable extends RJsonwalksDisplaybase {

    private $tableClass = "";

    function DisplayWalks($walks) {
        $walks->sort(RJsonwalksWalk::SORT_CONTACT, RJsonwalksWalk::SORT_TELEPHONE1, NULL);
        $items = $walks->allWalks();
        $last = "";

        echo "<table class='$this->tableClass'>";
        echo RHtml::addTableHeader(array("Contact", "Telephone 1", "Telephone 2"));
        foreach ($items as $walk) {
            $contactName = $walk->getIntValue("contacts", "contactName");
            $telephone1 = $walk->getIntValue("contacts", "telephone1");
            $telephone2 = $walk->getIntValue("contacts", "telephone2");
            $value = $contactName . " - " . $telephone1;
            $value .= " ," . $telephone2;
            if ($value <> $last) {
                echo RHtml::addTableRow(array($contactName, $telephone1, $telephone2));
                $last = $value;
            }
        }
        echo "</table>" . PHP_EOL;
    }

    function setTableClass($class) {
        $this->tableClass = $class;
    }
}
