# Ramblers json walks feed.

## Purpose

The new Group Walks facility in the Ramblers web site can provide a feed of a group(s) walks in a format called JSON.

This document describes one way of processing this data specifically within a Joomla 3 web site. This allows you to display walks as part of your web site and in your own formats rather than provided by Central Office.

To process such a walks feed requires some custom PHP code. This could be implemented as a Joomla extension. However the method chosen is to use a standard extension called DirectPHP.
DirectPHP allows PHP code to be included within an Article or a Custom HTML module and hence its output be displayed as part of the article or module. This means we don't have to worry about how to write Joomla extensions. Also additional information can be included in the articles of Custom Html Module. You are also able to customise the code to your requirements.
If you install DirectPHP please remember to enable the plugin.

## Implementation

A number of Library PHP files are required. These files are stored in a directory called ramblers in the Joomla root directory. 
In addition to the above a Ramblers plugin is required which enables the above libraries to be accessed by Joomla.

The master code for these are stored on https://github.com/ramblerswebs/ramblerslibrary 

##File structure

Under the ramblers folder are the following
* jsonwalks - containing classes relevant to the json walks feed
* jsonwalks/std - containing classes to display walks in some sample/standard ways
* json/code - where code is the code for a group or area. e.g. de02 holds ways of displaying walks for Derby & South Derbyshire group

* html - classes to help produce html tags
* feedhelper - classes to read and cache a walks feed 
* users - some test classes to access users membership data
* sql - some classes to query the sql databases

The files that are required are 

Ramblers Library contains a number of classes including the following 

* RJsonwalksWalks - this class contains the collection of walks retrieved from the JSON feed
* RJsonwalksWalk - this class contains all the details of each walk. The system creates these objects with similar  properties to the JSON file. But it also creates some extra properties to make the data easier to display. A full description is required once the JSON feed is available. 
* RJsonwalksLocation
* <a href="/html/html.md">RHtml</a> - this class provides a number of helper functions
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
$feed->Display($display);  // display walks information a second time
$display= new RJsonwalksStdListleaders();
$feed->Display($display);  // display walks information a third time
?>```

### Notes on above code

Use these statements to get error reporting while you are testing your code.
``` 
error_reporting(E_ALL);  // comment out once your script is working
ini_set('display_errors', 1);  // comment out once your script is working
```

* $rafeedurl - set the url of the JSON feed that you wish to display
* RJsonwalksStdSimplelist(); is one of a set of standard codes to display your walks in a specific format. 
* RJsonwalksStdSimplelist (R Jsonwalks Std Simplelist) is stored in the  ramblers/jsonwalks/std/simplelist.php file/folder
* $feed->Display($display); - this statement actions the displays the walks in your defined format
* another two display formats are then used to display the walks information a second and third time.

### Notes 
if you wish to clear the feed cache (to display the latest data) insert the following line  
``` $feed->clearCache(); ```

This option should not be used on a regular basis as it would put a high load Ramblers web site. 
Any page that accesses a feed with this option <b>MUST be password protected</b> in some way

## Include the output of a feed in a custom html module

Create a Custom HTML module and include like that above within the module.
The most suitable display class is RJsonwalksStdNextwalks
You must also set the module option <b>Prepare Content</b>, this option is under the Options tag (J3) and it should be set to YES.
If this option is not set the code is displayed and not processed.

## Standard Display methods
These are all stored in a sub folder called ramblers/jsonwalks/std
* RJsonwalksStdNextwalks - aimed at listing the next few walks in a module
* RJsonwalksStdWalkscount - display number of future walks
* RJsonwalksStdSimplelist - list all future walks 
* RJsonwalksStdWalktable - list all future walks in a table
* RJsonwalksStdListleaders - list of contacts from future walks
* RJsonwalksStdFulldetails - list future walks with accordian display of full details


##Custom Display Methods
Custom display formats can be stored in a folder with the name of your group code. E.g. de02 for Derby & South Derbyshire group

#Classes
RHtml
<h2>RHtml</h2>
RHtml::addTableHeader($cols) where $cols is an array. Create the html code for a row of table header tags containing the data values $cols.

RHtml::addTableRow($cols) where $cols is an array. Create the html code for a row of table tags containing the data values $cols.

for example 
```      echo RHtml::addTableHeader(array("Date", "Meet", "Start", "Title", "Distance", "Grade", "Leader"));
  ```