/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var L, ramblersMap, ramblersGpx, markerRoute, jplist;

function RamblersLeafletGpx() {
    this.routes = null;
    this.folder = null;
    this.linecolour = "#782327";
    this.dateorder = false;
    this.authororder = false;
    this.distorder = false;
    this.titleorder = false;
    this.gainorder = false;
    this.download = 0;
    this.elevation = null;
    this.description = true;
    this.displayAsPreviousWalks = false;
    this.gpx = null;
    this.searchtext = '';
}
function displayData() {
    setTagHtml('ra-pagination1', addPagination());
    displayGPXTable();
    addGPXMarkers();
    jplist.init({
        storage: 'cookies', //'localStorage', 'sessionStorage' or 'cookies'
        storageName: 'my-page-storage' //the same storage name can be used to share storage between multiple pages
    });
}
function displayGPX(file, linecolour, imperial) {
    // remove old gpx route
    if (ramblersGpx.elevation !== null) {
        ramblersGpx.elevation.remove();
        ramblersGpx.elevation = null;
    }
    if (ramblersGpx.gpx !== null) {
        ramblersGpx.gpx.remove();
        ramblersGpx.gpx = null;
    }
    var el = L.control.elevation({
        position: "topleft",
        theme: "steelblue-theme", //default: lime-theme
        width: 600,
        height: 125,
        margins: {
            top: 10,
            right: 20,
            bottom: 30,
            left: 50
        },
        useHeightIndicator: true, //if false a marker is drawn at map position
        interpolation: "linear", //see https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-area_interpolate
        hoverNumber: {
            decimalsX: 1, //decimals on distance (always in km)
            decimalsY: 0, //deciamls on hehttps://www.npmjs.com/package/leaflet.coordinatesight (always in m)
            formatter: undefined //custom formatter function may be injected
        },
        xTicks: undefined, //number of ticks in x axis, calculated by default according to width
        yTicks: undefined, //number of ticks on y axis, calculated by default according to height
        collapsed: true, //collapsed mode, show chart on click or mouseover
        imperial: imperial    //display imperial units instead of metric
    });
    el.addTo(ramblersMap.map);
    var g = new L.GPX(ramblersMap.base + file, {async: true,
        polyline_options: {color: linecolour},
        marker_options: {
            startIconUrl: ramblersMap.base + 'ramblers/leaflet/images/pin-icon-start.png',
            endIconUrl: ramblersMap.base + 'ramblers/leaflet/images/pin-icon-end.png',
            shadowUrl: ramblersMap.base + 'ramblers/leaflet/images/pin-shadow.png'
        }});
    g.on('addline', function (e) {
        el.addData(e.line);
    });
    g.on('addpoint', function (e) {
        if (e.point_type === "waypoint") {
            var marker = e.point;
            var icon = L.icon({
                iconUrl: ramblersMap.base + 'ramblers/leaflet/images/redmarker.png',
                iconSize: [36, 41], // size of the icon
                iconAnchor: [18, 41],
                popupAnchor: [0, -41]
            });
            marker.setIcon(icon);
            var sSymbol = marker.options.iconkey;
            setMarkerIcon(marker, sSymbol);
        }
    });
    g.on('loaded', function (e) {
        ramblersMap.map.fitBounds(e.target.getBounds());
        displayGpxdetails(g);
    });
    g.addTo(ramblersMap.map);
    ramblersGpx.elevation = el;
    ramblersGpx.gpx = g;

}
function displayGpxdetails(g) {
    if (document.getElementById('gpxsingleheader') !== null) {
        var info = g._info;
        var header = "";
        if (info !== "undefined" && info !== null) {
            if (info.name !== "undefined" && info.name !== null) {
                header = '<b>Name:</b> ' + info.name + "<br/>";
            }
            header += '<b>Distance:</b> ' + getGPXDistance(info.length) + '<br/>';
            if (info.desc !== "undefined" && info.desc !== null) {
                header += '<b>Description:</b> ' + info.desc + '<br/>';
            }
            if (info.elevation.gain === 0) {
                header += "No elevation data<br/>";
            } else {
                header += '<b>Min Altitude:</b> ' + info.elevation.min.toFixed(0) + ' m<br/>';
                header += '<b>Max Altitude:</b> ' + info.elevation.max.toFixed(0) + ' m<br/>';
                header += '<b>Elevation Gain:</b> ' + info.elevation.gain.toFixed(0) + ' m<br/>';
            }
            header += "<b>Est time:</b> " + naismith(info.length, info.elevation.gain);
            document.getElementById('gpxsingleheader').innerHTML = header;
        }
    }
}

