var L, ra, jplist, OsGridRef;
if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.display) === "undefined") {
    ra.display = {};
}
ra.display.gpxSingle = function (options, data) {

    this.data = data;
    var masterdiv = document.getElementById(options.divId);
    this.lmap = new ra.leafletmap(masterdiv, options);
    this.load = function () {
        var data = this.data;
        var file = data.gpxfile;
        var linecolour = data.linecolour;
        var imperial = data.imperial;
        var detailsDivId = data.detailsDivId;
        /////////////////////////
        var _map = this.lmap.map;
        var el = this.lmap.elevationControl();
        var g = new L.GPX(ra.baseDirectory() + file, {async: true,
            polyline_options: {color: linecolour},
            marker_options: {
                startIconUrl: ra.baseDirectory() + 'media/lib_ramblers/leaflet/images/route-start.png',
                endIconUrl: ra.baseDirectory() + 'media/lib_ramblers/leaflet/images/route-end.png',
                shadowUrl: null,
                iconSize: [20, 20], // size of the icon
                iconAnchor: [10, 10]
            }});
        g.on('addline', function (e) {
            el.addData(e.line);
        });
        g.on('addpoint', function (e) {
            var marker = e.point;
            switch (e.point_type) {
                case "waypoint":
                    var icon = L.icon({
                        iconUrl: ra.baseDirectory() + 'media/lib_ramblers/leaflet/images/redmarker.png',
                        iconSize: [36, 41], // size of the icon
                        iconAnchor: [18, 41],
                        popupAnchor: [0, -20]
                    });
                    marker.setIcon(icon);
                    var sSymbol = marker.options.iconkey;
                    ra.map.icon.setMarker(marker, sSymbol);
                    break;
                case "start":
                    L.setOptions(marker, {title: "Start location"});
                    break;
                case "end":
                    L.setOptions(marker, {title: "End location"});
                    break;
            }
            L.setOptions(marker, {riseOnHover: true});
        });
        var _this = this;
        g.on('loaded', function (e) {
            _map.fitBounds(e.target.getBounds(), {padding: [20, 20]});
            _this.displayGpxdetails(g, detailsDivId);
            var clear = document.createElement('div');
            clear.classList.add("clearBoth");
            _this.pageDiv.appendChild(clear);
            const collection = document.getElementsByClassName("leaflet-control-container");
            const ele = collection[0].getElementsByClassName("elevation");
            var elevation = ele[0];
            var svg = elevation.childNodes[1];
            var clone = svg.cloneNode(true);
            var holder = document.createElement('div');
            holder.classList.add("elevation");
            holder.classList.add("steelblue-theme");
            holder.classList.add("leaflet-control");
            _this.pageDiv.appendChild(holder);
            holder.appendChild(clone);
            var clear = document.createElement('div');
            clear.classList.add("clearBoth");
            _this.pageDiv.appendChild(clear);
        });
        g.addTo(_map);

    };
    this.displayGpxdetails = function (g, divId) {
        var container = document.getElementById(divId);

        if (container !== null) {
            var titleDiv = document.createElement('div');
            titleDiv.setAttribute("leaflet-browser-print-content", true);
            titleDiv.innerHTML = "";
            container.appendChild(titleDiv);
            var pageDiv = document.createElement('div');
            pageDiv.setAttribute("leaflet-browser-print-pages", true);
            container.appendChild(pageDiv);
            var info = g._info;
            var header = "";
            if (info !== "undefined" && info !== null) {
                if (info.name !== "undefined" && info.name !== null) {
                    header = '<b>Name:</b> ' + info.name + "<br/>";
                }
                header += '<b>Distance:</b> ' + ra.map.getGPXDistance(info.length) + '<br/>';
                if (info.desc) {
                    header += '<b>Description:</b> ' + info.desc + '<br/>';
                }
                if (info.elevation.gain === 0) {
                    header += "No elevation data<br/>";
                } else {
                    header += '<b>Min Altitude:</b> ' + info.elevation.min.toFixed(0) + ' m<br/>';
                    header += '<b>Max Altitude:</b> ' + info.elevation.max.toFixed(0) + ' m<br/>';
                    header += '<b>Elevation Gain:</b> ' + info.elevation.gain.toFixed(0) + ' m<br/>';
                }
                header += "<b>Est time:</b> " + ra.math.naismith(info.length, info.elevation.gain) + '<br/>';
                if (typeof info.duration !== "undefined") {
                    var duration = info.duration;
                    if (typeof duration.total !== "undefined") {
                        if (duration.total !== null) {
                            var actual = duration.total / 1000;
                            header += "<b>Actual Time:</b> " + ra.time.secsToHrsMins(actual) + '<br/>';
                        }
                    }
                }
                pageDiv.innerHTML = header;
                this.pageDiv = pageDiv;
            }
        }
    };
};
ra.display.gpxGetElevationSVG = function () {
    const collection = document.getElementsByClassName("leaflet-control-container");
    const ele = collection[0].getElementsByClassName("elevation");
    var elevation = ele[0];
    var svg = elevation.childNodes[1];
    return svg;
};
ra.display.gpxGetElevationSVGCopy = function (svg, tag) {
    var clear = document.createElement('div');
    clear.classList.add("clearBoth");
    tag.appendChild(clear);
    var clone = svg.cloneNode(true);
    var holder = document.createElement('div');
    holder.classList.add("elevation");
    holder.classList.add("steelblue-theme");
    holder.classList.add("leaflet-control");
    tag.appendChild(holder);
    holder.appendChild(clone);
    var clear = document.createElement('div');
    clear.classList.add("clearBoth");
    tag.appendChild(clear);
};

