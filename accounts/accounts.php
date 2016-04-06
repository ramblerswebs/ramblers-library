<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of accounts
 *
 * @author Chris
 */
define("ACCOUNTTABLE", "j8eh1_web_sites");

class RAccounts {

    private $dbresults;

    public function updateAccounts() {
        $this->getAccounts();
        $org = new ROrganisation();
        $this->updateDatabase($org);
    }

   
    public function addMapMarkers($map) {
        $this->readAccounts();
        $text = "";
        foreach ($this->dbresults as $item) :
            $text.= $this->addMapMarker($map, $item) . PHP_EOL;
        endforeach;
        $map->addMarkers($text);
    }

    private function addMapMarker($map, $item) {

        $text = "Unknown group";
        $long = $item->longitude;
        $lat = $item->latitude;
        $url = "http://www." . $item->domain;
        switch (strlen($item->code) == 2) {
            case true:
                $title = str_replace("'", "", $item->areaname);
                $icon = "walkingarea";
                $text = "Area " . $title . " [" . $item->code . "]";
                break;
            case false:
                $title = str_replace("'", "", $item->groupname);
                $icon = "walkinggroup";
                $text = str_replace("'", "", "Area " . $item->areaname) . "<br/>";
                if (strlen($item->code) == 4) {
                    $text .= "Group " . $title . " [" . $item->code . "]";
                }
                break;
        }
        $class = "website";
        $popup = "<div class='" . $class . "'>" . $text . "<br/><a href='" . $url . "' target='_blank'>" . $url . "</a></div>";
        $marker = "addMarker(markerList,\"" . $popup . "\", " . $lat . ", " . $long . ", " . $icon . ");";

        return $marker;
    }

    private function readAccounts() {

        if (RSqlUtils::tableExists(ACCOUNTTABLE)) {
            $db = JFactory::getDbo();
            $query = $db->getQuery(true);

            $query->select("*");
            $query->from($db->quoteName(ACCOUNTTABLE));

            // Reset the query using our newly populated query object.
            $db->setQuery($query);

            // Load the results as a list of stdClass objects
            $this->dbresults = $db->loadObjectList();
        }
    }

    private function getAccounts() {

        if (RSqlUtils::tableExists(ACCOUNTTABLE)) {
            $db = JFactory::getDbo();
            $query = $db->getQuery(true);

            $query->select($db->quoteName(array('id', 'code', 'domain', 'status')));
            $query->from($db->quoteName(ACCOUNTTABLE));

            // Reset the query using our newly populated query object.
            $db->setQuery($query);

            // Load the results as a list of stdClass objects
            $this->dbresults = $db->loadObjectList();
        }
    }

    private function updateDatabase($org) {
        foreach ($this->dbresults as $item) :
            $this->updateAccount($item, $org);
        endforeach;
    }

    private function updateAccount($item, $org) {
        $groups = $org->groups;
        $uppCode = strtoupper($item->code);
        echo "<p>Updating group " . $uppCode . "<p/>";
        if (isset($groups[$uppCode])) {
            $group = $groups[$uppCode];
            $areacode = substr($uppCode, 0, 2);
            $area = $org->areas[$areacode];
            $this->updateDatabaseRecord($item->id, $group, $area, $uppCode);
        } else {
            $this->defaultDatabaseRecord($item->id, $uppCode, $item->domain);
        }
    }

    private function updateDatabaseRecord($id, $group, $area, $uppCode) {
        $db = JFactory::getDbo();
        $query = $db->getQuery(true);
        $groupname = $group->name;
        if ($group->code == $area->code) {
            $groupname = "";
        }
        // Fields to update.
        $fields = array(
            $db->quoteName('latitude') . ' = ' . $group->latitude,
            $db->quoteName('longitude') . ' = ' . $group->longitude,
            $db->quoteName('areaname') . ' = "' . $area->name . '"',
            $db->quoteName('groupname') . ' = "' . $groupname . '"',
            $db->quoteName('code') . ' = "' . $uppCode . '"'
        );

        // Conditions for which records should be updated.
        $conditions = array(
            $db->quoteName('id') . "='" . $id . "'"
        );

        $query->update($db->quoteName(ACCOUNTTABLE))->set($fields)->where($conditions);

        $db->setQuery($query);

        $result = $db->execute();
    }

    private function defaultDatabaseRecord($id, $uppCode, $domain) {
        $db = JFactory::getDbo();
        $query = $db->getQuery(true);
        // Fields to update.
        $fields = array(
            $db->quoteName('latitude') . ' = 51.488010',
            $db->quoteName('longitude') . ' = -0.123809',
            $db->quoteName('areaname') . ' = "Central"',
            $db->quoteName('groupname') . ' = "' . $domain . '"',
            $db->quoteName('code') . ' = "' . $uppCode . '"'
        );

        // Conditions for which records should be updated.
        $conditions = array(
            $db->quoteName('id') . "='" . $id . "'"
        );

        $query->update($db->quoteName(ACCOUNTTABLE))->set($fields)->where($conditions);

        $db->setQuery($query);

        $result = $db->execute();
    }

}
