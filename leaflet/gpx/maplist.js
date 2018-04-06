/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ramblersMap, ramblersGpx, markerRoute;

function RamblersLeafletGpx() {
    this.gpxroutes = null;
    this.gpxfolder = null;
    this.gpxdistorder = false;
    this.gpxtitleorder = false;
    this.gpxgainorder = false;
    this.gpxdownload = 0;
    this.gpxelevation = null;
    this.description = true;
    this.gpx = null;
    this.searchtext = '';
}
function displayGPX(file, linecolour, imperial) {
    // remove old gpx route
    if (ramblersGpx.gpxelevation !== null) {
        ramblersGpx.gpxelevation.remove();
        ramblersGpx.gpxelevation = null;
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
            startIconUrl: ramblersMap.base + 'ramblers/leaflet/gpx/images/pin-icon-start.png',
            endIconUrl: ramblersMap.base + 'ramblers/leaflet/gpx/images/pin-icon-end.png',
            shadowUrl: ramblersMap.base + 'ramblers/leaflet/gpx/images/pin-shadow.png'
        }});
    g.on('addline', function (e) {
        el.addData(e.line);
    });
    g.on('loaded', function (e) {
        ramblersMap.map.fitBounds(e.target.getBounds());
    });
    g.addTo(ramblersMap.map);
    ramblersGpx.gpxelevation = el;
    ramblersGpx.gpx = g;
}

// Tab control

