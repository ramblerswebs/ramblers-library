function addMarker($list, $popup, $lat, $long, $icon) {
    var marker = L.marker([$lat, $long], {icon: $icon});
    $pop = $popup.replace(/&quot;/g, '"'); // replace quots in popup text
    marker.bindPopup($pop);
    $list.push(marker);
}

function addMarkerToLayer($layer, $popup, $lat, $long, $icon) {
    var marker = L.marker([$lat, $long], {icon: $icon});
    $pop = $popup.replace(/&quot;/g, '"'); // replace quots in popup text 
    marker.bindPopup($pop);
    $layer.add.push(marker);
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

function displayPostcodes(e, map) {
    var p = new LatLon(e.latlng.lat, e.latlng.lng);
    var grid = OsGridRef.latLonToOsGrid(p);
    gr = grid.toString(6);
    gr10 = grid.toString(8);
    var desc = "<b>Latitude: </b>" + e.latlng.lat.toFixed(5) + "<br/><b>Longitude: </b>" + e.latlng.lng.toFixed(5);
    results = encodeShortest(e.latlng.lat, e.latlng.lng);
    if (results.length > 0) {
        desc += '<br/><b><a href="http://www.mapcode.com" target="_blank">Mapcode:</a> </b>' + results[0].fullmapcode;
    }
    postcodelayer.clearLayers();
    var msg = "   ";
    var point = L.marker(p).bindPopup(msg);
    postcodelayer.addLayer(point);
    if (gr != "") {
        desc += "<br/><b>Grid Reference: </b>" + gr +
                "<br/><b>Grid Reference: </b>" + gr10 + " (8 Figure)";
// remove previous postcodes

        point.getPopup().setContent("Searching ...");
        point.openPopup();
        // get postcodes around this point       
        var east = Math.round(grid.easting);
        var north = Math.round(grid.northing);

        url = "http://postcodes.theramblers.org.uk/index.php?easting=" + east + "&northing=" + north + "&dist=10&maxpoints=20";
        getJSON(url, function (err, items) {
            if (err != null) {
                var msg = "Error: Something went wrong: " + err;
                point.getPopup().setContent(msg);
            } else {
                if (items.length == 0) {
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
                        pt = new L.latLng(latlong.lat, latlong.lon);
                        if (i == 0) {
                            var marker = L.marker(pt, {icon: postcodeIconClosest}).bindPopup(popup);
                            style = {color: 'green', weight: 4, opacity: 0.2};
                        } else {
                            var marker = L.marker(pt, {icon: postcodeIcon}).bindPopup(popup);
                            style = {color: 'blue', weight: 4, opacity: 0.2};
                        }
                        postcodelayer.addLayer(marker);
                        postcodelayer.addLayer(L.polyline([pt, p], style));
                    }
                }
                point.getPopup().setContent(desc);
                point.openPopup();
            }
        });
    } else {
        desc += "<br/>Outside OS Grid";
        point.getPopup().setContent(desc);
        point.openPopup();
    }

}

function kFormatter(num) {
    return num > 999 ? (num / 1000).toFixed(1) + 'K' : num
}


var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("get", url, true);
    xhr.responseType = "json";
    xhr.onload = function () {
        var status = xhr.status;
        if (status == 200) {
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

function getMouseMoveAction(e, map) {
    var zoom = map.getZoom();
    var p = new LatLon(e.latlng.lat, e.latlng.lng);
    var grid = OsGridRef.latLonToOsGrid(p);
    if (zoom > 16) {
        gr = grid.toString(8);
        gridref = '8 figure grid reference [10m<sup>2</sup>]<br/><span class="osgridref">' + gr + "</span><br/>";
    } else {
        gr = grid.toString(6);
        gridref = '6 figure grid reference [100m<sup>2</sup>]<br/><span class="osgridref">' + gr + "</span><br/>";
    }
    if (gr == "") {
        gridref = "Outside OS Grid<br/>";
    } else {
        if (zoom > 12) {
            var bounds = osGridToLatLongSquare(grid, 100);
            // change rectangle
            gridsquare100.setLatLngs(bounds);
        }
        if (zoom > 16) {
            var bounds2 = osGridToLatLongSquare(grid, 10);
            // change rectangle
            gridsquare10.setLatLngs(bounds2);
        } else {
            gridsquare10.setLatLngs([[84, -89], [84.00001, -89.000001]]);
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

    _toggleTitle: function() {
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

    _setFullscreen: function(fullscreen) {
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

