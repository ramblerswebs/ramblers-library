<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class RSqlUtils {

    static function tableExists($table) {
        $db = JFactory::getDbo();
        $findTable = $db->replacePrefix($table, $prefix = '#__');
        $tables = $db->getTableList();
        foreach ($tables as $value) {
            if ($value == $findTable) {
                return true;
            }
        }
        return false;
    }

}
