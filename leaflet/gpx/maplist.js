/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var L, ra, jplist;
if (typeof (ra) === "undefined") {
    ra = {};
}
ra.gpx = (function () {
    var gpx = {};
    gpx.displayGPX = function (lmap, data) {
        var file = data.gpxfile;
        var linecolour = data.linecolour;
        var imperial = data.imperial;
        var detailsDivId = data.detailsDivId;
        /////////////////////////
        var _map = lmap.map;
        var el = lmap.elevationControl();
        var g = new L.GPX(ra.baseDirectory() + file, {async: true,
            polyline_options: {color: linecolour},
            marker_options: {
                startIconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/route-start.png',
                endIconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/route-end.png',
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
                        iconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/redmarker.png',
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
        g.on('loaded', function (e) {
            _map.fitBounds(e.target.getBounds(), {padding: [20, 20]});
            gpx.displayGpxdetails(g, detailsDivId);
        });
        g.addTo(_map);
    };
    gpx.displayGpxdetails = function (g, divId) {
        if (document.getElementById(divId) !== null) {
            var info = g._info;
            var header = "";
            if (info !== "undefined" && info !== null) {
                if (info.name !== "undefined" && info.name !== null) {
                    header = '<b>Name:</b> ' + info.name + "<br/>";
                }
                header += '<b>Distance:</b> ' + ra.map.getGPXDistance(info.length) + '<br/>';
                if (info.desc !== "undefined" && info.desc !== null) {
                    header += '<b>Description:</b> ' + info.desc + '<br/>';
                }
                if (info.elevation.gain === 0) {
                    header += "No elevation data<br/>";
                } else {
                    header += '<b>Min Altitude:</b> ' + info.elevation.min.toFixed(0) + ' m<br/>';
                    header += '<b>Max Altitude:</b> ' + info.elevation.max.toFixed(0) + ' m<br/>';
                    header += '<b>Elevation Gain:</b> ' + info.elevation.gain.toFixed(0) + ' m<br/>';
                }
                header += "<b>Est time:</b> " + ra.math.naismith(info.length, info.elevation.gain);
                document.getElementById(divId).innerHTML = header;
                //////////////////////////////////////////////
            }
        }
    };
    return gpx;
}
());
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
function gpxFolderDisplay(options) {
    this._map = null;
    this.options = options;
    this.base = ra.baseDirectory();
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
        {name: 'map', parent: 'row', tag: 'td', attrs: {class: 'ra-tab active', id: 'Map'}, textContent: 'Map'},
        {name: 'list', parent: 'row', tag: 'td', attrs: {class: 'ra-tab', id: 'List'}, textContent: 'List'},
        {name: 'gpxouter', parent: 'root', tag: 'div', attrs: {id: 'gpxouter'}},
        {name: 'gpxmap', parent: 'gpxouter', tag: 'div', attrs: {id: 'gpxmap'}},
        {parent: 'gpxmap', tag: 'p'},
        {name: 'gpxheader', parent: 'gpxmap', tag: 'div'},
        {parent: 'gpxmap', tag: 'h4', textContent: 'Click on any walk to see summary, click on title to display route'},
        {name: 'gpxlist', parent: 'gpxouter', tag: 'div', attrs: {id: 'gpxlist'}, style: {display: 'none'}},
        {parent: 'gpxlist', tag: 'div', attrs: {id: 'ra-pagination1'}},
        {name: 'tableDiv', parent: 'gpxlist', tag: 'div', attrs: {textContent: 'Program loading: please give this a minute or so. If this does not vanish then please contact the web master!'}}
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
    this.lmap = new leafletMap(this.elements.gpxmap, options);
    this._map = this.lmap.map;
    this.el = this.lmap.elevationControl();
    this.gpx = null;
    this.cluster = new cluster(this._map);
    this._map.on('popupopen', function () {
        var tabs = document.querySelectorAll('.leaflet-popup-content div[data-route-id]');
        for (var i = 0; i < tabs.length; ++i) {
            tabs[i].addEventListener("click", function () {
                var id = this.getAttribute('data-route-id');
                _this.updateGPXid(id);
            });
        }
    });
    this.displayData = function (data) {
        this.setData(data);
        ra.html.setTag('ra-pagination1', this.addPagination());
        this.displayGPXTable();
        this.addGPXMarkers();
        this.addRouteEvents();
        if (ra.isES6()) {
            jplist.init({
                storage: 'cookies', //'localStorage', 'sessionStorage' or 'cookies'
                storageName: 'my-page-storage' //the same storage name can be used to share storage between multiple pages
            });
        }
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
        document.getElementById(option).classList.add('active');
        switch (option) {
            case 'List':
                this.elements.gpxmap.style.display = "none";
                this.elements.gpxlist.style.display = "inline";
                break;
            case 'Map':
                this.elements.gpxlist.style.display = "none";
                this.elements.gpxmap.style.display = "inline";
                this._map.invalidateSize();
                break;
        }
    };
    this.displayGPXName = function (route) {
        var link = '<b><div data-route-id="' + route.id + '">' + route.title + '</div></b>';
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
        if (tag !== null) {
            var tags = [
                {name: 'table', parent: 'root', tag: 'table', attrs: {id: 'gpxdetails'}},
                {name: 'thead', parent: 'table', tag: 'thead'},
                {name: 'headings', parent: 'thead', tag: 'tr'}];
            if (this.controls.displayAsPreviousWalks) {
                tags.push({parent: 'headings', tag: 'th', attrs: {class: 'alignleft'}, textContent: 'Date'});
                tags.push({parent: 'headings', tag: 'th', attrs: {class: 'alignleft'}, textContent: 'Leader'});
            }
            tags.push(
                    {name: 'title', parent: 'headings', tag: 'th', attrs: {class: 'alignleft'}, textContent: 'Title'},
                    {name: 'distance', parent: 'headings', tag: 'th', attrs: {class: 'alignleft'}, textContent: 'Distance Km'},
                    {parent: 'headings', tag: 'th', attrs: {class: 'alignleft'}, textContent: 'Miles'},
                    {parent: 'headings', tag: 'th', attrs: {class: 'alignleft'}, textContent: 'min Altitude'},
                    {parent: 'headings', tag: 'th', attrs: {class: 'alignleft'}, textContent: 'max Altitude'},
                    {name: 'elevation', parent: 'headings', tag: 'th', attrs: {class: 'alignleft'}, textContent: 'Elevation Gain'},
                    );
            if (this.controls.download > 0) {
                tags.push({parent: 'headings', tag: 'th', attrs: {class: 'alignleft'}, textContent: 'GPX'});
            }
            tags.push({name: 'tbody', parent: 'table', tag: 'tbody'});
            var eles = ra.html.generateTags(tag, tags);
            ra.jplist.sortButton(eles.title, "group1", 'wTitle', 'text', "asc", "▲");
            ra.jplist.sortButton(eles.title, "group1", 'wTitle', 'text', "desc", "▼");
            ra.jplist.sortButton(eles.distance, "group1", 'wDistance', 'number', "asc", "▲");
            ra.jplist.sortButton(eles.distance, "group1", 'wDistance', 'number', "desc", "▼");
            ra.jplist.sortButton(eles.elevation, "group1", 'wElevation', 'number', "asc", "▲");
            ra.jplist.sortButton(eles.elevation, "group1", 'wElevation', 'number', "desc", "▼");
            out = "";
            eles.tbody.setAttribute('data-jplist-group', 'group1');
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
        header += "<button style='float:right' class=\"link-button button-p5565 small white\" onclick=\"ra.html.showhide(event, 'gpxDetails')\">Show/Hide Details</button><div id='gpxDetails'><span>";
        if (this.controls.displayAsPreviousWalks) {
            header += '<b>Date:</b> ' + route.date + '<br/>';
            header += '<b>Leader:</b> ' + route.author + '<br/>';
        }
        header += '<b>Distance:</b> ' + ra.map.getGPXDistance(route.distance) + '<br/>';
        if (route.description !== '') {
            header += '<b>Description:</b> ' + route.description + '<br/>';
        }
        header += this.formatAltitude(route);
        header += "<b>Est time <a href=\"https://maphelp.ramblers-webs.org.uk/naismith.html\" target='_blank'>(Naismith)</a>:</b> " + ra.math.naismith(route.distance, route.cumulativeElevationGain) + '<br/>';
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
                startIconUrl: this.base + 'libraries/ramblers/leaflet/images/route-start.png',
                endIconUrl: this.base + 'libraries/ramblers/leaflet/images/route-end.png',
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
                        iconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/redmarker.png',
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
            link = "<a href='" + path + "'><img  alt='gpx' src='" + ra.baseDirectory() + "libraries/ramblers/images/orange-gpx-32.png' width='20' height='20'></a>";
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
    this.addPagination = function () {
        if (!ra.isES6()) {
            return "<h3 class='oldBrowser'>You are using an old Web Browser!</h3><p class='oldBrowser'>We suggest you upgrade to a more modern Web browser, Chrome, Firefox, Safari,...</p>";
        }
        var $div = '</span> \
<input class="ra-route-search" \
     data-jplist-control="textbox-filter" \
     data-group="group1" \
     data-name="my-filter-1" \
     data-path=".wTitle" \
     data-clear-btn-id="title-clear-btn" \
     type="text" \
     value="" \
     placeholder="Filter by Title" \
/>                \
<button type="button" id="title-clear-btn">Clear</button> \
</span></div><div class="clear"></div>\
<div data-jplist-control=\"pagination\" \
            data-group=\"group1\" \
            data-items-per-page=\"20\" \
            data-current-page=\"0\" \
            data-name=\"pagination1\"> \
            <span data-type=\"info\"> \
            {startItem} - {endItem} of {itemsNumber} \
            </span> ';
        var $display = "";
        if (this.routes.length < 15) {
            $display = ' style=\"display:none;\" ';
        }
        $div += '  <span' + $display + '> \
            <button type=\"button\" data-type=\"first\">First</button> \
            <button type=\"button\" data-type=\"prev\">Previous</button> \
            <span class=\"jplist-holder\" data-type=\"pages\"> \
                <button type=\"button\" data-type=\"page\">{pageNumber}</button> \
            </span> \
            <button type=\"button\" data-type=\"next\">Next</button> \
            <button type=\"button\" data-type=\"last\">Last</button> \
            </span> \
            <!-- items per page select --> \
    <select data-type=\"items-per-page\"' + $display + '> \
        <option value=\"10\"> 10 per page </option> \
        <option value=\"20\"> 20 per page </option> \
        <option value=\"30\"> 30 per page </option> \
        <option value=\"0\"> view all </option> \
    </select> ';
        $div += '</div> ';
        return $div;
    };
}