ra.display.gpxFolder = function (options, data) {

    this._map = null;
    this.options = options;
    this.base = ra.baseDirectory();
    this.jplistgroup = ra.uniqueID();
    this.myjplist = new ra.jplist(this.jplistgroup);
    this.controls = {
        folder: null,
        linecolour: "#782327",
        dateorder: false,
        authororder: false,
        distorder: false,
        titleorder: false,
        gainorder: false,
        download: 0,
        elevation: null,
        description: true,
        displayAsPreviousWalks: false,
        gpx: null,
        searchtext: ''
    };
    var tags1 = [
        {name: 'table', parent: 'root', tag: 'table', attrs: {class: 'ra-tab-options'}},
        {name: 'row', parent: 'table', tag: 'tr'},
        {name: 'map', parent: 'row', tag: 'td', attrs: {class: 'ra-tab active'}, textContent: 'Map'},
        {name: 'list', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'List'},
        {name: 'gpxouter', parent: 'root', tag: 'div', attrs: {class: 'gpxouter'}},
        {name: 'gpxmap', parent: 'gpxouter', tag: 'div'},
        {parent: 'gpxmap', tag: 'p'},
        {name: 'gpxheader', parent: 'gpxmap', tag: 'div'},
        {parent: 'gpxmap', tag: 'h4', textContent: 'Click on any walk to see summary, click on title to display route'},
        {name: 'gpxlist', parent: 'gpxouter', tag: 'div', style: {display: 'none'}},
        {name: 'filters', parent: 'gpxlist', tag: 'div'},
        {name: 'pagination', parent: 'gpxlist', tag: 'div'},
        {name: 'tableDiv', parent: 'gpxlist', tag: 'div', textContent: 'Program loading: please give this a minute or so. If this does not vanish then please contact the web master!'}
    ];
    this.routes = null;
    this.masterdiv = document.getElementById(options.divId);
    this.elements = ra.html.generateTags(this.masterdiv, tags1);
    var _this = this;
    this.elements.map.addEventListener("click", function () {
        _this.ra_format('Map');
    });
    this.elements.list.addEventListener("click", function () {
        _this.ra_format('List');
    });
    this.lmap = new ra.leafletmap(this.elements.gpxmap, options);
    this._map = this.lmap.map;
    this.el = this.lmap.elevationControl();
    this.gpx = null;
    this.cluster = new ra.map.cluster(this._map);
    this._map.on('popupopen', function () {
        var tabs = document.querySelectorAll('.leaflet-popup-content div[data-route-id]');
        for (var i = 0; i < tabs.length; ++i) {
            tabs[i].addEventListener("click", function () {
                var id = this.getAttribute('data-route-id');
                _this.updateGPXid(id);
            });
        }
    });
    this.data = data;

    this.load = function () {
        this.setData(this.data);
        this.addFilters(this.elements.filters);
        this.addPagination(this.routes.length, this.elements.pagination);
        this.displayGPXTable();
        this.addGPXMarkers();
        this.addRouteEvents();

        this.myjplist.init('ra-gpx-list');
        this.myjplist.updateControls();

    };
    this.setData = function (data) {
        this.routes = data.items;
        this.controls.folder = data.folder;
        this.controls.linecolour = data.linecolour;
        this.controls.displayAsPreviousWalks = data.displayAsPreviousWalks;
        this.controls.download = data.download;
    };
    this.ra_format = function (option) {
        this.elements.map.classList.remove('active');
        this.elements.list.classList.remove('active');

        switch (option) {
            case 'List':
                this.elements.list.classList.add('active');
                this.elements.gpxmap.style.display = "none";
                this.elements.gpxlist.style.display = "inline";
                this.myjplist.updateControls();
                break;
            case 'Map':
                this.elements.map.classList.add('active');
                this.elements.gpxlist.style.display = "none";
                this.elements.gpxmap.style.display = "inline";
                this._map.invalidateSize();
                break;
        }
    };
    this.displayGPXName = function (route) {
        var link = '<b><div data-route-id="' + route.id + '" class="pointer">' + route.title + '</div></b>';
        return link;
    };
    this.addRouteEvents = function () {
        var i;
        var _this = this;
        var tabs = document.querySelectorAll('div[data-route-id]');
        for (var i = 0; i < tabs.length; ++i) {
            tabs[i].addEventListener("click", function () {
                var id = this.getAttribute('data-route-id');
                _this.updateGPXid(id);
            });
        }
    };
    this.displayGPXTable = function () {
        var out, index;
        var tag;
        //  var extra = "";
        tag = this.elements.tableDiv;
        tag.innerHTML = '';
        if (tag !== null) {
            var tags = [
                {name: 'table', parent: 'root', tag: 'table', attrs: {id: 'gpxdetails'}},
                {name: 'thead', parent: 'table', tag: 'thead'},
                {name: 'headings', parent: 'thead', tag: 'tr'}];
            if (this.controls.displayAsPreviousWalks) {
                tags.push({name: 'date', parent: 'headings', tag: 'th', attrs: {class: 'alignleft'}, textContent: 'Date'});
                tags.push({name: 'leader', parent: 'headings', tag: 'th', attrs: {class: 'alignleft'}, textContent: 'Leader'});
            }
            tags.push(
                    {name: 'title', parent: 'headings', tag: 'th', attrs: {class: 'alignleft'}, textContent: 'Title'},
                    {name: 'distance', parent: 'headings', tag: 'th', attrs: {class: ''}, textContent: 'Distance Km'},
                    {parent: 'headings', tag: 'th', attrs: {class: ''}, textContent: 'Miles'},
                    {parent: 'headings', tag: 'th', attrs: {class: ''}, textContent: 'min Altitude(m)'},
                    {parent: 'headings', tag: 'th', attrs: {class: ''}, textContent: 'max Altitude(m)'},
                    {name: 'elevation', parent: 'headings', tag: 'th', attrs: {class: ''}, textContent: 'Elevation Gain(m)'},
                    );
            if (this.controls.download > 0) {
                tags.push({parent: 'headings', tag: 'th', attrs: {class: ''}, textContent: 'GPX'});
            }
            tags.push({name: 'tbody', parent: 'table', tag: 'tbody'});
            var eles = ra.html.generateTags(tag, tags);
            if (this.controls.displayAsPreviousWalks) {
                this.myjplist.sortButton(eles.date, 'wDate', 'date', "asc", "▲");
                this.myjplist.sortButton(eles.date, 'wDate', 'date', "desc", "▼");
                this.myjplist.sortButton(eles.leader, 'wAuthor', 'text', "asc", "▲");
                this.myjplist.sortButton(eles.leader, 'wAuthor', 'text', "desc", "▼");
            }
            this.myjplist.sortButton(eles.title, 'wTitle', 'text', "asc", "▲");
            this.myjplist.sortButton(eles.title, 'wTitle', 'text', "desc", "▼");
            this.myjplist.sortButton(eles.distance, 'wDistance', 'number', "asc", "▲");
            this.myjplist.sortButton(eles.distance, 'wDistance', 'number', "desc", "▼");
            this.myjplist.sortButton(eles.elevation, 'wElevation', 'number', "asc", "▲");
            this.myjplist.sortButton(eles.elevation, 'wElevation', 'number', "desc", "▼");
            out = "";
            eles.tbody.setAttribute('data-jplist-group', this.jplistgroup);
            for (index = 0; index < this.routes.length; ++index) {
                var route = this.routes[index];
                if (this.displayRoute(route)) {
                    out += this.displayGPXRow(route);
                }
            }

            if (this.controls.download === 1) {
                var ele = document.createElement('p');
                tag.appendChild(ele);
                ele.textContent = "* To be able to download GPX Routes, you need to log on to our web site.";
            }
            eles.tbody.innerHTML = out;
        }
    };
    this.displayGPXRow = function (route) {
        var link = '<tr data-jplist-item>';
        if (this.controls.displayAsPreviousWalks) {
            link += '<td class="wDate"><b>' + route.date + '</b></td>';
            link += '<td class="wAuthor alignleft">' + route.author + '</td>';
        }
        link += '<td class="wTitle alignleft">' + this.displayGPXName(route) + '</td>';
        link += '<td class="wDistance">' + (route.distance / 1000).toFixed(1) + '</td>';
        link += '<td>' + ra.units.metresToMi(route.distance).toFixed(2) + '</td>';
        if (route.cumulativeElevationGain === 0) {
            link += '<td>...</td>';
            link += '<td>...</td>';
            link += '<td class="wElevation">...</td>';
        } else {
            link += '<td>' + route.minAltitude.toFixed(0) + '</td>';
            link += '<td>' + route.maxAltitude.toFixed(0) + '</td>';
            link += '<td class="wElevation">' + route.cumulativeElevationGain.toFixed(0) + '</td>';
        }
        if (this.controls.download > 0) {
            link += '<td>' + this.getGPXdownloadLink(route) + '</td>';
        }
        link += '</tr>';
        return link;
    };
    this.updateGPXid = function (sid) {
        var id = parseInt(sid);
        this.ra_format("Map");
        var header, path;
        var route = this.getRoutefromID(id);
        header = "<h2>" + route.title + "</h2>";
        header += "<button style='float:right' class=\"link-button sunset small white\" onclick=\"javascript:ra.html.showhide(event, 'gpxDetails')\">Show/Hide Details</button><div id='gpxDetails'><span>";
        if (this.controls.displayAsPreviousWalks) {
            header += '<b>Date:</b> ' + route.date + '<br/>';
            header += '<b>Leader:</b> ' + route.author + '<br/>';
        }
        header += '<b>Distance:</b> ' + ra.map.getGPXDistance(route.distance) + '<br/>';
        if (route.description !== '') {
            header += '<b>Description:</b> ' + route.description + '<br/>';
        }
        var p = new LatLon(route.latitude, route.longitude);
        var grid = OsGridRef.latLonToOsGrid(p);
        header += '<b>Start:</b> ' + grid.toString(6) + '<br/>';
        if (route.endLatitude !== undefined && route.endLongitude !== undefined) {
            if (route.endLatitude !== 0 && route.endLongitude !== 0) {
                var p = new LatLon(route.endLatitude, route.endLongitude);
                var grid = OsGridRef.latLonToOsGrid(p);
                header += '<b>End:</b> ' + grid.toString(6) + '<br/>';
            }
        }
        header += this.formatAltitude(route);
        header += "<b>Est time <a href=\"" + ra.map.helpNaismith + "\" target='_blank'>(Naismith)</a>:</b> " + ra.math.naismith(route.distance, route.cumulativeElevationGain) + '<br/>';
        if (route.duration !== 0) {
            header += "<b>Actual Time:</b> " + ra.time.secsToHrsMins(route.duration) + '<br/>';
        }
        if (this.controls.download > 0) {
            header += "<b>Download route:</b> " + this.getGPXdownloadLink(route) + '<br/>';
            if (this.controls.download === 1) {
                header += "* To be able to download GPX Routes, you need to log on to our web site.<br/>";
            }
        }
        if (route.tracks > 0) {
            header += "<b>Tracks:</b> " + route.tracks.toFixed(0);
        }

        if (route.routes > 0) {
            header += "<b>Routes:</b> " + route.routes.toFixed(0);
        }

        header += "</div>";
        if (route.links !== undefined) {
            if (route.links.length > 0) {
                header += '<b>Links</b><ul>';
                for (var index = 0; index < route.links.length; ++index) {
                    var link = route.links[index];
                    var text = link.text;
                    if (text === "") {
                        text = link.href;
                    }
                    header += '<li><a href="' + link.href + '" target="_blank" >' + text + '</a>';
                }
                header += '</ul>';
            }
        }
        header += "</div>";
        path = this.controls.folder + "/" + route.filename;
        this.elements.gpxheader.innerHTML = header;
        var data = {};
        data.gpxfile = path;
        data.linecolour = this.controls.linecolour;
        data.imperial = 0;
        this.displayGPX(data);
        this.elements.gpxheader.scrollIntoView();
    };
    this.displayGPX = function (data) {
        var file = data.gpxfile;
        var linecolour = data.linecolour;
        var imperial = data.imperial;
        var detailsDivId = data.detailsDivId;
        var _this = this;
        // remove old gpx route and elevation
        this.el.clear();
        if (this.gpx !== null) {
            this.gpx.remove();
            this.gpx = null;
        }

        this.gpx = new L.GPX(this.base + file, {async: true,
            polyline_options: {color: linecolour},
            marker_options: {
                startIconUrl: this.base + 'media/lib_ramblers/leaflet/images/route-start.png',
                endIconUrl: this.base + 'media/lib_ramblers/leaflet/images/route-end.png',
                shadowUrl: null,
                iconSize: [20, 20], // size of the icon
                iconAnchor: [10, 10]
            }});
        this.gpx.on('addline', function (e) {
            _this.el.addData(e.line);
        });
        this.gpx.on('addpoint', function (e) {
            var marker = e.point;
            switch (e.point_type) {
                case "waypoint":
                    var icon = L.icon({
                        iconUrl: ra.baseDirectory() + 'media/lib_ramblers/leaflet/images/redmarker.png',
                        iconSize: [36, 41], // size of the icon
                        iconAnchor: [18, 41],
                        popupAnchor: [0, -20]
                    });
                    marker.setIcon(icon);
                    var sSymbol = marker.options.iconkey;
                    ra.map.icon.setMarker(marker, sSymbol);
                    break;
                case "start":
                    L.setOptions(marker, {title: "Start location"});
                    break;
                case "end":
                    L.setOptions(marker, {title: "End location"});
                    break;
            }
            L.setOptions(marker, {riseOnHover: true});
        });
        this.gpx.on('loaded', function (e) {
            _this._map.fitBounds(e.target.getBounds(), {padding: [20, 20]});
            _this._map.closePopup();
        });
        this.gpx.addTo(this._map);
    };
    this.getRoutefromID = function (id) {
        for (var index = 0; index < this.routes.length; ++index) {
            var route = this.routes[index];
            if (route.id === id) {
                return route;
            }
        }
        return null;
    };
    this.addGPXMarkers = function () {
        for (var index = 0; index < this.routes.length; ++index) {
            var route = this.routes[index];
            if (this.displayRoute(route)) {
                this.addGPXMarker(route);
            }
        }
        this.cluster.addClusterMarkers();
        this.cluster.zoomAll();
    };
    this.addGPXMarker = function (route) {
        var $popup, $lat, $long, title;
        title = route.title;
        $popup = "<div style='font-size:120%'>" + this.displayGPXName(route) + "</div>";
        $popup += '<b>Distance</b> - ' + ra.map.getGPXDistance(route.distance) + '<br/>';
        $popup += this.formatAltitude(route);
        $lat = route.latitude;
        $long = route.longitude;
        this.cluster.addMarker($popup, $lat, $long, {icon: ra.map.icon.markerRoute(), riseOnHover: true, title: title});
    };
    this.formatAltitude = function (route) {
        var text;
        text = "";
        if (route.cumulativeElevationGain === 0) {
            return "No elevation data<br/>";
        } else {
            text += '<b>Min Altitude:</b> ' + route.minAltitude.toFixed(0) + ' m<br/>';
            text += '<b>Max Altitude:</b> ' + route.maxAltitude.toFixed(0) + ' m<br/>';
            text += '<b>Elevation Gain:</b> ' + route.cumulativeElevationGain.toFixed(0) + ' m<br/>';
        }
        return text;
    };
    this.getGPXdownloadLink = function (route) {
        var path, link;
        link = "";
        if (this.controls.download === 1) {
            link = "*";
        }
        if (this.controls.download === 2) {
            path = ra.baseDirectory() + this.controls.folder + "/" + route.filename;
            link = "<a href='" + path + "'><img  alt='gpx' src='" + ra.baseDirectory() + "media/lib_ramblers/images/orange-gpx-32.png' width='20' height='20'></a>";
        }
        return link;
    };
    this.displayRoute = function (route) {
        if (this.controls.searchtext === '') {
            return true;
        }
        if (route.title.toLowerCase().includes(this.controls.searchtext)) {
            return true;
        }
        return false;
    };
    this.gpxsearch = function () {
        var x = document.getElementById("searchform");
        var text = "";
        var i, y;
        for (i = 0; i < x.length; i++) {
            text += x.elements[i].value;
            y = x.elements[i];
        }
        this.controls.searchtext = text.toLowerCase();
        this.displayTabs();
        this.cluster.removeClusterMarkers();
        this.addGPXMarkers();
        this.cluster.addClusterMarkers();
        return false;
    };
    this.addFilters = function (tag) {
        var out = '';
        out += this.myjplist.addFilter('wTitle', 'Title', 'text');
        var min, max;
        var result = this.routes;
        min = result.reduce(function (a, b) {
            var km = Math.floor(b.distance / 1000);
            return Math.min(a, km);
        }, 99999);
        max = result.reduce(function (a, b) {
            var km = Math.ceil(b.distance / 1000);
            return Math.max(a, km);
        }, -99999);
        out += this.myjplist.addFilter('wDistance', 'Distance Km', 'number', min, max);
        tag.innerHTML = out;

    };
    this.addPagination = function (no, tag) {
        this.myjplist.addPagination(no, tag, "pagination1", 20);
        return;
    };

};