// Tab control

//function ra_tab(evt, name) {
//    var i, tabcontent, tablinks;
//    tabcontent = document.getElementsByClassName("ra_tabcontent");
//    for (i = 0; i < tabcontent.length; i++) {
//        tabcontent[i].style.display = "none";
//    }
//    tablinks = document.getElementsByClassName("ra_tablinks");
//    for (i = 0; i < tablinks.length; i++) {
//        tablinks[i].className = tablinks[i].className.replace(" active", "");
//    }
//    document.getElementById(name).style.display = "block";
//    evt.currentTarget.className += " active";
//}

//function openTab(evt, tabName) {
//// Declare all variables
//    var i, tablinks;
//// Get all elements with class="tablinks" and remove the class "active"
//    tablinks = document.getElementsByClassName("tablinks");
//    for (i = 0; i < tablinks.length; i++) {
//        tablinks[i].className = tablinks[i].className.replace(" active", "");
//    }
//
//    evt.currentTarget.className += " active";
//    switch (tabName) {
//        case "tabRouteDetails":
//            displayGPXTable();
//            break;
//        case "tabRouteList":
//            displayGPXNames();
//            break;
//        case "tabDescriptions":
//            displayGPXDescriptions();
//            break;
//    }
//    jplist.init({
//    storage: 'cookies', //'localStorage', 'sessionStorage' or 'cookies'
//            storageName: 'my-page-storage' //the same storage name can be used to share storage between multiple pages
//
//            });
//        }

function showhide(evt, idName) {
    var x = document.getElementById(idName);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }

}

