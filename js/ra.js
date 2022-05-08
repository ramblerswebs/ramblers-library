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
    "mouseposition": false,
    "rightclick": false,
    "settings": false,
    "mylocation": false,
    "fitbounds": true,
    "draw": false,
    "print": false,
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
        ra._baseDirectory = options.base;
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
    var $img = '<img src="' + ra.baseDirectory() + 'libraries/ramblers/images/symbol_at.png" alt="@ sign" />';
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
        if (key == null) {
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
                callback(status);
            }
        };
        xhr.send();
    };
    // post for json feed and callback
    ajax.postJSON = function (url, data, callback) {
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
                callback(null, items);
            } else {
                callback(status);
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
                if (typeof toItem === 'object' && typeof fromItem === 'object') {
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
        var value = date._setDateTime(datetime);
        var options = {year: 'numeric', month: 'short', day: 'numeric', weekday: 'short'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.dow = function (datetime) {
        var value = date._setDateTime(datetime);
        var options = {weekday: 'long'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.dowShort = function (datetime) {
        var value = date._setDateTime(datetime);
        var options = {weekday: 'short'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.dd = function (datetime) {
        var value = date._setDateTime(datetime);
        return value.getDate().toString() + date.nth(value);
    };
    date.dowShortdd = function (datetime) {
        return date.dowShort(datetime) + ", " + date.dd(datetime);
    };
    date.month = function (datetime) {
        var value = date._setDateTime(datetime);
        var options = {month: 'long'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.monthShort = function (datetime) {
        var value = date._setDateTime(datetime);
        var options = {month: 'short'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.dowShortddmm = function (datetime) {
        return date.dowShortdd(datetime) + ", " + date.month(datetime);
    };
    date.dowShortddmmyyyy = function (datetime) {
        var value = date._setDateTime(datetime);
        var options = {year: 'numeric', month: 'short', day: 'numeric', weekday: 'short'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.toICSFormat = function (datetime) {
        var value = date._setDateTime(datetime);
        var yyyymmdd = value.getFullYear().toString() + date.MM(value) + date.DD(value);
        var out = yyyymmdd + "T" + value.getHours().toString().padStart(2, '0') + value.getMinutes().toString().padStart(2, '0') + "00";
        return out;
    };
    date.toYYYYMMDDmmhhssFormat = function (datetime) {
        var value = date._setDateTime(datetime);
        var yyyymmdd = value.getFullYear().toString() + '-' + date.MM(value) + '-' + date.DD(value);
        var time = value.getHours().toString().padStart(2, '0') + ':' + value.getMinutes().toString().padStart(2, '0') + ':' + "00";
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
        var value = date._setDateTime(datetime);
        var options = {year: 'numeric'};
        return value.toLocaleDateString("en-UK", options);
    };
    date.YY = function (datetime) {
        var value = ra.date.YYYY(datetime);
        return value.substr(2, 2);
    };
    date.YYYYMMDD = function (datetime) {
        var value = date._setDateTime(datetime);
        return value.getFullYear() + "-" + date.MM(value) + "-" + date.DD(value);
    };
    date.DDMMYYYY = function (datetime) {
        var value = date._setDateTime(datetime);
        return date.DD(value) + "/" + date.MM(value) + "/" + value.getFullYear();
    };
    date.MM = function (datetime) {
        var value = date._setDateTime(datetime);
        return  (value.getMonth() + 1).toString().padStart(2, '0');
    };
    date.DD = function (datetime) {
        var value = date._setDateTime(datetime);
        return value.getDate().toString().padStart(2, '0');
    };
    date.nth = function (datetime) {
        var value = date._setDateTime(datetime);
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
        var d1 = date._setDateTime(date1);
        var d2 = date._setDateTime(date2);
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
    date._setDateTime = function (datetimestring) {
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
            return date;
        } else {
            return value;
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
        var date = ra.date._setDateTime(datetime);
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
        var value = ra.date._setDateTime(datetime);
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
    html.insertAfter = function (referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
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
        var content = tag.innerHTML;
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
        mywindow.document.write(content);
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
        if (raobject[property]) {
            inputTag.textContent = options[0];
            inputTag.classList.add("button-p0555");
            inputTag.classList.remove("button-p0186");
        } else {
            inputTag.textContent = options[1];
            inputTag.classList.add("button-p0186");
            inputTag.classList.remove("button-p0555");
        }
        inputTag.ra = {};
        inputTag.ra.object = raobject;
        inputTag.ra.property = property;
        inputTag.ra.options = options;
        inputTag.addEventListener("click", function (e) {
            inputTag.ra.object[inputTag.ra.property] = !inputTag.ra.object[inputTag.ra.property];
            ra.html.input.yesNoReset(inputTag, inputTag.ra.object[inputTag.ra.property]);
            let event = new Event("ra-input-change");
            inputTag.dispatchEvent(event);
        });
        itemDiv.appendChild(_label);
        itemDiv.appendChild(inputTag);
        return inputTag;
    };
    ra.html.input.yesNoReset = function (inputTag, value) {
        var ra = inputTag.ra;
        ra.object[ra.property] = value;
        if (value) {
            inputTag.textContent = ra.options[0];
            inputTag.classList.add("button-p0555");
            inputTag.classList.remove("button-p0186");
        } else {
            inputTag.textContent = ra.options[1];
            inputTag.classList.add("button-p0186");
            inputTag.classList.remove("button-p0555");
        }
        let event = new Event("ra-input-change");
        inputTag.dispatchEvent(event);
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
        //  inputTag.setAttribute('class', ' form-control-range');
        inputTag.setAttribute('type', 'range');
        inputTag.setAttribute('class', 'slider');
        inputTag.setAttribute('min', minval);
        inputTag.setAttribute('max', maxval);
        inputTag.setAttribute('step', step);
        inputTag.ra = {};
        inputTag.ra.object = raobject;
        inputTag.ra.property = property;
        if (raobject.hasOwnProperty(property)) {  // Initialise value
            inputTag.setAttribute('value', raobject[property]);
            _label.textContent = label.replace("%n", inputTag.value);
        }
        inputTag.addEventListener("input", function (e) {
            e.target.ra.object[e.target.ra.property] = e.target.value;
            _label.textContent = label.replace("%n", e.target.value);
            let event = new Event("ra-input-change");
            tag.dispatchEvent(event);
        });
        itemDiv.appendChild(inputTag);
        itemDiv.appendChild(_label);
        return inputTag;
    };
    ra.html.input.numberReset = function (inputTag, value) {
        var ra = inputTag.ra;
        ra.object[ra.property] = value;
        inputTag.value = value;
        //   if (raiseEvent) {
        let event = new Event("ra-input-change");
        inputTag.dispatchEvent(event);
        // }
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
            tag.dispatchEvent(event);
        });



        return inputColor;
    };
    ra.html.input.colourReset = function (inputTag, value) {
        var ra = inputTag.ra;
        ra.object[ra.property] = value;
        inputTag.value = value;
//        if (raiseEvent) {
        let event = new Event("ra-input-change"); // (2)
        inputTag.dispatchEvent(event);
//    }

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
        var weight = ra.html.input.number(itemDiv, 'divClass', 'Weight %n pixels', raobject, 'weight', 1, 10, 0.5);
        var opacity = ra.html.input.number(itemDiv, 'divClass', 'Opacity %n (0-1)', raobject, 'opacity', .1, 1, .01);
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

//        itemDiv.addEventListener("ra-input-change", function (e) {
//            ra.html.input._setExampleLineStyle(example, raobject);
//        });
        return itemDiv;
    };
    ra.html.input.lineStyleReset = function (itemDiv, style) {
        ra.html.input.colourReset(itemDiv.ra.color, style.color, false);
        ra.html.input.numberReset(itemDiv.ra.weight, style.weight, false);
        ra.html.input.numberReset(itemDiv.ra.opacity, style.opacity, false);
        // ra.html.input._setExampleLineStyle(itemDiv,style);
        //     let event = new Event("ra-input-change");
        //    itemDiv.dispatchEvent(event);
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
        var opacity = ra.html.input.number(itemDiv, 'divClass', 'Opacity %n (0-1)', raobject, 'opacity', .1, 1, .01);
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
        return itemDiv;
    };
    ra.html.input.fillStyleReset = function (itemDiv, style) {
        ra.html.input.colourReset(itemDiv.ra.color, style.color);
        ra.html.input.numberReset(itemDiv.ra.weight, style.weight);
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
        $out = "<span class='mappopup' onClick=\"javascript:ra.link.streetmap(" + lat + "," + long + ")\">[" + text + "]</span>";
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
                var out = '<a class="w3w" href="https://what3words.com/about-us/" target="_blank">What3Words: </a>';
                out += '<a class="w3w" href="https://what3words.com/' + items.words + '" target="_blank"> ///' + items.words + '</a><br/>';
                if (place) {
                    out += '<b>Nearest Place: </b>' + items.nearestPlace + '<br/>';
                }
                tag.innerHTML = out;
            }
        });
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


ra.modal = (function () {
    var modal = {};
    modal.isFullScreen = false;
    modal.mapcontrol = null;
    modal.elements = {modaltag: null};
    modal.display = function ($html, printButton = true) {

        modal._createModalTag(printButton);
        ra.html.setTag(modal.elements.data, $html);
        modal.elements.modaltag.style.display = "block";
        modal.elements.close.addEventListener("click", function () {
            if (modal.elements.modaltag !== null) {
                modal.elements.modaltag.remove();
                modal.elements = {modaltag: null};
            }
        });
        var print = modal.elements.print;
        if (print !== null) {
            print.onclick = function () {
                ra.html.printTag(modal.elements.data);
            };
        }
        modal.fullscreenMap();
        return;
    };

    modal.magnify = function (target) {
        // save current modal
        var savecurrentmodal = '';
        if (modal.elements.modaltag === null) {
            // not in a modal
            modal.display(target.innerHTML);
            return;
        }
        savecurrentmodal = modal.elements.data.innerHTML;
        // change content
        var complete = document.createElement('div');
        complete.classList.add("modal-outline");
        var closeBtn = document.createElement('span');
        closeBtn.textContent = 'x';
        closeBtn.classList.add("close");
        complete.appendChild(closeBtn);
        var content = document.createElement('div');
        complete.appendChild(content);

        content.innerHTML = target.innerHTML;
        //  content.classList.add("pointer");
        ra.modal.elements.data.innerHTML = '';
        ra.modal.elements.data.appendChild(complete);
        complete.addEventListener("click", function () {
            ra.modal.elements.data.innerHTML = '';
            ra.modal.elements.data.innerHTML = savecurrentmodal;
        });
        // reset modal when it closes
    };
    modal.fullscreen = function (isFullScreen, mapcontrol) {
        modal.isFullScreen = isFullScreen;
        modal.mapcontrol = mapcontrol;
    };
    modal.fullscreenMap = function () {
        if (modal.isFullScreen) {
            modal.mapcontrol.toggleFullscreen();
            var closeBtn = modal.elements.close;
            closeBtn.addEventListener("click", function () {
                modal.mapcontrol.toggleFullscreen();
            });
        }
    };
    modal._createModalTag = function (print = true) {
        var tags = [
            {name: 'modaltag', parent: 'root', tag: 'div', attrs: {class: 'js-modal ramblers'}, style: {display: 'none'}},
            {name: 'content', parent: 'modaltag', tag: 'div', attrs: {class: 'modal-content'}},
            {name: 'header', parent: 'content', tag: 'div', attrs: {class: 'modal-header'}},
            {name: 'print', parent: 'header', tag: 'button', attrs: {class: 'btn modal-print'}, textContent: 'Print'},
            {name: 'close', parent: 'header', tag: 'button', attrs: {class: 'btn modal-close'}, textContent: 'Close'},
            {parent: 'content', tag: 'p', style: {clear: 'right'}},
            {name: 'data', parent: 'content', tag: 'div'},
            {parent: 'content', tag: 'hr'}
        ];

        if (modal.elements.modaltag === null) {
            var body = document.getElementsByTagName("BODY")[0];
            modal.elements = ra.html.generateTags(body, tags);
            modal.elements.close.setAttribute('data-dismiss', 'modal');
        }
        if (!print) {
            modal.elements.print.style.display = 'none';
    }
    };
    return modal;
}
());


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
        {angle: 45, name: "North East", abbr: "NE"},
        {angle: 90, name: "East", abbr: "E"},
        {angle: 135, name: "South East", abbr: "SE"},
        {angle: 180, name: "South", abbr: "S"},
        {angle: 225, name: "South West", abbr: "SW"},
        {angle: 270, name: "West", abbr: "W"},
        {angle: 315, name: "North West", abbr: "NW"},
        {angle: 360, name: "North", abbr: "N"}];

    geom.validateRadius = function ($unit) {
        if ($unit === "KM") {
            return KM;
        } else {
            return MI;
        }
    };
// Takes two sets of geographic coordinates in decimal degrees and produces distance along the great circle line.
// Optionally takes a fifth argument with one of the predefined units of measurements, or planet radius in custom units.
    geom.distance = function ($lat1, $lon1, $lat2, $lon2, $unit = KM) {
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
        var $lon3 = $lon1 + Math.atan2(sin(ra.math.deg2rad($brng)) * Math.sin($dt / $r) * Math.cos($lat1), Math.cos($dt / $r) - Math.sin($lat1) * Math.sin($lat3));
        return {
            "LAT": ra.math.rad2deg($lat3),
            "LON": ra.math.rad2deg($lon3)};
    };
    geom.direction = function ($lat1, $lon1, $lat2, $lon2) {
        var $bearing = geom.bearing($lat1, $lon1, $lat2, $lon2);
        var $inc = 22.5;
        //     var $direction = array("North", "North East", "East", "South East", "South", "South West", "West", "North West", "North");
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
//        var $ang;
//        for ($ang = 0; $ang <= 360; $ang += 45) {
//            if ($bearing >= $ang - $inc && $bearing <= $ang + $inc) {
//                return $direction[$i];
//            }
//            
//        }
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


ra.filter = function (settingsFilter) {

    this.settingsFilter = settingsFilter;
    this.setFilterGroup = function (items, date = false) {
        var _this = this;
        if (date) {
            Object.keys(items).forEach(function (key) {
                var item = items[key];
                _this.settingsFilter[item.id] = item.no;
            });
        } else {
            Object.keys(items).forEach(function (key) {
                var item = items[key];
                _this.settingsFilter[item.id] = item.no !== 0;
            });
    }

    };
    this.addFilter = function (tag, title, items, all = true, dates = false) {
        //   if (!all) {
        if (Object.keys(items).length < 2) {
            return;
            //       }
        }
        var div = document.createElement('div');
        div.setAttribute('class', 'ra-filteritem');
        tag.appendChild(div);

        var h3 = document.createElement('h3');
        h3.textContent = title;
        div.appendChild(h3);

        var intDiv = document.createElement('div');
        intDiv.setAttribute('class', 'ra_filter');
        div.appendChild(intDiv);
        if (!dates) {
            var ul = document.createElement('ul');
            this.addAllNone(intDiv, '[All]', ul);
            this.addAllNone(intDiv, '[None]', ul);
            intDiv.appendChild(ul);
            var _this = this;
            Object.keys(items).forEach(function (key) {
                var item = items[key];
                if (item.no > 0) {
                    _this.addFilterItem(ul, item);
                }
            });
        } else {
            var span = document.createElement('div');
            intDiv.appendChild(span);
            var start = items.min;
            var end = items.max;
            this.addFilterItemDate(span, start.name, start.id, start.no, start.no, end.no);
            this.addFilterItemDate(span, end.name, end.id, end.no, start.no, end.no);
    }
    };
    this.addFilterSelect = function (tag, title, items) {

        if (Object.keys(items).length === 1) {
            return;
        }

        var div = document.createElement('div');
        div.setAttribute('class', 'ra-filteritem');
        tag.appendChild(div);

        var h3 = document.createElement('h3');
        h3.textContent = title;
        div.appendChild(h3);

        var intDiv = document.createElement('div');
        intDiv.setAttribute('class', 'ra_filter');
        div.appendChild(intDiv);

        var select = document.createElement('select');

        intDiv.appendChild(select);

        Object.keys(items).forEach(function (key) {
            var item = items[key];
            if (item.no > 0) {
                var option = document.createElement('option');
                select.appendChild(option);
                option.setAttribute('value', item.num);
                option.innerText = item.name + " [" + item.no + "]";
//                if (item.num === '0') {
//                    option.setAttribute('selected', true);
//                }
            }
        });
        var _this = this;
        select.addEventListener("change", function (event) {
            // only works if you have one select as 'updated' is hard coded
            _this.settingsFilter['updated'] = event.target.value;
            let e = new Event("reDisplayWalks");
            document.dispatchEvent(e);
        });
    };
    this.addOpenClose = function (div, title) {
        var h3 = document.createElement('h3');
        h3.setAttribute('class', 'ra_openclose');
        h3.textContent = title;
        div.appendChild(h3);
        var span = document.createElement('span');
        span.setAttribute('class', 'ra-closed');
        h3.appendChild(span);
        h3.onclick = function (event) {
            var tag = event.target;
            if (tag.tagName === "SPAN") {
                var tag = tag.parentNode;
            }
            var next = tag.nextSibling;
            if (next.style.display !== "none") {
                next.style.display = "none";
                span.classList.add('ra-closed');
                span.classList.remove('ra-open');
            } else {
                next.style.display = "block";
                span.classList.add('ra-open');
                span.classList.remove('ra-closed');
            }
        };

    };
    this.addAllNone = function (tag, option, ul) {
        var span = document.createElement('span');
        span.setAttribute('class', 'pointer link');
        span.textContent = option;
        if (option === "[All]") {
            span.style.marginLeft = '25px';
        }
        tag.appendChild(span);
        var ul_list = ul;
        var _this = this;
        span.addEventListener('click', function (event) {
            var all = event.target.innerHTML === "[All]";
            if (ul_list.tagName === "UL") {
                var children = ul_list.children;
                Object.keys(children).forEach(function (key) {
                    var node = children[key].childNodes[0];
                    var keyid = node.getAttribute('data-filter-id');
                    node.checked = all;
                    _this.settingsFilter[keyid] = all;
                });
            }
            let e = new Event("reDisplayWalks");
            document.dispatchEvent(e);
        });

    };
    this.addFilterItem = function (tag, item) {
        var li = document.createElement('li');
        tag.appendChild(li);
        var input = document.createElement('input');
        input.setAttribute('type', 'checkbox');
        input.checked = true;
        li.appendChild(input);
        var _this = this;
        input.setAttribute('data-filter-id', item.id);
        // var keyid = item.id;
        input.addEventListener("change", function (event) {
            var keyid = event.target.getAttribute('data-filter-id');
            _this.settingsFilter[keyid] = event.target.checked;
            let e = new Event("reDisplayWalks");
            document.dispatchEvent(e);
        });

        var label = document.createElement('label');
        label.textContent = item.name + " [" + item.no + "]";
        li.appendChild(label);
    };
    this.addFilterItemDate = function (tag, name, id, value, min, max) {
        var li = document.createElement('div');
        tag.appendChild(li);
        var label = document.createElement('label');
        label.style.marginLeft = '25px';
        label.textContent = name;
        li.appendChild(label);
        var input = document.createElement('input');
        input.setAttribute('type', 'date');
        input.setAttribute('value', value);
        input.setAttribute('min', min);
        input.setAttribute('max', max);
        input.style.marginLeft = '25px';
        input.checked = true;
        li.appendChild(input);
        var _this = this;
        var keyid = id;
        input.addEventListener("input", function (event) {
            var input = event.target;
            var value = input.value;
            if (value === '') {
                if (keyid === 'RA_DateStart') {
                    value = input.min;
                    input.value = min;
                } else {
                    value = input.max;
                    input.value = max;
                }
            }
            _this.settingsFilter[keyid] = value;
            let e = new Event("reDisplayWalks");
            document.dispatchEvent(e);
        });
    };
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
    this.addPagination = function (no, tag, jplistName, itemsPerPage, print = false) {
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
            var tags = [
                {name: 'print', parent: 'root', tag: 'button', attrs: {class: 'link-button tiny button mintcake'}, textContent: 'Print'}
            ];
            var elements = ra.html.generateTags(tag, tags);
        } else {
            var tags = [
                {name: 'div', parent: 'root', tag: 'div', attrs: {'data-jplist-control': 'pagination',
                        'data-group': this.group, 'data-items-per-page': itemsPerPage,
                        'data-current-page': '0', 'data-id': 'no-items',
                        'data-name': jplistName, class: 'ra pagination'}},
                {name: 'spanitems', parent: 'div', tag: 'span'},
                {name: 'print', parent: 'spanitems', tag: 'button', attrs: {class: 'ra nonmobile link-button tiny button mintcake'}, textContent: 'Print'},
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
        elements.print.style.marginRight = "5px";
        if (print) {
            return elements.print;
        } else {
            elements.print.style.display = 'none';
            return null;
    }
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
    ra.ics.events = function () {
        this.foldLength = 73;
        this.newLineChar = '\r\n';
        this.file = '';
        this.dateStamp = ra.date.toICSFormat(new Date()) + 'Z';
        var d = new Date();
        this.createdDate = d.toISOString();
        this.addEvent = function (event) {
            var item = event.getItem();
            this.addRecord('BEGIN:', 'VEVENT');
            this.addRecord('DTSTART;VALUE=DATE-TIME:', item.startDate);
            this.addRecord('DTEND;VALUE=DATE-TIME:', item.endDate);
            this.addRecord('LOCATION:', item.location);
            this.addRecord('TRANSP:', 'OPAQUE');
            this.addRecord('SEQUENCE:', item.sequence);
            this.addRecord('UID:', item.uid);
            this.addRecord('ORGANIZER;CN=', item.organiser);
            this.addRecord('SUMMARY:', item.summary);
            this.addRecord('DESCRIPTION:', item.description);
            this.addRecord('X-ALT-DESC;FMTTYPE=text/html:', item.altDescription, true);
            this.addRecord('CATEGORIES:', item.categories);
            this.addRecord('DTSTAMP;VALUE=DATE-TIME:', this.dateStamp);
            this.addRecord('CREATED;VALUE=DATE-TIME', item.createdDate);
            this.addRecord('LAST-MODIFIED;VALUE=DATE-TIME', item.modifiedDate);
            this.addRecord('PRIORITY:', '1');
            this.addRecord('URL;VALUE=URI:', item.url);
            this.addRecord('CLASS:', 'PUBLIC');
            this.addRecord('END:', 'VEVENT');
        };
        this.download = function () {
            this.addRecord('END:', 'VCALENDAR');
            var data = this.file;
            try {
                var blob = new Blob([data], {type: "application/gpx+xml;charset=utf-8"});

                var name = "walks.ics";
                saveAs(blob, name);
            } catch (e) {
                alert('Your web browser does not support his option!');
            }
        };
        this.addRecord = function ($command, $content = "", $html = false) {
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
                var $lines;
                var $before = "<!DOCTYPE html><html><head><title></title></head><body>";
                var $after = "</body></html>";
                $text = this.decodeEntities($text);
                $text = this.escapeString($text);
                //     $lines = this.foldline($command + $before + $text + $after + this.newLineChar);
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
                $text = ra.html.stripTags($text);
                // $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5);
                $text = ra.html.convertToText($text);
                $text = this.escapeString($text);
                //   $lines = this.foldline($command + $text + this.newLineChar);
                $line = $command + $text;
            }
            $lines = this.stringToChunks($line, 73);
            var _this = this;
            $lines.forEach(myFunction);

            function myFunction(value, index, array) {
                _this.file += value + '\r\n';
        }
        //  this.file += $lines;
        };
        this.stringToChunks = function (string, chunkSize) {
            const chunks = [];
            while (string.length > 0) {
                chunks.push(string.substring(0, chunkSize));
                string = string.substring(chunkSize, string.length);
            }
            return chunks;
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
            out = out.replace(/[^\x20-\x7E]+/g, '&nbsps;');

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


        this.addRecord('BEGIN:', 'VCALENDAR');
        this.addRecord('VERSION:', '2.0');
        this.addRecord('METHOD:', 'PUBLISH');
        this.addRecord('PRODID:', 'ramblers-webs v1.1');
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