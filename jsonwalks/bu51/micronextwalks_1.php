<?php

/**
 * Description of WalksDisplay
 *
 * @author Chris Vaughan
 */
// no direct access
defined("_JEXEC") or die("Restricted access");

class RJsonwalksBU51Micronextwalks extends RJsonwalksDisplaybase {

    public $walkClass = "walk";
    public $feedClass = "walksfeed";
    private $nowalks = 4;

    function DisplayWalks($walks) {
        $schemawalks = array();
        $walks->sort(RJsonwalksWalk::SORT_DATE, RJsonwalksWalk::SORT_TIME, RJsonwalksWalk::SORT_DISTANCE);
        $items = $walks->allWalks();
        $no = 0;
        $urlbase = "https://www.chilterns2030s.org.uk/walks/our-walks/";
        echo "<ul class='" . $this->feedClass . "' >" . PHP_EOL;
        foreach ($items as $walk) {
            $no += 1;
            if ($no > $this->nowalks) {
                break;
            }
            $date = "<b itemprop=startDate content=\"" . $walk->startLocation->time->format(DateTime::ISO8601) . "\"> " . $walk->walkDate->format('D, jS F') . " " . $walk->startLocation->timeHHMMshort . "</b>, ";
            $postcode = "<span itemprop='location' itemscope itemtype='http://schema.org/Place'><span itemprop='address' itemscope itemtype='http://schema.org/PostalAddress'><em itemprop='postalCode'> " . $walk->startLocation->postcode . "</em></span></span>, ";
            $desc = $date . "<span itemprop=name> " . $walk->title . "</span>, " . $postcode;
            if ($walk->distanceMiles > 0) {
                $desc .= $walk->nationalGrade . " " . $walk->distanceMiles . " miles / " . $walk->distanceKm . "km";
            }
            echo "<li itemscope itemtype='http://schema.org/Event'> <div class='" . $this->walkClass . $walk->status . "' " . "><a itemprop=url href='" . $urlbase . "#W" . $walk->id . "' >" . $desc . "</a></div></li>" . PHP_EOL;
            if ($walk->isCancelled()) {
                echo "CANCELLED: " . $walk->cancellationReason;
            }
        }
        echo "</ul>" . PHP_EOL;
    }

    function noWalks($no) {
        $this->nowalks = $no;
    }

}
