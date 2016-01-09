<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of group
 *
 * @author Chris Vaughan
 */
class REventGroup {

    private $arrayofevents;
    private $class = "event";

    function __construct() {
        $this->arrayofevents = array();
    }

    public function setWalkClass($class) {
        $this->walkClass = $class;
    }

    public function addWalks($feed) {
        $walks = $feed->getWalks();
        $arrayofwalks = $walks->allWalks();
        foreach ($arrayofwalks as $walk) {
            $this->arrayofevents[] = $walk;
        }
    }

    public function getLastDate() {
        $lastdate = date("Y-m-d");
        foreach ($this->arrayofevents as $event) {
            $currentdate = $event->EventDateYYYYMMDD();
            if ($currentdate > $lastdate) {
                $lastdate = $currentdate;
            }
        }
        return $lastdate;
    }

    public function addEvent($text, $currentDate) {
        $found = false;
        $out = "";
        foreach ($this->arrayofevents as $event) {
            if ($event->EventDateYYYYMMDD() === $currentDate) {
                // echo "found";
                if ($found == false) {
                    // $out.= "<a class='tooltip' href='#'>";
                    // $out.= $text;
                    //  $out.= "<span class='classic'>";
                    $out.="<span class='event-list-cal-event'>";
                    $out.= "<div class='event-list-cal-day'>" . $text . "</div>";
                    $out.="<div class='event-list-cal-hover'>";
                    $out.= $event->EventDate()->format('l, jS');
                }
                $found = true;
                $out.= $event->EventList($this->class);
            }
        }
        if ($found) {
            $out.= "</div>";
            $out.= "</span>";
            //$out.= "</a>";
        } else {
            $out.= "<div class='event-list-cal-day'>" . $text . "</div>";
            // $out.= $text;
        }
        return $out;
    }

}
