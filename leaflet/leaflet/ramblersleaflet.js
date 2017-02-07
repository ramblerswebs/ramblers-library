var L, ramblersMap, OsGridRef, Element;
function RamblersLeafletMap(base) {
    this.base = base;
    this.map = null;
    this.osm = null;
    this.roads = null;
    this.satellite = null;
    this.hybrid = null;
    this.terrain = null;
    this.gridsquare10 = null;
    this.gridsquare100 = null;
    this.postcodelayer = null;
    this.markerList = null;
    this.markersCG = null;
    this.progress = null;
    this.progressBar = null;
    this.startingplaces = false;
    this.options = {cluster: true,
        fullscreen: true,
        google: false,
        search: true,
        locationsearch: true,
        osgrid: true,
        mouseposition: true,
        postcodes: true,
        fitbounds: true};
}
;
function raLoadLeaflet() {
    if (ramblersMap.options.fullscreen) {
        ramblersMap.map = new L.Map("leafletmap", {
            center: new L.LatLng(54.221592, -3.355007),
            zoom: 5,
            fullscreenControl: true});
    } else {
        ramblersMap.map = new L.Map("leafletmap", {
            center: new L.LatLng(54.221592, -3.355007),
            zoom: 5});
    }


// map types
    ramblersMap.osm = new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a>"}).addTo(ramblersMap.map);
    if (ramblersMap.options.google) {
        ramblersMap.roads = L.gridLayer.googleMutant({
            type: "roadmap" // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
        });
        ramblersMap.satellite = L.gridLayer.googleMutant({
            type: "satellite" // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
        });
        ramblersMap.hybrid = L.gridLayer.googleMutant({
            type: "hybrid" // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
        });
        ramblersMap.terrain = L.gridLayer.googleMutant({
            type: "terrain" // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
        });
        mapLayers = {"Open Street Map": ramblersMap.osm,
            "Google": ramblersMap.roads,
            "Google Satellite": ramblersMap.satellite,
            "Google Hybrid": ramblersMap.hybrid,
            "Google Terrain": ramblersMap.terrain
        };
    } else {
        mapLayers = {"Open Street Map": ramblersMap.osm};
    }


    createMouseMarkers(ramblersMap.base);
    if (ramblersMap.options.startingplaces) {
        createPlaceMarkers(ramblersMap.base);
    } else {
        createWalkMarkers(ramblersMap.base);
    }
    if (ramblersMap.options.cluster) {
        // progress bar for cluster
        ramblersMap.progressBar = document.getElementById("ra-cluster-progress-bar");
        ramblersMap.markersCG = L.markerClusterGroup({chunkedLoading: true, chunkProgress: updateClusterProgressBar});
        ramblersMap.markerList = [];
    }

    addContent(ramblersMap);
    if (ramblersMap.options.cluster) {
        ramblersMap.markersCG.addLayers(ramblersMap.markerList);
        ramblersMap.map.addLayer(ramblersMap.markersCG);
    }

    if (ramblersMap.options.fitbounds) {
        // [FitBounds]   
        if (ramblersMap.options.cluster) {
            // calc bounds from marker as cluster still loading
            var bounds = getBounds(ramblersMap.markerList);
            ramblersMap.map.fitBounds(bounds);
        } else {

        }
    }

    if (ramblersMap.options.osgrid) {
        osgrid = L.layerGroup([]);
        osMapGrid(L, osgrid);
        var overlayMaps = {
            "OS 100Km Grid": osgrid
        };
        osgrid.addTo(ramblersMap.map);
    }

    L.control.layers(mapLayers, overlayMaps, {collapsed: true}).addTo(ramblersMap.map);
    if (ramblersMap.options.search) {
        try {
            var geocoder = L.Control.geocoder({
                defaultMarkGeocode: true,
                collapsed: true,
                geocoder: L.Control.Geocoder.nominatim({
                    geocodingQueryParams: {countrycodes: 'gb'}
                })
            }).addTo(ramblersMap.map);
        } catch (err) {
            document.getElementById("ra-error-text").innerHTML = "ERROR: " + err.message;
        }
        // must be after layers so is second control in top right

    }

    if (ramblersMap.options.locationsearch) {
        L.control.locationsearch({
            defaultMarkLocationsearch: true,
            collapsed: true
        }).addTo(ramblersMap.map);
    }


    if (ramblersMap.options.startingplaces) {
        L.control.usageAgreement().addTo(ramblersMap.map);
    }
    if (ramblersMap.options.postcodes) {
        try {
            ramblersMap.postcodelayer = L.featureGroup([]);
            ramblersMap.postcodelayer.addTo(ramblersMap.map);
            L.control.postcodeStatus().addTo(ramblersMap.map);
        } catch (err) {
            document.getElementById("ra-error-text").innerHTML = "ERROR: " + err.message;
        }
    }

    if (ramblersMap.options.mouseposition && !L.Browser.mobile) {
        try {
            L.control.mouse().addTo(ramblersMap.map);
        } catch (err) {
            document.getElementById("ra-error-text").innerHTML = "ERROR: " + err.message;
        }

    }
    // Zoom control
    L.control.scale().addTo(ramblersMap.map);
}
;
function displayGPX(ramblersMap, file, linecolour, imperial) {
    var el = L.control.elevation({
        position: "topright",
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
    var g = new L.GPX(file, {async: true,
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
}

function updateClusterProgressBar(processed, total, elapsed) {
    if (elapsed > 1000) {
        // if it takes more than a second to load, display the progress bar:
        ramblersMap.progressBar.innerHTML = "Loading: " + Math.round(processed / total * 100) + "%";
    }

    if (processed === total) {
// all markers processed - hide the progress bar:
        ramblersMap.progressBar.style.display = "none";
    }
}

function createWalkMarkers(base) {
    markerStart = L.icon({
        iconUrl: base + "ramblers/images/marker-start.png",
        iconSize: [35, 35]
    });
    markerArea = L.icon({
        iconUrl: base + "ramblers/images/marker-area.png",
        iconSize: [35, 35]
    });
    markerCancelled = L.icon({
        iconUrl: base + "ramblers/images/marker-cancelled.png",
        iconSize: [35, 35]
    });
    walkingarea = L.icon({
        iconUrl: base + "ramblers/images/area.png",
        iconSize: [40, 35]
    });
    walkinggroup = L.icon({
        iconUrl: base + "ramblers/images/group.png",
        iconSize: [40, 35]
    });
    walkingspecial = L.icon({
        iconUrl: base + "ramblers/images/specialgroup.png",
        iconSize: [40, 35]
    });
}
function createMouseMarkers(base) {
// add marker and layer group to contain postcode markers
    postcodeIcon = L.icon({
        iconUrl: base + 'ramblers/leaflet/images/postcode-icon.png',
        iconSize: [24, 18], // size of the icon
        shadowSize: [26, 20], // size of the shadow
        iconAnchor: [12, 9], // point of the icon which will correspond to marker's location
        shadowAnchor: [0, 0], // the same for the shadow
        popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
    });
    postcodeIconClosest = L.icon({
        iconUrl: base + 'ramblers/leaflet/images/postcode-icon-closest.png',
        iconSize: [24, 18], // size of the icon
        shadowSize: [26, 20], // size of the shadow
        iconAnchor: [12, 9], // point of the icon which will correspond to marker's location
        shadowAnchor: [0, 0], // the same for the shadow
        popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
    });
    redmarkericon = L.icon({
        iconUrl: base + 'ramblers/leaflet/images/redmarker.png',
        iconSize: [32, 32], // size of the icon
        shadowSize: [26, 20], // size of the shadow
        iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
        shadowAnchor: [0, 0], // the same for the shadow
        popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
    });
    // create an orange rectangle
    ramblersMap.gridsquare100 = L.rectangle([[84, -89], [84.00001, -89.000001]],
            {color: "#ff7800", weight: 1}).addTo(ramblersMap.map);
    ramblersMap.gridsquare10 = L.rectangle([[84, -89], [84.00001, -89.000001]],
            {color: "#884000", weight: 1}).addTo(ramblersMap.map);
}
function createPlaceMarkers(base) {
    s0 = L.icon({
        iconUrl: base + 'images/rejected.png',
        iconSize: [15, 15]
    });
    s1 = L.icon({
        iconUrl: base + 'images/1star.png',
        iconSize: [19, 19]
    });
    s2 = L.icon({
        iconUrl: base + 'images/2star.png',
        iconSize: [21, 21]
    });
    s3 = L.icon({
        iconUrl: base + 'images/3star.png',
        iconSize: [23, 23]
    });
    s4 = L.icon({
        iconUrl: base + 'images/4star.png',
        iconSize: [25, 25]
    });
    s5 = L.icon({
        iconUrl: base + 'images/5star.png',
        iconSize: [27, 27]
    });

}

function addMarker($popup, $lat, $long, $icon) {
    var marker = L.marker([$lat, $long], {icon: $icon});
    $pop = $popup.replace(/&quot;/g, '"'); // replace quots in popup text
    marker.bindPopup($pop);
    ramblersMap.markerList.push(marker);
}

function addMarkerToLayer($layer, $popup, $lat, $long, $icon) {
    var marker = L.marker([$lat, $long], {icon: $icon});
    $pop = $popup.replace(/&quot;/g, '"'); // replace quots in popup text 
    marker.bindPopup($pop);
    $layer.add.push(marker);
}
function addPlace($gr, $no, $lat, $long, $icon)
{
    var marker = L.marker([$lat, $long], {icon: $icon, gridref: $gr, no: $no, lat: $lat, long: $long});
    if ($gr.length == 8) {
        $grdisp = $gr.substr(0, 2) + " " + $gr.substr(2, 3) + " " + $gr.substr(5, 3);
    } else {
        $grdisp = $gr;
    }
    marker.bindPopup("<b>Grid Ref " + $grdisp + "</b><br/>Lat/Long " + $lat + " " + $long);
    marker.on('click', onClick);
    ramblersMap.markerList.push(marker);
}
function getBounds(list) {
    var bounds = new L.LatLngBounds();
    var marker;
    for (i = 0; i < list.length; i++) {
        marker = list[i];
        bounds.extend(marker.getLatLng());
    }

    return bounds;
}

function walkdetails($url) {
    page = $url;
    window2 = open(page, "_blank", "scrollbars=yes,width=990,height=480,menubar=yes,resizable=yes,status=yes");
}

function photos($gr) {
    page = "http://www.geograph.org.uk/gridref/" + $gr;
    window2 = open(page, "_blank", "scrollbars=yes,width=990,height=480,menubar=yes,resizable=yes,status=yes");
}
function streetmap($gr) {
    page = "http://www.streetmap.co.uk/grid/" + $gr + "&z=115";
    window2 = open(page, "_blank", "scrollbars=yes,width=900,height=580,menubar=yes,resizable=yes,status=yes");
}
function directions($lat, $long) {
//  var $directions = "<a href='https://maps.google.com?saddr=Current+Location&daddr=" + $lat + "," + $long + "' target='_blank'>[Directions]</a>";
    page = "https://maps.google.com?saddr=Current+Location&daddr=" + $lat.toString() + "," + $long.toString();
    window2 = open(page, "_blank", "scrollbars=yes,width=900,height=580,menubar=yes,resizable=yes,status=yes");
}
function googlemap($lat, $long) {
    page = "https://www.google.com/maps/place/" + $lat.toString() + "+" + $long.toString() + "/@" + $lat.toString() + "," + $long.toString() + ",15z";
    window2 = open(page, "Google Map", "scrollbars=yes,width=900,height=580,menubar=yes,resizable=yes,status=yes");
}

function displayPostcodes(e) {
    var p = new LatLon(e.latlng.lat, e.latlng.lng);
    var grid = OsGridRef.latLonToOsGrid(p);
    var gr = grid.toString(6);
    var gr10 = grid.toString(8);
    var i;
    var marker;
    var zoom = displaymap.getZoom();
    var desc = "<b>Latitude: </b>" + e.latlng.lat.toFixed(5) + " ,  <b>Longitude: </b>" + e.latlng.lng.toFixed(5);
    if (gr !== "") {
        desc += "<br/><b>Grid Reference: </b>" + gr +
                "<br/><b>Grid Reference: </b>" + gr10 + " (8 Figure)";
    }
    // desc += getBroswerStatus();
    var results = encodeShortest(e.latlng.lat, e.latlng.lng);
    if (results.length > 0) {
        desc += '<br/><b><a href="http://www.mapcode.com" target="_blank">Mapcode:</a> </b>' + results[0].fullmapcode + "<br/>";
    }
    if (gr !== "") {
        desc += '<a href="javascript:photos(\'' + gr10 + '\')">[Photos]</a>';
        desc += '<a href="javascript:streetmap(\'' + gr10 + '\')">[OS Map]</a>';

    }
    desc += '<a href="javascript:googlemap(' + e.latlng.lat.toFixed(7) + ',' + e.latlng.lng.toFixed(7) + ')">[Google Map]</a>';
    desc += '<a href="javascript:directions(' + e.latlng.lat.toFixed(7) + ',' + e.latlng.lng.toFixed(7) + ')">[Directions]</a>';
    ramblersMap.postcodelayer.clearLayers();
    var msg = "   ";
    var point = L.marker(p).bindPopup(msg);
    ramblersMap.postcodelayer.addLayer(point);
    point.getPopup().setContent(desc);
    if (gr !== "") {
        point.openPopup();
        if (zoom > 12) {
            point.getPopup().setContent(desc + "<br/><b>Searching for postcodes ...</b>");
// get postcodes around this point       
            var east = Math.round(grid.easting);
            var north = Math.round(grid.northing);
            var url = "http://postcodes.theramblers.org.uk/index.php?easting=" + east + "&northing=" + north + "&dist=10&maxpoints=20";
            getJSON(url, function (err, items) {
                if (err !== null) {
                    var msg = "Error: Something went wrong: " + err;
                    point.getPopup().setContent(msg);
                } else {
                    if (items.length === 0) {
                        closest = "No postcodes found within 10Km";
                        point.getPopup().setContent(closest);
                    } else {
                        for (i = 0; i < items.length; i++) {

                            var item = items[i];
                            var popup = item.Postcode + "<br />     Distance: " + kFormatter(Math.round(item.Distance)) + "m";
                            var easting = item.Easting;
                            var northing = item.Northing;
                            var gr = new OsGridRef(easting, northing);
                            var latlong = OsGridRef.osGridToLatLon(gr);
                            var pt = new L.latLng(latlong.lat, latlong.lon);
                            if (i === 0) {
                                marker = L.marker(pt, {icon: postcodeIconClosest}).bindPopup(popup);
                                style = {color: 'green', weight: 4, opacity: 0.2};
                            } else {
                                marker = L.marker(pt, {icon: postcodeIcon}).bindPopup(popup);
                                style = {color: 'blue', weight: 4, opacity: 0.2};
                            }
                            ramblersMap.postcodelayer.addLayer(marker);
                            ramblersMap.postcodelayer.addLayer(L.polyline([pt, p], style));
                        }
                    }
                    point.getPopup().setContent(desc);
                    point.openPopup();
                }

            });

        } else {
            point.getPopup().setContent(desc + "<br/><b>Zoom in and right click/tap hold to see nearby postcodes</b>");
        }
    } else {
        desc += "<br/>Outside OS Grid";
        point.getPopup().setContent(desc);
        point.openPopup();
    }

}

function kFormatter(num) {
    return num > 999 ? (num / 1000).toFixed(1) + 'K' : num;
}

function getBroswerStatus() {
    out = "";
    out += "<br/>Mobile: " + L.Browser.mobile.toString();
    out += "<br/>Touch: " + L.Browser.touch.toString();
    out += "<br/>Pointer : " + L.Browser.pointer.toString();
    out += "<br/>Win: " + L.Browser.win.toString();
    out += "<br/>Android: " + L.Browser.android.toString();
    return out;
}

var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("get", url, true);
    xhr.responseType = "json";
    xhr.onload = function () {
        var status = xhr.status;
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
// Helper method to parse the title tag from the response.
function getTitle(text) {
    return text.match('<title>(.*)?</title>')[1];
}

function getMouseMoveAction(e) {
    var gr, gridref;
    var zoom = ramblersMap.map.getZoom();
    var p = new LatLon(e.latlng.lat, e.latlng.lng);
    var grid = OsGridRef.latLonToOsGrid(p);
    if (zoom > 16) {
        gr = grid.toString(8);
        gridref = '8 figure grid reference [10m<sup>2</sup>]<br/><span class="osgridref">' + gr + "</span><br/>";
    } else {
        gr = grid.toString(6);
        gridref = '6 figure grid reference [100m<sup>2</sup>]<br/><span class="osgridref">' + gr + "</span><br/>";
    }
    if (gr === "") {
        gridref = "Outside OS Grid<br/>";
    } else {
        if (zoom > 12) {
            var bounds = osGridToLatLongSquare(grid, 100);
            // change rectangle
            ramblersMap.gridsquare100.setLatLngs(bounds);
        }
        if (zoom > 16) {
            var bounds2 = osGridToLatLongSquare(grid, 10);
            // change rectangle
            ramblersMap.gridsquare10.setLatLngs(bounds2);
        } else {
            ramblersMap.gridsquare10.setLatLngs([[84, -89], [84.00001, -89.000001]]);
        }
    }
    var lng = e.latlng.lng.toFixed(5);
    var lat = e.latlng.lat.toFixed(5);
    var value = "Lat/long: " + lat + ", " + lng;
    return  gridref + value;
}


function osGridToLatLongSquare(gridref, size) {
//  if (!(gridref instanceof OsGridRef))
//      throw new TypeError('gridref is not OsGridRef object');

    var E1 = Math.floor(gridref.easting / size) * size;
    var N1 = Math.floor(gridref.northing / size) * size;
    var E2 = E1 + size;
    var N2 = N1 + size;
    var g1 = new OsGridRef(E1, N1);
    var g2 = new OsGridRef(E1, N2);
    var g3 = new OsGridRef(E2, N2);
    var g4 = new OsGridRef(E2, N1);
    var ll1 = OsGridRef.osGridToLatLon(g1);
    var ll2 = OsGridRef.osGridToLatLon(g2);
    var ll3 = OsGridRef.osGridToLatLon(g3);
    var ll4 = OsGridRef.osGridToLatLon(g4);
    var bounds = [[ll1.lat, ll1.lon],
        [ll2.lat, ll2.lon],
        [ll3.lat, ll3.lon],
        [ll4.lat, ll4.lon],
        [ll1.lat, ll1.lon]];
    return bounds;
}
function osMapGrid(L, layer) {
    style = {color: '#333366', weight: 1, opacity: 0.2};
    for (east = 0; east < 700500; east += 100000) {
        lines = new Array();
        i = 0;
        for (north = 0; north < 1300500; north += 10000) {
            gr = new OsGridRef(east, north);
            latlong = OsGridRef.osGridToLatLon(gr);
            lines[i] = new L.latLng(latlong.lat, latlong.lon);
            i++;
        }
// L.polyline(lines, style).addTo(map);
        layer.addLayer(L.polyline(lines, style));
    }
    for (north = 0; north < 1300500; north += 100000) {
        lines = new Array();
        i = 0;
        for (east = 0; east < 700500; east += 10000) {
            gr = new OsGridRef(east, north);
            latlong = OsGridRef.osGridToLatLon(gr);
            lines[i] = new L.latLng(latlong.lat, latlong.lon);
            i++;
        }
// L.polyline(lines, style).addTo(map);
        layer.addLayer(L.polyline(lines, style));
    }
}

// support for leaflet full screen mode

L.Control.Fullscreen = L.Control.extend({
    options: {
        position: 'topleft',
        title: {
            'false': 'View Fullscreen',
            'true': 'Exit Fullscreen'
        }
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-fullscreen leaflet-bar leaflet-control');
        this.link = L.DomUtil.create('a', 'leaflet-control-fullscreen-button leaflet-bar-part', container);
        this.link.href = '#';
        this._map = map;
        this._map.on('fullscreenchange', this._toggleTitle, this);
        this._toggleTitle();
        L.DomEvent.on(this.link, 'click', this._click, this);
        return container;
    },
    _click: function (e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        this._map.toggleFullscreen(this.options);
    },
    _toggleTitle: function () {
        this.link.title = this.options.title[this._map.isFullscreen()];
    }
});
L.Map.include({
    isFullscreen: function () {
        return this._isFullscreen || false;
    },
    toggleFullscreen: function (options) {
        var container = this.getContainer();
        if (this.isFullscreen()) {
            if (options && options.pseudoFullscreen) {
                this._disablePseudoFullscreen(container);
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else {
                this._disablePseudoFullscreen(container);
            }
        } else {
            if (options && options.pseudoFullscreen) {
                this._enablePseudoFullscreen(container);
            } else if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            } else {
                this._enablePseudoFullscreen(container);
            }
        }

    },
    _enablePseudoFullscreen: function (container) {
        L.DomUtil.addClass(container, 'leaflet-pseudo-fullscreen');
        this._setFullscreen(true);
        this.invalidateSize();
        this.fire('fullscreenchange');
    },
    _disablePseudoFullscreen: function (container) {
        L.DomUtil.removeClass(container, 'leaflet-pseudo-fullscreen');
        this._setFullscreen(false);
        this.invalidateSize();
        this.fire('fullscreenchange');
    },
    _setFullscreen: function (fullscreen) {
        this._isFullscreen = fullscreen;
        var container = this.getContainer();
        if (fullscreen) {
            L.DomUtil.addClass(container, 'leaflet-fullscreen-on');
        } else {
            L.DomUtil.removeClass(container, 'leaflet-fullscreen-on');
        }
    },
    _onFullscreenChange: function (e) {
        var fullscreenElement =
                document.fullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement;
        if (fullscreenElement === this.getContainer() && !this._isFullscreen) {
            this._setFullscreen(true);
            this.fire('fullscreenchange');
        } else if (fullscreenElement !== this.getContainer() && this._isFullscreen) {
            this._setFullscreen(false);
            this.fire('fullscreenchange');
        }
    }
});
L.Map.mergeOptions({
    fullscreenControl: false
});
L.Map.addInitHook(function () {
    if (this.options.fullscreenControl) {
        this.fullscreenControl = new L.Control.Fullscreen(this.options.fullscreenControl);
        this.addControl(this.fullscreenControl);
    }

    var fullscreenchange;
    if ('onfullscreenchange' in document) {
        fullscreenchange = 'fullscreenchange';
    } else if ('onmozfullscreenchange' in document) {
        fullscreenchange = 'mozfullscreenchange';
    } else if ('onwebkitfullscreenchange' in document) {
        fullscreenchange = 'webkitfullscreenchange';
    } else if ('onmsfullscreenchange' in document) {
        fullscreenchange = 'MSFullscreenChange';
    }

    if (fullscreenchange) {
        var onFullscreenChange = L.bind(this._onFullscreenChange, this);
        this.whenReady(function () {
            L.DomEvent.on(document, fullscreenchange, onFullscreenChange);
        });
        this.on('unload', function () {
            L.DomEvent.off(document, fullscreenchange, onFullscreenChange);
        });
    }
});
L.control.fullscreen = function (options) {
    return new L.Control.Fullscreen(options);
};
// end of leaflet full screen support