var L, ra, document, OsGridRef;
L.Control.RA_Map_Settings = L.Control.extend({
    options: {
        id: null,
        title: 'Settings&Help',
        position: 'topright',
        osgrid: {
            color: '#0080C0',
            weight: 2,
            opacity: 0.5}
    },
    helpBase: "https://maphelp5.ramblers-webs.org.uk/",
    _userOptions: null,
    onAdd: function (map) {
        this._map = map;
        this.osMapLayer = L.featureGroup([]).addTo(map);
        this.OSGrid = {};
        this.OSGrid.display = false;
        this.OSGrid.basicgrid = false;
        this.OSGrid.layer = L.layerGroup().addTo(map);
        var _this = this;
        // OS Grid Display
        map.on('zoomend', function () {
            _this.displayOSGrid();
        });
        map.on('moveend', function () {
            _this.displayOSGrid();
        });
        this.OSGrid.basicgrid = false;
        this.displayOSGrid();
        this.searchLayer = L.featureGroup([]);
        this.searchLayer.addTo(this._map);
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-control-display-tools');
        this._container = container;
        if (this.options.id !== null) {
            container.setAttribute('id', this.options.id);
        }
        container.title = this.options.title;
        //  this.getDrawSettings();
        container.addEventListener("click", function (e) {
            _this.forms = document.createElement('div');
            _this.forms.setAttribute('class', 'xxxx');
            ra.modal.display(_this.forms, false);
            var title = document.createElement('h4');
            title.textContent = "Settings & Help";
            _this.forms.appendChild(title);
            // tabs
            var container = document.createElement('div');
            container.setAttribute('class', 'tabs');
            _this.forms.appendChild(container);
            var tabs = document.createElement('div');
            tabs.setAttribute('class', 'ra-tabs-left ');
            container.appendChild(tabs);
            var list = document.createElement('div');
            tabs.appendChild(list);
            // tab content 
            var content = document.createElement('div');
            content.setAttribute('class', 'tab-content');
            container.appendChild(content);
            var first = true;

            if (_this._userOptions.plotroute !== null) {
                _this._addTabItem(container, list, 'Plot Walking Route', 'route', first);
                var drawDiv = _this.addTabContentItem(content, "route", first);
                _this.addDrawOptions(drawDiv);
                _this.saveDrawOptions = false;
                _this.getDrawSettings();
                first = false;
            }

            var searchDiv;
            _this._addTabItem(container, list, 'Search', 'search', first);
            searchDiv = _this.addTabContentItem(content, "search", first);
            first = false;
            _this.addSearch(searchDiv);

            var osmapsDiv = _this.addTabContentItem(content, "osmaps", false);
            _this._addTabItem(container, list, 'Ordnance Survey', 'osmaps', false);
            _this.addOSMaps(osmapsDiv);

            if (_this._userOptions.rightclick !== null) {
                _this._addTabItem(container, list, 'Mouse Right Click', 'mouse', false);
                var mouseDiv = _this.addTabContentItem(content, "mouse", false);
                _this.addMouse(mouseDiv);
            }

            if (_this._helpPage !== '') {
                _this._addTabItem(container, list, 'Help/Feedback', 'help', false);

                var helpDiv = _this.addTabContentItem(content, "help", false);
                _this.addHelp(helpDiv);
            }
            var padding = document.createElement('p');
            container.appendChild(padding);
        });
        return container;
    },
    changeDisplay: function (display) {
        this._container.style.display = display;
    },
    userOptions: function (value) {
        this._userOptions = value;
    },
    helpPage: function (value) {
        this._helpPage = value;
    },
    addSearch: function (tag) {
        var _this = this;
        var feed = new feeds();
        feed.getSearchTags(tag, tag);
        tag.addEventListener("locationfound", function (e) {
            var raData = e.raData;
            var result = raData.item;
            _this.searchLayer.clearLayers();
            result.center = new L.LatLng(result.lat, result.lon);
            new L.Marker(result.center, {icon: ra.map.icon.redmarker()})
                    .bindPopup("<b>" + result.class + ": " + result.type + "</b><br/>" + result.display_name)
                    .addTo(_this.searchLayer)
                    .openPopup();
            _this._map.setView(result.center, 16);
        });
    },
    addHelp: function (tag) {
        if (this._helpPage !== '') {
            var helpcomment = document.createElement('div');
            helpcomment.setAttribute('class', 'help map-tools');
            helpcomment.innerHTML = "If you have a problem with the mapping facilities on this site then please contact the web site owner. Alternatively contact us via the mapping HELP below.</br></br>";
            tag.appendChild(helpcomment);
            var help = document.createElement('div');
            help.setAttribute('class', 'link-button mintcake');
            //  help.setAttribute('href', this._helpPage);
            //  help.setAttribute('target', '_blank');
            //  help.style.cssFloat = "center";
            help.textContent = "View Mapping Help";
            tag.appendChild(help);
            var _this = this;
            help.addEventListener("click", function (e) {
                _this.forms.innerHTML = "";
                ra.loading.start();
                var iframe = document.createElement('iframe');
                iframe.onload = function() { ra.loading.stop(); };
                iframe.setAttribute('src', _this.helpBase + _this._helpPage);
                iframe.setAttribute('class', 'ra maphelp-modal');
                _this.forms.appendChild(iframe);
            });
        }
    },
    addOSMaps: function (tag) {
        var _this = this;
        this.osMapLayer.clearLayers();
        var title = document.createElement('h4');
        title.textContent = 'Ordnance Survey Landranger and Explorer Maps';
        tag.appendChild(title);
        var select = document.createElement('select');
        select.style.width = '350px';
        tag.appendChild(select);
        var option0 = document.createElement('option');
        option0.textContent = "Do not display Ordnance Survey map outlines";
        option0.setAttribute('value', 'none');
        select.appendChild(option0);
        var option1 = document.createElement('option');
        option1.textContent = "Display outline of all Explorer 1:25k Maps";
        option1.setAttribute('value', '25K');
        select.appendChild(option1);
        var option2 = document.createElement('option');
        option2.textContent = "Display outline of all Landranger 1:50k Maps";
        option2.setAttribute('value', '50K');
        select.appendChild(option2);
        var comment = document.createElement('div');
        comment.innerHTML = '<br/><p>Display the areas covered by Ordnance Survey Landranger or Explorer Maps.</p>';
        comment.innerHTML += '<p> Please note that this information is unofficial and may be incorrect. Please check before buying a map.</p>';
        comment.innerHTML += '<p>If you notice any errors then do contact us via the help option on the left.</p>';
        tag.appendChild(comment);
        select.addEventListener("change", function (e) {
            var option = e.target.value;
            if (option === 'none') {
                _this.osMapLayer.clearLayers();
                return;
            }
            var self = _this;
            var url = "https://osmaps.theramblers.org.uk/index.php?mapscale=" + option;
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
                }
            });
        });

        tag.appendChild(document.createElement('hr'));
        var title = document.createElement('h4');
        title.textContent = 'Ordnance Survey Grid';
        tag.appendChild(title);
        var osGrid = this.addYesNo(tag, 'divClass', "Display OS Grid at 100km, 10km or 1km dependant on zoom level", this.OSGrid, 'display');
        var gridColor = this.addColour(tag, 'divClass', 'OS Grid line colour', this.options.osgrid, 'color');
        var label = document.createElement('label');
        label.textContent = "OS Grid line style";
        tag.appendChild(label);
        this.addNumber(tag, 'divClass', 'Line weight %n pixels', this.options.osgrid, 'weight', 1, 10, 0.5);
        this.addNumber(tag, 'divClass', 'Line opacity %n (0-1)', this.options.osgrid, 'opacity', .1, 1, .01);
        var example = this.addExampleLine(tag, "300px", "Example: ");
        this.addExampleLineStyle(example, this.options.osgrid);
        title = document.createElement('hr');
        tag.appendChild(title);
        title = document.createElement('h4');
        title.textContent = 'Mouse Operation';
        tag.appendChild(title);
        title = document.createElement('p');
        title.textContent = 'As you zoom in, the mouse can display a 100m or a 10m square showing the area covered by a 6 or 8 figure grid reference.';
        tag.appendChild(title);
        this.addYesNo(tag, 'divClass', "Display 10m/100m grid reference squares", this._userOptions.mouse, 'displayMouseGridSquare');
        tag.addEventListener("change", function (e) {
            _this.addExampleLineStyle(example, _this.options.osgrid);
            _this.OSGrid.basicgrid = false;
            _this.displayOSGrid();
        });
        osGrid.addEventListener("yesnochange", function (e) {
            this._ramblersMap.OSGrid.display = !this._ramblersMap.OSGrid.display;
            _this.OSGrid.basicgrid = false;
            _this.displayOSGrid();
        });
        gridColor.addEventListener("change", function (e) {
            _this.OSGrid.basicgrid = false;
            _this.displayOSGrid();
        });
    },
    addDrawOptions: function (tag) {
        var _this = this;
        var title = document.createElement('h4');
        title.textContent = 'Plot Walking Route';
        tag.appendChild(title);
        var titleoptions = document.createElement('h5');
        titleoptions.textContent = 'Options';
        tag.appendChild(titleoptions);
        var pan = this.addYesNo(tag, 'divClass', "Pan: Centre map on last point added to route", this._userOptions.plotroute.draw, 'panToNewPoint');
        var join = this.addYesNo(tag, 'divClass', "Join: Join new route to nearest existing route", this._userOptions.plotroute.draw, 'joinSegments');
        tag.appendChild(document.createElement('hr'));
        var titlestyle = document.createElement('h5');
        titlestyle.textContent = 'Display: Style of route';
        tag.appendChild(titlestyle);
        var drawColor = this.addColour(tag, 'divClass', 'Route line colour', this._userOptions.plotroute.style, 'color');
        var weight = this.addNumber(tag, 'divClass', 'Line weight %n pixels', this._userOptions.plotroute.style, 'weight', 1, 10, 0.5);
        var opacity = this.addNumber(tag, 'divClass', 'Line opacity %n (0-1)', this._userOptions.plotroute.style, 'opacity', .1, 1, .01);
        var example = this.addExampleLine(tag, "300px", "Example: ");
        this.addExampleLineStyle(example, this._userOptions.plotroute.style);
        tag.appendChild(document.createElement('hr'));
        var cookies = this.addYesNo(tag, 'divClass', "Save settings between sessions/future visits to web site (you accept cookies)", this, 'saveDrawOptions');
        var reset = this.addButton(tag, 'divClass', "Reset Plot Walking Route options to default values", 'Reset');
        reset.addEventListener("click", function (e) {
            _this.setYesNo(pan, true);
            _this.setYesNo(join, true);
            _this.setNumber(weight, 3);
            _this.setNumber(opacity, 1);
            _this.setColour(drawColor, '#782327');
        });
        cookies.addEventListener("click", function (e) {
            _this.setDrawSettings();
        });
        pan.addEventListener("yesnochange", function (e) {
            _this.setDrawSettings();
        });
        join.addEventListener("yesnochange", function (e) {
            _this.setDrawSettings();
        });
        tag.addEventListener("change", function (e) {
            _this.setDrawSettings();
            _this.addExampleLineStyle(example, _this._userOptions.plotroute.style);
            _this._map.fire("draw:color-change", null);
        });
        drawColor.addEventListener("change", function (e) {
            let event = new Event("change", {bubbles: true}); // (2)
            tag.dispatchEvent(event);
        });
    },
    getDrawSettings: function () {
        if (this._userOptions.plotroute !== null) {
            var scookie = ra.cookie.read('raDraw');
            if (scookie !== null) {
                var cookie = JSON.parse(scookie);
                this.saveDrawOptions = cookie.saveOptions;
//            if (this._userOptions.plotroute === null) {
//                this._userOptions.plotroute = {draw: {}, style: {}};
//            }
                this._userOptions.plotroute.draw.panToNewPoint = cookie.panToNewPoint;
                this._userOptions.plotroute.draw.joinSegments = cookie.joinSegments;
                this._userOptions.plotroute.style.weight = cookie.weight;
                this._userOptions.plotroute.style.opacity = cookie.opacity;
                this._userOptions.plotroute.style.color = cookie.colour;
                this._map.fire("draw:color-change", null);
            }
        }
    },
    setDrawSettings: function () {
        if (this.saveDrawOptions) {
            var cookie = {};
            cookie.saveOptions = this.saveDrawOptions;
            cookie.panToNewPoint = this._userOptions.plotroute.draw.panToNewPoint;
            cookie.joinSegments = this._userOptions.plotroute.draw.joinSegments;
            cookie.weight = this._userOptions.plotroute.style.weight;
            cookie.opacity = this._userOptions.plotroute.style.opacity;
            cookie.colour = this._userOptions.plotroute.style.color;
            ra.cookie.create(JSON.stringify(cookie), 'raDraw', 365);
        } else {
            ra.cookie.erase('raDraw');
        }
    },
    _changePolyline: function (polyline) {
        polyline.setStyle(this._userOptions.plotroute.style);
    },
    _addTabItem: function (container, list, name, id, active) {
        var listItem;
        listItem = document.createElement('div');
        // listItem.setAttribute('data-toggle', 'tab');
        listItem.classList.add('ra-tab-item');
        if (active) {
            listItem.classList.add('active');
        }
        listItem.textContent = name;
        listItem.setAttribute('data-tab', id);
        list.appendChild(listItem);
        listItem.addEventListener('click', (function (e) {
            var tab = e.currentTarget;
            var elems = container.querySelectorAll(".active");
            elems.forEach(function (item, index) {
                item.classList.remove("active");
            });
            var id = tab.getAttribute('data-tab');
            var ele = document.getElementById(id);
            ele.classList.add('active');
            tab.classList.add('active');
        }));
    },
    addTabContentItem: function (content, id, active) {
        var item;
        item = document.createElement('div');
        item.setAttribute('id', id);
        if (active) {
            item.setAttribute('class', "tab-panel active");
        } else {
            item.setAttribute('class', "tab-panel");
        }
        content.appendChild(item);
        return item;
    },
    addMouse: function (tag) {
        var comment;
        // var mouse = this._ramblersMap.PostcodeStatus;
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
        this.addNumber(tag, 'divClass', 'Display groups/area within %n km', this._userOptions.rightclick.groups, 'distance', 0.5, 500, 0.5);
        this.addNumber(tag, 'divClass', 'Display nearest %n groups/area.', this._userOptions.rightclick.groups, 'number', 1, 500, 1);
        tag.appendChild(document.createElement('hr'));
        var hdg1 = document.createElement('h5');
        hdg1.textContent = 'Postcode Options';
        tag.appendChild(hdg1);
        comment = document.createElement('p');
        comment.setAttribute('class', 'smaller');
        comment.textContent = 'Useful for finding correct postcode for your satnav';
        tag.appendChild(comment);
        this.addNumber(tag, 'divClass', 'Display postcodes within %n km', this._userOptions.rightclick.postcodes, 'distance', 0.5, 20, 0.5);
        this.addNumber(tag, 'divClass', 'Display nearest %n postcodes', this._userOptions.rightclick.postcodes, 'number', 1, 50, 1);
        tag.appendChild(document.createElement('hr'));
        var hdg3 = document.createElement('h5');
        hdg3.textContent = 'Meeting/Starting Locations Options';
        tag.appendChild(hdg3);
        comment = document.createElement('p');
        comment.setAttribute('class', 'smaller');
        comment.textContent = 'Find locations Ramblers Groups have used to meet or start a walk';
        tag.appendChild(comment);
        this.addNumber(tag, 'divClass', 'Display locations within %n km', this._userOptions.rightclick.starting, 'distance', 0.5, 20, 0.5);
        this.addNumber(tag, 'divClass', 'Display nearest %n locations', this._userOptions.rightclick.starting, 'number', 5, 500, 5);
        tag.appendChild(document.createElement('hr'));
        var hdg4 = document.createElement('h5');
        hdg4.textContent = 'Open Street Map Options';
        tag.appendChild(hdg4);
        comment = document.createElement('p');
        comment.setAttribute('class', 'smaller');
        comment.textContent = 'This option affects the display of parking, bus stops, cafes, public housea and toilets.';
        tag.appendChild(comment);
        this.addNumber(tag, 'divClass', 'Display items within %n km', this._userOptions.rightclick.osm, 'distance', 0.5, 5, 0.5);
    },
    displayOSGrid: function () {
        if (!this.OSGrid.display) {
            this.OSGrid.layer.clearLayers();
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
            if (this.OSGrid.basicgrid) {
                return;
            } else {
                sw.easting = 0;
                sw.northing = 0;
                ne.easting = 700000;
                ne.northing = 1400000;
                this.OSGrid.basicgrid = true;
            }
        } else {
            this.OSGrid.basicgrid = false;
        }
        this.OSGrid.layer.clearLayers();
        this.drawOSMapGrid(ne, sw, gs, this.OSGrid.layer);
    },
    drawOSMapGrid: function (ne, sw, gs, layer) {
        var style;
        var color = this.options.osgrid.color;
        var weight = this.options.osgrid.weight;
        var opacity = this.options.osgrid.opacity;
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
        _label.setAttribute('class', 'help-label');
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
    },
    setNumber: function (tag, value) {
        tag.value = value;
        let event = new Event("input", {bubbles: true});
        tag.dispatchEvent(event);
    },
    addColour: function (tag, divClass, labeltext, raobject, property) {
        var itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', divClass);
        tag.appendChild(itemDiv);
        var label = document.createElement('label');
        label.textContent = labeltext;
        itemDiv.appendChild(label);
        var inputColor = document.createElement('input');
        inputColor.setAttribute('type', 'color');
        inputColor.setAttribute('value', raobject[property]);
        itemDiv.appendChild(inputColor);
        inputColor.raobject = raobject;
        inputColor.raproperty = property;

        inputColor.addEventListener("change", function (e) {
            e.target.raobject[e.target.raproperty] = e.target.value;
            let event = new Event("change", {bubbles: true}); // (2)
            tag.dispatchEvent(event);
        });
        return inputColor;
    },
    setColour: function (tag, value) {
        tag.value = value;
        let event = new Event("change", {bubbles: true});
        tag.dispatchEvent(event);
    },
    addButton: function (tag, divClass, label, buttonText) {
        var itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', divClass);
        tag.appendChild(itemDiv);
        var _label = document.createElement('label');
        _label.textContent = label;
        _label.style.display = "inline";
        var inputTag = document.createElement('button');
        inputTag.setAttribute('class', 'small link-button white');
        inputTag.style.display = "inline";
        inputTag.style.marginLeft = "10px";
        inputTag.textContent = buttonText;
        inputTag.classList.add("button-p5565");
        itemDiv.appendChild(_label);
        itemDiv.appendChild(inputTag);
        return inputTag;
    },
    addYesNo: function (tag, divClass, label, raobject, property) {
        var itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', divClass);
        tag.appendChild(itemDiv);
        var _label = document.createElement('label');
        _label.textContent = label;
        _label.style.display = "inline";
        var inputTag = document.createElement('button');
        inputTag.setAttribute('class', 'small link-button white');
        inputTag.style.display = "inline";
        inputTag.style.marginLeft = "10px";
        if (raobject[property]) {
            inputTag.textContent = "Yes";
            inputTag.classList.add("button-p0555");
            inputTag.classList.remove("button-p0186");
        } else {
            inputTag.textContent = "No";
            inputTag.classList.add("button-p0186");
            inputTag.classList.remove("button-p0555");
        }
        inputTag.raobject = raobject;
        inputTag.property = property;
        inputTag.addEventListener("click", function (e) {
            inputTag.raobject[inputTag.property] = !inputTag.raobject[inputTag.property];
            if (inputTag.raobject[property]) {
                inputTag.textContent = "Yes";
                inputTag.classList.add("button-p0555");
                inputTag.classList.remove("button-p0186");
            } else {
                inputTag.textContent = "No";
                inputTag.classList.add("button-p0186");
                inputTag.classList.remove("button-p0555");
            }
            let event = new Event("yesnochange", {bubbles: true}); // (2)
            inputTag.dispatchEvent(event);
        });
        itemDiv.appendChild(_label);
        itemDiv.appendChild(inputTag);
        return inputTag;
    },
    setYesNo: function (tag, value) {
        tag.raobject[tag.property] = !value;
        tag.click();
    }
});
L.control.ra_map_settings = function (options) {
    return new L.Control.RA_Map_Settings(options);
};