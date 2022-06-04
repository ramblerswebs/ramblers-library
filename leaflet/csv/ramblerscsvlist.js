var L, ra, jplist, OsGridRef;
if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.display) === "undefined") {
    ra.display = {};
}
ra.display.csvList = (function () {
    var csvList = {};

    csvList.display = function (options,data) {
        this.list = null;
        this.options = options;  
        this.data = data;
        //this.paginationDefault = 10;
        
        this.load = function ( ) {
            this.dataGroup = ra.uniqueID();
            this.myjplist = new ra.jplist(this.dataGroup);
            var tags = [
                {name: 'table', parent: 'root', tag: 'table', attrs: {class: 'ra-tab-options'}},
                {name: 'row', parent: 'table', tag: 'tr'},
                {name: 'map', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'Map'},
                {name: 'list', parent: 'row', tag: 'td', attrs: {class: 'ra-tab active'}, textContent: 'List'},
                {name: 'gpxouter', parent: 'root', tag: 'div', attrs: {class: 'gpxouter'}},
                {name: 'csvmap', parent: 'gpxouter', tag: 'div', style: {display: 'none'}},
                {name: 'csvrecord', parent: 'gpxouter', tag: 'div'},
                {name: 'csvlist', parent: 'gpxouter', tag: 'div'},
                {name: 'csvFilter', parent: 'csvlist', tag: 'div', attrs: {class: 'csvFilter'}, textContent: 'Program loading: please give this a minute or so.If this does not vanish then please contact the web master!'},
                {name: 'raPagination1', parent: 'csvlist', tag: 'div'},
                {name: 'dataTab', parent: 'csvlist', tag: 'div'}
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
            this.displayCsvData();
        };

        this.displayCsvData = function () {
            this.addPagination(this.data.list.rows, this.elements.raPagination1);
            this.testForMap();
            this.displayCSVTable();

            if (this.displayMap) {
                this.lmap = new ra.leafletmap(this.elements.csvmap, this.options);
                this.map = this.lmap.map;
                this.cluster = new cluster(this.map);
                this.ra_format("Map");
                this.map.invalidateSize();
                this.addCSVMarkers();
            }

            this.myjplist.init('ra-csv-list');
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
            table.setAttribute('class', "csvdetails");
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
            this.elements.csvFilter.innerHTML = filter;
        };

        this.displayCSVRows = function (tag) {
            var no, index;
            var item;
            for (no = 0; no < this.data.list.rows; ++no) {
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
                        switch (item.type) {
                            case "link":
                                if (item.values[no] !== "") {
                                    td.innerHTML = " <a href='" + item.values[no] + "' target='_blank'>Link</a>";
                                }
                                break;
                            case "number":
                                td.innerHTML = item.values[no];
                                break;
                            default:
                                td.innerHTML = item.values[no];
                        }
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
                ;
            }
            return;
        };

        this.addCSVMarkers = function () {
            for (var index = 0; index < this.data.list.rows; ++index) {
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
                        if (items[index].type === "link") {
                            $popup += '<b>' + items[index].name + ': </b><a href="' + items[index].values[no] + '" target="_blank">Link</a><br/>';
                        } else {
                            $popup += '<b>' + items[index].name + ': </b>' + items[index].values[no] + '<br/>';
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
                var icon = L.icon({
                    iconUrl: ra.baseDirectory() + "libraries/ramblers/images/marker-route.png",
                    iconSize: [33, 50],
                    iconAnchor: [16, 47],
                    popupAnchor: [0, -44]
                });
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
        this.displayRecord = function (no) {
            var $details;
            $details = "<div style='font-size:120%'>";
            var items = this.data.list.items;
            for (var index = 0; index < items.length; ++index) {
                if (items[index].values[no] !== "") {
                    if (items[index].type === "link") {
                        $details += '<b>' + items[index].name + ': </b><a href="' + items[index].values[no] + '" target="_blank">Link</a><br/>';
                    } else {
                        $details += '<b>' + items[index].name + ': </b>' + items[index].values[no] + '<br/>';
                    }
                }
            }
            $details += "</div>";
            this.elements.csvrecord.innerHTML = $details;
        };
        this.removeRecordDisplay = function () {
            this.elements.csvrecord.innerHTML = "";
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
                    this.elements.csvmap.style.display = "none";
                    this.elements.csvlist.style.display = "inline";
                    this.myjplist.updateControls();
                    break;
                case 'Map':
                    this.elements.map.classList.add('active');
                    this.elements.csvlist.style.display = "none";
                    this.elements.csvmap.style.display = "inline";
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
    return csvList;
}
());