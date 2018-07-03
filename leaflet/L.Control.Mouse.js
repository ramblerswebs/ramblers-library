var L, ramblersMap, OsGridRef, postcodeIconClosest, postcodeIcon;
var s0, s1, s2, s3, s4, s5;
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
        position: 'bottomleft',
        zoominString: 'Zoom in and right click/tap hold to see nearby postcodes',
        displayString: 'Right click/tap hold to see nearby postcodes'
    },
    displaymap: null,
    onAdd: function (map) {
        this.map = map;
        this._placeslayer = null;
        _mouse_this = this;
        this.map.postcodelayer = L.featureGroup([]);
        this.map.postcodelayer.addTo(this.map);
        this.enabled = true;
        //  L.control.layers( overlayMaps).addTo(this.map);
        this._container = L.DomUtil.create('div', 'leaflet-control-postcodeposition');
        L.DomEvent.disableClickPropagation(this._container);
        this.map.on('zoomend', this._onZoomEnd, this);
        this.map.on('contextmenu', this._onRightClick, this);
        this._container.innerHTML = this.options.zoominString;
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
        if (this.enabled) {
            if (e.originalEvent.altKey === false) {
                this._displayPostcodes(e);
            } else {
                if (this._placeslayer === null) {
                    this._addPlacesLayers();
                }
                this._displayPlaces(e);
            }
        }
    },
    _onZoomEnd: function (e) {
        var zoom = this.map.getZoom();
        if (zoom <= 12) {
            this._container.innerHTML = this.options.zoominString;
            if (zoom <= 9) {
                this.map.postcodelayer.clearLayers();
            }
        } else {
            this._container.innerHTML = this.options.displayString;
        }
    },
    _displayPostcodes: function (e) {
        var p = new LatLon(e.latlng.lat, e.latlng.lng);
        var grid = OsGridRef.latLonToOsGrid(p);
        var gr = grid.toString(6);
        var gr10 = grid.toString(8);
        var i;
        var marker;
        var zoom = this.map.getZoom();
        var desc = "<b>Latitude: </b>" + e.latlng.lat.toFixed(5) + " ,  <b>Longitude: </b>" + e.latlng.lng.toFixed(5);
        if (gr !== "") {
            desc += "<br/><b>Grid Reference: </b>" + gr +
                    "<br/><b>Grid Reference: </b>" + gr10 + " (8 Figure)";
        }
// desc += getBrowserStatus();
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
        this.map.postcodelayer.clearLayers();
        var msg = "   ";
        var point = L.marker(p).bindPopup(msg);
        this.map.postcodelayer.addLayer(point);
        point.getPopup().setContent(desc);
        if (gr !== "") {
            point.openPopup();
            if (zoom > 12) {
                point.getPopup().setContent(desc + "<br/><b>Searching for postcodes ...</b>");
// get postcodes around this point       
                var east = Math.round(grid.easting);
                var north = Math.round(grid.northing);
                var url = "https://postcodes.theramblers.org.uk/index.php?easting=" + east + "&northing=" + north + "&dist=10&maxpoints=20";
                getJSON(url, function (err, items) {
                    if (err !== null) {
                        var msg = "Error: Something went wrong: " + err;
                        point.getPopup().setContent(msg);
                    } else {
                        if (items.length === 0) {
                            closest = "No postcodes found within 10km";
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
                                    marker = L.marker(pt, {icon: postcodeIconClosest}).bindPopup(popup);
                                    style = {color: 'green', weight: 4, opacity: 0.2};
                                } else {
                                    marker = L.marker(pt, {icon: postcodeIcon}).bindPopup(popup);
                                    style = {color: 'blue', weight: 4, opacity: 0.2};
                                }
                                _mouse_this.map.postcodelayer.addLayer(marker);
                                _mouse_this.map.postcodelayer.addLayer(L.polyline([pt, p], style));
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

    },
    _addPlacesLayers: function () {
        this._placeslayer = [];
        for (i = 1; i < 6; i++) {
            this._placeslayer[i] = L.layerGroup([]);
            this._placeslayer[i].addTo(ramblersMap.map);
            ramblersMap.mapControl.addOverlay(this._placeslayer[i], "<span class='ramblers-places-icon'><img src='ramblers/leaflet/images/" + i + "star.png' alt='" + i + " Star'> places</span>");
        }
    },
    _clearPlacesLayers: function () {
        for (i = 1; i < 6; i++) {
            this._placeslayer[i].clearLayers();
        }
    },
    _displayPlaces: function (e) {
        var p = new LatLon(e.latlng.lat, e.latlng.lng);
        var grid = OsGridRef.latLonToOsGrid(p);
        var gr = grid.toString(6);
        var i;
        var desc = "<b>Latitude: </b>" + e.latlng.lat.toFixed(5) + " ,  <b>Longitude: </b>" + e.latlng.lng.toFixed(5);

        this._clearPlacesLayers();
        var msg = "   ";
        var point = L.marker(p).bindPopup(msg);
        this.map.postcodelayer.addLayer(point);
        point.getPopup().setContent(desc);
        if (gr !== "") {
            point.openPopup();

            point.getPopup().setContent(desc + "<br/><b>Searching for Ramblers meeting/starting places ...</b>");

            var east = Math.round(grid.easting);
            var north = Math.round(grid.northing);
            var url = "https://places.walkinginfo.co.uk/get.php?easting=" + east + "&northing=" + north + "&dist=10&maxpoints=100";
            getJSON(url, function (err, items) {
                if (err !== null) {
                    var msg = "Error: Something went wrong: " + err;
                    point.getPopup().setContent(msg);
                } else {
                    if (items.length === 0) {
                        closest = "No meeting/starting places found within 10km";
                        point.getPopup().setContent(closest);
                    } else {
                        for (i = 0; i < items.length; i++) {

                            var item = items[i];
                            var popup = item.GR;

                            var pt = new L.latLng(item.Lat, item.Lng);
                            var marker;
                            switch (item.S) {
                                case 0:
                                    marker = L.marker(pt, {icon: s0}).bindPopup(popup);
                                    break;
                                case 1:
                                    marker = L.marker(pt, {icon: s1}).bindPopup(popup);
                                    break;
                                case 2:
                                    marker = L.marker(pt, {icon: s2}).bindPopup(popup);
                                    break;
                                case 3:
                                    marker = L.marker(pt, {icon: s3}).bindPopup(popup);
                                    break;
                                case 4:
                                    marker = L.marker(pt, {icon: s4}).bindPopup(popup);
                                    break;
                                case 5:
                                    marker = L.marker(pt, {icon: s5}).bindPopup(popup);
                                    break;
                            }
                            if (item.S > 0 && item.S < 6) {
                                _mouse_this._placeslayer[item.S].addLayer(marker);
                            }

                        }
                    }
                    point.getPopup().setContent(desc);
                    point.openPopup();
                    ramblersMap.map.removeLayer(point);
                }

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