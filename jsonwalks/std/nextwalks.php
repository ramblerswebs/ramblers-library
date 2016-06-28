<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdNextwalks extends RJsonwalksDisplaybase {

    public $walkClass = "walk";
    public $feedClass = "walksfeed";
    private $nowalks = 5;

    function DisplayWalks($walks) {
        $schemawalks = array();
        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_TIME, RJsonwalksWalk::SORT_DISTANCE);
        $items = $walks->allWalks();
        $no = 0;
        echo "<ul class='" . $this->feedClass . "' >" . PHP_EOL;

        foreach ($items as $walk) {
            $no+=1;
            if ($no > $this->nowalks) {
                break;
            }
            $date = "<b>" . $walk->walkDate->format('D, jS F') . "</b>";
            $col2 = "<span itemprop=startDate content=" . $walk->walkDate->format(DateTime::ISO8601) . ">" . $date . "</span>";
            $col2 .= ", <span itemprop=name>" . $walk->title;
            if ($walk->distanceMiles > 0) {
                $col2 .= ", " . $walk->distanceMiles . "mi/" . $walk->distanceKm . "km";
            }
            $col2 .= "</span>";
            $tag = $walk->placeTag;

            echo "<li> <div class='" . $this->walkClass . $walk->status . "' " . $walk->eventTag . "><a href='" . $walk->detailsPageUrl . "' target='_blank' >" . $col2 . $tag . "</a></div>" . PHP_EOL;
            if ($walk->isCancelled()) {
                echo "CANCELLED: " . $walk->cancellationReason;
            } else {
                $performer = new RJsonwalksStructuredperformer($walk->groupName);
                $location = new RJsonwalksStructuredlocation($walk->startLocation->description, $walk->startLocation->postcode);
                $schemawalk = new RJsonwalksStructuredevent($performer, $location);
                $schemawalk->description = $walk->description;
                $schemawalk->enddate = $walk->walkDate->format('Y-m-d');
                $schemawalk->image = "http://www.ramblers-webs.org.uk/images/ra-images/logos/standard/logo92.png";
                $schemawalk->name = $walk->title;
                $schemawalk->startdate = $schemawalk->enddate;
                $schemawalk->url = $walk->detailsPageUrl;

                $schemawalks[] = $schemawalk;
            }
        }

        echo "</ul>" . PHP_EOL;
        $script = json_encode($schemawalks);
        $script = str_replace('context', '@context', $script);
        $script = str_replace('type', '@type', $script);
        $script = str_replace('\/', '/', $script);
        $script = '<script type="application/ld+json">' . $script . '</script>';
        echo $script;
    }

    function noWalks($no) {
        $this->nowalks = $no;
    }

}
