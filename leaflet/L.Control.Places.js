var L, ra, OsGridRef;
L.Control.Places = L.Control.extend({
    options: {
        position: 'topright',
        separator: ', ',
        emptyString: 'Display previously used meeting and starting locations',
        cluster: false
    },
    _urlbase: 'https://placestest.walkinginfo.co.uk/',
    _test: false,
    _diagnosticslayer: null,
    _masterlayer: null,
    _placeslayer: null,
    _numberOfMarkers: [],
    onAdd: function (map) {
        if (this._test) {
            this._urlbase = 'http://localhost/mapplacesv4/';
        }
        this._map = map;
        this._container = L.DomUtil.create('div', 'leaflet-control-places');
        this._container.style.display = 'none';
        L.DomEvent.disableClickPropagation(this._container);
        this._addLayerControl();
        this._addProgressBar();
        this._createPlacesLayers();
        for (var i = 1; i < 6; i++) {
            this._numberOfMarkers[i].textContent = "  [0]";
        }
        var self = this;
        this._container.addEventListener("display-item-numbers", function (e) {
            for (var i = 1; i < 6; i++) {
                self._numberOfMarkers[i].textContent = "  [" + self._placeslayer[i].getLayers().length + "]";
            }
        });
        return this._container;
    },
    //   setOptions: function (options) {
    //       this.options = L.setOptions(this.options, options);
    //   },
    onRemove: function (map) {
        //  map.off('mousemove', this._update);
    },
    _addProgressBar() {
        var bar = document.getElementById("ra-cluster-progress-bar");
        if (bar === null) {
            var body = document.getElementsByTagName("BODY")[0];
            var div = document.createElement('div');
            div.setAttribute('id', 'ra-cluster-progress');
            body.appendChild(div);
            var progressBar = document.createElement('div');
            progressBar.setAttribute('id', 'ra-cluster-progress-bar');
            div.appendChild(progressBar);
            progressBar.style.display = "none";
        }
    },
    _initialiseProgressBar: function () {
        var progressBar = document.getElementById("ra-cluster-progress-bar");
        progressBar.innerHTML = "Retrieving data";
        progressBar.style.display = "block";
    },
    _closeProgressBar: function () {
        var progressBar = document.getElementById("ra-cluster-progress-bar");
        progressBar.style.display = "none";
    },
    _updateClusterProgressBar: function (processed, total, elapsed) {
        var progressBar = document.getElementById("ra-cluster-progress-bar");
        if (elapsed > 1000) {
            // if it takes more than a second to load, display the progress bar:
            progressBar.innerHTML = "Loading: " + Math.round(processed / total * 100) + "%";
            progressBar.style.display = "block";
        }
        if (processed === total) {
            progressBar.style.display = "none";// all markers processed - hide the progress bar:
        }
    },
    _createPlacesLayers: function () {
        this._diagnosticslayer = L.featureGroup([]);
        this._diagnosticslayer.addTo(this._map);
        if (this.options.cluster) {
            this._masterlayer = L.markerClusterGroup({
                disableClusteringAtZoom: 15,
                maxClusterRadius: 50});
        } else {
            this._masterlayer = L.featureGroup([]);
        }
        this._masterlayer.addTo(this._map);
        this._placeslayer = {};
        for (var i = 1; i < 6; i++) {
            this._placeslayer[i] = L.featureGroup.subGroup(this._masterlayer, []);
            this._placeslayer[i].addTo(this._map);
        }
    },
    _addClusteredPlaces: function () {
        for (var i = 1; i < 6; i++) {
            if (this.options.cluster) {
                this._map.addLayer(this._placeslayer[i]);
            }
        }
    },
    _addLayerControl: function () {
        var _this = this;
        var title = document.createElement('div');
        title.textContent = 'Meeting & Starting Places';
        this._container.appendChild(title);
        this.checkboxes = {};
        for (var i = 1; i < 6; i++) {
            var div = document.createElement('div');
            this._container.appendChild(div);
            div.setAttribute('class', ' ramblers-places-options');
            var check = document.createElement('input');
            this.checkboxes[i] = check;
            check.setAttribute('type', "checkbox");
            check.setAttribute('checked', true);
            check.setAttribute('data-id', i);
            check.addEventListener("change", function (e) {
                var state = e.target.checked;
                var id = parseInt(e.target.getAttribute('data-id'));
                if (state) {
                    _this._placeslayer[id].addTo(_this._map);
                } else {
                    _this._map.removeLayer(_this._placeslayer[id]);
                }
            });
            div.appendChild(check);
            var img = document.createElement('img');
            div.appendChild(img);
            img.setAttribute('src', ra.baseDirectory() + 'libraries/ramblers/leaflet/images/' + i + 'star.png');
            var desc = document.createElement('span');
            div.appendChild(desc);
            desc.textContent = '  ' + i + ' stars';
            var _numberOfMarkers = document.createElement('span');
            div.appendChild(_numberOfMarkers);
            this._numberOfMarkers[i] = _numberOfMarkers;
        }
        var extra = document.createElement('div');
        div.appendChild(extra);
//        var a = document.createElement('a');
//        a.setAttribute('href', 'https://maphelp.ramblers-webs.org.uk');
//        a.setAttribute('target', '_blank');
//        a.textContent = 'Help';
//        extra.appendChild(a);
    },
    clearLayers: function () {
        this._clearPlacesLayers();
        this._container.style.display = 'none';
    },
    _clearPlacesLayers: function () {
        if (this._masterlayer !== null) {
            this._masterlayer.clearLayers();
        }
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
    displayPlaces: function (locationOptions) {
        var _locationOptions = {location: {lat: 52, lng: -2},
            distance: 20,
            limit: 100
        };
        _locationOptions = L.setOptions(_locationOptions, locationOptions);
        this._clearPlacesLayers();
        this._initialiseProgressBar();
        this._container.style.display = 'inherit';
        var self = this;
        var p = new LatLon(_locationOptions.location.lat, _locationOptions.location.lng);
        var grid = OsGridRef.latLonToOsGrid(p);
        var gr = grid.toString(6);

        //    var desc = "<b><a href='https://maphelp.ramblers-webs.org.uk/startingplaces.html' target='_blanks'>Meeting/Starting Places</a><b>";

        if (gr !== "") {
            var east = Math.round(grid.easting);
            var north = Math.round(grid.northing);
            var limit = "&dist=" + _locationOptions.distance + "&maxpoints=" + _locationOptions.limit;
            var url = this._urlbase + "get.php?easting=" + east + "&northing=" + north + limit;
            ra.ajax.getJSON(url, function (err, items) {
                if (err !== null) {
                    self._closeProgressBar();
                    alert("Error: Sorry something went wrong: " + err);
                } else {
                    var no = items.length;
                    if (no === 0) {
                        self._closeProgressBar();
                        alert("No meeting/starting places found within " + _locationOptions.distance + "km");
                    } else {
                        self._processItems(items, 500);
                        var bounds = self._getPlacesBounds();
                        self._map.fitBounds(bounds, {padding: [50, 50]});
                    }
                }
                self._addClusteredPlaces();
            });
        } else {
            self._closeProgressBar();
            alert("Outside OS Grid");
        }
    },
    displayAllPlaces: function () {
        this._clearPlacesLayers();
        this._initialiseProgressBar();
        this._container.style.display = 'inherit';
        var self = this;
        this._addProgressBar();
        //     var desc = "<b><a href='https://maphelp.ramblers-webs.org.uk/startingplaces.html' target='_blanks'>Meeting/Starting Places</a><b>";
        var url = this._urlbase + "getall.php";
        ra.ajax.getJSON(url, function (err, items) {
            if (err !== null) {
                alert("Error: Something went wrong: " + err);
                self._closeProgressBar();
            } else {
                self._addClusteredPlaces();
                self._processItems(items, 1000);
            }
        });
    },
    _processItems: function (items, chunk) {
        var i = 0;
        var self = this;
        function processChunk() {
            self._processItemChucks(items, i * chunk, chunk);
            i++; // Increment the position
            if (i * chunk < items.length) { // If there are more items, schedule another
                setTimeout(processChunk, 20);
            }
        }
        processChunk(); // Print the first entry/char
    },
    _processItemChucks: function (items, start, number) {
        var no = 0;
        var i;
        for (i = start; i < items.length; i++) {
            var item = items[i];
            if (item.S > 0 && item.S < 6) {
                var marker;
                marker = this._getMarker(item.GR, item.S, item.Lat, item.Lng);
                this._placeslayer[item.S].addLayer(marker);
            }
            no += 1;
            if (no === number) {
                break;
            }
        }
        this._updateClusterProgressBar(i, items.length, 2000);
        let event = new Event("display-item-numbers", {bubbles: true}); // 
        this._container.dispatchEvent(event);
    },
    // starting or meeting place markers
    _getMarker: function ($gr, $no, $lat, $long) {
        var $icon;
        var self = this;
        switch ($no) {
            case 0:
                $icon = ra.map.icon.s0();
                break;
            case 1:
                $icon = ra.map.icon.s1();
                break;
            case 2:
                $icon = ra.map.icon.s2();
                break;
            case 3:
                $icon = ra.map.icon.s3();
                break;
            case 4:
                $icon = ra.map.icon.s4();
                break;
            case 5:
                $icon = ra.map.icon.s5();
                break;
        }

        var marker = L.marker([$lat, $long], {icon: $icon, gridref: $gr, no: $no, lat: $lat, long: $long, riseOnHover: true});
        marker.gr = $gr;
        var text = "<br/><b>Searching for usage details ...</b>";
        marker.bindPopup("<b>Grid Ref " + $gr + "</b><br/>Lat/Long " + $lat + " " + $long + text, {maxWidth: 800});
        marker.on('click', function (e) {
            var marker = e.target;
            var alt = e.originalEvent.altKey;
            var $url = self._urlbase + "details.php?gr=" + marker.gr;
            if (alt) {
                ra.ajax.getUrl($url, "", {marker: marker, places: self, gr: $gr}, self._displayDetailsDiagnostics);
            } else {
                ra.ajax.getUrl($url, "", {marker: marker, places: self, gr: $gr}, self._displayDetails);
            }
        }, marker);
        return marker;
    },
    _displayDetailsDiagnostics: function (data, result) {
        var _this = data.places;
        var json = JSON.parse(result);
        var items = json.records;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var circle = L.circleMarker([item.latitude, item.longitude], {radius: 5});
            _this._diagnosticslayer.addLayer(circle);
        }
    },
    _displayDetails: function (data, result) {
        var marker = data.marker;
        var starsUrl = marker.options.icon.options.iconUrl;
        var self = data.places;
        var gr = data.gr;
        var latlng = marker.getLatLng();
        var ll = new LatLon(latlng.lat, latlng.lng);
        var gr8 = OsGridRef.latLonToOsGrid(ll).toString(8);
        var json = JSON.parse(result);
        var div = document.createElement('div');
        div.appendChild(self._getMarkerHeading(starsUrl, gr));
        div.appendChild(self._getCorrectElement(gr, json.likes));
        div.appendChild(self._getIncorrectElement(gr, json.dislikes));
        div.appendChild(self._getResultDiv(gr));
        div.appendChild(self._getGRDiv(gr8));
        div.appendChild(self._getDetails(json.records));
        div.appendChild(self._getStreetMapLink(latlng));
        div.appendChild(self._getGoogleMapLink(latlng));

        var popup = marker.getPopup();
        popup.setContent(div);
        popup.update();
    },
    _getMarkerHeading: function (starsUrl, gr) {
        var element = document.createElement('span');
        element.setAttribute('class', 'placelocation');
        var img = document.createElement('img');
        img.setAttribute('src', starsUrl);
        img.setAttribute('alt', 'Stars');
        img.setAttribute('height', '30px');
        img.setAttribute('width', '30px');
        element.appendChild(img);
        var title = document.createElement('span');
        title.textContent = ' Place Grid Ref  ' + gr;
        element.appendChild(title);
        return element;
    },
    _getCorrectElement: function (gr, likes) {
        var self = this;
        var no = "";
        if (likes > 0) {
            no = "<sup>" + likes + "</sup>";
        }
        var element = document.createElement('span');
        element.setAttribute('class', 'agreebutton hasTip pointer');
        element.setAttribute('title', 'VOTE: This location is correct');
        element.innerHTML = ' ' + String.fromCharCode(9745) + no;
        element.addEventListener("click", function (e) {
            var $url = self._urlbase + "report.php?gr=" + gr + "&type=like";
            ra.ajax.getUrl($url, "", gr, function (gr, result) {
                if (result) {
                    document.getElementById(gr).innerHTML = "Correct vote recorded";
                } else {
                    document.getElementById(gr).innerHTML = "ERROR";
                }
            });
        });
        return element;
    },
    _getIncorrectElement: function (gr, dislikes) {
        var self = this;
        var no = "";
        if (dislikes > 0) {
            no = "<sup>" + dislikes + "</sup>";
        }
        var element = document.createElement('span');
        element.setAttribute('class', 'agreebutton hasTip pointer');
        element.setAttribute('title', 'VOTE: This location is INCORRECT');
        element.innerHTML = ' ' + String.fromCharCode(9746) + no;
        element.addEventListener("click", function (e) {
            var $url = self._urlbase + "report.php?gr=" + gr + "&type=dislikes";
            ra.ajax.getUrl($url, "", gr, function (gr, result) {
                if (result) {
                    document.getElementById(gr).innerHTML = "Incorrect vote recorded";
                } else {
                    document.getElementById(gr).innerHTML = "ERROR";
                }
            });
        });
        return element;
    },
    _getStreetMapLink: function (latlng) {
        var element = document.createElement('span');
        element.setAttribute('class', 'placebutton-green hasTip');
        element.setAttribute('title', 'View location in streetmap.co.uk');
        var a = document.createElement('a');
        a.setAttribute('href', "javascript:ra.link.streetmap(" + latlng.lat + "," + latlng.lng + ")");
        a.textContent = 'Streemap';
        a.style.fontSize = '12px';
        element.appendChild(a);
        return element;
    },
    _getGoogleMapLink: function (latlng) {
        var element = document.createElement('span');
        element.setAttribute('class', 'placebutton-green hasTip');
        element.setAttribute('title', 'View location in Google maps');
        var a = document.createElement('a');
        a.setAttribute('href', "javascript:ra.link.googlemap(" + latlng.lat + "," + latlng.lng + ")");
        a.textContent = 'Google Map';
        a.style.fontSize = '12px';
        element.appendChild(a);
        return element;
    },
    _getResultDiv: function (gr) {
        var element = document.createElement('div');
        element.setAttribute('id', gr);
        return element;
    },
    _getGRDiv: function (gr) {
        var element = document.createElement('div');
        element.textContent = gr;
        element.style.textAlign = 'right';
        return element;
    },
    _getDetails: function (items) {
        var element = document.createElement('div');
        element.setAttribute('class', 'ra places popup');
        var desc = document.createElement('p');
        desc.innerHTML = "<b>Description</b> [Date used / Score]";
        element.appendChild(desc);
        var ul = document.createElement('ul');
        element.appendChild(ul);
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.desc === "") {
                item.desc = "<i>no description</i>";
            }
            var li = document.createElement('li');
            li.innerHTML = item.desc + " [" + item.lastread + "/" + item.score + "%]";
            ul.appendChild(li);
        }
        return element;
    }
});