//// code to handle list of GPX Routes
//function displayGPXNames() {
//    var out, index;
//    out = "<div class='gpxlist'>";
//    out += '<ul data-jplist-group=\"group1\">';
//    for (index = 0; index < ramblersGpx.routes.length; ++index) {
//        var route = ramblersGpx.routes[index];
//        if (displayRoute(route)) {
//            out += "<li data-jplist-item>" + displayGPXName(route) + "</li>";
//        }
//    }
//    out += '</ul>';
//    out += '</div>';
//    document.getElementById("dataTab").innerHTML = out;
//}
function displayGPXName(route) {
    var link = '<b><a href="javascript:updateGPXid(' + route.id + ')">' + route.title + '</a></b>';
    return link;
}
function displayGPXTable() {
    var out, index;
    var tag;
    var extra = "";
    tag = document.getElementById("dataTab");
    if (tag !== null) {
        out = '<table id="gpxdetails"><thead>';
        if (ramblersGpx.displayAsPreviousWalks) {
            extra = "<th>Date</th><th>Leader</th>";
        }
        out += "<tr>" + extra + "<th>Title</th><th>Distance Km</th><th>Miles</th><th>min Altitude</th><th>max Altitude</th><th>Elevation Gain</th>";
        if (ramblersGpx.download === 0) {
            out += "</tr>";
        } else {
            out += "<th>GPX</th></tr>";
        }
        out += "</thead>";
        out += '<tbody data-jplist-group=\"group1\">';
        for (index = 0; index < ramblersGpx.routes.length; ++index) {
            var route = ramblersGpx.routes[index];
            if (displayRoute(route)) {
                out += '<tr data-jplist-item>';
                out += displayGPXRow(route);
                out += '</tr>';
            }
        }
        out += '</tbody></table>';
        if (ramblersGpx.download === 1) {
            out += "<p>* To be able to download GPX Routes, you need to log on to our web site.</p>";
        }
        tag.innerHTML = out;
    }
}
function displayGPXRow(route) {
    var link = "";
    if (ramblersGpx.displayAsPreviousWalks) {
        link += '<td class="wDate"><b>' + route.date + '</b></td>';
        link += '<td class="wAuthor alignleft">' + route.author + '</td>';
    }
    link += '<td class="wTitle alignleft"><b><a href="javascript:updateGPXid(' + route.id + ')">' + route.title + '</a></b></td>';
    link += '<td class="wDistance">' + (route.distance / 1000).toFixed(1) + '</td>';
    link += '<td>' + m_to_mi(route.distance).toFixed(2) + '</td>';
    if (route.cumulativeElevationGain === 0) {
        link += '<td>...</td>';
        link += '<td>...</td>';
        link += '<td class="wElevation">...</td>';
    } else {
        link += '<td>' + route.minAltitude.toFixed(0) + '</td>';
        link += '<td>' + route.maxAltitude.toFixed(0) + '</td>';
        link += '<td class="wElevation">' + route.cumulativeElevationGain.toFixed(0) + '</td>';
    }
    link += '<td>' + getGPXdownloadLink(route) + '</td>';
    return link;
}
function getGPXDistance(distance) {
    var dist, miles;
    dist = m_to_km(distance);
    miles = m_to_mi(distance);
    return dist.toFixed(1) + ' km / ' + miles.toFixed(2) + 'mi';
}
function updateGPXid(id) {
    ra_format("Map");
    var header, path;
    var route = getRoutefromID(id);
    header = "<h2>" + route.title + "</h2>";
    header += "<button style='float:right' class=\"link-button button-p5565 small white\" onclick=\"showhide(event, 'gpxDetails')\">Show/Hide Details</button><div id='gpxDetails'><p>";
    if (ramblersGpx.displayAsPreviousWalks) {
        header += '<b>Date:</b> ' + route.date + '<br/>';
        header += '<b>Leader:</b> ' + route.author + '<br/>';
    }
    header += '<b>Distance:</b> ' + getGPXDistance(route.distance) + '<br/>';
    if (route.description !== '') {
        header += '<b>Description:</b> ' + route.description + '<br/>';
    }
    header += formatAltitude(route);
    header += "<b>Est time:</b> " + naismith(route.distance, route.cumulativeElevationGain) + '<br/>';
    header += "<b>Download route:</b> " + getGPXdownloadLink(route) + '<br/>';
    if (route.tracks > 0) {
        header += "<b>Tracks:</b> " + route.tracks.toFixed(0);
    }

    if (route.routes > 0) {
        header += "<b>Routes:</b> " + route.routes.toFixed(0);
    }

    header += "</p></div>";
    path = ramblersGpx.folder + "/" + route.filename;
    document.getElementById('gpxheader').innerHTML = header;
    displayGPX(path, ramblersGpx.linecolour, 0);
    location.hash = '#gpxheader';
}
function getRoutefromID(id) {
    for (var index = 0; index < ramblersGpx.routes.length; ++index) {
        var route = ramblersGpx.routes[index];
        if (route.id === id) {
            return route;
        }
    }
    return null;
}
//function displayGPXDescriptions() {
//    var out;
//    out = "<div class='gpxdescriptions' data-jplist-group=\"group1\">";
//    out += '<p data-jplist-item>';
//    for (var index = 0; index < ramblersGpx.routes.length; ++index) {
//        var route = ramblersGpx.routes[index];
//        if (route.description !== '') {
//            if (displayRoute(route)) {
//                out += displayGPXName(route) + " [" + getGPXDistance(route.distance) + "] - " + route.description;
//            }
//        }
//        out += '</p>';
//    }
//    out += '</div>';
//    document.getElementById("dataTab").innerHTML = out;
//}
function addGPXMarkers() {
    for (var index = 0; index < ramblersGpx.routes.length; ++index) {
        var route = ramblersGpx.routes[index];
        if (displayRoute(route)) {
            addGPXMarker(route);
        }
    }
}
function addGPXMarker(route) {
    var $popup, $lat, $long;
    $popup = "<div style='font-size:120%'>" + displayGPXName(route) + "</div>";
    $popup += '<b>Distance</b> - ' + getGPXDistance(route.distance) + '<br/>';
    $popup += formatAltitude(route);
    $lat = route.latitude;
    $long = route.longitude;
    addMarker($popup, $lat, $long, ramblersMap.markerRoute);
}
function formatAltitude(route) {
    var popup;
    popup = "";
    if (route.cumulativeElevationGain === 0) {
        return "No elevation data<br/>";
    } else {
        popup += '<b>Min Altitude:</b> ' + route.minAltitude.toFixed(0) + ' m<br/>';
        popup += '<b>Max Altitude:</b> ' + route.maxAltitude.toFixed(0) + ' m<br/>';
        popup += '<b>Elevation Gain:</b> ' + route.cumulativeElevationGain.toFixed(0) + ' m<br/>';
    }
    return popup;
}
function getGPXdownloadLink(route) {
    var path, link;
    link = "";
    if (ramblersGpx.download === 1) {
        link = "*";
    }
    if (ramblersGpx.download === 2) {
        path = ramblersMap.base + ramblersGpx.folder + "/" + route.filename;
        link = "<a href='" + path + "'><img  alt='gpx' src='" + ramblersMap.base + "ramblers/images/orange-gpx-32.png' width='20' height='20'></a>";
    }
    return link;
}
//function sortGPXTable(order) {
//    if (order === "date") {
//        sortOn(ramblersGpx.routes, 'date', ramblersGpx.dateorder, false);
//        ramblersGpx.dateorder = !ramblersGpx.dateorder;
//    }
//    if (order === "author") {
//        sortOn(ramblersGpx.routes, 'author', ramblersGpx.authororder, false);
//        ramblersGpx.authororder = !ramblersGpx.authororder;
//    }
//    if (order === "distance") {
//        sortOn(ramblersGpx.routes, 'distance', ramblersGpx.distorder, true);
//        ramblersGpx.distorder = !ramblersGpx.distorder;
//    }
//    if (order === "title") {
//        sortOn(ramblersGpx.routes, 'title', ramblersGpx.titleorder, false);
//        ramblersGpx.titleorder = !ramblersGpx.titleorder;
//    }
//    if (order === "gain") {
//        sortOn(ramblersGpx.routes, 'cumulativeElevationGain', ramblersGpx.gainorder, true);
//        ramblersGpx.gainorder = !ramblersGpx.gainorder;
//    }
//    displayGPXTable();
//    jplist.init({
//        storage: 'cookies', //'localStorage', 'sessionStorage' or 'cookies'
//        storageName: 'my-page-storage' //the same storage name can be used to share storage between multiple pages
//    });
//}
function displayRoute(route) {
    if (ramblersGpx.searchtext === '') {
        return true;
    }
    if (route.title.toLowerCase().includes(ramblersGpx.searchtext)) {
        return true;
    }
    return false;
}
function gpxsearch() {
    var x = document.getElementById("searchform");
    var text = "";
    var i, y;
    for (i = 0; i < x.length; i++) {
        text += x.elements[i].value;
        y = x.elements[i];
    }
    ramblersGpx.searchtext = text.toLowerCase();
    displayTabs();
    removeClusterMarkers();
    addGPXMarkers();
    ramblersMap.markersCG.addLayers(ramblersMap.markerList);
    return false;
}
//var sortOn = function (arr, prop, reverse, numeric) {
//
//// Ensure there's a property
//    if (!prop || !arr) {
//        return arr;
//    }
//
//// Set up sort function
//    var sort_by = function (field, rev, primer) {
//
//// Return the required a,b function
//        return function (a, b) {
//
//// Reset a, b to the field
//            a = primer(a[field]), b = primer(b[field]);
//            // Do actual sorting, reverse as needed
//            return ((a < b) ? -1 : ((a > b) ? 1 : 0)) * (rev ? -1 : 1);
//        };
//    };
//    // Distinguish between numeric and string to prevent 100's from coming before smaller
//    // e.g.
//    // 1
//    // 20
//    // 3
//    // 4000
//    // 50
//
//    if (numeric) {
//
//// Do sort "in place" with sort_by function
//        arr.sort(sort_by(prop, reverse, function (a) {
//
//// - Force value to a string.
//// - Replace any non numeric characters.
//// - Parse as float to allow 0.02 values.
//            return parseFloat(String(a).replace(/[^0-9.-]+/g, ''));
//        }));
//    } else {
//
//// Do sort "in place" with sort_by function
//        arr.sort(sort_by(prop, reverse, function (a) {
//
//// - Force value to string.
//            return String(a).toUpperCase();
//        }));
//    }
//};
function addPagination() {
    var $div = '<div class="ra-route-filter"><span><button>Sort By:</button> \
<button \
        data-jplist-control="sort-buttons" \
        data-path=".wTitle" \
        data-group="group1" \
        data-order="asc" \
        data-type="text" \\n\
        data-selected="true" \
        data-mode="radio"> \
    Title\
</button> \
<button \
        data-jplist-control="sort-buttons" \
        data-path=".wDistance" \
        data-group="group1" \
        data-order="asc" \
        data-type="number" \
        data-mode="radio"> \
    Distance \
</button> \
<button \
        data-jplist-control="sort-buttons" \
        data-path=".wElevation" \
        data-group="group1" \
        data-order="asc" \
        data-type="number" \
        data-mode="radio"> \
    Elevation \
</button>\
</span> \
<span> \
<input class="ra-route-search" \
     data-jplist-control="textbox-filter" \
     data-group="group1" \
     data-name="my-filter-1" \
     data-path=".wTitle" \
     data-clear-btn-id="title-clear-btn" \
     type="text" \
     value="" \
     placeholder="Filter by Title" \
/> \               \
<button type="button" id="title-clear-btn">Clear</button> \
</span></div><div class="clear"></div>\
<div data-jplist-control=\"pagination\" \
            data-group=\"group1\" \
            data-items-per-page=\"10\" \
            data-current-page=\"0\" \
            data-name=\"pagination1\"> \
            <span data-type=\"info\"> \
            {startItem} - {endItem} of {itemsNumber} \
            </span> \
            <span> \
            <button type=\"button\" data-type=\"first\">First</button> \
            <button type=\"button\" data-type=\"prev\">Previous</button> \
            <span class=\"jplist-holder\" data-type=\"pages\"> \
                <button type=\"button\" data-type=\"page\">{pageNumber}</button> \
            </span> \
            <button type=\"button\" data-type=\"next\">Next</button> \
            <button type=\"button\" data-type=\"last\">Last</button> \
            </span> \
            <!-- items per page select --> \
    <select data-type=\"items-per-page\"> \
        <option value=\"10\"> 10 per page </option> \
        <option value=\"20\"> 20 per page </option> \
        <option value=\"30\"> 30 per page </option> \
        <option value=\"0\"> view all </option> \
    </select> \
        </div> ';

    return $div;
}
function setTagHtml(id, html) {
    var tag = document.getElementById(id);
    if (tag) {
        tag.innerHTML = html;
    }
}
function ra_format(option) {
    document.getElementById("Map").classList.remove('active');
    document.getElementById("List").classList.remove('active');

    document.getElementById(option).classList.add('active');
    switch (option) {
        case 'List':
            document.getElementById("gpxmap").style.display = "none"; 
            document.getElementById("gpxlist").style.display = "initial"; 
            break;
        case 'Map':
            document.getElementById("gpxmap").style.display = "initial"; 
            document.getElementById("gpxlist").style.display = "none"; 
            break;
    }
}