function ra_tab(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("ra_tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("ra_tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

function openTab(evt, tabName) {
// Declare all variables
    var i, tabcontent, tablinks;
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

// Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

// Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// code to handle list of GPX Routes
function displayGPXNames() {
    var out;
    out = "<div class='gpxlist'>";
    out += '<ul>';
    for (index = 0; index < ramblersGpx.gpxroutes.length; ++index) {
        var route = ramblersGpx.gpxroutes[index];
        if (displayRoute(route)) {
            out += "<li>" + displayGPXName(route) + "</li>";
        }
    }
    out += '</ul>';
    out += '</div>';
    document.getElementById("tabRouteList").innerHTML = out;
}
function displayGPXName(route) {
    link = '<b><a href="javascript:updateGPXid(' + route.id + ')">' + route.title + '</a></b>';
    return link;
}
function displayGPXTable() {
    var out;
    var tag;
    tag = document.getElementById("tabRouteDetails");
    if (tag !== null) {
        out = '<table id="gpxdetails">';
        out += "<tr><th onclick='sortGPXTable(\"title\")'>Title</th><th onclick='sortGPXTable(\"distance\")'>Distance</th><th>min Altitude</th><th>max Altitude</th><th onclick='sortGPXTable(\"gain\")'>Elevation Gain</th>";
        if (ramblersGpx.gpxdownload === 0) {
            out += "</tr>";
        } else {
            out += "<th>GPX</th></tr>";
        }
        for (index = 0; index < ramblersGpx.gpxroutes.length; ++index) {
            var route = ramblersGpx.gpxroutes[index];
            if (displayRoute(route)) {
                out += '<tr>';
                out += displayGPXRow(route);
                out += '</tr>';
            }
        }
        out += '</table>';
        if (ramblersGpx.gpxdownload === 1) {
            out += "<p>* To be able to download GPX Routes, you need to log on to our web site.</p>";
        }
        tag.innerHTML = out;
    }
}
function displayGPXRow(route) {
    var link, download;
    link = '<td><b><a href="javascript:updateGPXid(' + route.id + ')">' + route.title + '</a></b></td>';
    link += '<td>' + getGPXDistance(route.distance) + '</td>';
    link += '<td>' + route.minAltitude.toFixed(0) + ' m</td>';
    link += '<td>' + route.maxAltitude.toFixed(0) + ' m</td>';
    link += '<td>' + route.cumulativeElevationGain.toFixed(0) + ' m</td>';
    //  link += '<td>' + route.tracks.toFixed(0) + '/' + route.routes.toFixed(0) + '</td>';
    link += '<td>' + getGPXdownloadLink(route) + '</td>';
    return link;
}
function getGPXDistance(distance) {
    var dist, miles;
    dist = distance / 1000;
    miles = dist / 8 * 5;
    return dist.toFixed(1) + ' km / ' + miles.toFixed(2) + 'mi';
}
function updateGPXid(id) {
    var header, path;
    var route = getRoutefromID(id);
    header = "<h2>" + route.title + "</h2><p>";
    header += '<b>Distance</b> ' + getGPXDistance(route.distance) + '<br/>';
    if (route.description !== '') {
        header += '<b>Description</b> ' + route.description + '<br/>';
    }
    header += '<b>Min Altitude</b> ' + route.minAltitude.toFixed(0) + ' m<br/>';
    header += '<b>Max Altitude</b> ' + route.maxAltitude.toFixed(0) + ' m<br/>';
    header += '<b>Elevation Gain</b> ' + route.cumulativeElevationGain.toFixed(0) + ' m<br/>';
    header += "<b>Download route</b> " + getGPXdownloadLink(route) + '<br/>';

    if (route.tracks > 0) {
        header += "<b>Tracks:</b> " + route.tracks.toFixed(0);
    }
    if (route.routes > 0) {
        header += "<b>Routes:</b> " + route.routes.toFixed(0);
    }
    header += "</p>";
    path = ramblersGpx.gpxfolder + "/" + route.filename;
    document.getElementById('gpxheader').innerHTML = header;
    displayGPX(path, "#782327", 0);
    location.hash = '#gpxheader';
}
function getRoutefromID(id) {
    for (index = 0; index < ramblersGpx.gpxroutes.length; ++index) {
        var route = ramblersGpx.gpxroutes[index];
        if (route.id === id) {
            return route;
        }
    }
    return null;
}
function displayGPXDescriptions() {
    var out;
    out = "<div class='gpxdescriptions'>";
    out += '<p>';
    for (index = 0; index < ramblersGpx.gpxroutes.length; ++index) {
        var route = ramblersGpx.gpxroutes[index];
        if (route.description !== '') {
            if (displayRoute(route)) {
                out += displayGPXName(route) + " [" + getGPXDistance(route.distance) + "] - " + route.description;
            }
        }
        out += '</p>';
    }
    out += '</div>';
    document.getElementById("tabDescriptions").innerHTML = out;
}
function addGPXMarkers() {
    for (index = 0; index < ramblersGpx.gpxroutes.length; ++index) {
        var route = ramblersGpx.gpxroutes[index];
        if (displayRoute(route)) {
            addGPXMarker(route);
        }
    }
}
function addGPXMarker(route) {
    var $popup, $lat, $long;
    $popup = "<span style='font-size:120%'>" + displayGPXName(route) + "</span>";
    $popup += ' - ' + getGPXDistance(route.distance) + '<br/>';
    $popup += '<b>Min Altitude</b> ' + route.minAltitude.toFixed(0) + ' m<br/>';
    $popup += '<b>Max Altitude</b> ' + route.maxAltitude.toFixed(0) + ' m<br/>';
    $popup += '<b>Elevation Gain</b> ' + route.cumulativeElevationGain.toFixed(0) + ' m<br/>';
    $lat = route.latitude;
    $long = route.longitude;
    addMarker($popup, $lat, $long, markerRoute);
}
function getGPXdownloadLink(route) {
    var path, link;
    link = "";
    if (ramblersGpx.gpxdownload === 1) {
        link = "*";
    }
    if (ramblersGpx.gpxdownload === 2) {
        path = ramblersGpx.gpxfolder + "/" + route.filename;
        link = "<a href='" + path + "'><img  alt='gpx' src='ramblers/images/orange-gpx-32.png' width='20' height='20'></a>";
    }
    return link;
}
function sortGPXTable(order) {
    if (order === "distance") {
        sortOn(ramblersGpx.gpxroutes, 'distance', ramblersGpx.gpxdistorder, true);
        ramblersGpx.gpxdistorder = !ramblersGpx.gpxdistorder;
    }
    if (order === "title") {
        sortOn(ramblersGpx.gpxroutes, 'title', ramblersGpx.gpxtitleorder, false);
        ramblersGpx.gpxtitleorder = !ramblersGpx.gpxtitleorder;
    }
    if (order === "gain") {
        sortOn(ramblersGpx.gpxroutes, 'cumulativeElevationGain', ramblersGpx.gpxgainorder, true);
        ramblersGpx.gpxgainorder = !ramblersGpx.gpxgainorder;
    }
    displayGPXTable();
}
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
    var i;
    for (i = 0; i < x.length; i++) {
        text += x.elements[i].value;
        y = x.elements[i];
    }
    ramblersGpx.searchtext = text.toLowerCase();
    displayGPXNames();
    displayGPXDescriptions();
    displayGPXTable();
    removeClusterMarkers();
    addGPXMarkers();
    ramblersMap.markersCG.addLayers(ramblersMap.markerList);
    return false;
}
var sortOn = function (arr, prop, reverse, numeric) {

// Ensure there's a property
    if (!prop || !arr) {
        return arr;
    }

// Set up sort function
    var sort_by = function (field, rev, primer) {

// Return the required a,b function
        return function (a, b) {

// Reset a, b to the field
            a = primer(a[field]), b = primer(b[field]);
            // Do actual sorting, reverse as needed
            return ((a < b) ? -1 : ((a > b) ? 1 : 0)) * (rev ? -1 : 1);
        };
    };
    // Distinguish between numeric and string to prevent 100's from coming before smaller
    // e.g.
    // 1
    // 20
    // 3
    // 4000
    // 50

    if (numeric) {

// Do sort "in place" with sort_by function
        arr.sort(sort_by(prop, reverse, function (a) {

// - Force value to a string.
// - Replace any non numeric characters.
// - Parse as float to allow 0.02 values.
            return parseFloat(String(a).replace(/[^0-9.-]+/g, ''));
        }));
    } else {

// Do sort "in place" with sort_by function
        arr.sort(sort_by(prop, reverse, function (a) {

// - Force value to string.
            return String(a).toUpperCase();
        }));
    }
};