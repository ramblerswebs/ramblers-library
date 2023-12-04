var ra, jplist;
if (typeof (ra) === "undefined") {
    ra = {};
}
ra._isES6 = null;
ra._baseDirectory = '';
ra.uniquenumber = 0;
ra.defaultMapOptions = {
    "divId": "",
    "mapHeight": "250px",
    "mapWidth": "100%",
    "helpPage": "single-led-walk.html",
    "cluster": null,
    "fullscreen": true,
    //  "google": false,
    //  "search": false,
    //  "locationsearch": false,
    "osgrid": true,
    "mouseposition": true,
    "rightclick": true,
    "settings": true,
    "mylocation": true,
    "fitbounds": true,
    "draw": false,
    "print": true,
    "displayElevation": null,
    //  "smartRoute": false,
    "bing": false,
    "bingkey": "",
    "ORSkey": null,
    //   "ramblersPlaces": false,
    "topoMapDefault": false,
    "controlcontainer": false,
    "copyright": null,
    "initialview": null
};
// return base directory
ra.baseDirectory = function () {
    return ra._baseDirectory;
};
ra.decodeOptions = function (value) {
    var options = JSON.parse(value);
    if (options.hasOwnProperty('base')) {
        var parts = options.base.split("/");
        parts.splice(0, 3);// remove protocol and host
        var base = parts.join('/');
        ra._baseDirectory = "/" + base;
    }
    ra.defaultMapOptions.bing = options.bing;
    ra.defaultMapOptions.bingkey = options.bingkey;
    value = "";
    return options;
};
ra.decodeData = function (value) {
    if (value === null) {
        return null;
    }
    var data = JSON.parse(value);
    value = "";
    return data;
};
ra.uniqueID = function () {
    ra.uniquenumber += 1;
    return 'uniqueid' + ra.uniquenumber; // lowercase because of jplist issue
};
ra.bootstrapper = function (displayClass, mapOptions, _data) {
    ra.loading.start();
    var options = ra.decodeOptions(mapOptions);
    if (document.getElementById(options.divId) !== null) {
        var data = ra.decodeData(_data);
        var myclass;
        //  var load = true;
        if (displayClass !== 'noDirectAction') {
            const parts = displayClass.split('.');
            myclass = window;
            for (let i = 0; i < parts.length; i++) {
                myclass = myclass[parts[i]];
                if (typeof myclass === 'undefined') {
                    alert('Ra.Bootstrapper - ' + displayClass + ' option not known!');
                    ra.loading.stop();
                    return;
                }
            }
            var display = new myclass(options, data);
            display.load();
        }
    }
    ra.loading.stop();
};
// convert string to title case
ra.titleCase = function (str) {
    return str.replace(/(^|\s)\S/g, function (t) {
        return t.toUpperCase();
    });
};
ra.capitalizeFirstLetter = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// is an equivalent item in the array
ra.contains = function (items, item) {
    var index, len;
    for (index = 0, len = items.length; index < len; ++index) {
        if (ra.isEquivalent(items[index], item)) {
            return true;
        }
    }
    return false;
};
// find all email addresses in text
ra.fetch_mails = function ($text) {
    if ($text.length === 0) {
        return [];
    }
    var $result = $text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    if ($result === null) {
        return [];
    } else {
        return $result;
    }
};
ra.convert_mails = function ($text) {
    var $img = '<img src="' + ra.baseDirectory() + 'media/lib_ramblers/images/symbol_at.png" alt="@ sign" />';
    var $emails = ra.fetch_mails($text);
    $emails.forEach(myFunction);

    function myFunction(value, index, array) {
        var email = value.replace("@", $img);
        $text = $text.replace(value, email);
    }
    return $text;
};
// are two objects equivalent,i.e. same properties
ra.isEquivalent = function (a, b) {
    // Create arrays of property names
    var aProps = [];
    var bProps = [];
    if (a !== 'undefined') {
        aProps = Object.getOwnPropertyNames(a);
    }
    if (a !== 'undefined') {
        bProps = Object.getOwnPropertyNames(b);
    }
    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length !== bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
};
ra.syntaxHighlight = function (json) {
    if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
};
// obtain property of an object
ra.getObjProperty = function (obj, path, defaultvalue = null) {
    // call getObj("basics.date");
    if (typeof obj === 'undefined') {
        return defaultvalue;
    }
    if (obj === null) {
        return defaultvalue;
    }
    var property;
    var result = null;
    var properties = path.split(".");
    var item = obj;
    var i;
    for (i = 0; i < properties.length; i++) {
        property = properties[i];
        if (item.hasOwnProperty(property)) {
            result = item;
            item = item[property];
        } else {
            return defaultvalue;
        }
    }
    return item;

};
// sort object so listed in order of a value
ra.sortObject = function (obj, property) {
    var sortedObj = {};
    var done = false;
    do {
        var first = null;
        var key = null;
        for (var prop in obj) {
            var item = obj[prop];
            if (first === null) {
                first = item;
                key = prop;
            }
            if (item[property] < first[property]) {
                first = item;
                key = prop;
            }
        }
        if (key === null) {
            done = true;
        } else {
            delete obj[key];
            sortedObj[first.id] = first;
        }
    } while (!done);
    return sortedObj;
};
// test to see if ES6 or not
ra.isES6 = function () {
    if (ra._isES6 !== null) {
        return ra._isES6;
    } else {
        try
        {
            Function("() => {};");
            ra._isES6 = true;
        } catch (exception)
        {
            ra._isES6 = false;
        }
        return ra._isES6;
    }
};
ra.isRealOject = function (obj) {
    return typeof obj === "object" && obj !== null && obj !== 'undefined';
};
ra.arrayToCSV = function (arr) {
    var item, i;
    var line = [];

    for (i = 0; i < arr.length; ++i) {
        item = arr[i];
        if (item.indexOf && (item.indexOf(',') !== -1 || item.indexOf('"') !== -1)) {
            item = '"' + item.replace(/"/g, '""') + '"';
        }
        line.push(item);
    }

    return line.join(',');
};


ra.ajax = (function () {
    var ajax = {};
    // request url and call function
    ajax.postUrl = function ($url, $params, target, displayFunc) {
        var xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
        } else
        {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5
        }
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    displayFunc(target, xmlhttp.responseText);
                } else {
                    alert('Unable to complete task');
                }
            }
        };
        xmlhttp.open("POST", $url, true);
        //Send the proper header information along with the request
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        //   xmlhttp.setRequestHeader("Content-length", $params.length);
        //   xmlhttp.setRequestHeader("Connection", "close");
        xmlhttp.send($params);
    };
    ajax.getUrl = function ($url, $params, target, displayFunc) {
        var xmlhttp;
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else
        {// code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200)
            {
                displayFunc(target, xmlhttp.responseText);
            }
        };
        xmlhttp.open("GET", $url, true);
        //Send the proper header information along with the request
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        //   xmlhttp.setRequestHeader("Content-length", $params.length);
        //   xmlhttp.setRequestHeader("Connection", "close");
        xmlhttp.send($params);
    };
    // request json feed and callback
    ajax.getJSON = function (url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.responseType = "json";
        xhr.onload = function () {
            var status = xhr.status;
            var items;
            if (status === 200) {
                if (typeof xhr.response === 'string') {
                    items = JSON.parse(xhr.response);
                } else {
                    items = xhr.response;
                }
                callback(null, items);
            } else {
                callback(status, null);
            }
        };
        xhr.send();
    };
    // post for json feed and callback
    ajax.postJSON = function (url, data, target, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.responseType = "json";
        xhr.onload = function () {
            var status = xhr.status;
            var items;
            if (status === 200) {
                if (typeof xhr.response === 'string') {
                    items = JSON.parse(xhr.response);
                } else {
                    items = xhr.response;
                }
                callback(target, items);
            } else {
                callback(target, status);
            }
        };
        xhr.send(data);
    };
    return ajax;
}
());


ra.cookie = (function () {
    var cookie = {};
    cookie.create = function (raobject, name, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }
        document.cookie = name + "=" + raobject + expires + "; path=/;samesite=Strict";
    };
    cookie.read = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ')
                c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                var item = c.substring(nameEQ.length, c.length);
                if (item === '') {
                    item = null;
                }
                return item;
            }
        }
        return null;
    };
    cookie.erase = function (name) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970; path=/;samesite=Strict";
    };
    return cookie;
}
());

ra.settings = (function () {
    var settings = {};
    settings.read = function (name, settings) {
        var scookie = ra.cookie.read(name);
        if (scookie !== null) {
            try {
                var cookie = JSON.parse(scookie);
                if (typeof cookie === 'object' && cookie !== null) {
                    ra.settings._transferValues(cookie, settings);
                }
            } catch (err) {
                alert("Unable to retrieve settings from previous session [" + name + ']');
            }
        }
    };
    settings._transferValues = function (from, to) {
        // tranfer values from one object to another
        Object.keys(to).forEach(key => {
            var toItem = to[key];
            if (from.hasOwnProperty(key)) {
                var fromItem = from[key];
                if (ra.isRealOject(toItem) && ra.isRealOject(fromItem)) {
                    ra.settings._transferValues(fromItem, toItem);
                } else {
                    to[key] = from[key];
                }
                //  console.log("\n" + key + ": " + to[key]);
            }
        });
    };
    settings.changed = function () {
        let event = new Event("ra-setting-changed");
        document.dispatchEvent(event);
    };
    settings.save = function (save, name, settings) {
        if (save) {
            ra.cookie.create(JSON.stringify(settings), name, 365);
        } else {
            ra.cookie.erase(name);
        }
    };
    return settings;
}
());


