var L, ra, OsGridRef;
// this file contains three controls
// Mouse to display grid reference
// OSInfo to display oS Map outlines
// Rightclick to define mouse right click actions

L.Control.Mouse = L.Control.extend({
    options: {
        position: 'bottomleft',
        separator: ', ',
        emptyString: 'Outside OS Grid',
        lngFirst: false,
        numDigits: 5
    },
    _userOptions: {
        displayMouseGridSquare: true,
        displayGridRef: true,
        displayLatLong: true,
        displayLatLongFormat: true,
        displayZoom: false
    },
    _mapState: {
        zoom: 0,
        latlng: [0, 0],
        gridref: 'Outside OS Grid',
        firstLine: '',
        middleLine: '',
        lastLine: ''
    },
    onAdd: function (map) {
        var self = this;
        this._map = map;
        this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
        L.DomEvent.disableClickPropagation(this._container);
        map.on('mousemove', this._updateLocation, this);
        map.on('zoom', this._updateZoom, this);
        this._container.innerHTML = this.options.emptyString;
        this.OSGridSquareLayer = L.featureGroup([]).addTo(map);
        this.OSGridSquareLayer.options.ignore = true;
        if (L.Browser.mobile) {
            this._container.style.display = 'none';
        }
        this._readSettings();
        map.on('mouseover', function () {
            self._container.style.display = 'inherit';
        });
        map.on('mouseout', function () {
            self._container.style.display = 'none';
        });
        return this._container;
    },
    changeDisplay: function (display) {
        if (!L.Browser.mobile) {
            this._container.style.display = display;
        }
    },
    onRemove: function (map) {
        map.off('mousemove', this._updateState);
    },
    gridSquarePause: function () {
        this.SAVEdisplayMouseGridSquare = this._userOptions.displayMouseGridSquare;
        this._userOptions.displayMouseGridSquare = false;
    },
    gridSquareResume: function () {
        this._userOptions.displayMouseGridSquare = this.SAVEdisplayMouseGridSquares;
    },
    _updateZoom: function () {
        this._mapState.zoom = this._map.getZoom();
        this._updateLocationPanel();
    },
    _updateLocation: function (e) {
        var latlng = e.latlng;
        this._mapState.latlng = e.latlng;
        var gr;
        var p = new LatLon(latlng.lat, latlng.lng);
        var grid = OsGridRef.latLonToOsGrid(p);
        var zoom = this._mapState.zoom;
        if (zoom > 16) {
            gr = grid.toString(8);
            this._mapState.firstLine = '8 figure grid reference [10m<sup>2</sup>]<br/>';
        } else {
            gr = grid.toString(6);
            this._mapState.firstLine = '6 figure grid reference [100m<sup>2</sup>]<br/>';

        }
        this.OSGridSquareLayer.clearLayers();
        if (gr === "") {
            this._mapState.firstLine = "Outside OS Grid<br/>";
            this._mapState.gridref = "";
        } else {
            this._mapState.gridref = '<span class="osgridref">' + gr + "</span>";
        }
        var lng = latlng.lng.toFixed(5);
        var lat = latlng.lat.toFixed(5);
        this._mapState.lastLine = "";
        if (this._userOptions.displayLatLong) {
            if (this._userOptions.displayLatLongFormat) {
                this._mapState.lastLine = "Lat/long: " + lat + ", " + lng; //+" z"+ zoom;
            } else {
                this._mapState.lastLine = "Lat/long: " + ra.latlongDecToDms(latlng.lat, latlng.lng);
            }
        }

        //   var grtext = '<span class="osgridref">' + gr + "</span>";

        if (!this._userOptions.displayGridRef) {
            this._mapState.gridref = '';
        }

        this._updateLocationPanel();
        this._displayMouseGrid(gr, zoom, grid);
        return;
    },
    _updateLocationPanel: function () {
        if (this._userOptions.displayZoom) {
            this._mapState.middleLine = this._mapState.gridref + "   Zoom[" + this._mapState.zoom + "]<br/>";
        } else {
            this._mapState.middleLine = this._mapState.gridref + "<br/>";
        }

        if (this._map.getSize().y > 300) {
            this._container.innerHTML = this._mapState.firstLine + this._mapState.middleLine + this._mapState.lastLine;
        } else {
            this._container.innerHTML = this._mapState.middleLine + this._mapState.lastLine;
        }

    },
    _displayMouseGrid: function (gr, zoom, grid) {
        this.OSGridSquareLayer.clearLayers();
        if (gr !== "") {
            if (this._userOptions.displayMouseGridSquare) {
                if (zoom > 12) {
                    var bounds = this._osGridToLatLongSquare(grid, 100);
                    this.gridsquare100 = L.polygon(bounds, {color: "#ff7800", weight: 1, ignore: true});
                    // ignore property is for Zoom All
                    this.OSGridSquareLayer.addLayer(this.gridsquare100); // change rectangle
                }
                if (zoom > 16) {
                    var bounds2 = this._osGridToLatLongSquare(grid, 10);
                    this.gridsquare10 = L.polygon(bounds2, {color: "#884000", weight: 1, ignore: true});
                    // ignore property is for Zoom All
                    this.OSGridSquareLayer.addLayer(this.gridsquare10); // change rectangle
                }
            }
        }
    },
    _osGridToLatLongSquare: function (gridref, size) {
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
            [ll4.lat, ll4.lon]];
        return bounds;
    },
    settingsForm: function (tag) {
        try {
            if (!L.Browser.mobile) {
                var title = document.createElement('h3');
                title.textContent = 'Mouse Position';
                tag.appendChild(title);
                title = document.createElement('p');
                title.textContent = 'As you zoom in, the mouse can display a 100m and a 10m square showing the area covered by a 6 or 8 figure grid reference.';
                tag.appendChild(title);
                var osMouse = ra.html.input.yesNo(tag, 'divClass', "Display 10m/100m grid reference squares", this._userOptions, 'displayMouseGridSquare');
                title = document.createElement('h4');
                title.textContent = 'Bottom left display';
                tag.appendChild(title);
                var displayGR = ra.html.input.yesNo(tag, 'divClass', "Display Grid Reference", this._userOptions, 'displayGridRef');
                var displayLatLong = ra.html.input.yesNo(tag, 'divClass', "Display Latitude/Longitude", this._userOptions, 'displayLatLong');
                var displayLatLongFormat = ra.html.input.yesNo(tag, 'divClass', "Latitude/Longitude format", this._userOptions, 'displayLatLongFormat', ['Decimal', 'Degrees Minutes Seconds']);
                var displayZoom = ra.html.input.yesNo(tag, 'divClass', "Display Zoom level", this._userOptions, 'displayZoom');
                osMouse.addEventListener("ra-input-change", function (e) {
                    ra.settings.changed();
                });
                displayGR.addEventListener("ra-input-change", function (e) {
                    ra.settings.changed();
                });
                displayLatLong.addEventListener("ra-input-change", function (e) {
                    ra.settings.changed();
                });
                displayLatLongFormat.addEventListener("ra-input-change", function (e) {
                    ra.settings.changed();
                });
            }
        } catch (err) {
            ra.showError(err.message);
        }
    },
    resetSettings: function () {
        ra.html.input.yesNoReset(this._userOptions.displayMouseGridSquare, true);
        ra.html.input.yesNoReset(this._userOptions.displayGridRef, true);
        ra.html.input.yesNoReset(this._userOptions.displayLatLong, true);
        ra.html.input.yesNoReset(this._userOptions.displayLatLongFormat, false);
        ra.html.input.yesNoReset(this._userOptions.displayZoom, false);
    },
    _readSettings: function () {
        ra.settings.read('__mouseossquare', this._userOptions);
    },
    saveSettings: function (save) {
        ra.settings.save(save, '__mouseossquare', this._userOptions);
    }
});
L.control.mouse = function (options) {
    return new L.Control.Mouse(options);
};
L.Control.OSInfo = L.Control.extend({
    options: {
        position: 'bottomleft'
    },
    _displayOSGrid: false,
    _userOptions: {
        osgridline: {
            color: '#0080C0',
            weight: 2,
            opacity: 0.5}
    },
    onAdd: function (map) {
        self = this;
        this._map = map;
        this.osMapLayer = L.featureGroup([]).addTo(map);
        this.OSGrid = {};
        this.OSGrid.layer = L.layerGroup().addTo(map);
        this._containerAll = L.DomUtil.create('div', 'leaflet-control-osmaps leaflet-bar leaflet-control');
        // this._container = L.DomUtil.create('div', '', this._containerAll);
        this._containerAll.title = "Display the coverage of all OS Explore/Landranger maps";
        L.DomEvent.disableClickPropagation(this._containerAll);
        this._appendButtons(this._containerAll);
        this.holder.style.display = "none";
        L.DomEvent.addListener(this._containerAll, 'mouseover', function () {
            self.holder.style.display = "";
        }, this);
        L.DomEvent.addListener(this._containerAll, 'mouseout', function () {
            self.holder.style.display = "none";
        }, this);
        L.DomEvent.addListener(this._containerAll, 'mouseover', function () {
            if (this.osMapLayer.getLayers().length > 0) {
                self.removeDiv.style.display = "";
            } else {
                self.removeDiv.style.display = "none";
            }
        }, this);
        this._readSettings();
        map.on('zoomend', function () {
            self.displayOSGrid();
        });
        map.on('moveend', function () {
            self.displayOSGrid();
        });
        this.displayOSGrid();
        return this._containerAll;
    },
    _appendButtons: function (container) {
        this.holder = L.DomUtil.create('div', 'leaflet-os-options', container);
        this.osGridMenuItem = L.DomUtil.create('div', 'osgrid', this.holder);
        this.osGridMenuItem.title = "Display Ordnance Survey grid over the map";
        this.osGridMenuItem.innerHTML = "OS Grid [OFF]";
        L.DomEvent.addListener(this.osGridMenuItem, 'click', this._osgrid, this);
        var element = L.DomUtil.create('div', 'explorer', this.holder);
        element.title = "Display coverage of all Explorer maps";
        element.innerHTML = "Explorer 25K";
        L.DomEvent.addListener(element, 'click', this._disp25K, this);
        var element = L.DomUtil.create('div', 'landranger', this.holder);
        element.title = "Display coverage of all Landranger maps";
        element.innerHTML = "Landranger 50K";
        L.DomEvent.addListener(element, 'click', this._disp50K, this);
        this.removeDiv = L.DomUtil.create('div', 'remove', this.holder);
        this.removeDiv.title = "Remove coverage of maps";
        this.removeDiv.innerHTML = "Clear maps";
        L.DomEvent.addListener(this.removeDiv, 'click', this._clear, this);
        this.disclaimDiv = L.DomUtil.create('div', 'disclaim', this.holder);
        this.disclaimDiv.title = "Disclaimer about OS Map coverage";
        this.disclaimDiv.innerHTML = "Map disclaimer";
        L.DomEvent.addListener(this.disclaimDiv, 'click', this._disclaim, this);
    },
    onRemove: function (map) {

    },
    _disp25K: function () {
        this.saveBounds = this._map.getBounds();
        this.osMapLayer.clearLayers();
        this.displayOSMapOutlines('25K');
    },
    _disp50K: function () {
        this.saveBounds = this._map.getBounds();
        this.osMapLayer.clearLayers();
        this.displayOSMapOutlines('50K');
    },
    _clear: function () {
        this.osMapLayer.clearLayers();
        this._map.fitBounds(this.saveBounds);
    },
    _osgrid: function () {
        this._displayOSGrid = !this._displayOSGrid;
        if (this._displayOSGrid) {
            this.osGridMenuItem.innerHTML = "OS Grid [ON]";
        } else {
            this.osGridMenuItem.innerHTML = "OS Grid [OFF]";
        }
        this.displayOSGrid();
    },
    _disclaim: function () {
        var container = document.createElement('div');
        var title = document.createElement('h4');
        title.textContent = 'Ordnance Survey Landranger and Explorer Maps';
        container.appendChild(title);
        var comment = document.createElement('div');
        comment.innerHTML = 'Please note that our information showing the area covered be OS maps is unofficial and may be incorrect.<br/>Please check before buying a map.';
        comment.innerHTML += '<br/>If you notice any errors then do contact us via the help option.';
        container.appendChild(comment);
        ra.modals.createModal(container, false, true);
    },
    displayOSGrid: function () {
        this.OSGrid.layer.clearLayers();
        if (!this._displayOSGrid) {
            return;
        }
        var gs = 100000;
        var zoom = this._map.getZoom();
        if (zoom > 10) {
            gs = 10000;
        }
        if (zoom > 12.5) {
            gs = 1000;
        }
        var bounds = this._map.getBounds();
        var pNE = new LatLon(bounds._northEast.lat, bounds._northEast.lng);
        var pSW = new LatLon(bounds._southWest.lat, bounds._southWest.lng);
        var ne = OsGridRef.latLonToOsGrid(pNE);
        var sw = OsGridRef.latLonToOsGrid(pSW);
        var grne = ne.toString(6);
        var grsw = sw.toString(6);
        if (grne === "" & grne === "") {
            gs = 100000;
        }
        ne.easting = Math.floor(ne.easting / gs + 2) * gs;
        ne.northing = Math.floor(ne.northing / gs + 2) * gs;
        sw.easting = Math.floor(sw.easting / gs) * gs;
        sw.northing = Math.floor(sw.northing / gs) * gs;
        if (grsw === "") {
            sw.easting = 0;
            sw.northing = 0;
        }
        if (grne === "") {
            ne.easting = 700000;
            ne.northing = 1400000;
        }

        if (gs === 100000) {
            sw.easting = 0;
            sw.northing = 0;
            ne.easting = 700000;
            ne.northing = 1400000;
        }
        this.drawOSMapGrid(ne, sw, gs, this.OSGrid.layer);
    },
    displayOSMapOutlines: function (type) {
        // type should be '25K' or '50K'
        var self = this;
        var url = "https://osmaps.theramblers.org.uk/index.php?mapscale=" + type;
        ra.ajax.getJSON(url, function (err, items) {
            if (err !== null) {
                var msg = "Error: Something went wrong: " + err;
            } else {
                if (items.length !== 0) {
                    for (i = 0; i < items.length; i++) {
                        var item = items[i];
                        ra.map.os.display(item, self.osMapLayer);
                    }
                }
                self._map.fitBounds(self.osMapLayer.getBounds());
            }
        });
    },
    drawOSMapGrid: function (ne, sw, gs, layer) {
        var style;
        var color = this._userOptions.osgridline.color;
        var weight = this._userOptions.osgridline.weight;
        var opacity = this._userOptions.osgridline.opacity;
        style = {color: color, weight: weight, opacity: opacity, ignore: true};
        var lines;
        for (east = sw.easting; east < ne.easting + 1000; east += gs) {
            lines = new Array();
            i = 0;
            for (north = sw.northing; north < ne.northing; north += gs) {
                var gr = new OsGridRef(east, north);
                var latlong = OsGridRef.osGridToLatLon(gr);
                lines[i] = new L.latLng(latlong.lat, latlong.lon);
                i++;
            }
            layer.addLayer(L.polyline(lines, style));
        }
        for (var north = sw.northing; north < ne.northing; north += gs) {
            lines = new Array();
            i = 0;
            for (var east = sw.easting; east < ne.easting + 1000; east += gs / 3) {
                gr = new OsGridRef(east, north);
                latlong = OsGridRef.osGridToLatLon(gr);
                lines[i] = new L.latLng(latlong.lat, latlong.lon);
                i++;
            }
            layer.addLayer(L.polyline(lines, style));
        }
    },
    settingsForm: function (tag) {
        try {
            var _this = this;
            var title = document.createElement('h3');
            title.textContent = 'Ordnance Survey Grid';
            tag.appendChild(title);
            var comment = document.createElement('div');
            comment.innerHTML = 'You can change the style of how the OS Grid is displayed';
            tag.appendChild(comment);
            var line = ra.html.input.lineStyle(tag, '', 'OS Grid line style', this._userOptions.osgridline);
            line.addEventListener("ra-input-change", function (e) {
                ra.settings.changed();
                _this.displayOSGrid();
            });
        } catch (err) {
            ra.showError(err.message);
        }
    },
    resetSettings: function () {
        ra.html.input.lineStyleReset(this._userOptions.osgridline, {
            color: '#0080C0',
            weight: 2,
            opacity: 0.5});
    },
    _readSettings: function () {
        ra.settings.read('__osmapinfo', this._userOptions);
    },
    saveSettings: function (save) {
        ra.settings.save(save, '__osmapinfo', this._userOptions);
    }
});
L.control.osinfo = function (options) {
    return new L.Control.OSInfo(options);
};
L.Control.RightclickMarker = function (latlng, layer, actiontag) {
    this.p = new LatLon(latlng.lat, latlng.lng);
    this.actiontag = actiontag;
    this._layer = layer;
    layer.clearLayers();
    var icon = L.icon({
        iconUrl: ra.baseDirectory() + 'media/lib_ramblers/leaflet/images/mouseloc.png',
        iconSize: [18, 18], // size of the icon
        iconAnchor: [9, 9], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -9] // point from which the popup should open relative to the iconAnchor
    });
    this._marker = L.marker(this.p, {icon: icon}).bindPopup("Processing...");
    this._layer.addLayer(this._marker);
    this._marker.openPopup();
    setTimeout(function (marker) {
        marker.closePopup();
    }, 10000, this._marker);

    this.setContent = function (contentTag) {
        var tags = [
            {name: 'content', parent: 'root', tag: 'div'},
            {name: 'options', parent: 'root', tag: 'div'}
        ];
        var popup = document.createElement('div');
        var elements = ra.html.generateTags(popup, tags);
        if (typeof contentTag === 'string') {
            elements.content.innerHTML = contentTag;
        } else {
            elements.content.appendChild(contentTag);
        }
        this._marker.getPopup().setContent(popup);
        this._addOptionsLink(elements.options);
    };
    this._addOptionsLink = function (tag) {
        if (this.actiontag === null) {
            return;
        }
        var _this = this;
        var div = document.createElement('div');
        div.classList.add("ra-mouse-option");
        tag.appendChild(div);
        var opt = document.createElement('a');
        var img = document.createElement("img");
        img.setAttribute('src', ra.baseDirectory() + 'media/lib_ramblers/leaflet/images/mouse-right-click-icon.png');
        img.setAttribute('height', '18px');
        img.setAttribute('width', '18px');
        img.classList.add('rotateimg90');
        opt.appendChild(img);
        var link = document.createTextNode("Right click options ");
        opt.appendChild(link);
        opt.title = "Change the way Mouse Right Click works";
        opt.classList.add("pointer");
        opt.addEventListener("click", function (e) {
            _this.actiontag.click();
        });
        div.appendChild(opt);
    };


};
L.Control.Rightclick = L.Control.extend({
    options: {
        position: 'bottomleft',
        separator: ', '
    },
    displaymap: null,
    _places: null,
    apiUrl2: "http://overpass-api.de/api/interpreter?data=",
    apiUrl: "https://overpass.kumi.systems/api/interpreter?data=",
    _placesEnabled: true,
    _userOptions: {
        postcodes: {
            number: 20,
            distance: 10
        },
        groups: {
            number: 60,
            distance: 25
        },
        starting: {
            number: 300,
            distance: 10
        },
        osm: {
            distance: 2
        }
    },
    controls: {
        postcodes: {
            number: null,
            distance: null
        },
        groups: {
            number: null,
            distance: null
        },
        starting: {
            number: null,
            distance: null
        },
        osm: {
            distance: null
        }
    },
    rightClickOptions: [
        {group: 'General Information',
            items: {
                details: 'Display map co-ordinates',
                postcode: 'Display Postcodes',
                osmaps: 'Ordnance Survey Maps'}},
        {group: "Ramblers Information",
            items: {groups: 'Display Ramblers Groups',
                starting: 'Display Starting Places'}},
        {group: 'Open Street Map information',
            items: {
                parking: 'Display Parking',
                bus_stops: 'Display Bus Stops',
                cafes: 'Display Cafes',
                pubs: 'Display Public Houses',
                toilets: 'Display Toilets'}}],
    //   alltags: 'What\'s here?'}}],
    rightClickOption: "details",
    onAdd: function (map) {
        this._map = map;
        this._readSettings();
        this._mouseLayer = L.featureGroup([]);
        this._mouseLayer.addTo(this._map);
        this._places = new L.Control.Places({cluster: false});
        this._places.addTo(map);
        this._map.on('contextmenu', this._onRightClick, this);
        this.enabled = true;
        this._containerAll = L.DomUtil.create('div', 'leaflet-control-rightclick leaflet-bar leaflet-control');
        this._containerAll.title = "Mouse right click/ Tap & hold setting";
        this._appendButtons(this._containerAll);
        var osmOptions = [];
        osmOptions["cafes"] = {tag: "amenity", type: "cafe", title: "Cafes", single: "Cafe"};
        osmOptions["parking"] = {tag: "amenity", type: "parking", title: "Car Parks", single: "Car Park"};
        osmOptions["pubs"] = {tag: "amenity", type: "pub", title: "Pubs", single: "Pub"};
        osmOptions["toilets"] = {tag: "amenity", type: "toilets", title: "Toilets", single: "Toilets"};
        osmOptions["bus_stops"] = {tag: "highway", type: "bus_stop", title: "Bus Stops", single: "Bus Stop"};
        osmOptions["alltags"] = {tag: "", type: "", title: "What's there", single: "What's here?"};
        this.osmOptions = osmOptions;
        L.DomEvent.disableClickPropagation(this._containerAll);
        return this._containerAll;
    },
    noLayers: function () {
        var no = 0;
        no += this._mouseLayer.getLayers().length;
        no += this._places.noLayers();
        return no;
    },
    onRemove: function () {
        this._map.off('contextmenu', this._onRightClick);
    },
    _appendButtons: function (container) {
        var holder = L.DomUtil.create('div', 'leaflet-control-rightclick-container', container);
        holder.style.display = "none";
        L.DomEvent.disableClickPropagation(holder);
        var _this = this;
        L.DomEvent.addListener(container, 'click', function (event) {
            holder.style.display = "";
            var tag = document.createElement('div');
            _this.optionsForm(tag);
            ra.modals.createModal(tag, false, true);
            event.stopPropagation();
        }, this);
        this.closeHolder = false;
        holder.addEventListener("click", function (ev) {
            ev.stopPropagation();
        });
    },
    Enabled: function (status) {
        this.enabled = status === true;
    },
    disablePlaces: function () {
        this._placesEnabled = false;
    },
    mapControl: function (value) {
        this._mapControl = value;
    },
    userOptions: function () {
        return this._userOptions;
    },
    _onRightClick: function (e) {
        this._mouseLayer.clearLayers();
        this._places.clearLayers();
        var option = this.rightClickOption;
        if (this.enabled) {
            switch (option) {
                case "details":
                    this._displayDetails(e);
                    break;
                case "postcode":
                    this._displayPostcodes(e);
                    break;
                case "osmaps":
                    this._displayOsMaps(e);
                    break;
                case "starting":
                    if (!this._placesEnabled) {
                        ra.showMsg('The current map is already displaying all meeting and starting places and hence this option is currently disabled');
                        break;
                    }
                    var options = {
                        location: e.latlng,
                        distance: this._userOptions.starting.distance,
                        limit: this._userOptions.starting.number,
                        mouseOptions: this._containerAll};
                    this._places.displayPlaces(options);
                    break;
                case "groups":
                    this._displayGroups(e);
                    break;
                case "cafes":
                    this._displayOSM(e, "cafes");
                    break;
                case "parking":
                    this._displayOSM(e, "parking");
                    break;
                case "pubs":
                    this._displayOSM(e, "pubs");
                    break;
                case "toilets":
                    this._displayOSM(e, "toilets");
                    break;
                case "bus_stops":
                    this._displayOSM(e, "bus_stops");
                    break;
                case "alltags":
                    this._displayOSM(e, "alltags");
                    //   this._displayAllTags(e);
                    break;
            }
        }
    },
    rightClickDisplayPlaces: function (options) {
        this._places.displayPlaces(options);
    },
    rightClickClearPlaces: function () {
        this._places.clearLayers();
    },
    _displayDetails: function (e) {
        var desc, links = '', gr, gr10, grid;
        var p = new LatLon(e.latlng.lat, e.latlng.lng);
        grid = OsGridRef.latLonToOsGrid(p);
        gr = grid.toString(6);
        gr10 = grid.toString(8);
        desc = "<b>Latitude: </b>" + e.latlng.lat.toFixed(5) + " ,  <b>Longitude: </b>" + e.latlng.lng.toFixed(5);
        if (gr !== "") {
            desc += "<br/><b>Grid Reference: </b>" + gr +
                    "<br/><b>Grid Reference: </b>" + gr10 + " (8 Figure)";
            links += '<a href="javascript:ra.link.photos(\'' + gr10 + '\')">[Photos]</a>';
            links += '<a href="javascript:ra.link.streetmap(' + e.latlng.lat.toFixed(7) + ',' + e.latlng.lng.toFixed(7) + ')">[OS Map]</a>';
        } else {
            desc += "<br/>Outside OS Grid";
        }
        links += '<a href="javascript:ra.link.googlemap(' + e.latlng.lat.toFixed(7) + ',' + e.latlng.lng.toFixed(7) + ')">[Google Map]</a>';
        links += '<a href="javascript:ra.loc.directions(' + e.latlng.lat.toFixed(7) + ',' + e.latlng.lng.toFixed(7) + ')">[Directions]</a>';
        var marker = new L.Control.RightclickMarker(e.latlng, this._mouseLayer, this._containerAll);

        var tags = [
            {parent: 'root', tag: 'div', 'innerHTML': desc},
            {name: 'w3w', parent: 'root', tag: 'div'},
            {parent: 'root', tag: 'div', 'innerHTML': links},
            {name: 'options', parent: 'root', tag: 'div'}
        ];
        var pop = document.createElement('div');
        //   ele.innerHTML = desc;
        var elements = ra.html.generateTags(pop, tags);
        marker.setContent(pop);
        ra.w3w.get(e.latlng.lat, e.latlng.lng, elements.w3w, false);
    },
    _displayPostcodes: function (e) {
        var p = new LatLon(e.latlng.lat, e.latlng.lng);
        var grid = OsGridRef.latLonToOsGrid(p);
        var gr = grid.toString(6);
        var i;
        var marker;
        var desc = " ";
        var self = this;
        var marker = new L.Control.RightclickMarker(e.latlng, this._mouseLayer, this._containerAll);
        if (gr !== "") {
            marker.setContent("<b>Searching for postcodes ...</b>");

            // get postcodes around this point       
            var east = Math.round(grid.easting);
            var north = Math.round(grid.northing);
            var options = "&dist=" + this._userOptions.postcodes.distance + "&maxpoints=" + this._userOptions.postcodes.number;
            var url = "https://postcodes.theramblers.org.uk/index.php?easting=" + east + "&northing=" + north + options;
            ra.ajax.getJSON(url, function (err, items) {
                if (err !== null) {
                    var msg = "Error: Something went wrong: " + err;
                    marker.setContent(msg);
                } else {
                    if (items.length === 0) {
                        var closest = "No postcodes found within " + self._userOptions.postcodes.distance + "km";
                        marker.setContent(closest);
                    } else {
                        for (i = 0; i < items.length; i++) {
                            var item = items[i];
                            var easting = item.Easting;
                            var northing = item.Northing;
                            var gr = new OsGridRef(easting, northing);
                            var latlong = OsGridRef.osGridToLatLon(gr);
                            var pt = new L.latLng(latlong.lat, latlong.lon);
                            var location = ra.geom.position(p.lat, p.lon, pt.lat, pt.lng);
                            var popup = item.Postcode + "<br />     Location " + self._kFormatter(Math.round(location.distance * 1000)) + "m " + location.direction.name + " from marker";
                            var style;
                            if (i === 0) {
                                pcmarker = L.marker(pt, {icon: ra.map.icon.postcodeClosest()}).bindPopup(popup);
                                style = {color: 'green', weight: 3, opacity: 0.2};
                            } else {
                                pcmarker = L.marker(pt, {icon: ra.map.icon.postcode()}).bindPopup(popup);
                                style = {color: 'blue', weight: 3, opacity: 0.2};
                            }

                            self._mouseLayer.addLayer(pcmarker);
                            self._mouseLayer.addLayer(L.polyline([pt, p], style));
                        }
                        marker.setContent("<b>" + items.length + " Postcodes found within " + self._userOptions.postcodes.distance + "km</b>");
                        var bounds = self._mouseLayer.getBounds();
                        self._map.fitBounds(bounds, {padding: [50, 50]});
                    }
                }
                setTimeout(function (point) {
                    point.closePopup();
                }, 3000, point);
            });
        } else {
            desc += "<br/>Outside OS Grid";
            point.getPopup().setContent(desc);
            point.openPopup();
        }

    },

    _kFormatter: function (num) {
        return num > 999 ? (num / 1000).toFixed(1) + 'K' : num;
    },
    _displayOsMaps: function (e) {
        var p = new LatLon(e.latlng.lat, e.latlng.lng);
        var grid = OsGridRef.latLonToOsGrid(p);
        var gr = grid.toString(6);
        var self = this;
        var marker = new L.Control.RightclickMarker(e.latlng, this._mouseLayer, this._containerAll);

        if (gr !== "") {
            marker.setContent("<b>Searching for Ordnance Survey maps ...</b>");
            //  point.openPopup();
            var east = Math.round(grid.easting);
            var north = Math.round(grid.northing);
            var url = "https://osmaps.theramblers.org.uk/index.php?easting=" + east + "&northing=" + north;
            ra.ajax.getJSON(url, function (err, items) {
                if (err !== null) {
                    marker.setContent("Error: Something went wrong: " + err);
                } else {
                    marker.setContent("No Ordnance Survey Maps found for this location");
                    if (items.length !== 0) {
                        content = "<b>" + items.length + " Ordnance Survey maps found</b>";
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            content += "<h4>" + item.type + " " + item.number + "</h4>";
                            content += "<p>" + item.title + "</p>";
                            ra.map.os.display(item, self._mouseLayer);
                        }
                    }

                    marker.setContent(content);
                    var bounds = self._mouseLayer.getBounds();
                    self._map.fitBounds(bounds, {padding: [50, 50]});
                }
            });
        } else {
            marker.setContent("<br/>Outside OS Grid");
        }

    },
    _displayGroups: function (e) {
        var self = this;
        var marker = new L.Control.RightclickMarker(e.latlng, this._mouseLayer, this._containerAll);
        marker.setContent("<b>Searching for Ramblers Groups ...</b>");
        var $latitude = e.latlng.lat;
        var $longitude = e.latlng.lng;
        var options = "&dist=" + this._userOptions.groups.distance + "&maxpoints=" + this._userOptions.groups.number + "&v=2";
        var url = "https://groups.theramblers.org.uk/index.php?latitude=" + $latitude + "&longitude=" + $longitude + options;
        ra.ajax.getJSON(url, function (err, items) {
            if (err !== null) {
                marker.setContent("Error: Something went wrong: " + err);
            } else {
                var length = Object.keys(items).length;
                if (length === 0) {
                    var closest = "No Ramblers Groups found within " + self._userOptions.groups.distance + "km";
                    marker.setContent(closest);
                } else {
                    marker.setContent("<b>" + length + " Ramblers Groups found within " + self._userOptions.groups.distance + "km</b>");
                    //   point.openPopup();
                    for (var propt in items) {
                        var item = items[propt];
                        var type = "";
                        var popup = "<b>";
                        switch (item.scope) {
                            case "A":
                                popup += "Area: ";
                                type = "Area";
                                break;
                            case "G":
                                popup += "Group: ";
                                type = "Group";
                                break;
                        }
                        popup += item.name + "</b><br/>" + item.description;
                        popup += "<br/>" + type + " information on <a href='" + item.url + "' target='_blank'>Ramblers.org.uk</a>";
                        popup += "<br/>" + type + " site: <a href='http://" + item.website + "' target='_blank' >" + item.groupUrl + "</a>";
                        if (item.scope !== "A") {
                            popup += "<br/>Part of " + item.areaName;
                        }
                        var $iclass = "group-icon " + item.scope.toLowerCase();
                        var pt = new L.latLng(item.latitude, item.longitude);
                        var title = item.name;
                        var icon = L.divIcon({className: $iclass, iconSize: null, html: title});
                        var gmarker = L.marker(pt, {icon: icon}).bindPopup(popup);
                        self._mouseLayer.addLayer(gmarker);
                    }
                    var bounds = self._mouseLayer.getBounds();
                    self._map.fitBounds(bounds, {padding: [50, 50]});
                }
            }
        });
    },
    _displayOSM: function (e, option) {
        var self = this;
        var osmOption = this.osmOptions[option];
        var myicon = this.nodeIcon(option);
        var tag = osmOption.tag;
        var type = osmOption.type;
        var title = osmOption.title;
        var single = osmOption.single;
        var marker = new L.Control.RightclickMarker(e.latlng, this._mouseLayer, this._containerAll);
        marker.setContent("<b>Searching for " + type + " ...</b>");
        this._latlng = e.latlng;
        var queryTemplate = '[out:json]; (node["{tag}"="{type}"](around:{radius},{lat},{lng});way["{tag}"="{type}"](around:{radius},{lat},{lng});relation["{tag}"="{type}"](around:{radius},{lat},{lng}););out center;';
        var query = this.getQuery(queryTemplate, tag, type);
        //console.log("Query: " + query);
        var url = this.getUrl(query);
        //console.log("Query: " + url);
        ra.ajax.getJSON(url, function (err, items) {
            if (err !== null) {
                var msg = "Error: Something went wrong: " + err;
                marker.setContent(msg);
            } else {
                if (items.elements.length === 0) {
                    var closest = "No " + title + " found within " + self._userOptions.osm.distance + "km";
                    marker.setContent(closest);
                } else {
                    msg = "<b>" + items.elements.length + " " + title + " found within " + self._userOptions.osm.distance + "km</b>";
                    msg += "<p>" + items.osm3s.copyright + "</p>";
                    marker.setContent(msg);
                    //  point.openPopup();
                    for (var i = 0; i < items.elements.length; i++) {
                        var item = items.elements[i];
                        self.displayElement(item, single, myicon);
                    }
                    var bounds = self._mouseLayer.getBounds();
                    self._map.fitBounds(bounds, {padding: [50, 50]});
                }
            }

        });
    },
    _displayAllTags: function (e) {
        // ('This option not available yet');
        //  return;
        var self = this;
        var title = "All items";
        var single = "Item";
        var type = "Items";
        var p = new LatLon(e.latlng.lat, e.latlng.lng);
        var i;
        var msg = "<b>Searching for " + type + " ...</b>";
        var point = L.marker(p).bindPopup(msg);
        this._mouseLayer.clearLayers();
        this._mouseLayer.addLayer(point);
        //  point.getPopup().setContent(msg);
        point.openPopup();
        this._latlng = e.latlng;
        // var queryTemplate = '[out:json]; (node({{bbox}});way({{bbox}});relation({{bbox}});';
        var queryTemplate = '[out:json];(way(around:200,52.71017,-1.3480224););out body;';
        //   node({{bbox}})(if:count_tags() > 0);
        //  var query = this.getQuery(queryTemplate, null, null);


        var queryTemplate = '(node({{bbox}});<;);out meta;';
        var kwargs = {bbox: this.getBox()};
        var query = L.Util.template(queryTemplate, kwargs);
        //console.log("Query: " + query);
        var url = this.getUrl(query);
        //console.log("Query: " + url);
        ra.ajax.getJSON(url, function (err, items) {
            if (err !== null) {
                var msg = "Error: Something went wrong: " + err;
                point.getPopup().setContent(msg);
            } else {
                if (items.elements.length === 0) {
                    var closest = "No " + title + " found within " + self._userOptions.osm.distance + "km";
                    point.getPopup().setContent(closest);
                } else {
                    msg = "<b>" + items.elements.length + " " + title + " found within " + self._userOptions.osm.distance + "km</b>";
                    msg += "<p>" + items.osm3s.copyright + "</p>";
                    point.getPopup().setContent(msg);
                    point.openPopup();
                    for (i = 0; i < items.elements.length; i++) {
                        var item = items.elements[i];
                        self.displayElement(item, single, "");
                    }
                    var bounds = self._mouseLayer.getBounds();
                    self._map.fitBounds(bounds, {padding: [50, 50]});
                }
            }
            setTimeout(function (point) {
                self._map.removeLayer(point);
            }, 6000, point);
        });
    },
    displayElement: function (node, title, myicon) {
        switch (node.type) {
            case "node":
                this.displayNode(node, title, myicon);
                break;
            case "way":
                this.displayWay(node, title, myicon);
                break;
            case "relation":

                break;
        }
    },
    displayNode: function (node, title, myicon) {
        var tags = node.tags;
        var popup = "<b>" + title + "</b><br/>";
        if (typeof tags.name !== 'undefined') {
            popup = "<h4>" + tags.name + "</h4>";
        }
        this.deleteTags(node.tags, ['name', 'amenity', 'fhrs:id', 'source']);
        popup += this.listTags(tags, null);
        var pt = new L.latLng(node.lat, node.lon);

        var marker = L.marker(pt, {icon: myicon}).bindPopup(popup);
        this._mouseLayer.addLayer(marker);
    },
    nodeIcon: function (type) {
        var icon = L.icon({
            iconUrl: ra.baseDirectory() + 'media/lib_ramblers/leaflet/images/redmarker.png',
            iconSize: [22, 22],
            iconAnchor: [11, 1],
            popupAnchor: [0, -1]
        });
        switch (type) {
            case "parking":
                icon.options.iconUrl = ra.baseDirectory() + 'media/lib_ramblers/leaflet/images/parking.svg';
                break;
            case "cafes":
                icon.options.iconUrl = ra.baseDirectory() + 'media/lib_ramblers/leaflet/images/cafe.svg';
                break;
            case "pubs":
                icon.options.iconUrl = ra.baseDirectory() + 'media/lib_ramblers/leaflet/images/pub.svg';
                break;
            case "toilets":
                icon.options.iconUrl = ra.baseDirectory() + 'media/lib_ramblers/leaflet/images/toilets.svg';
                break;
            case "bus_stops":
                icon.options.iconUrl = ra.baseDirectory() + 'media/lib_ramblers/leaflet/images/bus_stop.svg';
                break;
            default:

        }

        return icon;
    },

    displayWay: function (node, title, myicon) {
        var tags = node.tags;
        var popup = "<b>" + title + "</b>";
        if (typeof tags.name !== 'undefined') {
            popup = "<h3>" + tags.name + "</h3>";
        }
        this.deleteTags(node.tags, ['name', 'amenity', 'fhrs:id', 'source']);
        popup += this.listTags(tags);

        var pt = new L.latLng(node.center.lat, node.center.lon);
        var marker = L.marker(pt, {icon: myicon}).bindPopup(popup);
        this._mouseLayer.addLayer(marker);
    },
    deleteTags: function (tags, excludeProperties) {
        var property;
        for (var i in excludeProperties) {
            property = excludeProperties[i];
            if (tags.hasOwnProperty(property))
            {
                delete tags[property];
            }
        }
    },
    listTags: function (tags) {
        var out = "<ul>";
        out += this.getAddr(tags);
        for (var property in tags) {
            if (tags.hasOwnProperty(property))
            {
                var value = tags[property];
                out += "<li>" + this.displayProperty(property) + ": " + this.displayPropertyValue(value) + "</li>";
            }
        }
        out += "</ul>";
        return out;
    },
    displayProperty: function (prop) {
        prop = prop.replace(/:/g, " ");
        prop = prop.replace(/_/g, " ");
        return ra.titleCase(prop);
    },
    displayPropertyValue: function (value) {
        var link = false;
        if (value.toLowerCase().startsWith("http:")) {
            link = true;
        }
        if (value.toLowerCase().startsWith("https:")) {
            link = true;
        }
        if (link) {
            return "<a href=" + value + " target='_blank'>" + value + "</a>";
        }
        value = value.replace(/_/g, " ");
        return value;
    },
    getAddr: function (tags) {
        var out = "";
        out += this.getProperty(tags, "addr:housenumber");
        out += this.getProperty(tags, "addr:housename");
        out += this.getProperty(tags, "addr:street");
        out += this.getProperty(tags, "addr:place");
        out += this.getProperty(tags, "addr:village");
        out += this.getProperty(tags, "addr:suburb");
        out += this.getProperty(tags, "addr:district");
        out += this.getProperty(tags, "addr:subdistrict");
        out += this.getProperty(tags, "addr:city");
        out += this.getProperty(tags, "addr:country");
        out += this.getProperty(tags, "addr:postcode");
        if (out === "") {
            return "";
        }
        return "<li>" + out + "</li>";
    },
    getProperty: function (tags, property) {
        var out = "";
        if (tags.hasOwnProperty(property)) {
            out = " " + tags[property];
            delete tags[property];
        }
        return out;
    },
    getUrl: function (query) {
        return this.apiUrl + encodeURIComponent(query);
    },
    getQuery: function (queryTemplate, tag, type) {
        var lat = this._latlng.lat;
        var lng = this._latlng.lng;
        var kwargs = {tag: tag, type: type, lat: lat, lng: lng, radius: this.getRadius(), bbox: this.getBox()};
        return L.Util.template(queryTemplate, kwargs);
    },
    getBox: function () {
        var bounds = this._map.getBounds();
        return bounds.getSouth().toPrecision(8) + "," + bounds.getWest().toPrecision(8) + "," + bounds.getNorth().toPrecision(8) + "," + bounds.getEast().toPrecision(8);
    },
    getRadius: function () {
        return this._userOptions.osm.distance * 1000;
    },
    optionsForm: function (tag) {
        var title2 = document.createElement('h3');
        title2.textContent = 'Mouse right click/tap hold';
        tag.appendChild(title2);
        var title3 = document.createElement('h2');
        title3.textContent = 'Select which information should be displayed';
        tag.appendChild(title3);
        var so = document.createElement('select');
        so.setAttribute('class', 'ra-mouse-options');
        // so.setAttribute('size', '13');
        so.title = "Select which information is displayed";
        this.rightClickOptions.forEach((group) => {
            var gr = document.createElement("optgroup");
            gr.label = group.group;
            for (var prop in group.items) {
                var option = document.createElement("option");
                option.value = prop;
                option.text = group.items[prop];
                gr.appendChild(option);
            }
            so.appendChild(gr);
        });
        so.value = this.rightClickOption;
        tag.appendChild(so);
        var _this = this;
        so.addEventListener("change", function (e) {
            _this.rightClickOption = so.value;
        });
        tag.appendChild(document.createElement('hr'));
        var clearDiv = document.createElement("button");
        clearDiv.innerHTML = "Clear displayed item(s)";
        clearDiv.setAttribute('class', 'rightClick clearItems');
        clearDiv.title = "Clear information currently displayed by mouse right click";
        if (this.noLayers() > 0) {
            clearDiv.classList.add("active");
        }
        var self = this;
        clearDiv.addEventListener('click', function () {
            self._mouseLayer.clearLayers();
            self._places.clearLayers();
            clearDiv.classList.remove('active');
        });
        tag.appendChild(clearDiv);
    },
    settingsForm: function (tag) {
        var comment;
        var title = document.createElement('h3');
        title.textContent = 'Mouse right click/tap and hold';
        tag.appendChild(title);
        comment = document.createElement('p');
        comment.innerHTML = 'This option is used to view location information. ';
        comment.innerHTML += "It can display postcodes, Ramblers' Areas and Groups, meeting/starting places and information from <a href='https://www.openstreetmap.org/about' target='_blank'>Open Street Map</a> ";
        tag.appendChild(comment);
        comment = document.createElement('p');
        comment.innerHTML += "<b>The settings below control how much information is displayed.</b>";
        tag.appendChild(comment);
        tag.appendChild(document.createElement('hr'));
        var hdg2 = document.createElement('h5');
        hdg2.textContent = 'Ramblers Area / Group Options';
        tag.appendChild(hdg2);
        comment = document.createElement('p');
        comment.setAttribute('class', 'smaller');
        comment.textContent = 'Find a Ramblers walking group in your area';
        tag.appendChild(comment);
        this.controls.groups.distance = ra.html.input.number(tag, '', 'Display groups/area within %n km', this._userOptions.groups, 'distance', 0.5, 500, 0.5);
        this.controls.groups.number = ra.html.input.number(tag, '', 'Display nearest %n groups/area.', this._userOptions.groups, 'number', 1, 500, 1);
        tag.appendChild(document.createElement('hr'));
        var hdg1 = document.createElement('h5');
        hdg1.textContent = 'Postcode Options';
        tag.appendChild(hdg1);
        comment = document.createElement('p');
        comment.setAttribute('class', 'smaller');
        comment.textContent = 'Useful for finding correct postcode for your satnav';
        tag.appendChild(comment);
        this.controls.postcodes.distance = ra.html.input.number(tag, '', 'Display postcodes within %n km', this._userOptions.postcodes, 'distance', 0.5, 20, 0.5);
        this.controls.postcodes.number = ra.html.input.number(tag, '', 'Display nearest %n postcodes', this._userOptions.postcodes, 'number', 1, 50, 1);
        tag.appendChild(document.createElement('hr'));
        var hdg3 = document.createElement('h5');
        hdg3.textContent = 'Meeting/Starting Locations Options';
        tag.appendChild(hdg3);
        comment = document.createElement('p');
        comment.setAttribute('class', 'smaller');
        comment.textContent = 'Find locations Ramblers Groups have used to meet or start a walk';
        tag.appendChild(comment);
        this.controls.starting.distance = ra.html.input.number(tag, '', 'Display locations within %n km', this._userOptions.starting, 'distance', 0.5, 20, 0.5);
        this.controls.starting.number = ra.html.input.number(tag, '', 'Display nearest %n locations', this._userOptions.starting, 'number', 5, 500, 5);
        tag.appendChild(document.createElement('hr'));
        var hdg4 = document.createElement('h5');
        hdg4.textContent = 'Open Street Map Options';
        tag.appendChild(hdg4);
        comment = document.createElement('p');
        comment.setAttribute('class', 'smaller');
        comment.textContent = 'This option affects the display of parking, bus stops, cafes, public houses and toilets.';
        tag.appendChild(comment);
        this.controls.osm.distance = ra.html.input.number(tag, '', 'Display items within %n km', this._userOptions.osm, 'distance', 0.5, 5, 0.5);
        this.controls.groups.distance.addEventListener("ra-input-change", function (e) {
            ra.settings.changed();
        });
        this.controls.groups.number.addEventListener("ra-input-change", function (e) {
            ra.settings.changed();
        });
        this.controls.postcodes.distance.addEventListener("ra-input-change", function (e) {
            ra.settings.changed();
        });
        this.controls.postcodes.number.addEventListener("ra-input-change", function (e) {
            ra.settings.changed();
        });
        this.controls.starting.distance.addEventListener("ra-input-change", function (e) {
            ra.settings.changed();
        });
        this.controls.starting.number.addEventListener("ra-input-change", function (e) {
            ra.settings.changed();
        });
        this.controls.osm.distance.addEventListener("ra-input-change", function (e) {
            ra.settings.changed();
        });
    },
    resetSettings: function () {
        ra.html.input.numberReset(this.controls.groups.number, 60);
        ra.html.input.numberReset(this.controls.groups.distance, 25);
        ra.html.input.numberReset(this.controls.postcodes.number, 20);
        ra.html.input.numberReset(this.controls.postcodes.distance, 10);
        ra.html.input.numberReset(this.controls.starting.number, 300);
        ra.html.input.numberReset(this.controls.starting.distance, 10);
        ra.html.input.numberReset(this.controls.osm.distance, 2);
    },
    _readSettings: function () {
        ra.settings.read('__rightclick', this._userOptions);
    },
    saveSettings: function (save) {
        ra.settings.save(save, '__rightclick', this._userOptions);
    }
});

L.control.rightclick = function (options) {
    return new L.Control.Rightclick(options);
};