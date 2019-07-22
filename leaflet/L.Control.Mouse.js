var L, ramblersMap, OsGridRef;
L.Control.Mouse = L.Control.extend({
    options: {
        position: 'bottomleft',
        separator: ', ',
        emptyString: 'Outside OS Grid',
        lngFirst: false,
        numDigits: 5
    },
    onAdd: function (map) {
        this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
        L.DomEvent.disableClickPropagation(this._container);
        map.on('mousemove', this._update, this);
        this._container.innerHTML = this.options.emptyString;
        return this._container;
    },
    onRemove: function (map) {
        map.off('mousemove', this._update);
    },
    _update: function (e) {
        var text = getMouseMoveAction(e);
        this._container.innerHTML = text;
    }
});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
        this.addControl(this.positionControl);
    }
});

L.control.mouse = function (options) {
    return new L.Control.Mouse(options);
};

L.Control.PostcodeStatus = L.Control.extend({
    options: {
        position: 'bottomleft'
    },
    displaymap: null,
    onAdd: function (map) {
        this.map = map;
        this._first = true;
        this._placeslayer = null;
        _mouse_this = this;
        this.map.mouseLayer = L.featureGroup([]);
        this.map.mouseLayer.addTo(this.map);

        this.enabled = true;
        //  L.control.layers( overlayMaps).addTo(this.map);
        this._container = L.DomUtil.create('div', 'leaflet-control-postcodeposition');
        L.DomEvent.disableClickPropagation(this._container);
        this.map.on('zoomend', this._onZoomEnd, this);
        this.map.on('contextmenu', this._onRightClick, this);
        var text = 'Right click/tap hold to see <select id="ra-mouse-options"><option value="details">Location Details</option><option value="postcode">nearby Postcodes</option><option value="starting">nearby Starting Places</option><option value="groups">nearby Groups</option></select>';

        //  this._container.innerHTML = this.options.zoominString;
        this._container.innerHTML = text;
        return this._container;
    },
    onRemove: function () {
        this.map.off('zoomend', this._onZoomEnd);
        this.map.off('contextmenu', this._onRightClick);
    },
    Enabled: function (status) {
        this.enabled = status === true;
    },
    _onRightClick: function (e) {
        if (this._first) {
            this._first = false;
            document.getElementById("ra-mouse-options").addEventListener("focus", this._clearBoth);

        }
        this._clearBoth();
        var ele = document.getElementById("ra-mouse-options");
        var option = ele.options[ele.selectedIndex].value;

        if (this.enabled) {
            switch (option) {
                case "details":
                    this._displayDetails(e);
                    break;
                case "postcode":
                    this._displayPostcodes(e);
                    break;
                case "starting":
                    if (this._placeslayer === null) {
                        this._addPlacesLayers();
                    }
                    this._displayPlaces(e);
                    break;
                case "groups":
                    this._displayGroups(e);
                    break;
            }
        }
    },
    _onZoomEnd: function (e) {
//        var zoom = this.map.getZoom();
    },
    _displayDetails: function (e) {
        var p = new LatLon(e.latlng.lat, e.latlng.lng);
        var grid = OsGridRef.latLonToOsGrid(p);
        var gr = grid.toString(6);
        var gr10 = grid.toString(8);
        var i;
        var marker;
        var desc = "<b>Latitude: </b>" + e.latlng.lat.toFixed(5) + " ,  <b>Longitude: </b>" + e.latlng.lng.toFixed(5);
        if (gr !== "") {
            desc += "<br/><b>Grid Reference: </b>" + gr +
                    "<br/><b>Grid Reference: </b>" + gr10 + " (8 Figure)";
        }
// desc += getBrowserStatus();
        var results = encodeShortest(e.latlng.lat, e.latlng.lng);
        if (results.length > 0) {
            desc += '<br/><b><a href="http://www.mapcode.com" target="_blank">Mapcode:</a> </b>' + results[0].fullmapcode;
        }
        var pluscode = OpenLocationCode.encode(e.latlng.lat, e.latlng.lng);
        desc += '<br/><b><a href="https://plus.codes" target="_blank">Plus Code:</a> </b>' + pluscode + "<br/>";
        if (gr !== "") {
            desc += '<a href="javascript:photos(\'' + gr10 + '\')">[Photos]</a>';
            desc += '<a href="javascript:streetmap(\'' + gr10 + '\')">[OS Map]</a>';
        }
        desc += '<a href="javascript:googlemap(' + e.latlng.lat.toFixed(7) + ',' + e.latlng.lng.toFixed(7) + ')">[Google Map]</a>';
        desc += '<a href="javascript:directions(' + e.latlng.lat.toFixed(7) + ',' + e.latlng.lng.toFixed(7) + ')">[Directions]</a>';
        this.map.mouseLayer.clearLayers();
        var msg = "   ";
        var point = L.marker(p).bindPopup(msg);
        this.map.mouseLayer.addLayer(point);
        point.getPopup().setContent(desc);
        if (gr !== "") {
            point.openPopup();
        } else {
            desc += "<br/>Outside OS Grid";
            point.getPopup().setContent(desc);
            point.openPopup();
        }
    },
    _displayPostcodes: function (e) {
        var p = new LatLon(e.latlng.lat, e.latlng.lng);
        var grid = OsGridRef.latLonToOsGrid(p);
        var gr = grid.toString(6);
        var i;
        var marker;
        var desc = " ";

        this.map.mouseLayer.clearLayers();
        var msg = "   ";
        var point = L.marker(p).bindPopup(msg);
        this.map.mouseLayer.addLayer(point);

        if (gr !== "") {
            point.getPopup().setContent("<b>Searching for postcodes ...</b>");
            point.openPopup();
            // get postcodes around this point       
            var east = Math.round(grid.easting);
            var north = Math.round(grid.northing);
            var url = "https://postcodes.theramblers.org.uk/index.php?easting=" + east + "&northing=" + north + "&dist=10&maxpoints=30";
            getJSON(url, function (err, items) {
                if (err !== null) {
                    var msg = "Error: Something went wrong: " + err;
                    point.getPopup().setContent(msg);
                } else {
                    if (items.length === 0) {
                        var closest = "No postcodes found within 10km";
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
                            var style;
                            if (i === 0) {
                                marker = L.marker(pt, {icon: ramblersMap.postcodeIconClosest}).bindPopup(popup);
                                style = {color: 'green', weight: 3, opacity: 0.2};
                            } else {
                                marker = L.marker(pt, {icon: ramblersMap.postcodeIcon}).bindPopup(popup);
                                style = {color: 'blue', weight: 3, opacity: 0.2};
                            }
                            _mouse_this.map.mouseLayer.addLayer(marker);
                            _mouse_this.map.mouseLayer.addLayer(L.polyline([pt, p], style));
                        }
                    }
                    point.getPopup().setContent("<b>" + items.length + " Postcodes found</b>");
                    point.openPopup();
                    var bounds = _mouse_this.map.mouseLayer.getBounds();
                    _mouse_this.map.fitBounds(bounds, {padding: [150, 150]});
                }
                setTimeout(function (point) {
                    _mouse_this.map.removeLayer(point);
                }, 3000, point);
            });

        } else {
            desc += "<br/>Outside OS Grid";
            point.getPopup().setContent(desc);
            point.openPopup();
        }

    },
    _displayGroups: function (e) {
        var p = new LatLon(e.latlng.lat, e.latlng.lng);
        var i;
        var marker;
        var msg = "<b>Searching for Ramblers Groups ...</b>";
        this.map.mouseLayer.clearLayers();
        var point = L.marker(p).bindPopup(msg);
        this.map.mouseLayer.addLayer(point);
        //  point.getPopup().setContent(msg);
        point.openPopup();

        var $latitude = e.latlng.lat;
        var $longitude = e.latlng.lng;
        var url = "https://groups.theramblers.org.uk/index.php?latitude=" + $latitude + "&longitude=" + $longitude + "&dist=50&maxpoints=60";
        getJSON(url, function (err, items) {
            if (err !== null) {
                var msg = "Error: Something went wrong: " + err;
                point.getPopup().setContent(msg);
            } else {
                if (items.length === 0) {
                    var closest = "No Ramblers Groups found within 50km";
                    point.getPopup().setContent(closest);
                } else {
                    msg = items.length + " Ramblers Groups found within 50km";
                    point.getPopup().setContent(msg);
                    point.openPopup();
                    for (i = 0; i < items.length; i++) {
                        var item = items[i];
                        var popup = "<b>";
                        switch (item.scope) {
                            case "A":
                                popup += "Area: ";
                                break;
                            case "G":
                                popup += "Group: ";
                                break;
                            case "S":
                                popup += "Special Group: ";
                                break;
                        }
                        popup += item.name + "</b><br/>" + item.description;
                        popup += "<br/><a href='" + item.url + "' target='_blank'>More Info</a>";
                        popup += "<br/><a href='https://www.ramblers.org.uk/find-a-walk.aspx?layer=walks&tab=walks&group=" + item.groupCode + "' target='_blank' >Group walks</a>";
                        if ("status" in item) {
                            if (item.status === "Hosted") {
                                popup += "<br/>Web site: <a href='http://" + item.website + "' target='_blank' >" + item.website + "</a>";
                            }
                            if (item.scope !== "A") {
                                popup += "<br/>Belongs to " + item.areaname + " area";
                            }
                        }
                        var $iclass = "group-icon " + item.scope.toLowerCase();
                        //   var style;
                        var pt = new L.latLng(item.latitude, item.longitude);
                        var title = item.name;
                        var icon = L.divIcon({className: $iclass, iconSize: null, html: title});

                        marker = L.marker(pt, {icon: icon}).bindPopup(popup);
                        //   style = {color: 'blue', weight: 3, opacity: 0.2};

                        _mouse_this.map.mouseLayer.addLayer(marker);

                    }
                    var bounds = _mouse_this.map.mouseLayer.getBounds();
                    _mouse_this.map.fitBounds(bounds, {padding: [150, 150]});
                }
            }
            setTimeout(function (point) {
                _mouse_this.map.removeLayer(point);
            }, 3000, point);
        });



    },
    _clearBoth: function () {
        _mouse_this.map.mouseLayer.clearLayers();
        _mouse_this._clearPlacesLayers();
    },
    _addPlacesLayers: function () {
        this._placeslayer = [];
        for (var i = 1; i < 6; i++) {
            this._placeslayer[i] = L.featureGroup([]);
            this._placeslayer[i].addTo(ramblersMap.map);
            ramblersMap.mapControl.addOverlay(this._placeslayer[i], "<span class='ramblers-places-icon'><img src='ramblers/leaflet/images/" + i + "star.png' alt='" + i + " Star'> places</span>");
        }
    },
    _clearPlacesLayers: function () {
        if (_mouse_this._placeslayer !== null) {
            for (i = 1; i < 6; i++) {
                _mouse_this._placeslayer[i].clearLayers();
            }
        }
    },
    _getPlacesBounds: function () {
        var bounds;
        var bnds;
        bounds = this._placeslayer[1].getBounds();
        for (var i = 2; i < 6; i++) {
            bnds = this._placeslayer[i].getBounds();
            bounds = bounds.extend(bnds);
        }
        return bounds;
    },
    _displayPlaces: function (e) {
        var p = new LatLon(e.latlng.lat, e.latlng.lng);
        var grid = OsGridRef.latLonToOsGrid(p);
        var gr = grid.toString(6);
        var i;
        var desc = "<b><a href='https://maphelp.ramblers-webs.org.uk/startingplaces.html' target='_blanks'>Meeting/Starting Places</a><b>";
        this._clearPlacesLayers();
        this.map.mouseLayer.clearLayers();
        var msg = "   ";
        var point = L.marker(p).bindPopup(msg);
        this.map.mouseLayer.addLayer(point);
        point.getPopup().setContent(desc);
        if (gr !== "") {
            point.getPopup().setContent(desc + "<br/><b>Searching for Ramblers meeting/starting places ...</b>");
            point.openPopup();

            var east = Math.round(grid.easting);
            var north = Math.round(grid.northing);
            var url = "https://places.walkinginfo.co.uk/get.php?easting=" + east + "&northing=" + north + "&dist=10&maxpoints=300";
            getJSON(url, function (err, items) {
                if (err !== null) {
                    desc += "<br/>Error: Something went wrong: " + err;
                } else {
                    var no = 0;
                    for (i = 0; i < items.length; i++) {
                        var item = items[i];
                        if (item.S > 0 && item.S < 6) {
                            var marker;
                            marker = addPlaceMarker(item.GR, item.S, item.Lat, item.Lng);
                            _mouse_this._placeslayer[item.S].addLayer(marker);
                            no += 1;
                        }
                    }
                    if (no === 0) {
                        desc += "<br/>No meeting/starting places found within 10km";
                    } else {
                        if (no === 100) {
                            desc += "<br/>100+ locations found within 10Km";

                        } else {
                            desc += "<br/>" + no + " locations found within 10Km";
                        }
                        var bounds = _mouse_this._getPlacesBounds();
                        _mouse_this.map.fitBounds(bounds, {padding: [150, 150]});
                    }
                    point.getPopup().setContent(desc);
                    // point.openPopup();

                }
                setTimeout(function (point) {
                    _mouse_this.map.removeLayer(point);
                }, 10000, point);
            });

        } else {
            desc += "<br/>Outside OS Grid";
            point.getPopup().setContent(desc);
            point.openPopup();
        }
    }
});

L.control.postcodeStatus = function (options) {
    return new L.Control.PostcodeStatus(options);
};

L.Control.UsageAgreement = L.Control.extend({
    options: {
        position: 'bottomleft',
        defaultString: 'You have agreed that you will check the suitability of locations before you use them.'
    },
    onAdd: function (map) {
        this._container = L.DomUtil.create('div', 'leaflet-control-usageagreement');
        L.DomEvent.disableClickPropagation(this._container);
        this._container.innerHTML = this.options.defaultString;
        return this._container;
    },
    onRemove: function (map) {
        map.off('zoomend', this._onZoomEnd);
        map.off('contextmenu', this._onClick);
    }
});

L.control.usageAgreement = function (options) {
    return new L.Control.UsageAgreement(options);
};