<?php

/**
 * @version		0.0
 * @package		List users subscribed to Kunena Categories
 * @author    Chris Vaughan Ramblers-webs.org.uk
 * @copyright	Copyright (c) 2014 Chris Vaughan. All rights reserved.
 * @license		GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */
// no direct access
defined('_JEXEC') or die('Restricted access');

class RUsersKunena {

    function Display() {
        if (RSqlUtils::tableExists('#__kunena_categories')) {

            $db = JFactory::getDbo();  // Get a db connection.

            $query = $db->getQuery(true);  // Create a new query object.

            $query->select(array('b.name', 'b.username', 'b.email'))
                    ->select($db->quoteName('c.name', 'catname'))
                    ->from($db->quoteName('#__kunena_user_categories', 'a'))
                    ->join('LEFT', $db->quoteName('#__users', 'b') . ' ON (' . $db->quoteName('a.user_id') . ' = ' . $db->quoteName('b.id') . ')')
                    ->join('LEFT', $db->quoteName('#__kunena_categories', 'c') . ' ON (' . $db->quoteName('a.category_id') . ' = ' . $db->quoteName('c.id') . ')')
                    ->order('catname ASC');


//SELECT *
//  FROM i7v80_kunena_user_categories join i7v80_users ON i7v80_kunena_user_categories.user_id = i7v80_users.id
//                                  join i7v80_kunena_categories ON i7v80_kunena_user_categories.category_id = i7v80_kunena_categories.id		
//$query->order('name ASC');
//echo '<pre>query'; var_dump($query); echo '</pre>';
// Reset the query using our newly populated query object.
            $db->setQuery($query);

// Load the results as a list of stdClass objects (see later for more options on retrieving data).
            $results = $db->loadObjectList();
//echo '<pre>results '; var_dump($results); echo '</pre>';

            echo '<table>';
            echo '<thead><tr><th>Category</th><th>User</th><th>Email</th></tr></thead>';
            echo '<tbody>';
            foreach ($results as $i => $item) {
                echo '<tr class="row<?php echo $i % 2; ?>">';
                echo '<td>' . $item->catname . '</td>';
                echo '<td>' . $item->name . '</td>';
                echo '<td>' . $item->email . '</td>';
                echo ' </tr>';
            }
            echo '</tbody>';
            echo '</table>';
        }
    }

}
