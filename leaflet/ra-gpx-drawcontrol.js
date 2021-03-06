var L, ramblersMap;
// code for drawing route/track
function addDrawControl(lat, long, zoom) {
// zoom to correct area
    ramblersMap.map.setZoom(zoom);
    var latlong = new L.LatLng(lat, long);
    ramblersMap.map.panTo(latlong);
    // add elevation display
    var imperial = false;
    ramblersMap.elevationcontrol = L.control.elevation({
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
    ramblersMap.elevationcontrol.addTo(ramblersMap.map);
    ramblersMap.drawnItems = new L.FeatureGroup();
    L.drawLocal.draw.toolbar.buttons.polyline = 'Plot a walking route(s)';
    L.drawLocal.draw.toolbar.buttons.marker = 'Add a marker';
    L.drawLocal.edit.toolbar.buttons.edit = 'Edit walking route(s) and markers';
    L.drawLocal.edit.toolbar.buttons.editDisabled = 'No routes(s) to edit';
    L.drawLocal.edit.toolbar.buttons.remove = 'Delete walking route(s) or markers';
    L.drawLocal.edit.toolbar.buttons.removeDisabled = 'No route(s) to delete';
    L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Drag line markers to change route.';
    L.drawLocal.edit.handlers.edit.tooltip.text = 'Click darker marker to delete point.';
    ramblersMap.map.addLayer(ramblersMap.drawnItems);
    // load gpx download control
    var download = new L.Control.GpxDownload();
    download.setRouteItems(ramblersMap.drawnItems);
    ramblersMap.map.addControl(download);
    var upload = new L.Control.GpxUpload();
    upload.setRouteItems(ramblersMap.drawnItems);
    ramblersMap.map.addControl(upload);
    var reverse = new L.Control.ReverseRoute();
    reverse.setRouteItems(ramblersMap.drawnItems);
    ramblersMap.map.addControl(reverse);
    var simplify = new L.Control.GpxSimplify();
    simplify.setRouteItems(ramblersMap.drawnItems);
    ramblersMap.map.addControl(simplify);
    var drawControl = new L.Control.Draw({
        position: 'bottomright',
        draw: {
            polyline: {
                metric: true,
                shapeOptions: {
                    color: '#782327',
                    opacity: 1,
                    weight: 3
                }
            },
            polygon: false,
            marker: true,
            circle: false,
            circlemarker: false,
            rectangle: false
        },
        edit: {
            featureGroup: ramblersMap.drawnItems,
            title: 'Edit walking route',
            polyline: {
                metric: true,
                shapeOptions: {
                    color: '#007A87',
                    opacity: 1
                }
            }
        }
        //  color: '#007A87',
    });
    ramblersMap.DrawControl = drawControl;
    if (ramblersMap.ORSkey !== null) {
        // add smart route layer
        ramblersMap.map.SmartRouteLayer = L.featureGroup([]).addTo(ramblersMap.map);
        ramblersMap.SmartRouteControl = new L.Control.SmartRoute();
    } else {
        ramblersMap.SmartRouteControl = null;
        ramblersMap.SmartRoute = {};
        ramblersMap.SmartRoute.enabled = false;
    }
    enableDraw();
    ramblersMap.map.on(L.Draw.Event.CREATED, function (e) {
        var type = e.layerType,
                layer = e.layer;
        if (type === 'marker') {
            layer.bindPopup('A popup!');
            var marker = layer;
            marker.name = '';
            marker.desc = '';
            marker.symbol = '';
        }
        ramblersMap.drawnItems.addLayer(layer);
        ramblersMap.map.addLayer(ramblersMap.drawnItems);
        addElevations(false);
    });
    ramblersMap.map.on('browser-print-start', function (e) {
        L.control.scale({
            position: 'topleft',
            imperial: false,
            maxWidth: 200
        }).addTo(e.printMap);
    });
    ramblersMap.drawnItems.on("upload:addline", function (e) {
        var bounds = ramblersMap.drawnItems.getBounds();
        ramblersMap.map.fitBounds(bounds);
        setGpxToolStatus('auto');
        addElevations(false);
    });
    ramblersMap.drawnItems.on('upload:addpoint', function (e) {
        if (e.point_type === "waypoint") {
            var marker = e.point;
            var sSymbol = marker.symbol;
            setMarkerIcon(marker, sSymbol);
        }
    });
    ramblersMap.drawnItems.on('upload:loaded', function (e) {
        download.set_name(upload.get_name());
        download.set_desc(upload.get_desc());
        download.set_author(upload.get_author());
        download.set_copyright(upload.get_copyright());
        download.set_date(upload.get_date());
        download.set_links(upload.get_links());
    });
    ramblersMap.drawnItems.on("reverse:reversed", function (e) {
        addElevations(false);
    });
    ramblersMap.map.on('draw:color-change', function (e) {
        var drawnItems = ramblersMap.drawnItems;
        drawnItems.eachLayer(function (layer) {
            if (layer instanceof L.Polyline) {
                ramblersMap.RA_Map_Tools._changePolyline(layer);
            }
        });
        ramblersMap.DrawControl.setDrawingOptions({
            polyline: {shapeOptions: ramblersMap.DrawStyle}});
        if (ramblersMap.SmartRoute.enabled) {
            ramblersMap.SmartRoute.setOpacityZero();
        }
        upload.set_polyline_style(ramblersMap.DrawStyle);

    });
    ramblersMap.map.on(L.Draw.Event.DRAWSTART, function (e) {
        // console.log('DRAW START');
        if (ramblersMap.SmartRouteControl !== null) {
            ramblersMap.SmartRouteControl.disable();
        }
        if (ramblersMap.SmartRoute.enabled) {
            //setOpacityZero();
            // save number of layers so we can see if cancel used
            ramblersMap.SmartRoute.NoLayers = ramblersMap.drawnItems.getLayers().length;
            ramblersMap.SmartRoute.latlngs = null;
            ramblersMap.SmartRoute.pending = false;
            ramblersMap.SmartRoute.saveroute = false;
        }

        this.displayMouseGridSquare = ramblersMap.displayMouseGridSquare;
        ramblersMap.displayMouseGridSquare = false;

        enableMapMoveDrawing();
        setGpxToolStatus('off');
    });
    ramblersMap.map.on(L.Draw.Event.DRAWVERTEX, function (e) {
        var layer = e.layers._layers;
        if (ramblersMap.SmartRoute.enabled) {
            // console.log('DRAW VERTEX');
            ramblersMap.SmartRouteControl.displaySmartPoints(layer);
        }
        if (ramblersMap.RoutingOption.panToNewPoint) {
            var latlong; //= new L.LatLng(lat, long);
            for (const property in layer) {
                latlong = layer[property]._latlng;
            }

            ramblersMap.map.panTo(latlong);
        }
        if (ramblersMap.RoutingOption.joinSegments) {

        }
    });

    ramblersMap.map.on(L.Draw.Event.DRAWSTOP, function (e) {
        if (ramblersMap.SmartRoute.enabled) {
            //  console.log('DRAW STOP');
            if (ramblersMap.SmartRoute.pending) {
                // Let displaySmartPoints save route
                ramblersMap.SmartRoute.saveroute = true;
            } else {
                ramblersMap.SmartRouteControl.saveSmartRoute();
            }

        }
        if (ramblersMap.SmartRouteControl !== null) {
            ramblersMap.SmartRouteControl.enable();
        }
        ramblersMap.displayMouseGridSquare = this.displayMouseGridSquare;
        disableMapMoveDrawing();
        if (!ramblersMap.SmartRoute.enabled) {
            if (ramblersMap.RoutingOption.joinSegments) {
                ramblersMap.map.fire('join:attach', null);
            }
        }
        addElevations(false);
        setGpxToolStatus('auto');
        //  console.log('DRAW EXIT');
    });
    ramblersMap.map.on('join:attach', function () {
        joinLastSegment();
    });
    ramblersMap.map.on(L.Draw.Event.EDITSTART, function (e) {
        ramblersMap.map.setMaxZoom(22);
        //ramblersMap.displayMouseGridSquare = false;
        this.displayMouseGridSquare = ramblersMap.displayMouseGridSquare;
        ramblersMap.displayMouseGridSquare = false;
        enableMapMoveDrawing();
        setGpxToolStatus('off');
    });
    ramblersMap.map.on(L.Draw.Event.EDITED, function (e) {
        ramblersMap.map.setMaxZoom(18);
        ramblersMap.displayMouseGridSquare = this.displayMouseGridSquare;
        disableMapMoveDrawing();
        addElevations(true);
        setGpxToolStatus('auto');
    });
    ramblersMap.map.on(L.Draw.Event.EDITSTOP, function (e) {
        ramblersMap.map.setMaxZoom(18);
        ramblersMap.displayMouseGridSquare = this.displayMouseGridSquare;
        disableMapMoveDrawing();
        addElevations(true);
        setGpxToolStatus('auto');
    });
    ramblersMap.map.on(L.Draw.Event.EDITMOVE, function (e) {
    });
    ramblersMap.map.on(L.Draw.Event.EDITVERTEX, function (e) {
    });
    ramblersMap.map.on(L.Draw.Event.DELETESTART, function (e) {
        this.displayMouseGridSquare = ramblersMap.displayMouseGridSquare;
        ramblersMap.displayMouseGridSquare = false;
        enableMapMoveDrawing();
        setGpxToolStatus('off');
        if (ramblersMap.SmartRoute.enabled) {
            ramblersMap.SmartRouteControl.setOpacityZero();
        }
    });
    ramblersMap.map.on(L.Draw.Event.DELETESTOP, function (e) {
        ramblersMap.displayMouseGridSquare = this.displayMouseGridSquare;
        disableMapMoveDrawing();
        listDrawnItems();
        resetMetadata();
        setGpxToolStatus('auto');
        if (ramblersMap.SmartRoute.enabled) {
            ramblersMap.SmartRouteControl.setOpacityZero();
        }
    });
    ramblersMap.map.on(L.Draw.Event.DELETED, function (e) {
        ramblersMap.displayMouseGridSquare = this.displayMouseGridSquare;
        disableMapMoveDrawing();
        listDrawnItems();
        resetMetadata();
        setGpxToolStatus('auto');
        if (ramblersMap.SmartRoute.enabled) {
            ramblersMap.SmartRouteControl.setOpacityZero();
        }
    });
    ramblersMap.map.on('simplify:started', function () {
        setGpxToolStatus('off');
        disableDraw();
    });
    ramblersMap.map.on('simplify:saved', function () {
        setGpxToolStatus('auto');
        addElevations(true);
        enableDraw();
    });
    ramblersMap.map.on('simplify:cancelled', function () {
        setGpxToolStatus('auto');
        enableDraw();
    });
    function resetMetadata() {
        if (ramblersMap.drawnItems.getLayers().length === 0) {
            download.set_name('');
            download.set_desc('');
            download.set_author('');
            download.set_copyright('');
            download.set_date('');
            download.set_links([]);
        }
    }
    function setGpxToolStatus(status) {
        ramblersMap.processPopups = status;
        reverse.setStatus(status);
        download.setStatus(status);
        simplify.setStatus(status);
        upload.setStatus(status);
        if (ramblersMap.postcodes !== null) {
            ramblersMap.postcodes.Enabled(status !== 'off');
        }
    }
    ramblersMap.drawnItems.on('popupopen', function (e) {
        if (ramblersMap.processPopups === 'off') {
            return;
        }
        var marker = e.popup._source;
        if (typeof (marker) === 'undefined') {
            return;
        }
        findMarker(marker);
        if (marker.found) {
            var popup = marker.getPopup();
            var content = '<span><b>Name</b></span><br/><input id="markerName" type="text"/ value="' + marker.name + '" /><br/><span><b>Description<b/></span><br/><textarea id="markerDesc" style="resize:vertical;">' + marker.desc + '</textarea><br/><span><b>Symbol</b></span><br/><input id="markerSymbol" type="text" value="' + marker.symbol + '"/>';
            popup.setContent(content);
        }
        //    alert('open');
    });
    function findMarker(marker) {
        marker.found = false;
        ramblersMap.drawnItems.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                if (layer === marker) {
                    marker.found = true;
                }
            }
        });
    }
    ramblersMap.drawnItems.on('popupclose', function (e) {
        if (ramblersMap.processPopups === 'off') {
            return;
        }
        var marker = e.popup._source;
        if (typeof (marker) === 'undefined') {
            return;
        }
        findMarker(marker);
        if (marker.found) {
            var popup = marker.getPopup();
            var sName = _escapeChars(getElementValue('markerName'));
            var sDesc = _escapeChars(getElementValue('markerDesc'));
            var sSymbol = _escapeChars(getElementValue('markerSymbol'));
            popup.setContent(sDesc);
            marker.name = sName;
            marker.desc = sDesc;
            marker.symbol = sSymbol;
            marker.title = sName + " - " + sDesc;
            setMarkerIcon(marker, sSymbol);
            //       marker.fire('revert-edited', {layer: marker});
        }
    });
