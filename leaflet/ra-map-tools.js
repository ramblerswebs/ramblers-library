var L, ramblersMap, OsGridRef;
L.Control.RA_Map_Tools = L.Control.extend({
    options: {
        id: null,
        title: 'Mapping Tools',
        position: 'topright',
        osgrid: {
            color: '#0080C0',
            weight: 2,
            opacity: 0.5}
    },
    drawoptions: {
        color: '#782327',
        weight: 3,
        opacity: 1
    },
    onAdd: function (map) {
        this._map = map;
        ramblersMap.RA_Map_Tools = this;
        ramblersMap.OSGrid = {};
        ramblersMap.OSGrid.display = true;
        ramblersMap.OSGrid.basicgrid = false;
        ramblersMap.OSGrid.layer = L.layerGroup().addTo(ramblersMap.map);
        // OS Grid Display
        ramblersMap.map.on('zoomend', function () {
            ramblersMap.RA_Map_Tools.osZoomLevel();
            ramblersMap.RA_Map_Tools.displayOSGrid();
        });
        ramblersMap.map.on('moveend', function () {
            ramblersMap.RA_Map_Tools.displayOSGrid();
        });
        ramblersMap.map.on('baselayerchange', function (e) {
            ramblersMap.baseTiles = e.name;
            ramblersMap.RA_Map_Tools.osZoomLevel();
        });
        ramblersMap.OSGrid.basicgrid = false;
        ramblersMap.RA_Map_Tools.displayOSGrid();
        this.searchLayer = L.featureGroup([]);
        this.searchLayer.addTo(this._map);
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-control-display-tools');
        if (this.options.id !== null) {
            container.setAttribute('id', this.options.id);
        }
        container.title = this.options.title;
        container.addEventListener("click", this._displayOptions);
        return container;
    },
    _displayOptions: function () {
        var self = ramblersMap.RA_Map_Tools;
        displayModal("Loading", false);
        var tag = document.getElementById("modal-data");
        tag.innerHTML = "";
        // tabs
        var container = document.createElement('div');
        container.setAttribute('class', 'tabs-left ');
        tag.appendChild(container);
        var list = document.createElement('ul');
        list.setAttribute('class', 'nav nav-tabs tabs-stacked ');
        container.appendChild(list);
        self.addTabItem(container, list, 'Search', 'search');
        self.addTabItem(container, list, 'OS Grid', 'grid');
        self.addTabItem(container, list, 'Mouse Right Click', 'mouse');
        if (ramblersMap.options.draw) {
            self.addTabItem(container, list, 'Plot Route', 'route');
        }
        self.addTabItem(container, list, 'Help', 'help');
        // tab content 
        var content = document.createElement('div');
        content.setAttribute('class', 'tab-content');
        container.appendChild(content);
        var searchDiv = self.addTabContentItem(content, "search", true);
        var osgridDiv = self.addTabContentItem(content, "grid", false);
        var mouseDiv = self.addTabContentItem(content, "mouse", false);
        if (ramblersMap.options.draw) {
            var drawDiv = self.addTabContentItem(content, "route", false);
        }
        var helpDiv = self.addTabContentItem(content, "help", false);
        self.addSearch(searchDiv);
        self.addOSGrid(osgridDiv);
        self.addMouse(mouseDiv);
        if (ramblersMap.options.draw) {
            self.addDrawOptions(drawDiv);
        }

        self.addHelp(helpDiv);
        var padding = document.createElement('p');
        container.appendChild(padding);
        if (ramblersMap.map.isFullscreen()) {
            ramblersMap.map.toggleFullscreen();
            //       var modal = document.getElementById('js-raModal');
            //       modal.addEventListener("close", self._returnToFullScreen());
            var closeBtn = document.getElementById("btnClose");
            // When the user clicks on <span> (x), close the modal
            closeBtn.addEventListener("click", function () {
                ramblersMap.RA_Map_Tools._returnToFullScreen();
            });
        }
    },
    _returnToFullScreen: function () {
        ramblersMap.map.toggleFullscreen();
    },
    _display_help: function (evt) {
        var page = ramblersMap.maphelppage;
        open(page, "_blank", "scrollbars=yes,width=900,height=580,menubar=yes,resizable=yes,status=yes");
    },
    addSearch: function (tag) {
        var feed = new feeds();
        feed.getSearchTags(tag, tag);
        tag.addEventListener("locationfound", function (e) {
            var ra = e.ra;
            var result = ra.item;
            ramblersMap.RA_Map_Tools.searchLayer.clearLayers();
            result.center = new L.LatLng(result.lat, result.lon);
            ramblersMap.map.setZoom(16);
            new L.Marker(result.center, {icon: ramblersMap.redmarkericon})
                    .bindPopup("<b>" + result.class + ": " + result.type + "</b><br/>" + result.display_name)
                    .addTo(ramblersMap.RA_Map_Tools.searchLayer)
                    .openPopup();
            ramblersMap.map.setView(result.center);
        });
    },
    addHelp: function (tag) {
        if (ramblersMap.maphelppage !== '') {
            var help = document.createElement('button');
            help.setAttribute('class', 'help map-tools');
            help.textContent = "Mapping Help";
            var self = ramblersMap.RA_Map_Tools;
            tag.appendChild(help);
            L.DomEvent.on(help, 'click', self._display_help, self);
        }
    },
    osZoomLevel: function () {
        document.getElementById("ra-error-text").innerHTML = "";
        if (ramblersMap.baseTiles === 'Ordnance Survey') {
            var zoom = ramblersMap.map.getZoom();
            if (zoom <= 11) {
                document.getElementById("ra-error-text").innerHTML = "Info: Zoom in to see Ordnance Survey Maps";
            }
            if (zoom > 17) {
                document.getElementById("ra-error-text").innerHTML = "Info: Zoom out to see Ordnance Survey Maps";
            }
        }
    },
    addOSGrid: function (tag) {
        var self = this;
        var title = document.createElement('h4');
        title.textContent = 'Ordnance Survey Grid';
        tag.appendChild(title);
        var label = document.createElement('label');
        label.textContent = "Display OS Grid at 100km, 10km or 1km dependant on zoom level";
        tag.appendChild(label);
        var osGrid = document.createElement('input');
        osGrid.setAttribute('type', 'checkbox');
        osGrid.setAttribute('value', 'osgrid');
        tag.appendChild(osGrid);
        if (ramblersMap.OSGrid.display) {
            osGrid.setAttribute('checked', true);
        }
        var color = ramblersMap.RA_Map_Tools.options.osgrid.color;
        label = document.createElement('label');
        label.textContent = "OS Grid line colour";
        tag.appendChild(label);
        var osGridColor = document.createElement('input');
        osGridColor.setAttribute('type', 'color');
        osGridColor.setAttribute('value', color);
        tag.appendChild(osGridColor);
        // var weight = ramblersMap.RA_Map_Tools.options.osgrid.weight;
        label = document.createElement('label');
        label.textContent = "OS Grid line thickness";
        tag.appendChild(label);
        this.addNumber(tag, 'divClass', 'Line weight %n pixels', ramblersMap.RA_Map_Tools.options.osgrid, 'weight', 1, 10, 0.5);
        this.addNumber(tag, 'divClass', 'Line opacity %n (0-1)', ramblersMap.RA_Map_Tools.options.osgrid, 'opacity', .1, 1, .01);
        var example = this.addExampleLine(tag, "300px", "Example: ");
        this.addExampleLineStyle(example, ramblersMap.RA_Map_Tools.options.osgrid);
        tag.addEventListener("change", function (e) {
            self.addExampleLineStyle(example, ramblersMap.RA_Map_Tools.options.osgrid);
            ramblersMap.OSGrid.basicgrid = false;
            ramblersMap.RA_Map_Tools.displayOSGrid();
        });
        osGrid.addEventListener("change", function (e) {
            ramblersMap.OSGrid.display = !ramblersMap.OSGrid.display;
            ramblersMap.OSGrid.basicgrid = false;
            ramblersMap.RA_Map_Tools.displayOSGrid();
        });
        osGridColor.addEventListener("change", function (e) {
            ramblersMap.RA_Map_Tools.options.osgrid.color = osGridColor.value;
            ramblersMap.OSGrid.basicgrid = false;
            ramblersMap.RA_Map_Tools.displayOSGrid();
        });
    },
    addDrawOptions: function (tag) {
        var self = this;
        var title = document.createElement('h4');
        title.textContent = 'Plot Route';
        tag.appendChild(title);
        var color = ramblersMap.RA_Map_Tools.drawoptions.color;
        var label = document.createElement('label');
        label.textContent = "Route line colour";
        tag.appendChild(label);
        var drawColor = document.createElement('input');
        drawColor.setAttribute('type', 'color');
        drawColor.setAttribute('value', color);
        tag.appendChild(drawColor);
        this.addNumber(tag, 'divClass', 'Line weight %n pixels', ramblersMap.RA_Map_Tools.drawoptions, 'weight', 1, 10, 0.5);
        this.addNumber(tag, 'divClass', 'Line opacity %n (0-1)', ramblersMap.RA_Map_Tools.drawoptions, 'opacity', .1, 1, .01);
        var example = this.addExampleLine(tag, "300px", "Example: ");
        this.addExampleLineStyle(example, ramblersMap.RA_Map_Tools.drawoptions);
        tag.addEventListener("change", function (e) {
            self.addExampleLineStyle(example, ramblersMap.RA_Map_Tools.drawoptions);
            var drawnItems = ramblersMap.drawnItems;
            drawnItems.eachLayer(function (layer) {
                if (layer instanceof L.Polyline) {
                    ramblersMap.RA_Map_Tools._changePolyline(layer);
                }
            });
            //  var color = ramblersMap.RA_Map_Tools.drawoptions.color;
            ramblersMap.DrawControl.setDrawingOptions({
                polyline: {
                    shapeOptions: ramblersMap.RA_Map_Tools.drawoptions
                }
            });
        });
        drawColor.addEventListener("change", function (e) {
            var color = drawColor.value;
            ramblersMap.RA_Map_Tools.drawoptions.color = color;
            let event = new Event("change", {bubbles: true}); // (2)
            tag.dispatchEvent(event);
        });

    },
    _changePolyline: function (polyline) {
        polyline.setStyle(ramblersMap.RA_Map_Tools.drawoptions);

    },
    addTabItem: function (container, list, name, id) {
        var listItem;
        listItem = document.createElement('li');
        listItem.setAttribute('data-toggle', 'tab');
        list.appendChild(listItem);
        var link;
        link = document.createElement('a');
        link.setAttribute('href', '#' + id);
        link.textContent = name;
        listItem.appendChild(link);
        link.ra_linkItem = listItem;
        link.addEventListener('click', (function (e) {
            var elems = container.querySelectorAll(".active");
            elems.forEach(function (item, index) {
                item.classList.remove("active");
            });
            var id = e.currentTarget.hash.substring(1);
            var ele = document.getElementById(id);
            ele.classList.add('active');
        }));
    },
    addTabContentItem: function (content, id, active) {
        //<div id="home" class="tab-pane fade in active">
        var item;
        item = document.createElement('div');
        item.setAttribute('id', id);
        if (active) {
            item.setAttribute('class', "tab-pane active");
        } else {
            item.setAttribute('class', "tab-pane");
        }
        content.appendChild(item);
        return item;
    },
    addMouse: function (tag) {
        var comment;
        var mouse = ramblersMap.PostcodeStatus;
        var title = document.createElement('h4');
        title.textContent = 'Mouse right click/tap and hold';
        tag.appendChild(title);
        var comments = document.createElement('p');
        comments.innerHTML = 'Use right click, or tap and hold, to view location information, select what is displayed by using the control at the bottom left of the map. ';
        comments.innerHTML += "You can display postcodes, Ramblers' Areas and Groups, meeting/starting places and information from <a href='https://www.openstreetmap.org/about' target='_blank'>Open Street Map</a>, see below ";
        comments.innerHTML += "<br/>Please remember that the more information you ask for the more time it will take.";
        tag.appendChild(comments);
        var hdg2 = document.createElement('h5');
        hdg2.textContent = 'Ramblers Area / Group Options';
        tag.appendChild(hdg2);
        comment = document.createElement('p');
        comment.setAttribute('class', 'smaller');
        comment.textContent = 'Find a Ramblers walking group in your area';
        tag.appendChild(comment);
        this.addNumber(tag, 'divClass', 'Display groups/area within %n km', mouse.displayOptions.groups, 'distance', 0.5, 500, 0.5);
        this.addNumber(tag, 'divClass', 'Display nearest %n groups/area.', mouse.displayOptions.groups, 'number', 1, 500, 1);
        var hdg1 = document.createElement('h5');
        hdg1.textContent = 'Postcode Options';
        tag.appendChild(hdg1);
        comment = document.createElement('p');
        comment.setAttribute('class', 'smaller');
        comment.textContent = 'Useful for finding correct postcode for your satnav';
        tag.appendChild(comment);
        this.addNumber(tag, 'divClass', 'Display postcodes within %n km', mouse.displayOptions.postcodes, 'distance', 0.5, 20, 0.5);
        this.addNumber(tag, 'divClass', 'Display nearest %n postcodes', mouse.displayOptions.postcodes, 'number', 1, 50, 1);
        var hdg3 = document.createElement('h5');
        hdg3.textContent = 'Meeting/Starting Locations Options';
        tag.appendChild(hdg3);
        comment = document.createElement('p');
        comment.setAttribute('class', 'smaller');
        comment.textContent = 'Find locations Ramblers Groups have used to meet or start a walk';
        tag.appendChild(comment);
        this.addNumber(tag, 'divClass', 'Display locations within %n km', mouse.displayOptions.starting, 'distance', 0.5, 20, 0.5);
        this.addNumber(tag, 'divClass', 'Display nearest %n locations', mouse.displayOptions.starting, 'number', 5, 500, 5);
        var hdg4 = document.createElement('h5');
        hdg4.textContent = 'Open Street Map Options';
        tag.appendChild(hdg4);
        comment = document.createElement('p');
        comment.setAttribute('class', 'smaller');
        comment.textContent = 'This option affects the display of parking, bus stops, cafes, public housea and toilets.';
        tag.appendChild(comment);
        this.addNumber(tag, 'divClass', 'Display items within %n km', mouse.displayOptions.osm, 'distance', 0.5, 5, 0.5);
        //    this.addNumber(tag, 'divClass', 'Number', mouse.displayOptions.postcodes, 'distance', 1, 50, 1);
    },
    displayOSGrid: function () {
        if (!ramblersMap.OSGrid.display) {
            ramblersMap.OSGrid.layer.clearLayers();
            return;
        }
        var gs = 100000;
        var zoom = ramblersMap.map.getZoom();
        if (zoom > 10) {
            gs = 10000;
        }
        if (zoom > 12.5) {
            gs = 1000;
        }
        var bounds = ramblersMap.map.getBounds();
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
            if (ramblersMap.OSGrid.basicgrid) {
                return;
            } else {
                sw.easting = 0;
                sw.northing = 0;
                ne.easting = 700000;
                ne.northing = 1400000;
                ramblersMap.OSGrid.basicgrid = true;
            }
        } else {
            ramblersMap.OSGrid.basicgrid = false;
        }
        ramblersMap.OSGrid.layer.clearLayers();
        this.drawOSMapGrid(ne, sw, gs, ramblersMap.OSGrid.layer);
    },
    drawOSMapGrid: function (ne, sw, gs, layer) {
        var style;
        var color = ramblersMap.RA_Map_Tools.options.osgrid.color;
        var weight = ramblersMap.RA_Map_Tools.options.osgrid.weight;
        var opacity = ramblersMap.RA_Map_Tools.options.osgrid.opacity;
        switch (gs) {
            case 1000:
                style = {color: color, weight: weight, opacity: opacity};
                break;
            case 10000:
                style = {color: color, weight: weight, opacity: opacity};
                break;
            default:
                style = {color: color, weight: weight, opacity: opacity};
        }
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
    addExampleLine: function (tag, length, comment) {
        var com = document.createElement('div');
        com.style.display = 'inline-block';
        com.textContent = comment;
        com.style.marginRight = '20px';
        com.style.marginTop = '20px';
        tag.appendChild(com);
        var itemDiv = document.createElement('div');
        itemDiv.style.display = 'inline-block';
        itemDiv.style.width = length;
        itemDiv.style.height = "1px";
        tag.appendChild(itemDiv);
        return itemDiv;
    },
    addExampleLineStyle: function (line, style) {
        if (style.hasOwnProperty("color")) {
            line.style.backgroundColor = style.color;
        }
        if (style.hasOwnProperty("weight")) {
            line.style.height = style.weight + "px";
        }
        if (style.hasOwnProperty("opacity")) {
            line.style.opacity = style.opacity;
        }
    },
    addNumber: function (tag, divClass, label, raobject, property, minval, maxval, step) {
        var itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', divClass);
        tag.appendChild(itemDiv);
        var _label = document.createElement('label');
        _label.setAttribute('class', 'help-label xxxx');
        _label.textContent = label;
        var inputTag = document.createElement('input');
        //  inputTag.setAttribute('class', ' form-control-range');
        inputTag.setAttribute('type', 'range');
        inputTag.setAttribute('min', minval);
        inputTag.setAttribute('max', maxval);
        inputTag.setAttribute('step', step);
        inputTag.raobject = raobject;
        inputTag.raproperty = property;
        if (raobject.hasOwnProperty(property)) {  // Initialise value
            inputTag.setAttribute('value', raobject[property]);
            _label.textContent = label.replace("%n", inputTag.value);
        }
        inputTag.addEventListener("input", function (e) {
            e.target.raobject[e.target.raproperty] = e.target.value;
            _label.textContent = label.replace("%n", e.target.value);
            let event = new Event("change", {bubbles: true}); // (2)
            tag.dispatchEvent(event);
        });
        itemDiv.appendChild(inputTag);
        itemDiv.appendChild(_label);
        return inputTag;
    }

});
L.control.ra_map_tools = function (options) {
    return new L.Control.RA_Map_Tools(options);
};