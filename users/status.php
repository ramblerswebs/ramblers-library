<?php

/**
 * @version		0.0
 * @package		List user information, including forum subscriptions
 * @author              Chris Vaughan Ramblers-webs.org.uk
 * @copyright	       Copyright (c) 2014 Chris Vaughan. All rights reserved.
 * @license		GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */
// no direct access
defined('_JEXEC') or die('Restricted access');

class RUsersStatus {

    private $user;
    private $cbInfo;
    private $membership;

    function __construct() {
        $this->user = JFactory::getUser(); //gets user object
    }

    function sitename() { //gets sitename
        $config = new JConfig();
        return $config->sitename;
    }

    function loggedon() {
        return $this->user->id != 0;
    }

    function username() {
        return $this->user->name;
    }

    function useremail() {
        return $this->user->email;
    }

    function userlastvisitdate() {
        return $this->user->lastvisitDate;
    }

    function userregisterdate() {
        return $this->user->registerDate;
    }

    function display() {

        if ($this->loggedon() == false) {
            echo "<pre>Unknown, not logged on</pre>";
        } else {
            echo "<p>You are signed in as </p>";
            echo '<ul>';
            echo '<li>Name: ' . $this->username() . '</li>';
            echo '<li>Email: ' . $this->useremail() . '</li>';
            echo '<li>Your last vist to this site: ' . $this->userlastvisitdate() . '</li>';
            echo '<li>Registration date: ' . $this->userregisterdate() . '</li>';
            echo '</ul>';
            // index.php?option=com_comprofiler&task=userdetails
            echo '<a class="link-button button-p0110" href="index.php?option=com_comprofiler&task=userdetails">My Account</a>';
        }
    }

    function getMembershipInfo($id) {
        $ClearCache = NULL;
        $feedTimeout = 5;
        $CacheTime = 60; // minutes
        $cacheLocation = $this->CacheLocation();
        $rafeedurl = "http://members.theramblers.org.uk/index.php?id=" . $id;

// Fetch content
        $srfr = new RFeedhelper($cacheLocation, $CacheTime);

        if (isset($ClearCache)) {
            $srfr->clearCache($cacheLocation); // clear cache
        }
        $contents = $srfr->getFeed($rafeedurl);

        if ($contents != "") {
            $this->membership = json_decode($contents);
        } else {
            $this->membership = NULL;
        }
    }

    private function CacheLocation() {
        if (!defined('DS')) {
            define('DS', DIRECTORY_SEPARATOR);
        }
        return 'cache' . DS . 'ra_feed/members';
    }

    function displayKunenaSubscriptions() {
        if ($this->loggedon()) {

            if (JRamblersUtils::tableExists('#__kunena_categories')) {
// Get a db connection.
                $db = JFactory::getDbo();

// Create a new query object.
                $query = $db->getQuery(true);

                $query->select(array('b.name', 'b.username', 'b.email'))
                        ->select($db->quoteName('c.name', 'catname'))
                        ->from($db->quoteName('#__kunena_user_categories', 'a'))
                        ->join('LEFT', $db->quoteName('#__users', 'b') . ' ON (' . $db->quoteName('a.user_id') . ' = ' . $db->quoteName('b.id') . ')')
                        ->join('LEFT', $db->quoteName('#__kunena_categories', 'c') . ' ON (' . $db->quoteName('a.category_id') . ' = ' . $db->quoteName('c.id') . ')')
                        ->where($db->quoteName('a.user_id') . " = " . $db->quote($this->user->id))
                        ->order('catname ASC');

// Reset the query using our newly populated query object.
                $db->setQuery($query);

// Load the results as a list of stdClass objects (see later for more options on retrieving data).
                $results = $db->loadObjectList();
//echo '<pre>results '; var_dump($results); echo '</pre>';

                if (count($results) == 0) {
                    echo "<h2 class='usersubscribelist'>You are not subscribed to any Forum subjects</h2>";
                } else {
                    echo "<h2  class='usersubscribelist'>You are subscribed to the following Forum subjects </h2>";
                    echo "<ul class='usersubscribelist'>";
                    foreach ($results as $i => $item) :
                        echo '<li>' . $item->catname . '</li>';
                    endforeach;
                    echo '</ul>';
                }
            }
        }
    }

    function displayKunenaProfileButton($class) {
        // index.php?option=com_comprofiler&task=userdetails
        // <a class="link-button button-p0110"
        // index.php?option=com_kunena&view=user
    }

    function checkMembership() {
        if ($this->loggedon()) {
            if (RUtils::tableExists('#__comprofiler')) {
                echo '<p>Community Builder installed </p>';
                $db = JFactory::getDbo();
                $id = $this->user->id;
                $query = $db->getQuery(true);

                $query->select($db->quoteName(array('cb_membershipno', 'cb_postcode')));
                $query->from($db->quoteName('#__comprofiler'));
                $query->where($db->quoteName('id') . ' = ' . $id);
// Reset the query using our newly populated query object.
                $db->setQuery($query);

// Load the results as a list of stdClass objects (see later for more options on retrieving data).
                $results = $db->loadObjectList();
                $this->cbInfo = NULL;
                foreach ($results as $i => $item) :
                    echo "<p>Membership No: " . $item->cb_membershipno . '</p>';
                    $this->getMembershipInfo($item->cb_membershipno);
                    echo "<p>Postcode " . $item->cb_postcode . '</p>';
                    $this->cbInfo = $item;
                endforeach;
                echo $this->postcodeOK();
                echo $this->emailOK();
                echo $this->membershipOK();
            }
        }
    }
    function displayMembershipAlert(){
         if ( $this->postcodeOK() and  $this->emailOK() and $this->membershipOK){
             return;
         }
         // display alert button
    }

    function displayMembershipIssues() {
        
    }

    function postcodeOK() {
        if ($this->cbInfo == NULL) {
            return true;
        }
        if ($this->membership == NULL) {
            return true;
        }
        if (strtoupper($this->cbInfo->cb_postcode) == strtoupper($this->membership->postcode)) {
            return true;
        }
        return false;
    }

    function emailOK() {
        if ($this->cbInfo == NULL) {
            return true;
        }
        if ($this->membership == NULL) {
            return true;
        }
        if (md5($this->user->email) ==$this->membership->privateemail) {
            return true;
        }
        if (md5($this->user->email) == $this->membership->publicemail) {
            return true;
        }
        return false;
    }

    function membershipOK() {
        if ($this->cbInfo == NULL) {
            return true;
        }
        if ($this->membership == NULL) {
            return true;
        }
        if (strtoupper($this->membership->status == "LIFE")) {
            return true;
        }
        $val = $this->membership->expiry;
        if ($val == "") {
            return false;
        }
        if (trim($val) != "") {
            $expiry = DateTime::createFromFormat('Y-m-d H:i:s', $val . ' 00:00:00');
            $date = new DateTime();
            $date->add(new DateInterval('P30D'));
            if ($date < $expiry) {
                return true;
            }
        }

        return false;
    }

}

?>