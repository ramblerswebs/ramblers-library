<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of addSchema
 *
 * @author chris
 */
class RJsonwalksAddschema {

    function display($walks) {
        $no = 0;
        $schemawalks = array();
        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_TIME, RJsonwalksWalk::SORT_DISTANCE);
        $items = $walks->allWalks();
        foreach ($items as $walk) {
            if (!$walk->isCancelled()) {
                $no += 1;
                $schemawalks[] = $walk->_getWalkSchema();
            }
            if ($no > 7) {
                break;
            }
        }

        $script = json_encode($schemawalks);
        $script = str_replace('"context":', '"@context":', $script);
        $script = str_replace('"type":', '"@type":', $script);
        $script = str_replace('\/', '/', $script);
        $doc = JFactory::getDocument();
        $doc->addScriptDeclaration($script, "application/ld+json");
    }
}
