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
        $schemawalks = array();
        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_TIME, RJsonwalksWalk::SORT_DISTANCE);
        $items = $walks->allWalks();
        foreach ($items as $walk) {
            if (!$walk->isCancelled()) {
                $date = $walk->walkDate->format('D, jS F');
                $performer = new RJsonwalksStructuredperformer($walk->groupName . " - Ramblers");
                $location = new RJsonwalksStructuredlocation($walk->startLocation->description, $walk->startLocation->postcode);
                $schemawalk = new RJsonwalksStructuredevent($performer, $location);
                $schemawalk->name = "Ramblers led walk on " . $date . ", " . $walk->title;
                $schemawalk->description = "A " . $walk->nationalGrade . " " . $walk->distanceMiles . "mile / " . $walk->distanceKm . "km walk";
                # Google don't like markup which doesn't appear on page so description must be as on page and image should  be excluded from next walks summary listing
                $schemawalk->startdate = $walk->walkDate->format('Y-m-d');
                $schemawalk->enddate = $schemawalk->startdate;
                $schemawalk->image = "http://www.ramblers-webs.org.uk/images/ra-images/logos/standard/logo92.png";
                $schemawalk->url = $walk->detailsPageUrl;
                $schemawalks[] = $schemawalk;
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