ra.date = (function () {
    var date = {};

//      Possible values are "numeric", "2-digit", "narrow", "short", "long".

    date.getDate = function (datetime) {
        var value = date.getDateTime(datetime);
        var options = {year: 'numeric', month: 'short', day: 'numeric', weekday: 'short'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.dow = function (datetime) {
        var value = date.getDateTime(datetime);
        var options = {weekday: 'long'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.dowShort = function (datetime) {
        var value = date.getDateTime(datetime);
        var options = {weekday: 'short'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.dd = function (datetime) {
        var value = date.getDateTime(datetime);
        return value.getDate().toString() + date.nth(value);
    };
    date.dowShortdd = function (datetime) {
        return date.dowShort(datetime) + ", " + date.dd(datetime);
    };
    date.month = function (datetime) {
        var value = date.getDateTime(datetime);
        var options = {month: 'long'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.monthShort = function (datetime) {
        var value = date.getDateTime(datetime);
        var options = {month: 'short'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.dowShortddmm = function (datetime) {
        return date.dowShortdd(datetime) + ", " + date.month(datetime);
    };
    date.dowShortddmmyyyy = function (datetime) {
        var value = date.getDateTime(datetime);
        var options = {year: 'numeric', month: 'short', day: 'numeric', weekday: 'short'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.toICSFormat = function (datetime) {
        var value = date.getDateTime(datetime);
        var yyyymmdd = value.getFullYear().toString() + date.MM(value) + date.DD(value);
        var out = yyyymmdd + "T" + value.getHours().toString().padStart(2, '0') + value.getMinutes().toString().padStart(2, '0') + value.getSeconds().toString().padStart(2, '0');
        return out;
    };
    date.toYYYYMMDDmmhhssFormat = function (datetime) {
        var value = date.getDateTime(datetime);
        var yyyymmdd = value.getFullYear().toString() + '-' + date.MM(value) + '-' + date.DD(value);
        var time = value.getHours().toString().padStart(2, '0') + ':' + value.getMinutes().toString().padStart(2, '0') + ':' + value.getSeconds().toString().padStart(2, '0');
        var out = yyyymmdd + " " + time + '.000000';
        return out;
    };
    date.dowdd = function (datetime) {
        return date.dow(datetime) + ", " + date.dd(datetime);
    };
    date.dowddmm = function (datetime) {
        return date.dowdd(datetime) + " " + date.month(datetime);
    };
    date.ddmm = function (datetime) {
        return date.dd(datetime) + " " + date.month(datetime);
    };
    date.dowddmmyyyy = function (datetime) {
        return date.dowddmm(datetime) + " " + date.YYYY(datetime);
    };
    date.YYYY = function (datetime) {
        var value = date.getDateTime(datetime);
        var options = {year: 'numeric'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.YY = function (datetime) {
        var value = ra.date.YYYY(datetime);
        return value.substr(2, 2);
    };
    date.YYYYMMDD = function (datetime) {
        var value = date.getDateTime(datetime);
        return  value.getFullYear() + "-" + date.MM(value) + "-" + date.DD(value);
    };
    date.DDMMYYYY = function (datetime) {
        var value = date.getDateTime(datetime);
        return date.DD(value) + "/" + date.MM(value) + "/" + value.getFullYear();
    };
    date.MM = function (datetime) {
        var value = date.getDateTime(datetime);
        return  (value.getMonth() + 1).toString().padStart(2, '0');
    };
    date.DD = function (datetime) {
        var value = date.getDateTime(datetime);
        return value.getDate().toString().padStart(2, '0');
    };
    date.nth = function (datetime) {
        var value = date.getDateTime(datetime);
        var d = value.getDate();
        if (d > 3 && d < 21)
            return 'th';
        switch (d % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    };
    date.periodInDays = function (date1, date2) {
        var d1 = date.getDateTime(date1);
        var d2 = date.getDateTime(date2);
        const diffTime = Math.abs(d1 - d2);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    date.secondsSinceMidnight = function (d) {
        var e = new Date(d);
        return d - e.setHours(0, 0, 0, 0);
    };
    date.isValidString = function (text) {
        if (typeof text === 'undefined') {
            return false;
        }
        if (text === null) {
            return false;
        }
        return Date.parse(text) !== null;
    };
    date.compare = function (datetime1, datetime2) {
        var value1 = ra.date.YYYYMMDD(datetime1);
        var value2 = ra.date.YYYYMMDD(datetime2);
        if (value1 === value2) {
            return 0;
        }
        if (value1 > value2) {
            return 1;
        }
        return -1;
    };
    date.getDateTime = function (datetimestring) {
        // also used by time
        var value = datetimestring;
        if (typeof value === "string") {
            // set each item so it works on mac
            var arr = datetimestring.split(/[\-\+ :T]/);
            var date = new Date(arr[0], arr[1] - 1, arr[2]);
            if (arr.length > 3) {
                date.setHours(arr[3]);
            }
            if (arr.length > 4) {
                date.setMinutes(arr[4]);
            }
            if (arr.length > 5) {
                date.setSeconds(arr[5]);
            }
            return date;
        } else {
            if ((datetimestring instanceof Date)) {
                return value;
            } else {
                alert("Error RA0001: invalid datetime");
            }

        }
    };
//Day 	--- 	---
//d 	Day of the month, 2 digits with leading zeros 	01 to 31
//D 	A textual representation of a day, three letters 	Mon through Sun
//j 	Day of the month without leading zeros 	1 to 31
//l (lowercase 'L') 	A full textual representation of the day of the week 	Sunday through Saturday
//N 	ISO-8601 numeric representation of the day of the week 	1 (for Monday) through 7 (for Sunday)
//S 	English ordinal suffix for the day of the month, 2 characters 	st, nd, rd or th. Works well with j
//w 	Numeric representation of the day of the week 	0 (for Sunday) through 6 (for Saturday)
//z 	The day of the year (starting from 0) 	0 through 365
//Week 	--- 	---
//W 	ISO-8601 week number of year, weeks starting on Monday 	Example: 42 (the 42nd week in the year)
//Month 	--- 	---
//F 	A full textual representation of a month, such as January or March 	January through December
//m 	Numeric representation of a month, with leading zeros 	01 through 12
//M 	A short textual representation of a month, three letters 	Jan through Dec
//n 	Numeric representation of a month, without leading zeros 	1 through 12
//t 	Number of days in the given month 	28 through 31
//Year 	--- 	---
//L 	Whether it's a leap year 	1 if it is a leap year, 0 otherwise.
//o 	ISO-8601 week-numbering year. This has the same value as Y, except that if the ISO week number (W) belongs to the previous or next year, that year is used instead. 	Examples: 1999 or 2003
//Y 	A full numeric representation of a year, 4 digits 	Examples: 1999 or 2003
//y 	A two digit representation of a year 	Examples: 99 or 03
//Time 	--- 	---
//a 	Lowercase Ante meridiem and Post meridiem 	am or pm
//A 	Uppercase Ante meridiem and Post meridiem 	AM or PM
//B 	Swatch Internet time 	000 through 999
//g 	12-hour format of an hour without leading zeros 	1 through 12
//G 	24-hour format of an hour without leading zeros 	0 through 23
//h 	12-hour format of an hour with leading zeros 	01 through 12
//H 	24-hour format of an hour with leading zeros 	00 through 23
//i 	Minutes with leading zeros 	00 to 59

    return date;
}
());


ra.time = (function () {
    var time = {};
    time.HHMM = function (datetime) {
        var date = ra.date.getDateTime(datetime);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ampm;
        return strTime;
    };
    time.HHMMshort = function (datetime) {
        var value = ra.date.getDateTime(datetime);
        return time.HHMM(value).replace(":00", "");
    };
    time.secsToHrsMins = function (seconds) {
        if (isNaN(seconds)) {
            return "";
        }
        var strtime, hrs, mins;
        hrs = Math.floor(seconds / 3600);
        seconds -= hrs * 3600;
        mins = Math.floor(seconds / 60);
        seconds -= mins * 60;
        strtime = hrs.toFixed() + 'hrs ' + mins.toFixed() + 'mins';
        return strtime;
    };
    time.addMinutes = function (date, minutes) {
        return new Date(date.getTime() + minutes * 60000);
    };
    return time;
}
());


ra.html = (function () {
    var html = {};
    // add HTML Div tag with class and text
    html.addDiv = function ($class, $text) {
        var $out = "";
        $out += "<div class='" + $class + "'>";
        $out += $text;
        $out += "</div>";
        return $out;
    };
    html.createElement = function (tag, type, attr = '', value = '') {
        var ele = document.createElement(type);
        if (attr !== '') {
            ele.setAttribute(attr, value);
        }
        tag.appendChild(ele);
        return ele;
    };
    html.addTableRow = function (tabletag, cols) {
        var tr = ra.html.createElement(tabletag, "tr");
        cols.forEach(col => {
            var td = ra.html.createElement(tr, "td");
            td.innerHTML = col;
        });

    };


    html.displayInModal = function (tag) {
        // used by ra.walk to display images
        var ele = document.createElement("div");
        // copy children as tag has an onclick which creates another model
        for (var child = tag.firstChild; child !== null; child = child.nextSibling) {
            ele.appendChild(child.cloneNode(true));
        }
        ra.modals.createModal(ele, false);
    };
// var tags = [
//            {name: 'buttons', parent: 'root', tag: 'div', attrs: {class: 'alignRight'}},
//            {name: 'walksFilter', parent: 'root', tag: 'div', attrs: {class: 'walksFilter'}},
//            {name: 'pastwalks', parent: 'root', tag: 'div', attrs: {class: 'walksPast walksFilter'}},
//            {name: 'container', parent: 'root', tag: 'div'},
//            {name: 'table', parent: 'container', tag: 'table', attrs: {class: 'ra-tab-options'}},
//            {name: 'row', parent: 'table', tag: 'tr'},
//            {name: 'table', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'Table'},
//            {name: 'list', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'List'},
//            {name: 'map', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'Map'},
//            {name: 'calendar', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'Calendar'},
//            {name: 'gpxouter', parent: 'root', tag: 'div', attrs: {class: 'gpxouter'}}
//        ];
    html.generateTags = function (root, items) {
        var index;
        var tags = {};
        var item;
        for (index = 0; index < items.length; ++index) {
            item = items[index];
            item.element = document.createElement(item.tag);
            Object.keys(item).forEach(function (key, i) {
                // key: the name of the object key
                // i: the ordinal position of the key within the object 
                switch (key) {
                    case 'name':
                        tags[item[key]] = item.element;
                        break;
                    case 'parent':
                    case 'tag':
                    case 'element':
                        break;
                    case 'attrs':
                        var attrs = item[key];
                        Object.keys(attrs).forEach(function (key, i) {
                            item.element.setAttribute(key, attrs[key]);
                        });
                        break;
                    case 'style':
                        var styles = item[key];
                        Object.keys(styles).forEach(function (key, i) {
                            item.element.style[key] = styles[key];
                        });
                        break;
                    default:
                        item.element[key] = item[key];
                }

            });
        }
        function findItem(obj) {
            return obj.name === parent;
        }
        // put tags into structure
        for (index = 0; index < items.length; ++index) {
            item = items[index];
            if (item.hasOwnProperty('parent')) {
                var parent = item.parent;
                if (parent === 'root') {
                    root.appendChild(item.element);
                } else {
                    var result = items.find(findItem);
                    if (result) {
                        result.element.appendChild(item.element);
                    } else {
                        alert("generateTags: no parent");
                        root.appendChild(item.element);
                    }
                }

            } else {
                alert("generateTags: no parent");
            }
        }
        return tags;
    };
    html.setTag = function (id, innerhtml) {
        var tag = html.getTag(id);
        if (tag) {
            tag.innerHTML = '';
            if (typeof innerhtml === 'string') {
                tag.innerHTML = innerhtml;
            } else {
                tag.appendChild(innerhtml);
            }
        }
    };
    // toggle element visibility on/off 
    html.toggleVisibility = function (id) {
        var e = html.getTag(id);
        if (e.style.display !== 'none')
            e.style.display = 'none';
        else
            e.style.display = '';
    };
    // toggle two element's visibility on/off
    html.toggleVisibilities = function (id1, id2) {
        html.toggleVisibility(id1);
        html.toggleVisibility(id2);
    };
    html.isInViewport = function (el) {
        const rect = el.getBoundingClientRect();
        return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)

                );
    };
    html.insertAfter = function (referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    };
    html.triggerEvent = function (element, eventName) {
        var event = document.createEvent("HTMLEvents");
        event.initEvent(eventName, false, true);
        element.dispatchEvent(event);
    };
    html.getCoords = function (elem) { // crossbrowser version
        var box = elem.getBoundingClientRect();

        var body = document.body;
        var docEl = document.documentElement;

        var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        var clientTop = docEl.clientTop || body.clientTop || 0;
        var clientLeft = docEl.clientLeft || body.clientLeft || 0;

        var top = box.top + scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;

        return {top: Math.round(top), left: Math.round(left)};
    };
    // open window with tag content for printing
    html.printTag = function (id) {
        var tag = html.getTag(id);
        html.printHTML(tag.innerHTML);
        return true;
    };
    html.printHTML = function (html) {
        var mywindow = window.open('', 'Print', 'height=600,width=800');
        mywindow.document.write('<html><head><title>Print</title>');
        var index, len;
        var sheets = document.styleSheets;
        for (index = 0, len = sheets.length; index < len; ++index) {
            var sheet = sheets[index];
            if (sheet.href !== null) {
                var link = '<link rel="stylesheet" href="' + sheet.href + '">\n';
                mywindow.document.write(link);
                var noprint = "<style> .noprint {display: none !important; }</style>";
                mywindow.document.write(noprint);
            }
        }
        mywindow.document.write('</head><body><div id="js-document"><input type="button" value="Print" onclick="window.print(); return false;"><div class="div.component-content">');
        mywindow.document.write(html);
        mywindow.document.write('</div></div></body></html>');
        var span = mywindow.document.getElementById("js-document");
// When the user clicks on <span> (x), close the modal
        span.onclick = function () {
            mywindow.close();
        };
        mywindow.document.close();
        mywindow.focus();
        return true;
    };
    html.convertToText = function ($html) {
        var $text = $html.replace("\r", "");
        $text = $text.replace("\n", "");
        $text = $text.replace("&nbsp;", " ");
        $text = $text.replace(/(<([^>]+)>)/ig, "");
        $text = html.escape($text);
        $text = $text.trim();
        return $text;
    };
    // escape why?
    html.escape = function (text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function (m) {
            return map[m];
        });
    };
    // escape why?
    html.addslashes = function (str) {
//  discuss at: http://locutus.io/php/addslashes/
// original by: Kevin van Zonneveld (http://kvz.io)
// improved by: Ates Goral (http://magnetiq.com)
// improved by: marrtins
// improved by: Nate
// improved by: Onno Marsman (https://twitter.com/onnomarsman)
// improved by: Brett Zamir (http://brett-zamir.me)
// improved by: Oskar Larsson Högfeldt (http://oskar-lh.name/)
//    input by: Denny Wardhana
//   example 1: addslashes("kevin's birthday")
//   returns 1: "kevin\\'s birthday"

        return (str + '')
                .replace(/[\\"']/g, '\\$&')
                .replace(/\u0000/g, '\\0');
    };
    html.getBrowserStatus = function () {
        var out = "";
        out += "<br/>Mobile: " + L.Browser.mobile.toString();
        out += "<br/>Touch: " + L.Browser.touch.toString();
        out += "<br/>Pointer : " + L.Browser.pointer.toString();
        out += "<br/>Win: " + L.Browser.win.toString();
        out += "<br/>Android: " + L.Browser.android.toString();
        return out;
    };
    html.showhide = function (evt, idName) {
        var x = document.getElementById(idName);
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    };
    html.getTag = function (id) {
        if (typeof id === 'string') {
            return document.getElementById(id);
        } else {
            return id;
        }
    };
    html.stripTags = function (dirtyString) {
        const doc = new DOMParser().parseFromString(dirtyString, 'text/html');
        return doc.body.textContent || '';
    };

    html.walkDOM = function (node, func) {
        func(node);  //this will invoke the functionToInvoke from arg
        node = node.firstChild;
        while (node) {
            html.walkDOM(node, func);
            node = node.nextSibling;
        }
    };
    return html;
}
());

if (typeof (ra.html.input) === "undefined") {
    ra.html.input = {};
    ra.html.input.action = function (tag, divClass, label, name) {
        var itemDiv = document.createElement('div');
        if (divClass !== '') {
            itemDiv.setAttribute('class', divClass);
        }
        tag.appendChild(itemDiv);
        var _label = document.createElement('label');
        _label.textContent = label;
        _label.style.display = "inline";
        var inputTag = document.createElement('button');
        inputTag.setAttribute('class', 'small link-button white');
        inputTag.style.display = "inline";
        inputTag.style.marginLeft = "10px";
        inputTag.textContent = name;
        inputTag.classList.add("button-p0555");
        inputTag.ra = {};
        inputTag.ra.name = name;

        inputTag.addEventListener("click", function (e) {
            inputTag.textContent = 'Done';
            inputTag.classList.remove("button-p0555");
            inputTag.classList.add("button-p5565");
            let event = new Event("action");
            inputTag.dispatchEvent(event);
        });
        itemDiv.appendChild(_label);
        itemDiv.appendChild(inputTag);
        return inputTag;
    };
    ra.html.input.actionReset = function (inputTag) {
        inputTag.textContent = inputTag.ra.name;
        inputTag.classList.add("button-p0555");
        inputTag.classList.remove("button-p5565");
    };
    ra.html.input.yesNo = function (tag, divClass, label, raobject, property, options = ['Yes', 'No']) {
        var colours = ["button-p0555", "button-p0186"];
        if (options[0] !== 'Yes' || options[1] !== 'No') {
            colours = ["granite", "granite"];
        }
        var itemDiv = document.createElement('div');
        if (divClass !== '') {
            itemDiv.setAttribute('class', divClass);
        }
        tag.appendChild(itemDiv);
        var _label = document.createElement('label');
        _label.textContent = label;
        _label.style.display = "inline";
        var inputTag = document.createElement('button');
        inputTag.setAttribute('class', 'small link-button granite');
        inputTag.style.display = "inline";
        inputTag.style.marginLeft = "10px";
        if (raobject[property]) {
            inputTag.textContent = options[0];
            inputTag.classList.remove(colours[1]);
            inputTag.classList.add(colours[0]);
        } else {
            inputTag.textContent = options[1];
            inputTag.classList.remove(colours[0]);
            inputTag.classList.add(colours[1]);
        }
        inputTag.ra = {};
        inputTag.ra.object = raobject;
        inputTag.ra.property = property;
        inputTag.ra.options = options;
        inputTag.addEventListener("click", function (e) {
            var newvalue = !inputTag.ra.object[inputTag.ra.property];
            ra.html.input.yesNoReset(inputTag, newvalue, colours);
        });
        itemDiv.appendChild(_label);
        itemDiv.appendChild(inputTag);
        return inputTag;
    };
    ra.html.input.yesNoReset = function (inputTag, value, colours = ["button-p0555", "button-p0186"]) {
        var ra = inputTag.ra;
        if (ra.object[ra.property] !== value) {
            ra.object[ra.property] = value;
            if (value) {
                inputTag.textContent = ra.options[0];
                inputTag.classList.remove(colours[1]);
                inputTag.classList.add(colours[0]);
            } else {
                inputTag.textContent = ra.options[1];
                inputTag.classList.remove(colours[0]);
                inputTag.classList.add(colours[1]);
            }
            let event = new Event("ra-input-change");
            inputTag.dispatchEvent(event);
    }
    };
    ra.html.input.combo = function (tag, divClass, label, raobject, property, options) {
        var itemDiv = document.createElement('div');
        if (divClass !== '') {
            itemDiv.setAttribute('class', divClass);
        }
        tag.appendChild(itemDiv);
        var _label = document.createElement('label');
        _label.textContent = label;
        _label.style.display = "inline";
        var inputTag = document.createElement('select');
        inputTag.setAttribute('class', '');
        inputTag.style.display = "inline";
        inputTag.style.marginLeft = "10px";
        inputTag.style.width = "250px";
        var which = '';
        Object.keys(options).forEach(function (key) {
            var item = options[key];
            var optionTag = document.createElement('option');
            optionTag.textContent = item.name;
            optionTag.value = item.value;
            if (raobject[property] === item.value) {
                which = item.value;

            }
            inputTag.appendChild(optionTag);
        });
        inputTag.value = which; // set current value
        inputTag.value = raobject[property];
        inputTag.ra = {};
        inputTag.ra.object = raobject;
        inputTag.ra.property = property;
        inputTag.ra.options = options;
        inputTag.addEventListener("change", function (e) {
            ra.html.input.comboReset(inputTag, inputTag.value);
        });
        itemDiv.appendChild(_label);
        itemDiv.appendChild(inputTag);
        return inputTag;
    };
    ra.html.input.comboReset = function (inputTag, value) {
        var current = inputTag.selectedIndex;
        inputTag.value = value;
        if (inputTag.selectedIndex === -1) {
            inputTag.selectedIndex = current;
        } else {
            var ra = inputTag.ra;
            ra.object[ra.property] = value;
            let event = new Event("ra-input-change");
            inputTag.dispatchEvent(event);
        }

    };
    ra.html.input.number = function (tag, divClass, label, raobject, property, minval, maxval, step) {
        var itemDiv = document.createElement('div');
        if (divClass !== '') {
            itemDiv.setAttribute('class', divClass);
        }
        tag.appendChild(itemDiv);
        var _label = document.createElement('label');
        _label.setAttribute('class', 'help-label');
        _label.textContent = label;
        var inputTag = document.createElement('input');
        inputTag.setAttribute('type', 'range');
        inputTag.setAttribute('class', 'slider');
        inputTag.setAttribute('min', minval);
        inputTag.setAttribute('max', maxval);
        inputTag.setAttribute('step', step);
        inputTag.ra = {};
        inputTag.ra.object = raobject;
        inputTag.ra.property = property;
        inputTag.ra._label = _label;
        inputTag.ra.label = label;
        if (raobject.hasOwnProperty(property)) {  // Initialise value
            inputTag.setAttribute('value', raobject[property]);
            _label.textContent = label.replace("%n", inputTag.value);
        }
        inputTag.addEventListener("input", function (e) {
            e.target.ra.object[e.target.ra.property] = e.target.value;
            _label.textContent = label.replace("%n", e.target.value);
            let event = new Event("ra-input-change");
            inputTag.dispatchEvent(event);
        });
        itemDiv.appendChild(inputTag);
        itemDiv.appendChild(_label);
        return inputTag;
    };
    ra.html.input.numberReset = function (inputTag, value) {
        var ra = inputTag.ra;
        if (ra.object[ra.property] !== value) {
            ra.object[ra.property] = value;
            inputTag.value = value;
            inputTag.ra._label.textContent = inputTag.ra.label.replace("%n", inputTag.value);
            let event = new Event("ra-input-change");
            inputTag.dispatchEvent(event);
        }
    };
    ra.html.input.colour = function (tag, divClass, labeltext, raobject, property) {
        var itemDiv = document.createElement('div');
        if (divClass !== '') {
            itemDiv.setAttribute('class', divClass);
        }
        var label = document.createElement('label');
        label.textContent = labeltext;
        label.setAttribute('class', 'help-label');
        itemDiv.appendChild(label);
        tag.appendChild(itemDiv);
        var inputColor = document.createElement('input');
        inputColor.setAttribute('type', 'color');
        inputColor.setAttribute('class', 'pointer');
        inputColor.setAttribute('value', raobject[property]);
        itemDiv.appendChild(inputColor);
        inputColor.ra = {};
        inputColor.ra.object = raobject;
        inputColor.ra.property = property;
        inputColor.style.height = "30px";
        inputColor.style.width = "50px";
        inputColor.style.backgroundColor = "#DDDDDD";

        inputColor.addEventListener("input", function (e) {
            e.target.ra.object[e.target.ra.property] = e.target.value;
            let event = new Event("ra-input-change"); // (2)
            inputColor.dispatchEvent(event);
        });
        return inputColor;
    };
    ra.html.input.colorReset = function (inputTag, value) {
        var ra = inputTag.ra;
        if (ra.object[ra.property] !== value) {
            ra.object[ra.property] = value;
            inputTag.value = value;
            let event = new Event("ra-input-change"); // (2)
            inputTag.dispatchEvent(event);
        }
    };
    ra.html.input.lineStyle = function (tag, divClass, labeltext, raobject) {
        var itemDiv = document.createElement('div');
        if (divClass !== '') {
            itemDiv.setAttribute('class', divClass);
        }
        tag.appendChild(itemDiv);
        var titlestyle = document.createElement('h5');
        titlestyle.textContent = labeltext;
        itemDiv.appendChild(titlestyle);
        var color = ra.html.input.colour(itemDiv, 'inlineBlock', 'Colour', raobject, 'color');
        var example = ra.html.input._addExampleLine(itemDiv, "150px", "Example: ");
        var weight = ra.html.input.number(itemDiv, '', 'Weight %n pixels', raobject, 'weight', 1, 10, 0.5);
        var opacity = ra.html.input.number(itemDiv, '', 'Opacity %n (0-1)', raobject, 'opacity', .1, 1, .01);
        itemDiv.ra = {};
        itemDiv.ra.color = color;
        itemDiv.ra.weight = weight;
        itemDiv.ra.opacity = opacity;
        itemDiv.ra.example = example;
        ra.html.input._setExampleLineStyle(example, raobject);
        color.addEventListener("change", function (e) {
            ra.html.input._setExampleLineStyle(example, raobject);
            let event = new Event("ra-input-change"); // (2)
            itemDiv.dispatchEvent(event);
        });
        weight.addEventListener("change", function (e) {
            ra.html.input._setExampleLineStyle(example, raobject);
            let event = new Event("ra-input-change"); // (2)
            itemDiv.dispatchEvent(event);
        });
        opacity.addEventListener("change", function (e) {
            ra.html.input._setExampleLineStyle(example, raobject);
            let event = new Event("ra-input-change"); // (2)
            itemDiv.dispatchEvent(event);
        });
        color.addEventListener("ra-input-change", function (e) {
            ra.html.input._setExampleLineStyle(example, raobject);
        });
        weight.addEventListener("ra-input-change", function (e) {
            ra.html.input._setExampleLineStyle(example, raobject);
        });
        opacity.addEventListener("ra-input-change", function (e) {
            ra.html.input._setExampleLineStyle(example, raobject);
        });
        return itemDiv;
    };
    ra.html.input.lineStyleReset = function (itemDiv, style) {
        ra.html.input.colorReset(itemDiv.ra.color, style.color, false);
        ra.html.input.numberReset(itemDiv.ra.weight, style.weight, false);
        ra.html.input.numberReset(itemDiv.ra.opacity, style.opacity, false);

        let event = new Event("ra-input-change"); // (2)
        itemDiv.dispatchEvent(event);
    };
    ra.html.input._addExampleLine = function (tag, length, comment) {
        var com = document.createElement('div');
        com.style.display = 'inline-block';
        com.textContent = comment;
        com.style.marginRight = '10px';
        com.style.marginTop = '20px';
        com.style.marginLeft = "10px";
        tag.appendChild(com);
        var itemDiv = document.createElement('div');
        itemDiv.style.display = 'inline-block';
        itemDiv.style.width = length;
        itemDiv.style.height = "1px";
        tag.appendChild(itemDiv);

        return itemDiv;
    };
    ra.html.input._setExampleLineStyle = function (line, style) {
        if (style.hasOwnProperty("color")) {
            line.style.backgroundColor = style.color;
        }
        if (style.hasOwnProperty("weight")) {
            line.style.height = style.weight + "px";
        }
        if (style.hasOwnProperty("opacity")) {
            line.style.opacity = style.opacity;
        }
    };
    ra.html.input.fillStyle = function (tag, divClass, labeltext, raobject) {
        var itemDiv = document.createElement('div');
        if (divClass !== '') {
            itemDiv.setAttribute('class', divClass);
        }
        tag.appendChild(itemDiv);
        var titlestyle = document.createElement('h5');
        titlestyle.textContent = labeltext;
        itemDiv.appendChild(titlestyle);
        var color = ra.html.input.colour(itemDiv, 'inlineBlock', 'Colour', raobject, 'color');
        var example = ra.html.input._addExampleFill(itemDiv, "Example: ");
        var opacity = ra.html.input.number(itemDiv, '', 'Opacity %n (0-1)', raobject, 'opacity', .1, 1, .01);
        itemDiv.ra = {};
        itemDiv.ra.color = color;
        itemDiv.ra.opacity = opacity;
        itemDiv.ra.example = example;
        ra.html.input._addExampleFillStyle(example, raobject);
        color.addEventListener("change", function (e) {
            ra.html.input._addExampleFillStyle(example, raobject);
            let event = new Event("ra-input-change");
            itemDiv.dispatchEvent(event);
        });
        opacity.addEventListener("change", function (e) {
            ra.html.input._addExampleFillStyle(example, raobject);
            let event = new Event("ra-input-change");
            itemDiv.dispatchEvent(event);
        });
        color.addEventListener("ra-input-change", function (e) {
            ra.html.input._setExampleLineStyle(example, raobject);
        });

        opacity.addEventListener("ra-input-change", function (e) {
            ra.html.input._setExampleLineStyle(example, raobject);
        });
        return itemDiv;
    };
    ra.html.input.fillStyleReset = function (itemDiv, style) {
        ra.html.input.colorReset(itemDiv.ra.color, style.color);
        ra.html.input.numberReset(itemDiv.ra.opacity, style.opacity);
    };
    ra.html.input._addExampleFill = function (tag, comment) {
        var com = document.createElement('div');
        com.style.display = 'inline-block';
        com.textContent = comment;
        com.style.marginTop = '20px';
        com.style.marginRight = '10px';
        com.style.marginLeft = "10px";
        tag.appendChild(com);
        var itemDiv = document.createElement('div');
        itemDiv.style.display = 'inline-block';
        itemDiv.style.width = "30px";
        itemDiv.style.height = "30px";
        tag.appendChild(itemDiv);
        return itemDiv;
    };
    ra.html.input._addExampleFillStyle = function (fill, style) {
        if (style.hasOwnProperty("color")) {
            fill.style.backgroundColor = style.color;
        }
        if (style.hasOwnProperty("opacity")) {
            fill.style.opacity = style.opacity;
        }
    };
}

ra.link = (function () {
    var link = {};
    link.getOSMap = function (lat, long, text) {
        var $out;
        $out = "<abbr title='Click Map to see Ordnance Survey map of location'>";
        $out = "<a class='mappopup' href=\"javascript:ra.link.streetmap(" + lat + "," + long + ")\" >[" + text + "]</a>";
        $out += "</abbr>";
        return $out;
    };
    link.getAreaMap = function ($location, $text) {
        var $this = $location;
        var $code, $out;
        if (!$this.exact) {
            $code = "http://maps.google.com/maps?z=13&amp;t=h&amp;ll=[lat],[long]";
            $code = $code.replace("[lat]", $this.latitude);
            $code = $code.replace("[long]", $this.longitude);
            $out = "<span class='pointer' onClick=\"javascript:window.open('" + $code + "', '_blank','toolbar=yes,scrollbars=yes,left=50,top=50,width=800,height=600');\">[" + $text + "]</span>";
            return $out;
        } else {
            return "";
        }
    };
    link.photos = function ($gr) {
        var page = "http://www.geograph.org.uk/gridref/" + $gr;
        window.open(page, "_blank", "scrollbars=yes,width=990,height=480,menubar=yes,resizable=yes,status=yes");
    };
    link.streetmap = function (lat, long) {
        ////https://streetmap.co.uk/loc/N52.038333,W4.578611
        var page = "https://www.streetmap.co.uk/loc/N" + lat + ",E" + long;
        window.open(page, "_blank", "scrollbars=yes,width=900,height=580,menubar=yes,resizable=yes,status=yes");
    };
    link.googlemap = function ($lat, $long) {
        var page = "https://www.google.com/maps/place/" + $lat.toString() + "+" + $long.toString() + "/@" + $lat.toString() + "," + $long.toString() + ",15z";
        window.open(page, "Google Map", "scrollbars=yes,width=900,height=580,menubar=yes,resizable=yes,status=yes");
    };
    return link;
}
());
ra.clipboard = (function () {
    var clipboard = {};
    clipboard.set = function (text) {
        // Copy the text inside the text field
        navigator.clipboard.writeText(text);

        // Alert the copied text
        alert("Text copied to clipboard: " + text);
    };

    return clipboard;
}
());




ra.loading = (function () {
    var loading = {};
    loading.start = function () {
        var tags = [
            {name: 'container', parent: 'root', tag: 'div', attrs: {class: 'loadingcontainer'}},
            {name: 'loader', parent: 'container', tag: 'div', attrs: {class: 'loading'}},
            {parent: 'loader', tag: 'div', attrs: {class: 'circle'}},
            {parent: 'loader', tag: 'div', attrs: {class: 'circle'}},
            {parent: 'loader', tag: 'div', attrs: {class: 'circle'}},
            {parent: 'loader', tag: 'div', attrs: {class: 'shadow'}},
            {parent: 'loader', tag: 'div', attrs: {class: 'shadow'}},
            {parent: 'loader', tag: 'div', attrs: {class: 'shadow'}},
            {parent: 'loader', tag: 'span', textContent: 'LOADING'}
        ];
        loading.elements = ra.html.generateTags(document.body, tags);
    };
    loading.stop = function () {
        loading.elements.container.remove();
        loading.elements = null;
    };
    return loading;
}
());


ra.w3w = (function () {
    var w3w = {};
    w3w.get = function (lat, lng, id, place) {
        var tag = ra.html.getTag(id);
        var w3wurl = "https://api.what3words.com/v3/convert-to-3wa?key=6AZYMY7P&coordinates=";
        var url = w3wurl + lat.toFixed(7) + ',' + lng.toFixed(7);
        ra.ajax.getJSON(url, function (err, items) {

            if (err !== null || tag === null) {
                tag.innerHTML = "Error accessing What3Words: " + err + "<br/>";
            } else {
                var out;
                if (place) {
                    out = w3w.toText(items.words, items.nearestPlace);
                } else {
                    out = w3w.toText(items.words, "");
                }
                tag.innerHTML = out;
            }
        });
    };
    w3w.toText = function (words, nearestPlace) {
        if (words === "") {
            return "";
        }
        var out = '<a class="w3w" href="https://what3words.com/about-us/" title="See information about W3W" target="_blank">What3Words: </a>';
        out += '<a class="mappopup" title="See W3W map of location" href="https://what3words.com/' + words + '" target="_blank"> ///' + words + '</a><br/>';
        if (nearestPlace !== "") {
            out += '<b>Nearest Place: </b>' + nearestPlace + '<br/>';
        }
        return out;
    };
    w3w.toLocation = function (tag, words) {
        var url = "https://api.what3words.com/v3/convert-to-coordinates?words=" + words + "&key=6AZYMY7P";
        ra.ajax.getJSON(url, function (err, item) {
            let event = new Event("what3wordsfound");
            event.raData = {};
            event.raData.err = err;
            if (err === null) {
                event.raData.coordinates = item.coordinates;
                event.raData.nearestPlace = item.nearestPlace;
                event.raData.country = item.country;
                event.raData.words = item.words;
            }
            tag.dispatchEvent(event);
        });
    };
    w3w.fetch = function (tag, dataObject, lat, lng) {
        var w3wurl = "https://api.what3words.com/v3/convert-to-3wa?key=6AZYMY7P&coordinates=";
        var url = w3wurl + lat.toFixed(7) + ',' + lng.toFixed(7);
        ra.ajax.getJSON(url, function (err, item) {
            let event = new Event("what3wordsfound");
            event.raData = {};
            event.raData.err = err;
            event.raData.dataObject = dataObject;
            if (err === null) {
                event.raData.words = item.words;
                event.raData.nearestPlace = item.nearestPlace;
            }
            tag.dispatchEvent(event);
        });
    };

    w3w.aboutUs = function () {
        var page = "https://what3words.com/about-us/";
        window.open(page, "_blank", "scrollbars=yes,width=990,height=480,menubar=yes,resizable=yes,status=yes");
    };
    return w3w;
}
());




ra.modals = (function () {
    var modals = {};
    modals.items = [];

    modals.masterdiv = null;
    modals.createModal = function ($html, printButton = true, cancelButton = true, fullscreen = null) {
        if (modals.masterdiv === null) {
            var body = document.getElementsByTagName("BODY")[0];
            modals.masterdiv = document.createElement('div');
            modals.masterdiv.setAttribute('class', 'modal-master');
            body.appendChild(modals.masterdiv);
        }
        var item = new ra.modal();
        if (fullscreen !== null) {
            if (fullscreen.isFullscreen()) {
                fullscreen.toggleFullscreen();
                item.fullscreen = fullscreen;
            }
        }
        item.setContent($html, printButton, cancelButton);
        modals.items.push(item);
        modals.masterdiv.innerHTML = '';
        modals.masterdiv.appendChild(item.getContent());
        return item;
    };

    document.addEventListener("ra-modal-closing", function (event) {
        // raise event to reset status that may be lost, e.g. map full screen
        var modal = modals.items[modals.items.length - 1];
        let e = new Event("ra-modal-closed");
        e.ra = {modal: modal};
        document.dispatchEvent(e);
        modals.items.pop();
        if (modals.items.length === 0) {
            modals.masterdiv.innerHTML = '';
        } else {
            var item = modals.items[modals.items.length - 1];
            ra.html.setTag(modals.masterdiv, item.getContent());
        }
    });
    return modals;
}
());

ra.modal = function () {
    this.elements = {};
    this.content;
    this.fullscreen = null;
    this.setContent = function ($html, printButton = true, closeButton = true) {
        var _this = this;
        this._createModalTag(printButton, closeButton);
        ra.html.setTag(this.elements.data, $html);
        this.elements.modaltag.style.display = "block";
        this.elements.close.addEventListener("click", function () {
            _this.close();
        });
        var print = this.elements.print;
        if (print !== null) {
            print.onclick = function () {
                ra.html.printTag(_this.elements.data);
            };
    }
    };
    this.getContent = function () {
        return this.content;
    };
    this.headerDiv = function () {
        return this.elements.header;
    };
    this.close = function () {
        let e = new Event("ra-modal-closing");
        document.dispatchEvent(e);
        event.stopImmediatePropagation();
        if (this.fullscreen !== null) {
            this.fullscreen.toggleFullscreen();
        }
    };

    this._createModalTag = function (print = true, closeButton = true) {
        var tags = [
            {name: 'modaltag', parent: 'root', tag: 'div', attrs: {class: 'js-modal ramblers'}, style: {display: 'none'}},
            {name: 'content', parent: 'modaltag', tag: 'div', attrs: {class: 'ra-modal-content'}},
            {name: 'header', parent: 'content', tag: 'div', attrs: {class: 'ra-modal-header'}},
            {name: 'print', parent: 'header', tag: 'button', attrs: {class: 'link-button granite tiny modal-print'}, textContent: 'Print'},
            {name: 'close', parent: 'header', tag: 'button', attrs: {class: 'link-button granite tiny modal-close'}, textContent: 'Close'},
            {parent: 'content', tag: 'div', style: {clear: 'right'}},
            {name: 'data', parent: 'content', tag: 'div'},
            {parent: 'content', tag: 'hr'}
        ];
        if (typeof this.content !== 'undefined') {
            this.elements.data.innerHTML = '';
        } else {
            this.content = document.createElement('div');
            this.elements = ra.html.generateTags(this.content, tags);
            this.elements.close.setAttribute('data-dismiss', 'modal');
        }
        this.elements.close.style.display = '';
        this.elements.print.style.display = '';
        if (!closeButton) {
            this.elements.close.style.display = 'none';
        }
        if (!print) {
            this.elements.print.style.display = 'none';
    }
    };

};

ra.math = (function () {
    var math = {};
    math.deg2rad = function (value) {
        return value * Math.PI / 180;
    };
    math.rad2deg = function (value) {
        return value * 180 / Math.PI;
    };
    math.round = function (num, dec) {
        var num_sign = num >= 0 ? 1 : -1;
        return parseFloat((Math.round((num * Math.pow(10, dec)) + (num_sign * 0.0001)) / Math.pow(10, dec)).toFixed(dec));
    };
    math.naismith = function (dist, elevGain) {
        var mins = 60 * dist / 5000 + 60 * elevGain / 600;
        return convertToHoursMins(mins);
        function convertToHoursMins(time) {
            if (time < 1) {
                return '';
            }
            var h = Math.floor(time / 60);
            var m = (time % 60);
            return  h + 'hrs ' + m.toFixed(0) + 'mins';
        }
    };
    return math;
}
());


ra.geom = (function () {
    var geom = {};
    var KM = 6371.009;
    var MI = 3958.761;
    // var NM = 3440.070;
    // var YD = 6967420;
    // var FT = 20902260;
    var directions = [
        {angle: 0, name: "North", abbr: "N"},
        {angle: 22.5, name: "North NorthEast", abbr: "NNE"},
        {angle: 45, name: "North East", abbr: "NE"},
        {angle: 67.5, name: "East NorthEast", abbr: "ENE"},
        {angle: 90, name: "East", abbr: "E"},
        {angle: 112.5, name: "East SouthEast", abbr: "ESE"},
        {angle: 135, name: "South East", abbr: "SE"},
        {angle: 157.5, name: "South SouthEast", abbr: "SSE"},
        {angle: 180, name: "South", abbr: "S"},
        {angle: 202.5, name: "South SouthWest", abbr: "SSW"},
        {angle: 225, name: "South West", abbr: "SW"},
        {angle: 247.5, name: "West SouthWest", abbr: "WSW"},
        {angle: 270, name: "West", abbr: "W"},
        {angle: 292.5, name: "West NorthWest", abbr: "WNW"},
        {angle: 315, name: "North West", abbr: "NW"},
        {angle: 337.5, name: "North NorthWest", abbr: "NNW"},
        {angle: 360, name: "North", abbr: "N"}];

    geom.validateRadius = function ($unit) {
        if ($unit === "KM") {
            return KM;
        } else {
            return MI;
        }
    };
    geom.position = function ($lat1, $lon1, $lat2, $lon2, $unit = "KM") {
        var out = {};
        out.distance = geom.distance($lat1, $lon1, $lat2, $lon2, $unit);
        out.bearing = geom.bearing($lat1, $lon1, $lat2, $lon2);
        out.direction = geom.direction($lat1, $lon1, $lat2, $lon2);
        //  out.directionAbbr = geom.directionAbbr(out.direction);
        return out;
    };

// Takes two sets of geographic coordinates in decimal degrees and produces distance along the great circle line.
// Optionally takes a fifth argument with one of the predefined units of measurements, or planet radius in custom units.
    geom.distance = function ($lat1, $lon1, $lat2, $lon2, $unit = "KM") {
        var $r = geom.validateRadius($unit);
        $lat1 = ra.math.deg2rad($lat1);
        $lon1 = ra.math.deg2rad($lon1);
        $lat2 = ra.math.deg2rad($lat2);
        $lon2 = ra.math.deg2rad($lon2);
        var $lonDelta = $lon2 - $lon1;
        var $a = Math.pow(Math.cos($lat2) * Math.sin($lonDelta), 2) + Math.pow(Math.cos($lat1) * Math.sin($lat2) - Math.sin($lat1) * Math.cos($lat2) * Math.cos($lonDelta), 2);
        var $b = Math.sin($lat1) * Math.sin($lat2) + Math.cos($lat1) * Math.cos($lat2) * Math.cos($lonDelta);
        var $angle = Math.atan2(Math.sqrt($a), $b);
        return $angle * $r;
    };
// Takes two sets of geographic coordinates in decimal degrees and produces bearing (azimuth) from the first set of coordinates to the second set.
    geom.bearing = function ($lat1, $lon1, $lat2, $lon2) {
        $lat1 = ra.math.deg2rad($lat1);
        $lon1 = ra.math.deg2rad($lon1);
        $lat2 = ra.math.deg2rad($lat2);
        $lon2 = ra.math.deg2rad($lon2);
        var $lonDelta = $lon2 - $lon1;
        var $y = Math.sin($lonDelta) * Math.cos($lat2);
        var $x = Math.cos($lat1) * Math.sin($lat2) - Math.sin($lat1) * Math.cos($lat2) * Math.cos($lonDelta);
        var $brng = Math.atan2($y, $x);
        $brng = $brng * (180 / Math.PI);
        if ($brng < 0) {
            $brng += 360;
        }
        return $brng;
    };
// Takes one set of geographic coordinates in decimal degrees, azimuth and distance to produce a new set of coordinates, specified distance and bearing away from original.
// Optionally takes a fifth argument with one of the predefined units of measurements.
    geom.destination = function ($lat1, $lon1, $brng, $dt, $unit = KM) {
        var $r = geom.validateRadius($unit);
        $lat1 = ra.math.deg2rad($lat1);
        $lon1 = ra.math.deg2rad($lon1);
        var $lat3 = Math.asin(Math.sin($lat1) * Math.cos($dt / $r) + Math.cos($lat1) * Math.sin($dt / $r) * Math.cos(ra.math.deg2rad($brng)));
        var $lon3 = $lon1 + Math.atan2(Math.sin(ra.math.deg2rad($brng)) * Math.sin($dt / $r) * Math.cos($lat1), Math.cos($dt / $r) - Math.sin($lat1) * Math.sin($lat3));
        return {
            "lat": ra.math.rad2deg($lat3),
            "lon": ra.math.rad2deg($lon3)};
    };
    geom.direction = function ($lat1, $lon1, $lat2, $lon2) {
        var $bearing = geom.bearing($lat1, $lon1, $lat2, $lon2);
        var $inc = 11.25;
        var $i = 0;
        var index, len, item, angle;
        for (index = 0, len = directions.length; index < len; ++index) {
            item = directions[$i];
            angle = item.angle;
            if ($bearing >= angle - $inc && $bearing <= angle + $inc) {
                return item;
            }

            $i += 1;
        }
        return "direction error";
    };
    geom.test = function () {

        console.log(geom.distance(40.76, -73.984, 40.89, -74, "KM"));
        console.log(geom.bearing(40.76, -73.984, 40.89, -74));
        console.log(geom.direction(40.76, -73.984, 40.89, -74));
    };

    return geom;
}
());


ra.units = (function () {
    var units = {};
    // metres to Km
    units.metresTokm = function (v) {
        return v / 1000;
    };
    // metres to Miles
    units.metresToMi = function (v) {
        return v / 1609.34;
    };
    return units;
}
());

ra.help = function (tag, helpFunction) {
    // var targetRect = null;
    var lastHelp = null;
    var no = 1;
    this.tag = tag;
    this.helpFunction = helpFunction;
    this.open = false;
    this.fred = ra.help.no;
    ra.help.no += 1;
    this.helpTag = document.getElementById('ra-help-helptag');

    if (this.helpTag === null) {
        var body = document.getElementsByTagName("BODY")[0];
        this.helpTag = document.createElement('div');
        this.helpTag.setAttribute('id', 'ra-help-helptag');
        this.helpTag.setAttribute('class', 'ra help helpblock');
        this.helpTag.style.display = 'none';
        body.prepend(this.helpTag);
        var _this = this;
        this.helpTag.addEventListener("click", function (e) {
            _this.helpTag.style.display = 'none';
            var ele = e.target;
            if (ele.raHelpTag === 'undefined') {
                alert('help undefined');
            }
            ele.raHelpTag.open = false;
        }
        );
    }
    this.add = function () {
        this.helpButton = document.createElement('span');
        this.helpButton.setAttribute('class', 'ra help icon');
        this.helpButton.textContent = "";
        var _this = this;
        this.tag.appendChild(this.helpButton);

        this.helpButton.addEventListener("click", function (e) {
            if (lastHelp !== null) {
                if (lastHelp !== _this) {
                    lastHelp.open = false;
                }
            }
            _this.open = !_this.open;
            if (_this.open) {
                _this.helpTag.innerHTML = "<span>Help<span class='close'>x</span></span><div class='help-border'></div>" + _this.helpFunction();
                _this.helpTag.raHelpTag = _this;

                var eleRect = ra.html.getCoords(_this.helpButton);
                var top = eleRect.top;
                var left = eleRect.left + 40;
                var body = document.getElementsByTagName('body')[0];
                var r = body.clientWidth;
                if (left + 400 > r) {
                    left = r - 525;
                    if (left < 0) {
                        left = 0;
                    }
                }
                _this.helpTag.style.left = left + 'px';
                _this.helpTag.style.top = top + 'px';
                _this.helpTag.style.display = 'block';

            } else {
                _this.helpTag.style.display = 'none';
            }
            lastHelp = _this;
        });
    };


};
ra.filterType = {Unique: "Unique",
    Limit: "Limit",
    DateRange: "DateRange",
    NumberRange: "NumberRamge"};
ra.filter = function (eventTag, eventName) {
    this.eventTag = eventTag;
    this.eventName = eventName;
    this._groups = {};
    this.elements = null;
    this.addGroup = function (type, id, title, data = null) {
        var group = {id: id,
            type: type,
            title: title,
            values: {}
        };
        switch (group.type) {
            case ra.filterType.NumberRange:
            case ra.filterType.DateRange:
                group.min = null;
                group.max = null;
                break;
            case ra.filterType.Limit:
                group.limit = 0;
                group.displaySingle = false;
                data.forEach(item => { // data is an array of the titles and limit for each 
                    group.values[item.title] = {no: 0,
                        limit: item.limit,
                        active: false};
                });
                break;
            case ra.filterType.Unique:
                group.valueOrder = data; // data is the title order for the items
                break;
        }
        this._groups[id] = group;

        return group;
    };
    this._getGroup = function (id) {
        if (!this._groups.hasOwnProperty(id)) {
            console.error("Filter id error " + id);
            return null;
        }
        return this._groups[id];
    };


    this.setDisplaySingle = function (id, yesno) {
        var group = this._getGroup(id);
        group.displaySingle = yesno;
    };

    this.initialiseFilter = function (valueSet) {
        valueSet.forEach(item => {
            var id = item.id;
            var group = this._getGroup(id);
            if (group === null) {
                return;
            }
            var values = item.valueItems;
            values.forEach(i => {
                var id = i.id;
                var value = i.value;
                var tagId = i.tagId;
                switch (group.type) {
                    case "NumberRange":
                    case "DateRange":
                        this._insertGroupRange(id, value);
                        break;
                    case "Limit":
                        this._insertGroupLimit(id, value);
                        break;
                    case "Unique":
                        this._insertGroupUnique(id, value, tagId);
                        break;
                }
            });
        });
    };
    this._insertGroupRange = function (id, value) {
        var group = this._getGroup(id);
        group.type = "NumberRange";
        var type = Object.prototype.toString.call(value);
        if (type === "[object Date]") {
            group.type = "DateRange";
        }
        var values = group.values;
        if (!values.hasOwnProperty("min")) {
            values.min = value;
            values.max = value;
            group.min = value;
            group.max = value;

        } else {
            if (values.min > value) {
                values.min = value;
                group.min = value;
            }
            if (value > values.max) {
                values.max = value;
                group.max = value;
            }
        }

    };
    this._insertGroupUnique = function (id, value, tagId) {
        var group = this._getGroup(id);
        group.type = "Unique";
        var values = group.values;
        if (!values.hasOwnProperty(value)) {
            values[value] = {};
            values[value].no = 0;
            values[value].name = "";
            values[value].tagId = tagId;
        }
        values[value].no += 1;
        values[value].name = value;
        values[value].active = false;
    };
    this._insertGroupLimit = function (id, value) {
        var group = this._getGroup(id);
        var values = group.values;
        for (var propt in values) {
            var item = values[propt];
            if (value <= item.limit || item.limit === 0) {
                item.no += 1;
            }
        }

    };

    this.display = function (tag) {
        var tags = [
            {name: 'button', parent: 'root', tag: 'div', textContent: 'Filter', attrs: {class: 'ra_openclose'}},
            {name: 'span', parent: 'button', tag: 'span', attrs: {class: 'ra-closed'}},
            {name: 'options', parent: 'root', tag: 'div', attrs: {class: 'ra-clear'}},
            {parent: 'options', tag: 'div', attrs: {class: 'ra-filter-spacer'}},
            {name: 'filters', parent: 'options', tag: 'div', attrs: {class: 'ra-walksfilter'}}
        ];

        this.elements = ra.html.generateTags(tag, tags);
        var options = this.elements.options;
        var filters = this.elements.filters;
        var button = this.elements.button;
        var span = this.elements.span;
        button.onclick = function (event) {
            if (options.style.display !== "none") {
                options.style.display = "none";
                span.classList.add('ra-closed');
                span.classList.remove('ra-open');

            } else {
                options.style.display = "";
                span.classList.add('ra-open');
                span.classList.remove('ra-closed');
            }
        };
        options.style.display = "none";

        for (var propt in this._groups) {
            var div = document.createElement('div');
            div.setAttribute('class', 'ra-filtergroup');
            filters.appendChild(div);
            var group = this._groups[propt];
            switch (group.type) {
                case "Unique":
                    var keys = Object.keys(group.values);
                    if (keys.length > 1 || group.displaySingle) {
                        this._displayGroupUnique(div, group);
                    }
                    break;
                case "DateRange":
                    this._displayGroupDateRange(div, group);
                    break;
                case "NumberRange":
                    this._displayGroupNumberRange(div, group);
                    break;
                case "Limit":
                    this._displayGroupLimit(div, group);
                    break;
                default:
                    alert("Invalid filter type");
            }
        }
        var nodes = filters.getElementsByClassName("ra-filteritemnil");
        if (nodes.length > 0) {
            var displayall = document.createElement('div');
            displayall.textContent = "Empty categories";
            displayall.classList.add('ra-displayall');
            filters.appendChild(displayall);
            displayall.onclick = function (event) {
                var opt;
                var list = displayall.classList;

                if (list.contains('active')) {
                    list.remove('active');
                    opt = "none";
                } else {
                    list.add('active');
                    opt = "";
                }
                for (let i = 0; i < nodes.length; i++) {
                    nodes[i].style.display = opt;
                }
            };
        }


    };
    this._displayGroupNumberRange = function (tag, group) {
        // display title
        var h = document.createElement('h3');
        h.textContent = group.title;
        tag.appendChild(h);
        // display range
        alert("number range not imlpemented");
    };
    this._displayGroupUnique = function (tag, group) {
        // display title
        var h = document.createElement('h3');
        h.textContent = group.title;
        tag.appendChild(h);
        // display items
        if (group.valueOrder !== null) { // display in specified order
            group.valueOrder.forEach(name => {
                if (group.values.hasOwnProperty(name)) {
                    var item = group.values[name];
                    this._displayUniqueItem(tag, item);
                } else {
                    this._displaygroupUniqueItemNil(tag, name);
                }
            });
        } else { // display in alphabetical order
            var keys = Object.keys(group.values);
            keys.sort();
            keys.forEach(key => {
                var item = group.values[key];
                this._displayUniqueItem(tag, item);
            });
        }
    };
    this._displayUniqueItem = function (tag, item) {
        if (item.no > 0) {
            var div = document.createElement('div');
            div.setAttribute('class', 'ra-filteritem ');
            if (item.tagId !== null) {
                div.setAttribute('id', item.tagId);
            }
            div.textContent = item.name + " [" + item.no + "]";
            tag.appendChild(div);
            var _this = this;
            div.addEventListener("click", function (event) {
                item.active = !item.active;
                if (item.active) {
                    div.classList.add('active');
                } else {
                    div.classList.remove('active');
                }
                _this.eventTag.dispatchEvent(new Event(_this.eventName));
            });
        }
    };
    this._displaygroupUniqueItemNil = function (tag, name) {
        var div = document.createElement('div');
        div.setAttribute('class', 'ra-filteritemnil ');
        div.style.display = 'none';
        div.textContent = name + " [0]";
        tag.appendChild(div);
    };
    this._displayGroupDateRange = function (tag, group) {
        var h = document.createElement('h3');
        h.textContent = group.title;
        tag.appendChild(h);
        var titles = ["Start", "End"];
        var initValue = group.min;
        titles.forEach(title => {
            var div = document.createElement('div');
            tag.appendChild(div);
            var label = document.createElement('label');
            label.style.marginLeft = '5px';
            if (title === "Start") {
                label.style.marginRight = '5px';
            } else {
                label.style.marginRight = '10px';
            }
            label.textContent = title;
            div.appendChild(label);
            var input = document.createElement('input');
            input.setAttribute('type', 'date');
            input.setAttribute('value', ra.date.YYYYMMDD(initValue));
            input.setAttribute('min', ra.date.YYYYMMDD(group.min));
            input.setAttribute('max', ra.date.YYYYMMDD(group.max));
            div.appendChild(input);
            var _this = this;
            input.addEventListener("input", function (event) {
                var input = event.target;
                var value = input.value;
                if (title === "Start") {
                    if (value === "") {
                        value = input.min;
                        input.value = ra.date.YYYYMMDD(value);
                    }
                    group.values.min = ra.date.getDateTime(value);
                }
                if (title === "End") {
                    if (value === "") {
                        value = input.max;
                        input.value = ra.date.YYYYMMDD(value);
                    }
                    group.values.max = ra.date.getDateTime(value);
                }
                _this.eventTag.dispatchEvent(new Event(_this.eventName));
            });
            initValue = group.max;
        });
    };
    this._displayGroupLimit = function (tag, group) {
        var h = document.createElement('h3');
        h.textContent = group.title;
        tag.appendChild(h);
        var select = document.createElement('select');
        select.style.marginLeft = '5px';
        tag.appendChild(select);

        var values = group.values;
        for (var propt in values) {
            var item = values[propt];
            var option = document.createElement('option');
            select.appendChild(option);
            option.setAttribute('value', item.limit);
            option.innerText = propt + " [" + item.no + "]";
        }
        var _this = this;
        select.addEventListener("change", function (event) {
            // only works if you have one select as 'updated' is hard coded
            group.limit = Number(event.target.value);
            _this.eventTag.dispatchEvent(new Event(_this.eventName));
        });


    };
    this.shouldDisplayItem = function (valueSet) {
        var result = true;
        valueSet.forEach(item => {
            var id = item.id;
            var values = item.valueItems;
            var no = 0;
            values.forEach(value => {
                if (this._shouldDisplayItem(id, value)) {
                    no += 1;
                }
            });
            if (no === 0) {
                result = false;
            }
        });
        return result;
    };
    this._shouldDisplayItem = function (id, item) {
        if (!this._groups.hasOwnProperty(id)) {
            alert("Filter id error");
        }
        var group = this._groups[id];
        switch (group.type) {
            case "Unique":
                return this._shouldDisplayUnique(group, item.value);
                break;
            case "DateRange":
                return  this._shouldDisplayDateRange(group, item.value);
                break;
            case "NumberRange":
                return  this._shouldDisplayNumberRange(group, item.value);
                break;
            case "Limit":
                return  this._shouldDisplayLimit(group, item.value);
                break;
        }
        return true;
    };
    this._shouldDisplayUnique = function (group, value) {
        var anyActive = false;
        var items = group.values;
        for (var propt in items) {
            var item = items[propt];
            if (item.active) {
                anyActive = true;
            }
        }
        if (!anyActive) {
            return true;
        }
        for (var propt in items) {
            var item = items[propt];
            if (item.active) {
                if (item.name === value) {
                    return true;
                }
            }
        }
        return false;
    };
    this._shouldDisplayNumberRange = function (group, value) {
        var min = group.values.min;
        var max = group.values.max;
        if (value >= min && value <= max) {
            return true;
        }
        return false;
    };
    this._shouldDisplayDateRange = function (group, value) {
        var min = ra.date.YYYYMMDD(group.values.min);
        var max = ra.date.YYYYMMDD(group.values.max);
        var svalue = ra.date.YYYYMMDD(value);
        if (svalue >= min && svalue <= max) {
            return true;
        }
        return false;
    };
    this._shouldDisplayLimit = function (group, value) {
        var limit = group.limit;
        if (value <= limit || limit === 0) {
            return true;
        }
        return false;
    };

};
ra.filter.valueSet = function () {
    this._valueGroup = {};
    this.add = function (value) {
        if (value.hasOwnProperty("id")) {
            var id = value.id;
            if (!this._valueGroup.hasOwnProperty(id)) {
                this._valueGroup[id] = {id: id,
                    valueItems: []};
            }
            this._valueGroup[id].valueItems.push(value);
        }
        //   console.error("filter.valueSet error: no value .id property");
    };
    this.forEach = function (fcn) {
        for (var propt in this._valueGroup) {
            fcn(this._valueGroup[propt]);
        }
    };
};
ra.filter.value = function (id, value, tagId = null) {
    this.id = id;
    this.value = value;
    this.tagId = tagId;
};

ra.jplist = function (group) {
    this.hasFilters = false;
    this.group = group;
    this.sortButton = function (tag, varclass, type, order, text) {
        var button = document.createElement('button');
        tag.appendChild(button);
        button.setAttribute('class', "jplistsortbutton" + order);
        button.setAttribute('data-jplist-control', "sort-buttons");
        button.setAttribute('data-path', "." + varclass);
        button.setAttribute('data-group', this.group);
        button.setAttribute('data-order', order);
        button.setAttribute('data-type', type);
        button.setAttribute('data-name', "sortbutton");
        button.setAttribute('data-selected', "false");
        button.setAttribute('data-mode', "radio");
        button.textContent = text;
        return button;
    };
    this.addPagination = function (no, tag, jplistName, itemsPerPage) {
        tag.innerHTML = '';
        if (!ra.isES6()) {
            var h3 = document.createElement('h3');
            h3.setAttribute('class', 'oldBrowser');
            h3.textContent = 'You are using an old Web Browser!';
            var p = document.createElement('p');
            p.setAttribute('class', 'oldBrowser');
            h3.textContent = 'We suggest you upgrade to a more modern Web browser, Chrome, Firefox, Safari,...';
            h3.appendChild(p);
            tag.appendChild(h3);
            return null;
        }
        if (no < 21) {

        } else {
            var tags = [
                {name: 'div', parent: 'root', tag: 'div', attrs: {'data-jplist-control': 'pagination',
                        'data-group': this.group, 'data-items-per-page': itemsPerPage,
                        'data-current-page': '0', 'data-id': 'no-items',
                        'data-name': jplistName, class: 'ra pagination'}},
                {name: 'spanitems', parent: 'div', tag: 'span'},
                {name: 'span', parent: 'spanitems', tag: 'span', attrs: {class: 'ra nonmobile', 'data-type': 'info'}, textContent: '{startItem} - {endItem} of {itemsNumber}'},
                {name: 'buttons', parent: 'div', tag: 'span', attrs: {class: 'center '}},
                {name: 'first', parent: 'buttons', tag: 'button', attrs: {type: 'button', 'data-type': 'first'}, textContent: '|<'},
                {name: 'previous', parent: 'buttons', tag: 'button', attrs: {type: 'button', 'data-type': 'prev'}, textContent: '<'},
                {name: 'xxx', parent: 'buttons', tag: 'span', attrs: {class: 'jplist-holder', 'data-type': 'pages'}},
                {name: 'pageNumber', parent: 'xxx', tag: 'button', attrs: {type: 'button', 'data-type': 'page'}, textContent: '{pageNumber}'},
                {name: 'next', parent: 'buttons', tag: 'button', attrs: {type: 'button', 'data-type': 'next'}, textContent: '>'},
                {name: 'last', parent: 'buttons', tag: 'button', attrs: {type: 'button', 'data-type': 'last'}, textContent: '>|'},
                {name: 'select', parent: 'div', tag: 'select', attrs: {class: 'ra nonmobile', 'data-type': 'items-per-page'}},
                {parent: 'select', tag: 'option', attrs: {value: '10'}, textContent: '10 per page'},
                {parent: 'select', tag: 'option', attrs: {value: '20'}, textContent: '20 per page'},
                {parent: 'select', tag: 'option', attrs: {value: '50'}, textContent: '50 per page'},
                {parent: 'select', tag: 'option', attrs: {value: '100'}, textContent: '100 per page'},
                {parent: 'select', tag: 'option', attrs: {value: '0'}, textContent: 'View all'}
            ];

            var elements = ra.html.generateTags(tag, tags);
            elements.select.style.width = "120px";
        }

        return null;

    };
    this.addFilter = function (varclass, name, type, min = 0, max = 999999) {
        var out = "";
        if (type === "text") {
            this.hasFilters = true;
            out = '<input \
     data-jplist-control="textbox-filter"  data-group="' + this.group + '" \
     data-name="my-filter-' + varclass + '" \
     data-path=".' + varclass + '" type="text" \
     value="" placeholder="Filter by ' + name + '" />';
        }
        if (type === "number") {
            this.hasFilters = true;
            out = '<div class="csv-slider"><div class="ra-slider" \
      data-jplist-control="slider-range-filter" \
      data-path=".' + varclass + '" \
      data-group="' + this.group + '" \
      data-name="my-slider-' + varclass + '" \
      data-min="' + min + '" \
      data-from="' + min + '" \
      data-to="' + max + '" \
      data-max="' + max + '"> \
      <b>' + name + ':</b> <span data-type="value-1"></span> \
      <div class="jplist-slider" data-type="slider"></div> \
      <span data-type="value-2"></span>  \
      </div></div>';
        }
        var _this = this;
        window.addEventListener("resize", function () {
            _this.updateControls();
        });
        return out;
    };
    this.updateControls = function () {
        var sliders = document.getElementsByClassName('ra-slider');
        for (let slider of sliders) {
            jplist.resetControl(slider);
        }
    };
    this.init = function (name) {
        var hasPagination = false;
        var elements = document.querySelectorAll("[data-jplist-control='pagination']");
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            if (element.hasAttribute('data-group')) {
                if (element.getAttribute('data-group') === this.group) {
                    hasPagination = true;
                }
            }
        }
        if (ra.isES6()) {
            if (this.hasFilters || hasPagination) {
                jplist.init({
                    storage: 'sessionStorage', //'localStorage', 'sessionStorage' or 'cookies'
                    storageName: name //the same storage name can be used to share storage between multiple pages
                });
            }
        }
    };
};


if (typeof (ra.ics) === "undefined") {
    ra.ics = {};
    // https://icalendar.org/
    ra.ics.file = function () {
        this.foldLength = 73;
        this.newLineChar = '\r\n';
        this.file = '';
        this.dateStamp = ra.date.toICSFormat(new Date()) + 'Z';
        var d = new Date();
        this.createdDate = d.toISOString();
        this.addEvent = function (event) {
            var item = event.getItem();
            this._addRecord('BEGIN:', 'VEVENT');
            this._addRecord('DTSTART;VALUE=DATE-TIME:', item.startDate);
            this._addRecord('DTEND;VALUE=DATE-TIME:', item.endDate);
            this._addRecord('LOCATION:', item.location);
            this._addRecord('TRANSP:', 'OPAQUE');
            this._addRecord('SEQUENCE:', item.sequence);
            this._addRecord('UID: ', item.uid);
            this._addRecord('ORGANIZER;CN=', item.organiser);
            this._addRecord('SUMMARY:', item.summary);
            this._addRecord('DESCRIPTION:', item.description);
            this._addRecord('X-ALT-DESC;FMTTYPE=text/html:', item.altDescription, true);
            this._addRecord('CATEGORIES:', item.categories);
            this._addRecord('DTSTAMP;VALUE=DATE-TIME:', this.dateStamp);
            this._addRecord('CREATED;VALUE=DATE-TIME:', item.createdDate);
            this._addRecord('LAST-MODIFIED;VALUE=DATE-TIME:', item.modifiedDate);
            this._addRecord('PRIORITY:', '1');
            this._addRecord('URL;VALUE=URI:', item.url);
            this._addRecord('CLASS:', 'PUBLIC');
            this._addRecord('END:', 'VEVENT');
        };
        this.download = function () {
            this._addRecord('END:', 'VCALENDAR');
            var data = this.file;
            try {
                var blob = new Blob([data], {type: "text/calendar"});
                var name = "ramblerswalks.ics";
                saveAs(blob, name);
            } catch (e) {
                alert('Your web browser does not support this option!');
            }
        };
        this._addRecord = function ($command, $content = "", $html = false) {
            if ($content === null) {
                return;
            }
            if (!(typeof $content === 'string' || $content instanceof String)) {
                $content = $content.toString();
            }
            //var   $text= $command + $content+this.newLineChar;
            //  return;
            //  var $text = mb_convert_encoding($content, "UTF-8");
            var $text = $content;
            var $line;
            if ($html) {
                var $before = "<!DOCTYPE html><html><head><title></title></head><body>";
                var $after = "</body></html>";
                $text = this.escapeString($text);
                $line = $command + $before + $text + $after;
            } else {
                $text = $text.replace(/&nbsp;/g, " ");
                $text = $text.replace(/<p>/g, "");
                $text = $text.replace(/<\/p>/g, "\\n");
                $text = $text.replace(/<br>/g, "\\n");
                $text = $text.replace(/<br\/>/g, "\\n");
                $text = $text.replace(/<BR>/g, "\\n");
                $text = $text.replace(/<BR\/>/g, "\\n");
                $text = $text.replace(/&ndash;/g, "-");
                //   $text = ra.html.stripTags($text);
                // $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5);
                //   $text = ra.html.convertToText($text);
                $text = this.escapeString($text);
                //   $lines = this.foldline($command + $text + this.newLineChar);
                $line = $command + $text.trim();
            }
            this.file += this._stringIntoChunks($line, 73);
        };
        this._stringIntoChunks = function (string, chunkSize) {
            const chunks = [];
            var out = '';
            while (string.length > 0) {
                chunks.push(string.substring(0, chunkSize));
                string = string.substring(chunkSize, string.length);
            }

            chunks.forEach(myFunction);

            function myFunction(value, index, array) {
                if (index === 0) {
                    out += value + '\r\n';
                } else {
                    out += " " + value + '\r\n';
                }

            }
            return out;
        };
        this.trimICSstring = function (str) {
            var finished = false;
            var out = str;
            do {
                finished = true;
                if (out.endsWith("\\n")) {
                    out = out.slice(0, -2);
                    finished = false;
                }
                if (out.endsWith("\\r")) {
                    out = out.slice(0, -2);
                    finished = false;
                }
                if (out.endsWith(" ")) {
                    out = out.slice(0, -1);
                    finished = false;
                }
            } while (!finished);
            return out;
        };
        this.escapeString = function (str) {
            var out;
            out = str.replace(/,/g, '\\,');
            out = out.replace(/;/g, '\\;');
            //  out = out.replace(/[^\x20-\x7E]+/g, '&nbsps;');

            return out;
        };
        this.decodeEntities = function (s) {
            var str, temp = document.createElement('p');
            temp.innerHTML = s;
            str = temp.textContent || temp.innerText;
            temp = null;
            return str;
        };
        /**
         * Performs iCalendar line folding. A line ending character is inserted and
         * the next line begins with a whitespace.
         *
         * @example
         * SUMMARY:This line will be fold
         *  ed right in the middle of a word.
         *
         * @param {String} aLine      The line to fold
         * @return {String}           The folded line
         */
        this.foldline = function (aLine) {
            var result = "";
            var line = aLine || "", pos = 0, line_length = 0;
            //pos counts position in line for the UTF-16 presentation
            //line_length counts the bytes for the UTF-8 presentation
            while (line.length) {
                var cp = line.codePointAt(pos);
                if (cp < 128)
                    ++line_length;
                else if (cp < 2048)
                    line_length += 2;//needs 2 UTF-8 bytes
                else if (cp < 65536)
                    line_length += 3;
                else
                    line_length += 4; //cp is less than 1114112
                if (line_length < this.foldLength + 1)
                    pos += cp > 65535 ? 2 : 1;
                else {
                    result += this.newLineChar + " " + line.substring(0, pos);
                    line = line.substring(pos);
                    pos = line_length = 0;
                }
            }
            return result.substr(this.newLineChar.length + 1);
        };


        this._addRecord('BEGIN:', 'VCALENDAR');
        this._addRecord('VERSION:', '2.0');
        this._addRecord('METHOD:', 'PUBLISH');
        this._addRecord('PRODID:', 'ramblers-webs v1.2');
    };


    ra.ics.event = function () {
        this.item = {
            startDate: null,
            endDate: null,
            modifiedDate: null,
            createdDate: null,
            uid: null,
            organiser: null,
            summary: null,
            description: null,
            altDescription: null,
            sequence: null,
            location: null,
            url: null,
            class: null,
            method: null
        };
        this.getItem = function () {
            return this.item;
        };
        this.startDate = function (value) {
            this.checkType('[object Date]', value);
            this.item.startDate = ra.date.toICSFormat(value);
        };
        this.endDate = function (value) {
            this.checkType('[object Date]', value);
            this.item.endDate = ra.date.toICSFormat(value);
        };
        this.modifiedDate = function (value) {
            this.item.modifiedDate = ra.date.toICSFormat(value) + 'Z';
            var $date = new Date('2010-01-01');
            var $days = ra.date.periodInDays(value, $date) - 1;
            // Fix added to include number of seconds since midnight, forcing an update on each download. 
            // Otherwise, the event would only update daily. 
            this.item.sequence = $days.toString() + ra.date.secondsSinceMidnight(new Date()) % 86400;
        };
        this.createdDate = function (value) {
            this.checkType('[object Date]', value);
            this.item.createdDate = ra.date.toICSFormat(value) + 'Z';
        };
        this.location = function (value) {
            this.item.location = value;
        };
        this.uid = function (value) {
            this.item.uid = value;
        };
        this.organiser = function (value) {
            this.item.organiser = value;
        };
        this.summary = function (value) {
            this.item.summary = value;
        };
        this.description = function (value) {
            this.item.description = value;
        };
        this.altDescription = function (value) {
            this.item.altDescription = value;
        };
        this.categories = function (value) {
            this.item.categories = value;
        };
        this.url = function (value) {
            this.item.url = value;
        };
        this.class = function (value) {
            this.item.class = value;
        };
        this.method = function (value) {
            this.item.method = value;
        };
        this.checkType = function (type, value) {
            // Object.prototype.toString.call(value) === '[object Date]';
            var oType = Object.prototype.toString.call(value);
            if (oType === type) {
                return true;
            } else {
                alert('Incorrect type in ICS');
            }
            return false;
        };
    };


}

// create input field to allow uploading a file
// add field to a tag like a button
ra.uploadFile = function () {
    this.inputTag = null;
    this.addField = function (tag, extensions) {
        this.tag = tag;
        this.extensions = extensions;
        this.inputTag = this._createInput(tag);
        var _this = this;
        this.inputTag.addEventListener('input', function (evt) {
            var files = evt.target.files; // FileList object
            var file = files[0];
            _this.filename = file.name;
            var reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    _this._readFile(reader.result);
                };
            })(file);
            reader.readAsText(file);
            return false;
        });
        this.tag.addEventListener("click", function (e) {
            _this.inputTag.click();
        });
        return tag;
    };
    this._readFile = function (result) {
        let event = new Event("upload-file-read"); // 
        event.ra = {};
        event.ra.result = result;
        this.tag.dispatchEvent(event);
    };
    this._createInput = function (container) {
        var div = L.DomUtil.create('div', 'file-upload', container);
        container.appendChild(div);
        var input = document.createElement('input');
        //input.setAttribute('id', "gpx-file-upload");
        input.style.display = 'none';
        input.setAttribute('type', "file");
        input.setAttribute('accept', this.extensions);
        div.appendChild(input);
        return input;
    };


};