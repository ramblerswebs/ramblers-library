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

        $walks->sort(RJsonwalksWalk::SORT_DATE, NULL, NULL);
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
                $col2 .= ", " . $walk->distanceMiles . "m/" . $walk->distanceKm . "km";
            }
            $col2 .= "</span>";
            $tag = $walk->placeTag;

            echo "<li> <div class='" . $this->walkClass . $walk->status . "' " . $walk->eventTag . "><a href='" . $walk->detailsPageUrl . "' target='_blank' >" . $col2 . $tag . "</a></div>" . PHP_EOL;
            if ($walk->status == "Cancelled") {
                echo "CANCELLED: " . $walk->cancellationReason;
            }
        }

        echo "</ul>" . PHP_EOL;
    }

    function noWalks($no) {
        $this->nowalks = $no;
    }

}
