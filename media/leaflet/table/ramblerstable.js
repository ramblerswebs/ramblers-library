var L, ra, jplist, OsGridRef;
if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.display) === "undefined") {
    ra.display = {};
}
ra.display.tableList = (function () {
    var tableList = {};

    tableList.display = function (options, data) {
        this.list = null;
        this.options = options;
        this.data = data;
        this.numberOfRows = this.data.list.items[0].values.length;
        this.defaultIcon = L.icon({
            iconUrl: ra.baseDirectory() + "media/lib_ramblers/images/marker-route.png",
            iconSize: [33, 50],
            iconAnchor: [16, 47],
            popupAnchor: [0, -44]
        });
        this.load = function ( ) {
            this.dataGroup = ra.uniqueID();
            this.myjplist = new ra.jplist(this.dataGroup);
            var tags = [
                {name: 'table', parent: 'root', tag: 'table', attrs: {class: 'ra-tab-options'}},
                {name: 'row', parent: 'table', tag: 'tr'},
                {name: 'map', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'Map'},
                {name: 'list', parent: 'row', tag: 'td', attrs: {class: 'ra-tab active'}, textContent: 'List'},
                {name: 'gpxouter', parent: 'root', tag: 'div', attrs: {class: 'gpxouter'}},
                {name: 'tablemap', parent: 'gpxouter', tag: 'div', style: {display: 'none'}},
                {name: 'tablerecord', parent: 'gpxouter', tag: 'div'},
                {name: 'tablelist', parent: 'gpxouter', tag: 'div'},
                {name: 'tableFilter', parent: 'tablelist', tag: 'div', attrs: {class: 'tableFilter'}, textContent: 'Program loading: please give this a minute or so.If this does not vanish then please contact the web master!'},
                {name: 'raPagination1', parent: 'tablelist', tag: 'div'},
                {name: 'dataTab', parent: 'tablelist', tag: 'div'}
            ];
            this.masterdiv = document.getElementById(options.divId);

            this.elements = ra.html.generateTags(this.masterdiv, tags);
            var self = this;
            this.elements.map.addEventListener("click", function () {
                self.ra_format("Map");
            });
            this.elements.list.addEventListener("click", function () {
                self.removeRecordDisplay();
                self.ra_format("List");
            });
            setTimeout(function () {
                self.displayCsvData(); // lets the map/list tabs be displayed straight away
            }, 0);
        };

        this.displayCsvData = function () {
            this.addPagination(this.numberOfRows, this.elements.raPagination1);
            this.testForMap();
            this.displayCSVTable();
            if (this.displayMap) {
                this.lmap = new ra.leafletmap(this.elements.tablemap, this.options);
                this.map = this.lmap.map;
                this.cluster = new ra.map.cluster(this.map);
                this.ra_format("Map");
                this.map.invalidateSize();
                this.addCSVMarkers();
            }

            this.myjplist.init('ra-table-list');
            this.myjplist.updateControls();

        };
        this.testForMap = function () {
            this.data.list.longitude = -1;
            this.data.list.latitude = -1;
            for (var index = 0; index < this.data.list.items.length; ++index) {

                var item = this.data.list.items[index];
                if (item.longitude) {
                    this.data.list.longitude = index;
                }
                if (item.latitude) {
                    this.data.list.latitude = index;
                }
            }
            if (this.data.list.longitude > -1 && this.data.list.latitude > -1) {
                this.displayMap = true;
                return;
            }
// search for gridref
            this.data.list.gridref = -1;
            for (var index = 0; index < this.data.list.items.length; ++index) {

                var item = this.data.list.items[index];
                if (item.gridref) {
                    this.data.list.gridref = index;
                    this.calculateLatLng();
                    return;
                }
            }
        };
        this.calculateLatLng = function () {
            var items = this.data.list.items;
            var no = this.data.list.gridref;
            var grvalues = items[no].values;
            var lat = [];
            var long = [];
            var newitem;
            for (var index = 0; index < grvalues.length; ++index) {
                try {
                    var grid = OsGridRef.parse(grvalues[index]);
                    var latlng = OsGridRef.osGridToLatLon(grid);
                    lat.push(latlng.lat.toFixed(6));
                    long.push(latlng.lon.toFixed(6));
                } catch (err) {
                    lat.push(0);
                    long.push(0);
                }
            }
            newitem = this.addNewItem("Latitude", lat);
            newitem.latitude = true;
            newitem.table = true;
            newitem.align = 'right';
            newitem = this.addNewItem("Longitude", long);
            newitem.longitude = true;
            newitem.table = true;
            newitem.align = 'right';
            this.data.list.latitude = this.data.list.items.length - 2;
            this.data.list.longitude = this.data.list.items.length - 1;
            this.displayMap = true;
        };
        this.addNewItem = function (name, values) {
            var newitem = {name: "", sort: false, table: false, filter: false, popup: false, gridref: false};
            newitem.name = name;
            newitem.values = values;
            newitem.latitude = false;
            newitem.longitude = false;
            newitem.easting = false;
            newitem.northing = false;
            newitem.linkmarker = false;
            newitem.type = "text";
            this.data.list.items.push(newitem);
            newitem.jpclass = "var" + this.data.list.items.length;
            return newitem;
        };
        this.displayCSVTable = function () {
            //  var out, index;
            var tag;
            tag = this.elements.dataTab;
            if (tag !== null) {
                var table = this.displayCSVHeader(tag);
                var tbody = document.createElement('tbody');
                tbody.setAttribute('data-jplist-group', this.dataGroup);
                table.appendChild(tbody);
                this.displayCSVRows(tbody);
                this.displayCSVFilter();
            }
        };
        this.displayCSVHeader = function (tag) {
            var items = this.data.list.items;
            var table = document.createElement('table');
            table.setAttribute('class', "tabledetails");
            tag.appendChild(table);
            var thead = document.createElement('thead');
            table.appendChild(thead);
            var tr = document.createElement('tr');
            thead.appendChild(tr);
            var item;
            for (var index = 0; index < items.length; ++index) {
                item = items[index];
                if (item.table) {
                    var th = document.createElement('th');
                    tr.appendChild(th);
                    th.setAttribute('class', item.align);
                    th.textContent = item.name;
                    if (item.sort || item.linkmarker) {
                        this.myjplist.sortButton(th, item.jpclass, item.type, "asc", "▲");
                        this.myjplist.sortButton(th, item.jpclass, item.type, "desc", "▼");
                    }
                }
            }
            return table;
        };
        this.displayCSVFilter = function () {
            var items = this.data.list.items;
            var item, filter = "";
            for (var index = 0; index < items.length; ++index) {
                item = items[index];
                if (item.table) {
                    if (item.filter) {
                        filter += this.jplistFilter(item);
                    }
                }
            }
            this.elements.tableFilter.innerHTML = filter;
        };

        this.displayCSVRows = function (tag) {
            var no, index;
            var item;
            for (no = 0; no < this.numberOfRows; ++no) {
                var items = this.data.list.items;
                var tr = document.createElement('tr');
                tag.appendChild(tr);
                tr.setAttribute('data-jplist-item', "");
                for (index = 0; index < items.length; ++index) {
                    item = items[index];
                    if (item.table) {
                        var td = document.createElement('td');
                        tr.appendChild(td);
                        td.setAttribute('class', item.jpclass + " " + item.align);
                        td.innerHTML = this.displayItem(null, item.type, item.values[no]);
                        if (item.linkmarker) {
                            var self = this;
                            td.classList.add('pointer');
                            td.classList.add('link');
                            td.setAttribute('data-marker-number', no);
                            td.addEventListener("click", function (event) {
                                self.selectMarker(event);
                            });
                        }
                    }
                }
            }
            return;
        };

        this.addCSVMarkers = function () {
            for (var index = 0; index < this.numberOfRows; ++index) {
                this.addCSVMarker(index);
            }
            this.cluster.addClusterMarkers();
            this.cluster.zoomAll({padding: [30, 30]});
        };
        this.addCSVMarker = function (no) {
            var $popup, $lat, $long, title = "";
            var $all = true;
            $popup = "<div style='font-size:120%'>";
            var items = this.data.list.items;
            for (var index = 0; index < items.length; ++index) {
                if (items[index].popup) {
                    if (items[index].values[no] !== "") {
                        if (items[index].values[no] !== "") {
                            $popup += this.displayItem(items[index].name, items[index].type, items[index].values[no]);
                        }
                    }
                } else {
                    $all = false;
                }
            }
            if (!$all) {
                $popup += "All information for location is below map";
            }
            $popup += "</div>";
            for (var index = 0; index < items.length; ++index) {
                if (title === "") {
                    if (items[index].linkmarker) {
                        title = items[index].values[no];
                    }
                }
            }
            $lat = items[this.data.list.latitude].values[no];
            $long = items[this.data.list.longitude].values[no];
            if ($lat !== 0 && $long !== 0) {
                var icon = this.getMarkerIcon(no);
                var marker = L.marker([$lat, $long], {icon: icon, riseOnHover: true, title: title});
                var $pop = $popup.replace(/&quot;/g, '"'); // replace quots in popup text
                marker.bindPopup($pop);
                marker.ramblers_id = no;
                var self = this;
                marker.on('popupopen', function (popup) {
                    var id = popup.sourceTarget.ramblers_id;
                    self.displayRecord(id);
                });
                marker.on('popupclose', function (popup) {
                    self.removeRecordDisplay();
                });
                this.cluster.markerList.push(marker);
            }
        };
        this.getMarkerIcon = function (no) {
            var icon = this.defaultIcon;
            if (this.data.displayOptions === null) {
                return icon;
            }
            var icons = this.data.displayOptions.icons;
            if (icons) {
                if (icons.type && icons.column) {
                    var title = icons.column;
                    this.data.list.items.forEach(item => {
                        if (item.name === icons.column) {
                            title = item.values[no];
                        }
                    });
                    switch (icons.type) {
                        case "text":
                            xclass = icons.class;
                            var xclass = "ra-table-text-marker";
                            if (icons.class) {
                                xclass = icons.class;
                            }
                            icon = L.divIcon({className: xclass, iconSize: null, html: title, popupAnchor: [10, 30]});
                        case "icon":
                            xclass = icons.class;
                            var xclass = "ra-table-text-marker";
                            if (icons.class) {
                                xclass = icons.class;
                            }
                            if (icons.values) {
                                if (icons.values[title]) {
                                    icon = L.icon({
                                        iconUrl: ra.baseDirectory() + icons.values[title],
                                        iconSize: [33, 50],
                                        iconAnchor: [16, 47],
                                        popupAnchor: [0, -44]
                                    });
                                }
                            }
                    }
                }
            }
            return icon;
        };
        this.displayRecord = function (no) {
            var $details;
            $details = "<div style='font-size:120%'>";
            var items = this.data.list.items;
            for (var index = 0; index < items.length; ++index) {
                if (items[index].values[no] !== "") {
                    $details += this.displayItem(items[index].name, items[index].type, items[index].values[no]);
                }
            }
            $details += "</div>";
            this.elements.tablerecord.innerHTML = $details;
        };
        this.removeRecordDisplay = function () {
            this.elements.tablerecord.innerHTML = "";
        };
        this.selectMarker = function (event) {
            var no = parseInt(event.target.getAttribute('data-marker-number'));
            this.ra_format('Map');
            for (var index = 0; index < this.cluster.markerList.length; ++index) {
                var marker = this.cluster.markerList[index];
                if (marker.ramblers_id === no) {
                    this.cluster.markersCG.zoomToShowLayer(marker, this.openPopup(marker));
                    this.map.panTo(marker.getLatLng());
                }
            }
        };
        this.displayItem = function (name, type, value) {
            var out = "";
            if (name !== null)
                out = "<b>" + name + ": </b>";
            switch (type) {
                case 'link':
                    return out + '<a href="' + value + '" target="_blank">Link</a><br/>';
                case 'textlink':
                    return  out + '<a href="' + value + '" target="_blank">' + value + '</a><br/>';
                case 'exturl':
                    if (!value.includes("://")) {
                        return  out + '<a href="https://' + value + '" target="_blank">' + value + '</a><br/>';
                    }
                    return  out + '<a href="' + value + '" target="_blank">' + value + '</a><br/>';
                default:
                    return out + value + '<br/>';
            }
        };
        this.openPopup = function (marker) {
            setTimeout(function () {
                marker.openPopup();
            }, 500);
        };

        this.ra_format = function (option) {
            this.elements.map.classList.remove('active');
            this.elements.list.classList.remove('active');
            switch (option) {
                case 'List':
                    this.elements.list.classList.add('active');
                    this.elements.tablemap.style.display = "none";
                    this.elements.tablelist.style.display = "inline";
                    this.myjplist.updateControls();
                    break;
                case 'Map':
                    this.elements.map.classList.add('active');
                    this.elements.tablelist.style.display = "none";
                    this.elements.tablemap.style.display = "inline";
                    this.map.invalidateSize();
                    break;
            }
        };
        this.addPagination = function (no, tag) {

            this.myjplist.addPagination(no, tag, "pagination1", 20);

        };
        this.jplistFilter = function (item) {
            var min, max;
            if (item.type === "number") {

                var result = item.values.map(Number);
                min = result.reduce(function (a, b) {
                    return Math.min(a, b);
                }, 99999);
                max = result.reduce(function (a, b) {
                    return Math.max(a, b);
                }, -99999);
            }
            return this.myjplist.addFilter(item.jpclass, item.name, item.type, min, max);
        };

    };
    return tableList;
}
()); 