# Ramblers json walks feed.

## Purpose

The new Group Walks facility in the Ramblers web site can provide a feed of a groups(s) walks in a format called JSON.

This document describes one way of processing this data specifically within a Joomla 3 web site. This allows you to display walks as part of your web site and in your own formats rather than provided by Central Office.

To process such a walks feed requires some custom PHP code. This could be implemented as a Joomla extension. However the method chosen is to use a standard extension called DirectPHP.
DirectPHP allows PHP code to be included within an Article or a Custom HTML module and hence its output be displayed as part of the article or module. This means we don't have to worry about how to write Joomla extensions. Also additional information can be included in the articles of Custom Html Module. You are also able to customise the code to your requirements.
If you install DirectPHP please remember to enable the plugin.

## Implementation

A number of Library PHP files are required. These files are stored in a directory called ramblers in the Joomla root directory. 
In addition to the above a Ramblers plugin is required which enables the above libraries to be accessed by Joomla.

The master code for these are stored on https://github.com/ramblerswebs/ramblerslibrary and https://github.com/ramblerswebs/jsonwalksfeed

The files that are required are 

Ramblers Library contains a number of classes including the following classes

* RJsonwalksWalks - this class contains the collection of walks retrieved from the JSON feed
* RJsonwalksWalk - this class contains all the details of each walk. The system creates these objects with similar  properties to the JSON file. But it also creates some extra properties to make the data easier to display. A full description is required once the JSON feed is available. 
* RJsonwalksLocation
* RHtml - this class provides a number of helper functions
* RFeedhelper - will read and cache a walks feed.

the walks and walk classes process the JSON walks feed and turn it into a collection of walk objects.
Please note that the names of classes are case sensitive. For instance RJsonwalksWalks must have the R, J and the W in uppercase , with the rest in lower case.
How to invoke a feed and display your walks in an article
Include PHP code, based on the following, in some position within your article.
Note the code uses a class called  RjsonwalksFeed to read the json walks feed and process the data. The user can the select one or more display formats, 

1 RjsonwalksStdSimplelist, 

2 RjsonwalksStdWalkscount, 

3 RjsonwalksStdListleaders to display the data in particular formats.

```<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
$rafeedurl ="http://dev.ramblers.org.uk/api/lbs/walks?groups=de02";
$feed=new RJsonwalksFeed($rafeedurl); // standard software to read json feed and decode file
$display= new RJsonwalksStdSimplelist(); // code to display the walks in a particular format
$feed->Display($display);  // display walks information
$display=new RJsonwalksStdWalkscount();
$feed->Display($display);  // display walks information
$display= new RJsonwalksStdListleaders();
$feed->Display($display);  // display walks information
?>```

### Notes

Use these statements to get error reporting while you are testing your code.
``` 
error_reporting(E_ALL);  // comment out once your script is working
ini_set('display_errors', 1);  // comment out once your script is working
```

* $rafeedurl - set the url of the JSON feed that you wish to display
* RJsonwalksStdSimplelist(); is one of a set of standard codes to display your walks in a specific format. From the name (class name) you can tell which folder is is stored in
r - ramblers
* Jsonwalks - ramblers/jsonwalks
* Std - ramblers/jsonwalks/std
* Simpleliist - ramblers/jsonwalks/std/simplelist.php
* $feed->Display($display); - this statement actions the displays the walks in your defined format;

### Notes 
if you wish to clear the feed cache (to display the latest data) insert the following line  
``` $feed->clearCache(); ```

This option should not be used on a regular basis as it would put a high load Ramblers web site
Any page that accesses a feed with this option MUST be password protected in some way

Include the output of a feed in a custom html module

Include within code based on the above within the module. You must specify that the module option Prepare Content, this option is under the Options tag (J3) and it should be set to YES.

## Standard Display methods
These are all stored in a sub floder called std
* RJsonwalksStdNextwalks - aimed at listing the next few walks in a module
* RJsonwalksStdWalkscount - display number of future walks
* RJsonwalksStdSimplelist - list all future walks 
* RJsonwalksStdWalktable - list all future walks in a table
* RJsonwalksStdListleaders - list of contacts from future walks
* RJsonwalksStdFulldetails - list future walks with accordian display of full details


##Custom Display Methods
Custom display formats can be stored in a folder with the name of your group code. E.g. de02 for Derby & South Derbyshire group

#Classes
##RHtml
addTableHeader($cols) where $cols is an array. Create the html code for a row of table header tags containing the data values $cols.

addTableRow($cols) where $cols is an array. Create the html code for a row of table tags containing the data values $cols.