<?php

class RWalkseditorProgramme extends RLeafletMap {

    private $groups = null;
    private $localGrades = null;

    public function setGroups($values) {
        if (is_array($values)) {
            $this->groups = $values;
        } else {
            $text = "Groups not defined as an array";
            $app = JApplicationCms::getInstance('site');
            $app->enqueueMessage($text, 'error');
        }
    }

    public function setLocalGrades($values) {
        if (is_array($values)) {
            $this->localGrades = $values;
        } else {
            $text = "Local Grades not defined as an array";
            $app = JApplicationCms::getInstance('site');
            $app->enqueueMessage($text, 'error');
        }
    }

    public function display() {
        if ($this->groups == null) {
            $text = "No groups defined";
            $app = JApplicationCms::getInstance('site');
            $app->enqueueMessage($text, 'error');
            return;
        }

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
        $this->options->calendar = true;
        $this->options->ramblersPlaces = true;
        $this->options->controlcontainer = true;

        $this->data = new class {
            
        };
        $this->data->groups = $this->groups;
        $this->data->localGrades = $this->localGrades;
        $this->data->user = new class {
            
        };
        $user = JFactory::getUser();
        $userinfo = JFactory::getUser($user->id);
        $this->data->user->loggedin = $user->id > 0;
        $this->data->user->name = $userinfo->name;
        $this->data->user->email = $userinfo->email;
        $this->data->items=[];

        $path = "libraries/ramblers/walkseditor/";
        RLoad::addScript($path . "js/form/programme.js", "text/javascript");
        RLoad::addScript($path . "js/viewWalks.js", "text/javascript");
        RLoad::addScript("libraries/ramblers/vendors/jplist-es6-master/dist/1.2.0/jplist.min.js", "text/javascript");
   
        
       
        parent::setCommand('ra.walkseditor.form.programme');
        parent::setDataObject($this->data);
        parent::display();
        RWalkseditor::addScriptsandCss();
    }

}
