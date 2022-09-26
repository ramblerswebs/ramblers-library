<?php

class RWalkseditorSubmitform extends RLeafletMap {

    private $groups = null;
    private $coords = null;

    public function setWalksCoordinators($values) {
        if (is_array($values)) {
            $this->coords = $values;
        } else {
            $text = "Walk coordinators not defined as an array";
            $app = JApplicationCms::getInstance('site');
            $app->enqueueMessage($text, 'error');
        }
    }

    public function setGroups($values) {
        if (is_array($values)) {
            $this->groups = $values;
        } else {
            $text = "Groups not defined as an array";
            $app = JApplicationCms::getInstance('site');
            $app->enqueueMessage($text, 'error');
        }
    }

    public function display() {
        if ($this->groups == null) {
            return;
        }
        if ($this->coords == null) {
            return;
        }

        if (count($this->groups) === 1) {
            echo "<h3>Submit draft walk for " . $this->groups[0] . "</h3>";
        } else {
            
        }
        //  $this->help_page = "https://maphelp.ramblers-webs.org.uk/draw-walking-route.html";

        $this->options->settings = true;
        $this->options->mylocation = true;
        $this->options->rightclick = true;
        $this->options->fullscreen = true;
        $this->options->mouseposition = true;
        $this->options->postcodes = true;
        $this->options->fitbounds = true;
        $this->options->displayElevation = false;
        $this->options->cluster = false;
        $this->options->draw = false;
        $this->options->print = true;
        $this->options->ramblersPlaces = true;
        $this->options->controlcontainer = true;

        $this->data = new class {
            
        };
        $this->data->coords = $this->coords;
        $this->data->groups = $this->groups;
        $this->data->user = new class {
            
        };
        $user = JFactory::getUser();
        $userinfo = JFactory::getUser($user->id);
        $this->data->user->loggedin = $user->id > 0;
        $this->data->user->name = $userinfo->name;
        $this->data->user->email = $userinfo->email;

        $path = "libraries/ramblers/walkseditor/";
        RLoad::addScript($path . "js/submitwalkform.js", "text/javascript");
        parent::setCommand('ra.walkseditor.submitwalkform');
        parent::setDataObject($this->data);
        parent::display();
        RWalkseditor::addScriptsandCss();
    }

}