//    ramblersMap.map.on('popupclose', function (e) {
//        download._popupclose(e);
//    });
    function getElementValue(id) {
        var node = document.getElementById(id);
        if (node !== null) {
            return node.value;
        }
        return "Invalid";
    }

//Move the map around when we're editing or drawing
    enableMapMoveDrawing = function () {
        ramblersMap.map.on('mousemove', mapMoveDrawingMouseMove, this);
    };
    _escapeChars = function (text) {
        text = text.replace(/&/g, "&amp;"); // do this first so others are not changed
        text = text.replace(/"/g, "&quot;");
        text = text.replace(/'/g, "&apos;");
        text = text.replace(/</g, "&lt;");
        text = text.replace(/>/g, "&gt;");
        return text;
    };
    mapMoveDrawingMouseMove = function (e) {
        var mousePos = e.containerPoint;
        var mapSize = ramblersMap.map.getSize();
        if (mousePos.y <= 20) {
            ramblersMap.map.panBy([0, -40]);
        } else if (mousePos.y + 20 > mapSize.y) {
            ramblersMap.map.panBy([0, 40]);
        }

        if (mousePos.x <= 20) {
            ramblersMap.map.panBy([-40, 0]);
        } else if (mousePos.x + 20 > mapSize.x) {
            ramblersMap.map.panBy([40, 0]);
        }
    };
    disableMapMoveDrawing = function () {
        ramblersMap.map.off('mousemove', mapMoveDrawingMouseMove, this);
    };
    listDrawnItems();
}
function disableDraw() {
    ramblersMap.map.removeControl(ramblersMap.DrawControl);
    if (ramblersMap.SmartRouteControl !== null) {
        ramblersMap.map.removeControl(ramblersMap.SmartRouteControl);
    }
}
function enableDraw() {
    ramblersMap.map.addControl(ramblersMap.DrawControl);
    if (ramblersMap.SmartRouteControl !== null) {
        ramblersMap.map.addControl(ramblersMap.SmartRouteControl);
    }
}
function listDrawnItems() {
    var hasItems = ramblersMap.drawnItems.getLayers().length !== 0;
    ramblersMap.elevationcontrol.clear();
    var text = "";
    if (!hasItems) {
        text = '<p><b>Plot a walking Route:</b> No routes or markers defined ';
        text += '<br/>If you need help to get started please visit our <b><a href="' + ramblersMap.maphelppage + '" target="_blank">Mapping Help Site</a></b></p>';
    } else {
        text += "<table>";
        text += "<tr><th>Segment</th><th>Length</th><th>Elevation Gain</th><th>Est Time</th><th>Number of points</th></tr>";
        ramblersMap.drawnItems.eachLayer(function (layer) {
            var i = 1;
            if (layer instanceof L.Polyline) {
                ramblersMap.elevationcontrol.addData(layer);
                text += listpath(i, layer.getLatLngs());
                i += 1;
            }
        });
        text += "</table>";
        text += '<p>If you need help to get started please visit our <b><a href="' + ramblersMap.maphelppage + '" target="_blank">Mapping Help Site</a></b></p>';

    }
    var node = document.getElementById("ra-map-details");
    if (node !== null) {
        node.innerHTML = text;
    }
}
function  joinLastSegment() {
    var no = ramblersMap.drawnItems.getLayers().length;
    if (no > 1) {
        var layers = ramblersMap.drawnItems.getLayers();
        var isLine = layers[no - 1] instanceof L.Polyline;
        if (!isLine) {
            return;
        }
        var nearest = findNearestLine(layers, layers[no - 1]);
        if (nearest === null) {
            return;
        }
        var latlngs = [];
        var l1 = nearest.l1;
        var l2 = nearest.l2;

        latlngs = getMergedLinePoints(l1, l2);

        var line = new L.Polyline(latlngs, ramblersMap.DrawStyle);

        ramblersMap.drawnItems.removeLayer(l1.line);
        ramblersMap.drawnItems.removeLayer(l2.line);
        ramblersMap.drawnItems.addLayer(line);
        ramblersMap.drawnItems.fire('upload:addline', {line: line});
    }
}
function getMergedLinePoints(l1, l2) {
    var latlngs;
    if (l1.index > 0 && l2.index === 0) {
        latlngs = l1.line._latlngs.concat(l2.line._latlngs);
        return latlngs;
    }
    if (l1.index === 0 && l2.index > 0) {
        latlngs = l2.line._latlngs.concat(l1.line._latlngs);
        return latlngs;
    }
    if (l1.index > 0 && l2.index > 0) {
        latlngs = l1.line._latlngs.concat(l2.line._latlngs.reverse());
        return latlngs;
    }
    if (l1.index === 0 && l2.index === 0) {
        latlngs = l2.line._latlngs.reverse().concat(l1.line._latlngs);
        return latlngs;
    }
}
function findNearestLine(layers, joinLine) {
    var nearest = null;
    var shortest = Number.MAX_VALUE;
    for (var i = 0; i < layers.length - 1; i++) {
        var line = layers[i];
        if (line instanceof L.Polyline) {
            for (var j of [0, line._latlngs.length - 1]) {
                var pt1 = line._latlngs[j];
                for (var k of [0, joinLine._latlngs.length - 1]) {
                    var pt2 = joinLine._latlngs[k];
                    var dist = pt2.distanceTo(pt1);
                    if (dist < shortest) {
                        shortest = dist;
                        //  console.log(dist);
                        nearest = {l1: {
                                line: line,
                                index: j,
                                pt: pt1},
                            l2: {
                                line: joinLine,
                                index: k,
                                pt: pt2},
                            distance: dist};
                    }
                }
            }
        }
    }
    //  console.log(nearest);
    return nearest;
}

function listpath(i, latlngs) {
    var dist = polylineDistance(latlngs);
    var elevGain = polylineElevationGain(latlngs);
    var estTime = naismith(dist, elevGain);
    var text = "<tr><td>" + i + "</td><td> " + getGPXDistance(dist) + "</td><td>" + elevGain + "m</td><td>" + estTime + "</td><td>" + latlngs.length + "</td></tr>";
    return text;
}

function polylineDistance(latlngs) {
    var i, len;
    i = 0;
    len = latlngs.length;
    var tempLatLng = null;
    var totalDistance = 0.00000;
    for (i = 0, len = latlngs.length; i < len; i++) {
        var latlng = latlngs[i];
        if (tempLatLng === null) {
            tempLatLng = latlng;
        } else {
            totalDistance += tempLatLng.distanceTo(latlng);
            tempLatLng = latlng;
        }
    }
    return totalDistance;
}
function polylineElevationGain(latlngs) {
    var i, len;
    i = 0;
    len = latlngs.length;
    var tempLatLng = null;
    var elevationGain = 0.00000;
    for (i = 0, len = latlngs.length; i < len; i++) {
        var latlng = latlngs[i];
        if (tempLatLng === null) {
            tempLatLng = latlng;
        } else {
            if (latlng.alt > tempLatLng.alt) {
                elevationGain += latlng.alt - tempLatLng.alt;
            }
            tempLatLng = latlng;
        }
    }
    return  elevationGain;
}
function addElevations(force) {
    var node = document.getElementById("ra-map-details");
    if (node !== null) {
        node.innerHTML = "<br/><h4>Fetching elevations - please wait...</h4>";
    }
    var hasItems = ramblersMap.drawnItems.getLayers().length !== 0;
    if (hasItems) {
        ramblersMap.drawnItems.eachLayer(function (layer) {
            if (layer instanceof L.Polyline) {
                addElevation(layer.getLatLngs());
            }
        });
    }
    getElevations(force);
}
function addElevation(latlngs) {
    var i, len;
    i = 0;
    len = latlngs.length;
    for (i = 0, len = latlngs.length; i < len; i++) {
        if (typeof (latlngs[i].alt) === 'undefined') {
            // latlngs[i].meta = {ele: null};
            latlngs[i].alt = -999;
        }
    }
    return;
}
function getElevations(force) {
    var hasItems = ramblersMap.drawnItems.getLayers().length !== 0;
    var nullItems = [];
    if (hasItems) {
        ramblersMap.drawnItems.eachLayer(function (layer) {
            if (layer instanceof L.Polyline) {
                hasNullElevation(layer.getLatLngs(), nullItems, force);
            }
        });
    }
    if (nullItems.length > 0) { // need to fetch elevations
        if (nullItems.length > 1000) {
            blurt("Tracks contains more than 1000 points, response may be slow, please wait...");
        }
        var points = "data=" + JSON.stringify(nullItems);
        var url = "https://elevation.theramblers.org.uk/";
        postJSON(url, points, function (err, items) {
            if (err !== null) {
                var msg = "Error: Something went wrong: " + err;
                alert(msg);
            } else {
                for (i = 0; i < items.length; i++) {
                    var item = items[i];
                    updateElevations(item);
                }
            }
            listDrawnItems();
        });
    } else {
        listDrawnItems();
    }
}
function hasNullElevation(latlngs, nullItems, force) {
    var i, len;
    i = 0;
    len = latlngs.length;
    for (i = 0, len = latlngs.length; i < len; i++) {
        //   if (latlngs[i].meta.ele === null || force) {
        if (latlngs[i].alt === "undefined" || latlngs[i].alt === -999 || force) {
            var point = [latlngs[i].lat, latlngs[i].lng];
            nullItems.push(point);
        }
    }
}
function updateElevations(item) {
    var noItems = ramblersMap.drawnItems.getLayers().length;
    if (noItems > 0) {
        ramblersMap.drawnItems.eachLayer(function (layer) {
            if (layer instanceof L.Polyline) {
                updateElevation(layer.getLatLngs(), item);
            }
        });
    }
}
function updateElevation(latlngs, item) {
    var i, len;
    i = 0;
    len = latlngs.length;
    for (i = 0, len = latlngs.length; i < len; i++) {
        if (Math.abs(latlngs[i].lat - item[0]) < .000001 & Math.abs(latlngs[i].lng - item[1]) < .000001) {
            latlngs[i].alt = item[2];
        }
    }
}
function getLngLats(latlngs) {
    var i = 0;
    var lnglats = [];
    var len = latlngs.length;
    for (i = 0; i < len; i++) {
        // change to long/lat rather than lat/long
        lnglats[i] = [];
        lnglats[i][0] = latlngs[i].lng;
        lnglats[i][1] = latlngs[i].lat;
    }
    return lnglats;
}
function ragetLatlngs(lnglats) {
    var latlngs = [];
    for (const lnglat of lnglats) {
        var latlng = L.latLng(lnglat[1], lnglat[0]);
        latlngs.push(latlng);
    }
    return latlngs;
}
function removeShortSegments(latlngsOrig) {
    var latlngs = [];
    var last = null;
    var dist;
    for (const latlng of latlngsOrig) {
        if (last !== null) {
            dist = last.distanceTo(latlng);
            if (dist > 2) {
                latlngs.push(latlng);
            }
        } else {
            latlngs.push(latlng);
        }
        last = latlng;
    }
    return latlngs;
}