var L, ra, OsGridRef;
L.Control.Mouse = L.Control.extend({
    options: {
        position: 'bottomleft',
        separator: ', ',
        emptyString: 'Outside OS Grid',
        lngFirst: false,
        numDigits: 5
    },
    _userOptions: {
        displayMouseGridSquare: true
    },
    onAdd: function (map) {
        this._map = map;
        this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
        L.DomEvent.disableClickPropagation(this._container);
        map.on('mousemove', this._update, this);
        this._container.innerHTML = this.options.emptyString;
        this.gridsquare100 = L.rectangle([[84, -89], [84.00001, -89.000001]],
                {color: "#ff7800", weight: 1}).addTo(map);
        this.gridsquare10 = L.rectangle([[84, -89], [84.00001, -89.000001]],
                {color: "#884000", weight: 1}).addTo(map);
        return this._container;
    },
    onRemove: function (map) {
        map.off('mousemove', this._update);
    },
    userOptions: function () {
        return this._userOptions;
    },
    gridSquarePause: function () {
        this.SAVEdisplayMouseGridSquare = this._userOptions.displayMouseGridSquare;
        this._userOptions.displayMouseGridSquare = false;
    },
    gridSquareResume: function () {
        this._userOptions.displayMouseGridSquare = this.SAVEdisplayMouseGridSquares;
    },
    _update: function (e) {
        var text = this._getMouseMoveAction(this._map, e.latlng);
        this._container.innerHTML = text;
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
            [ll4.lat, ll4.lon],
            [ll1.lat, ll1.lon]];
        return bounds;
    },
    _getMouseMoveAction: function (map, latlng) {
        var gr, gridref;
        var zoom = map.getZoom();
        // console.log(zoom);
        var p = new LatLon(latlng.lat, latlng.lng);
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
            if (this._userOptions.displayMouseGridSquare) {
                if (zoom > 12) {
                    var bounds = this._osGridToLatLongSquare(grid, 100);
                    // change rectangle
                    this.gridsquare100.setLatLngs(bounds);
                }
                if (zoom > 16) {
                    var bounds2 = this._osGridToLatLongSquare(grid, 10);
                    // change rectangle
                    this.gridsquare10.setLatLngs(bounds2);
                } else {
                    this.gridsquare10.setLatLngs([[84, -89], [84.00001, -89.000001]]);
                }
            } else {
                this.gridsquare10.setLatLngs([[84, -89], [84.00001, -89.000001]]);
                this.gridsquare100.setLatLngs([[84, -89], [84.00001, -89.000001]]);
            }
        }
        var lng = latlng.lng.toFixed(5);
        var lat = latlng.lat.toFixed(5);
        var value = "Lat/long: " + lat + ", " + lng; //+" z"+ zoom;
        return  gridref + value;
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
L.Control.Rightclick = L.Control.extend({
    options: {
        position: 'bottomleft'
    },
    displaymap: null,
    apiUrl2: "http://overpass-api.de/api/interpreter?data=",
    apiUrl: "https://overpass.kumi.systems/api/interpreter?data=",
    _userOptions: {
        postcodes: {
            number: 20,
            distance: 10
        },
        groups: {
            number: 60,
            distance: 50
        },
        starting: {
            number: 300,
            distance: 10
        },
        osm: {
            distance: 2
        }
    },
    onAdd: function (map) {
        this._map = map;
        this._placeslayer = null;
        this._mouseLayer = L.featureGroup([]);
        this._mouseLayer.addTo(this._map);
        this.enabled = true;
        this._container = L.DomUtil.create('div', 'leaflet-control-postcodeposition');
        L.DomEvent.disableClickPropagation(this._container);
        this._map.on('zoomend', this._onZoomEnd, this);
        this._map.on('contextmenu', this._onRightClick, this);
        var options = ['<optgroup label="General Information">',
            '<option value="details">Right click/tap hold to see Location Details</option>',
            '<option value="postcode">Right click/tap hold to see nearby Postcodes</option>',
            '<option value="osmaps">Right click/tap hold to see relevant OS Maps</option>',
            '</optgroup>',
            '<optgroup label="Ramblers Information">',
            '<option value="groups">Right click/tap hold to see nearby Ramblers Groups</option>',
            '<option value="starting">Right click/tap hold to see nearby Starting Places</option>',
            '</optgroup>',
            '<optgroup label="Open Street Map information">',
            '<option value="parking">Right click/tap hold to see nearby Parking</option>',
            '<option value="bus_stops">Right click/tap hold to see nearby Bus Stops</option>',
            '<option value="cafes">Right click/tap hold to see nearby Cafes</option>',
            '<option value="pubs">Right click/tap hold to see nearby Public Houses</option>',
            '<option value="toilets">Right click/tap hold to see nearby Toilets</option>',
            '</optgroup>'];
        this.selectOptions = ra.html.createElement(this._container, 'select', 'class', 'ra-mouse-options');
        var self = this;
        this.selectOptions.innerHTML = options.join('');
        this.selectOptions.addEventListener("focus", function () {
            self._mouseLayer.clearLayers();
            self._clearPlacesLayers();
        });
        //   this._container.innerHTML = text + options.join('') + '</select>';
        var osmOptions = [];
        osmOptions["cafes"] = {};
        osmOptions["cafes"] = {tag: "amenity", type: "cafe", title: "Cafes", single: "Cafe"};
        osmOptions["parking"] = {tag: "amenity", type: "parking", title: "Car Parks", single: "Car Park"};
        osmOptions["pubs"] = {tag: "amenity", type: "pub", title: "Pubs", single: "Pub"};
        osmOptions["toilets"] = {tag: "amenity", type: "toilets", title: "Toilets", single: "Toilets"};
        osmOptions["bus_stops"] = {tag: "highway", type: "bus_stop", title: "Bus Stops", single: "Bus Stop"};
        this.osmOptions = osmOptions;

        return this._container;
    },
    onRemove: function () {
        this._map.off('zoomend', this._onZoomEnd);
        this._map.off('contextmenu', this._onRightClick);
    },
    Enabled: function (status) {
        this.enabled = status === true;
    },
    mapControl: function (value) {
        this._mapControl = value;
    },
    userOptions: function () {
        return this._userOptions;
    },
    _onRightClick: function (e) {
        this._mouseLayer.clearLayers();
        this._clearPlacesLayers();
        var ele = this.selectOptions;
        var option = ele.options[ele.selectedIndex].value;
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
                    if (this._placeslayer === null) {
                        this._addPlacesLayers();
                    }
                    this._displayPlaces(e);
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
                    this._displayAllTags(e);
                    break;
            }
        }
    },
    _onZoomEnd: function (e) {
//        var zoom = this._map.getZoom();
    },
    _displayDetails: function (e) {
        var desc, w3w, links = '', gr, gr10, grid;
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
        this._mouseLayer.clearLayers();
        var tags = [
            {parent: 'root', tag: 'div', 'innerHTML': desc},
            {name: 'w3w', parent: 'root', tag: 'div'},
            {parent: 'root', tag: 'div', 'innerHTML': links}

        ];
        var pop = document.createElement('div');
        //   ele.innerHTML = desc;
        var elements = ra.html.generateTags(pop, tags);
        var point = L.marker(p).bindPopup(pop);
        this._mouseLayer.addLayer(point);




        //    point.getPopup().setContent(ele);
        //      ra.html.createElement(tag, 'span').innerHTML = desc;
        //         w3w = ra.html.createElement(tag, 'span');
        //         ra.html.createElement(tag, 'span').innerHTML = links;

        point.openPopup();


        ra.w3w.get(e.latlng.lat, e.latlng.lng, elements.w3w, true);
    },
    _displayPostcodes: function (e) {
        var p = new LatLon(e.latlng.lat, e.latlng.lng);
        var grid = OsGridRef.latLonToOsGrid(p);
        var gr = grid.toString(6);
        var i;
        var marker;
        var desc = " ";
        var self = this;
        this._mouseLayer.clearLayers();
        var msg = "   ";
        var point = L.marker(p).bindPopup(msg);
        this._mouseLayer.addLayer(point);
        if (gr !== "") {
            point.getPopup().setContent("<b>Searching for postcodes ...</b>");
            point.openPopup();
            // get postcodes around this point       
            var east = Math.round(grid.easting);
            var north = Math.round(grid.northing);
            var options = "&dist=" + this._userOptions.postcodes.distance + "&maxpoints=" + this._userOptions.postcodes.number;
            var url = "https://postcodes.theramblers.org.uk/index.php?easting=" + east + "&northing=" + north + options;
            ra.ajax.getJSON(url, function (err, items) {
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
                            var popup = item.Postcode + "<br />     Distance: " + self._kFormatter(Math.round(item.Distance)) + "m";
                            var easting = item.Easting;
                            var northing = item.Northing;
                            var gr = new OsGridRef(easting, northing);
                            var latlong = OsGridRef.osGridToLatLon(gr);
                            var pt = new L.latLng(latlong.lat, latlong.lon);
                            var style;
                            if (i === 0) {
                                marker = L.marker(pt, {icon: ra.map.icon.postcodeClosest()}).bindPopup(popup);
                                style = {color: 'green', weight: 3, opacity: 0.2};
                            } else {
                                marker = L.marker(pt, {icon: ra.map.icon.postcode()}).bindPopup(popup);
                                style = {color: 'blue', weight: 3, opacity: 0.2};
                            }
                            self._mouseLayer.addLayer(marker);
                            self._mouseLayer.addLayer(L.polyline([pt, p], style));
                        }
                    }
                    point.getPopup().setContent("<b>" + items.length + " Postcodes found</b>");
                    point.openPopup();
                    var bounds = self._mouseLayer.getBounds();
                    self._map.fitBounds(bounds, {padding: [50, 50]});
                }
                setTimeout(function (point) {
                    self._map.removeLayer(point);
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
        var i;
        var desc = " ";
        var self = this;
        this._mouseLayer.clearLayers();
        var msg = "   ";
        var point = L.marker(p).bindPopup(msg);
        this._mouseLayer.addLayer(point);
        if (gr !== "") {
            point.getPopup().setContent("<b>Searching for Ordnance Survey maps ...</b>");
            point.openPopup();
            // get postcodes around this point       
            var east = Math.round(grid.easting);
            var north = Math.round(grid.northing);
            var url = "https://osmaps.theramblers.org.uk/index.php?easting=" + east + "&northing=" + north;
            ra.ajax.getJSON(url, function (err, items) {
                if (err !== null) {
                    var msg = "Error: Something went wrong: " + err;
                    point.getPopup().setContent(msg);
                } else {
                    var content = "No Ordnance Survey Maps found for this location";
                    if (items.length !== 0) {
                        content = "<b>" + items.length + " Ordnance Survey maps found</b>";
                        for (i = 0; i < items.length; i++) {
                            var item = items[i];
                            content += "<h4>" + item.type + " " + item.number + "</h4>";
                            content += "<p>" + item.title + "</p>";
                            ra.map.os.display(item, self._mouseLayer);
                        }
                    }

                    point.getPopup().setContent(content);
                    point.openPopup();
                    var bounds = self._mouseLayer.getBounds();
                    self._map.fitBounds(bounds, {padding: [50, 50]});
                }
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
        this._mouseLayer.clearLayers();
        var point = L.marker(p).bindPopup(msg);
        var self = this;
        this._mouseLayer.addLayer(point);
        //  point.getPopup().setContent(msg);
        point.openPopup();
        var $latitude = e.latlng.lat;
        var $longitude = e.latlng.lng;
        var options = "&dist=" + this._userOptions.groups.distance + "&maxpoints=" + this._userOptions.groups.number;
        var url = "https://groups.theramblers.org.uk/index.php?latitude=" + $latitude + "&longitude=" + $longitude + options;
        ra.ajax.getJSON(url, function (err, items) {
            if (err !== null) {
                var msg = "Error: Something went wrong: " + err;
                point.getPopup().setContent(msg);
            } else {

                if (items.length === 0) {
                    var closest = "No Ramblers Groups found within " + self._userOptions.groups.distance + "km";
                    point.getPopup().setContent(closest);
                } else {
                    msg = items.length + " Ramblers Groups found within " + self._userOptions.groups.distance + "km";
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
                                popup += "<br/>Part of " + item.areaname + " area";
                            }
                        }
                        var $iclass = "group-icon " + item.scope.toLowerCase();
                        //   var style;
                        var pt = new L.latLng(item.latitude, item.longitude);
                        var title = item.name;
                        var icon = L.divIcon({className: $iclass, iconSize: null, html: title});
                        marker = L.marker(pt, {icon: icon}).bindPopup(popup);
                        //   style = {color: 'blue', weight: 3, opacity: 0.2};

                        self._mouseLayer.addLayer(marker);
                    }
                    var bounds = self._mouseLayer.getBounds();
                    self._map.fitBounds(bounds, {padding: [50, 50]});
                }
            }
            setTimeout(function (point) {
                self._map.removeLayer(point);
            }, 3000, point);
        });
    },
    _displayOSM: function (e, option) {
        var self = this;
        var osmOption = this.osmOptions[option];
        var tag = osmOption.tag;
        var type = osmOption.type;
        var title = osmOption.title;
        var single = osmOption.single;
        var p = new LatLon(e.latlng.lat, e.latlng.lng);
        var i;
        var msg = "<b>Searching for " + type + " ...</b>";
        this._mouseLayer.clearLayers();
        var point = L.marker(p).bindPopup(msg);
        this._mouseLayer.addLayer(point);
        //  point.getPopup().setContent(msg);
        point.openPopup();
        this._latlng = e.latlng;
        var queryTemplate = '[out:json]; (node["{tag}"="{type}"](around:{radius},{lat},{lng});way["{tag}"="{type}"](around:{radius},{lat},{lng});relation["{tag}"="{type}"](around:{radius},{lat},{lng}););out center;';
        var query = this.getQuery(queryTemplate, tag, type);
        //console.log("Query: " + query);
        var url = this.getUrl(query);
        //console.log("Query: " + url);
        ra.ajax.getJSON(url, function (err, items) {
            if (err !== null) {
                var msg = "Error: Something went wrong: " + err;
                point.getPopup().setContent(msg);
            } else {
                if (items.elements.length === 0) {
                    var closest = "No " + title + " found within " + self._userOptions.osm.distance + "Km";
                    point.getPopup().setContent(closest);
                } else {
                    msg = "<b>" + items.elements.length + " " + title + " found within " + self._userOptions.osm.distance + "Km</b>";
                    msg += "<p>" + items.osm3s.copyright + "</p>";
                    point.getPopup().setContent(msg);
                    point.openPopup();
                    for (i = 0; i < items.elements.length; i++) {
                        var item = items.elements[i];
                        self.displayElement(item, single);
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
    _displayAllTags: function (e) {
        alert('This option not available yet');
        return;
//        var self =this;
//        var title = "All items";
//        var single = "Item";
//        var type = "Items";
//        var p = new LatLon(e.latlng.lat, e.latlng.lng);
//        var i;
//        var msg = "<b>Searching for " + type + " ...</b>";
//        var point = L.marker(p).bindPopup(msg);
//        this._mouseLayer.clearLayers();
//        this._mouseLayer.addLayer(point);
//        //  point.getPopup().setContent(msg);
//        point.openPopup();
//        this._latlng = e.latlng;
//        // var queryTemplate = '[out:json]; (node({{bbox}});way({{bbox}});relation({{bbox}});';
//        var queryTemplate = '[out:json];(way(around:200,52.71017,-1.3480224););out body;';
//        //   node({{bbox}})(if:count_tags() > 0);
//        //  var query = this.getQuery(queryTemplate, null, null);
//        var lat = this._latlng.lat;
//        var lng = this._latlng.lng;
//        var kwargs = {bbox: this.getBox()};
//        var query = L.Util.template(queryTemplate, kwargs);
//        //console.log("Query: " + query);
//        var url = this.getUrl(query);
//        //console.log("Query: " + url);
//        ra.ajax.getJSON(url, function (err, items) {
//            if (err !== null) {
//                var msg = "Error: Something went wrong: " + err;
//                point.getPopup().setContent(msg);
//            } else {
//                if (items.elements.length === 0) {
//                    var closest = "No " + title + " found within " + self._userOptions.osm.distance + "Km";
//                    point.getPopup().setContent(closest);
//                } else {
//                    msg = "<b>" + items.elements.length + " " + title + " found within " + self._userOptions.osm.distance + "Km</b>";
//                    msg += "<p>" + items.osm3s.copyright + "</p>";
//                    point.getPopup().setContent(msg);
//                    point.openPopup();
//                    for (i = 0; i < items.elements.length; i++) {
//                        var item = items.elements[i];
//                        self.displayElement(item, single);
//                    }
//                    var bounds = self._mouseLayer.getBounds();
//                    self._map.fitBounds(bounds, {padding: [50, 50]});
//                }
//            }
//            setTimeout(function (point) {
//                self._map.removeLayer(point);
//            }, 6000, point);
//        });
    },
    displayElement: function (node, title) {
        switch (node.type) {
            case "node":
                this.displayNode(node, title);
                break;
            case "way":
                this.displayWay(node, title);
                break;
            case "relation":

                break;
        }
    },
    displayNode: function (node, title) {
        var tags = node.tags;
        var popup = "<b>" + title + "</b><br/>";
        if (typeof tags.name !== 'undefined') {
            popup = "<h4>" + tags.name + "</h4>";
        }
        this.deleteTags(node.tags, ['name', 'amenity', 'fhrs:id', 'source']);
        popup += this.listTags(tags, null);
        var pt = new L.latLng(node.lat, node.lon);
        var marker = L.marker(pt).bindPopup(popup);
        this._mouseLayer.addLayer(marker);
    },
    displayWay: function (node, title) {
        var tags = node.tags;
        var popup = "<b>" + title + "</b><br/>";
        if (typeof tags.name !== 'undefined') {
            popup = "<h3>" + tags.name + "</h3>";
        }
        this.deleteTags(node.tags, ['name', 'amenity', 'fhrs:id', 'source']);
        popup += this.listTags(tags);
        var pt = new L.latLng(node.center.lat, node.center.lon);
        var marker = L.marker(pt).bindPopup(popup);
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
    _addPlacesLayers: function () {
        this._placeslayer = [];
        for (var i = 1; i < 6; i++) {
            this._placeslayer[i] = L.featureGroup([]);
            this._placeslayer[i].addTo(this._map);
            this._mapControl.addOverlay(this._placeslayer[i], "<span class='ramblers-places-icon'><img src='libraries/ramblers/leaflet/images/" + i + "star.png' alt='" + i + " Star'> places</span>");
        }
    },
    _clearPlacesLayers: function () {
        if (this._placeslayer !== null) {
            for (i = 1; i < 6; i++) {
                this._placeslayer[i].clearLayers();
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
        var self = this;
        var p = new LatLon(e.latlng.lat, e.latlng.lng);
        var grid = OsGridRef.latLonToOsGrid(p);
        var gr = grid.toString(6);
        var i;
        var desc = "<b><a href='https://maphelp.ramblers-webs.org.uk/startingplaces.html' target='_blanks'>Meeting/Starting Places</a><b>";
        this._clearPlacesLayers();
        this._mouseLayer.clearLayers();
        var msg = "   ";
        var point = L.marker(p).bindPopup(msg);
        this._mouseLayer.addLayer(point);
        point.getPopup().setContent(desc);
        if (gr !== "") {
            point.getPopup().setContent(desc + "<br/><b>Searching for Ramblers meeting/starting places ...</b>");
            point.openPopup();
            var east = Math.round(grid.easting);
            var north = Math.round(grid.northing);
            var limit = "&dist=" + self._userOptions.starting.distance + "&maxpoints=" + self._userOptions.starting.number;
            var url = "https://places.walkinginfo.co.uk/get.php?easting=" + east + "&northing=" + north + limit;
            ra.ajax.getJSON(url, function (err, items) {
                if (err !== null) {
                    desc += "<br/>Error: Something went wrong: " + err;
                } else {
                    var no = 0;
                    for (i = 0; i < items.length; i++) {
                        var item = items[i];
                        if (item.S > 0 && item.S < 6) {
                            var marker;
                            marker = ra.map.places.addMarker(item.GR, item.S, item.Lat, item.Lng);
                            self._placeslayer[item.S].addLayer(marker);
                            no += 1;
                        }
                    }
                    if (no === 0) {
                        desc += "<br/>No meeting/starting places found within " + self._userOptions.starting.distance + "km";
                    } else {
                        if (no === 100) {
                            desc += "<br/>100+ locations found within 10Km";
                        } else {
                            desc += "<br/>" + no + " locations found within " + self._userOptions.starting.distance + "km";
                        }
                        var bounds = self._getPlacesBounds();
                        self._map.fitBounds(bounds, {padding: [50, 50]});
                    }
                    point.getPopup().setContent(desc);
                    // point.openPopup();

                }
                setTimeout(function (point) {
                    self._map.removeLayer(point);
                }, 10000, point);
            });
        } else {
            desc += "<br/>Outside OS Grid";
            point.getPopup().setContent(desc);
            point.openPopup();
        }
    },
//    displayOSMap: function (map, layer) {
//        var boundstr = "Bounds: <br/>";
//        for (j = 0; j < map.bounds.length; j++) {
//            var rect;
//            var bounds = map.bounds[j];
//            var pt1 = this._getPointInfo(bounds.eastingmin, bounds.northingmin);
//            var pt2 = this._getPointInfo(bounds.eastingmax, bounds.northingmax);
//            var area = [pt1.latlng, pt2.latlng];
//            boundstr += pt1.gr + " to " + pt2.gr + "<br/>";
//        }
//        //  console.log(map.type + " " + map.number);
//        //  console.log(boundstr);
//        for (j = 0; j < map.bounds.length; j++) {
//            var rect;
//            var bounds = map.bounds[j];
//            var pt1 = this._getPointInfo(bounds.eastingmin, bounds.northingmin);
//            var pt2 = this._getPointInfo(bounds.eastingmin, bounds.northingmax);
//            var pt3 = this._getPointInfo(bounds.eastingmax, bounds.northingmax);
//            var pt4 = this._getPointInfo(bounds.eastingmax, bounds.northingmin);
//            var area = [pt1.latlng, pt2.latlng, pt3.latlng, pt4.latlng];
//            if (map.scale === "50000") {
//                rect = L.polygon(area, {color: "#ff0000", weight: 1});
//            } else {
//                rect = L.polygon(area, {color: "#ff7800", weight: 1});
//            }
//            var msg = "<h4>" + map.type + " " + map.number + "</h4>";
//            msg += "<p>" + map.title + "</p>";
//            msg += "<p>Scale: 1:" + map.scale.substr(0, 2) + "k</p>";
//            msg += boundstr;
//            rect.bindPopup(msg);
//            layer.addLayer(rect);
//        }
//    },

});
L.control.rightclick = function (options) {
    return new L.Control.Rightclick(options);
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