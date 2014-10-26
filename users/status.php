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
    private $membershipno = 0;
    private $membershipnoValidFormat = false;
    public $postcodeText = 'My Profile - HAVE YOU MOVED? - Your Postcode held by this site does not agree with that sent to us by Ramblers London Office';
    public $localRecordsText = "Note: Our local Membership records are updated monthly and hence may be out of date.";

    function __construct() {
        $this->user = JFactory::getUser(); //gets user object
    }

    function sitename() { //gets sitename
        $config = new JConfig();
        return $config->sitename;
    }

    function loggedon() {
        If ($this->user != null) {
            return $this->user->id != 0;
        }
        return false;
    }

    function username() {
        If ($this->user != null) {
            return $this->user->name;
        }
        return "";
    }

    function useremail() {
        If ($this->user != null) {
            return $this->user->email;
        }
        return null;
    }

    function userlastvisitdate() {
        If ($this->user != null) {
            return $this->user->lastvisitDate;
        }
        return null;
    }

    function userregisterdate() {
        If ($this->user != null) {
            return $this->user->registerDate;
        }
        return null;
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

    function displayMembershipNumberStatus() {
        if ($this->loggedon()) {
            if ($this->membershipnoValidFormat == false) {
                $text = 'The format of your Membership number is not correct. It should be of the form <b><i>DE-02-0123456</b></i>';
                $text .=" - value given in Profile: " . strtoupper($this->cbInfo->cb_membershipno);
                JFactory::getApplication()->enqueueMessage($text);
            }
        }
    }

    private function decodeMembershipNumber($no) {
        $this->membershipnoValidFormat = false;
        $pieces = explode("-", $no);
        If (count($pieces) == 3) {
            $this->membershipnoValidFormat = true;
            $this->membershipno = $pieces[2];
        }
        If (count($pieces) == 2) {
            $this->membershipno = $pieces[1];
        }
        If (count($pieces) == 1) {
            $this->membershipno = $pieces[0];
        }
    }

    function getMembershipInfo($id) {
        $this->decodeMembershipNumber($id);
        $ClearCache = NULL;
        $feedTimeout = 5;
        $CacheTime = 60; // minutes
        $cacheLocation = $this->CacheLocation();
        $rafeedurl = "http://members.theramblers.org.uk/index.php?id=" . $this->membershipno;

// Fetch content
        $srfr = new RFeedhelper($cacheLocation, $CacheTime);

        if (isset($ClearCache)) {
            $srfr->clearCache($cacheLocation); // clear cache
        }
        $contents = $srfr->getFeed($rafeedurl);

        if ($contents != "") {
            $this->membership = json_decode($contents);
            if (isset($this->membership->error)) {
                if ($this->membership->error == true) {
                    $this->membership = NULL;
                }
            }
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

            if (RSqlUtils::tableExists('#__kunena_categories')) {
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
                    echo "<div class='usersubscribelist'>You are not subscribed to any Forum subjects</div>";
                } else {
                    echo "<div  class='usersubscribelist'>You are subscribed to the following Forum subjects </div>";
                    echo "<ul class='usersubscribelist'>";
                    foreach ($results as $i => $item) :
                        echo '<li>' . $item->catname . '</li>';
                    endforeach;
                    echo '</ul>';
                }
            }
        }
    }

    
    function checkMembership() {
        if ($this->loggedon()) {
            if (RSqlUtils::tableExists('#__comprofiler')) {
                // echo '<p>Community Builder installed </p>';
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
                    $this->getMembershipInfo($item->cb_membershipno);
                    $this->cbInfo = $item;
                endforeach;
            }
        }
    }

     function postcodeOK() {
        if ($this->cbInfo == NULL) {
            return true;
        }
        if ($this->membership == NULL) {
            return true;
        }
        $email1 = strtoupper($this->cbInfo->cb_postcode);
        $email1 = str_replace(' ', '', $email1);
        $email2 = strtoupper($this->membership->postcode);
        $email2 = str_replace(' ', '', $email2);
        if ($email1 == $email2) {
            return true;
        }
        return false;
    }

    function displayPostcodeStatus() {
        if ($this->loggedon()) {
            if ($this->postcodeOK() == false) {
                $text = $this->postcodeText;
                $text .=" - Postcodes: " . strtoupper($this->cbInfo->cb_postcode) . " and " . strtoupper($this->membership->postcode);
                $text.= "<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" . $this->localRecordsText;
                JFactory::getApplication()->enqueueMessage($text);
            }
        }
    }

    function emailOK() {
        if ($this->cbInfo == NULL) {
            return true;
        }
        if ($this->membership == NULL) {
            return true;
        }
        if (md5($this->user->email) == $this->membership->privateemail) {
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

    function displayMembershipStatus() {
        if ($this->cbInfo == NULL) {
            return;
        }
        if ($this->membership == NULL) {
            Echo "<div class='ra-membership'><b>Ramblers Membership record not found within our Area/Group</b></div>";
            return;
        }
        $val = $this->membership->expiry;
        if ($val == "") {
            return;
        }
        Echo "<div class='ra-membership'><b>Ramblers Membership</b></div>";
        Echo "<div class='ra-membershipstatus'><b>Status: </b>" . $this->membership->status . "</div>";
        if (strtoupper($this->membership->status == "LIFE")) {
            return;
        }
        if (trim($val) != "") {
            $expiry = DateTime::createFromFormat('Y-m-d H:i:s', $val . ' 00:00:00');
            $date = new DateTime();
            $date->add(new DateInterval('P30D'));
            if ($date < $expiry) {
                Echo "<div class='ra-membershipexpires'><b>Expires: </b>" . $expiry->format('jS F Y') . "</div>";
            }
        }
        Echo "<div class='ra-membershipnote'>" . $this->localRecordsText . "</div>";

        return;
    }

}

?>