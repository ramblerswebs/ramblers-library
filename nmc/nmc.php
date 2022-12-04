<?php

class RNmc {

    public function addIFrame($url) {
        RLoad::addStyleSheet("libraries/ramblers/nmc/nmciframe.css");

        echo "<iframe class='nmc-iframe' src='" . $url . "' title='Execute NMC function'></iframe>";
    }

}
