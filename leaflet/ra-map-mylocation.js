var L, ra, document;
L.Control.MyLocation = L.Control.extend({
    options: {
        title: 'Display my location',
        position: 'topleft'
    },
    mylocationOptions: {
        panToLocation: true,
        marker: {
            radius: 5,
            color: '#0044DD'
        },
        accuracy: {
            display: true,
            fill: {
                color: '#550000',
                opacity: .5
            }}
    },
    _controls: {
        panToLocation: null,
        marker: null,
        accuracy: {
            display: null,
            fill: null}
    },
    first: false,
    onAdd: function (map) {
        this._map = map;
        this.active = false;
        this.locationfound = false;
        this._map.myLocationLayer = L.featureGroup([]);
        this._map.myLocationLayer.addTo(this._map);
        var containerAll = L.DomUtil.create('div', 'leaflet-control  leaflet-control-my-location');
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control', containerAll);
        var containerStatus = L.DomUtil.create('div', 'status', containerAll);
        L.DomEvent.disableClickPropagation(containerAll);
        L.DomEvent.disableClickPropagation(containerStatus);
        this._createIcon(container);
        this._container = container;

        L.DomEvent.on(this.link, 'click', this._displaymylocationEvent, this);
        this.process = null;

        this._setTitle();
        this._appendButtons(containerStatus);
        this.statuson.style.display = "none";
        this.statusoff.style.display = "none";
        var self = this;
        document.addEventListener('accuratepositionprogress', function (e) {
            console.log('GPX Progress');
            self._map.myLocationLayer.clearLayers();
            self.displayLocation(e.result);
        });
        document.addEventListener('accuratepositionfound', function (e) {
            console.log('GPS position found');
            self._map.myLocationLayer.clearLayers();
            self.locationfound = true;
            self.displayLocation(e.result);
            //  self._closeMyLocation();
            if (self.first) {
                self.first = false;
                self._map.setZoom(16);
            }
        });
        document.addEventListener('accuratepositionerror', function (e) {
            console.log('Location error');
            self.locationfound = false;
            //  self._closeMyLocation();
        });
        return containerAll;
    },
    _createIcon: function (container) {
        this.link = L.DomUtil.create('a', '', container);
        this.link.title = this.options.title;
        return this.link;
    },
    _appendButtons: function (container) {
        this.holder = L.DomUtil.create('div', 'leaflet-my-location', container);
        this.statuson = L.DomUtil.create('div', 'status on', this.holder);
        this.statuson.innerHTML = "Location turned ON";

        this.statusoff = L.DomUtil.create('div', 'status off', this.holder);
        this.statusoff.innerHTML = "Location turned OFF";
    },
    changeDisplay: function (display) {
        this._container.style.display = display;
    },
    _displaymylocationEvent: function (evt) {
        this._map.myLocationLayer.clearLayers();
        this.active = !this.active;
        this._setTitle();
        if (this.active) {
            this._turnOnPositioning();
        } else {
            this._turnOffPositioning();
        }
    },

    _turnOnPositioning: function () {
        clearInterval(this.process);
        this.link.classList.add("active");
        ra.loc.getPosition({
            maxWait: 5000, // defaults to 10closem000
            desiredAccuracy: 20 // defaults to 20
        });
        this.process = null;
        this.process = setInterval(function () {
            ra.loc.getPosition({
                maxWait: 5000, // defaults to 10000
                desiredAccuracy: 20 // defaults to 20
            });
        }, 10000);
        var _this = this;
        this.statuson.style.display = 'inline-block';
        this.statusoff.style.display = 'none';
        setInterval(function () {
            _this.statuson.style.display = 'none';
        }, 2000);
    },
    _turnOffPositioning: function () {
        clearInterval(this.process);
        this.link.classList.remove("active");
        this.statuson.style.display = 'none';
        this.statusoff.style.display = 'inline-block';
        var _this = this;
        setInterval(function () {
            _this.statusoff.style.display = 'none';
        }, 2000);
    },
    _setTitle: function () {
        if (this.active) {
            this.link.title = this.options.title + ' - searching';
        } else {
            this.link.title = this.options.title;
        }
    },

//            if (self.first) {
//                self.first = false;
//                self._map.setZoom(16);
//            }
//        });

    displayLocation: function (location) {
        if (this.active) {
            var pos = location.position.coords;
            var latlng = L.latLng(pos.latitude, pos.longitude);

            var popup = "Current location<br/>Accuracy is " + Math.ceil(pos.accuracy) + " metres";
            var options = {radius: this.mylocationOptions.marker.radius, color: this.mylocationOptions.marker.color};
            var circleMarker = new L.CircleMarker(latlng, options);
            this._map.myLocationLayer.addLayer(circleMarker);
            circleMarker.bindPopup(popup);

            if (this.mylocationOptions.accuracy.display) {
                var options = {radius: pos.accuracy, color: this.mylocationOptions.accuracy.fill.color, opacity: this.mylocationOptions.accuracy.fill.opacity, interactive: false, fill: true};
                var circle = new L.Circle(latlng, options);
                this._map.myLocationLayer.addLayer(circle);
            }
            if (this.mylocationOptions.panToLocation) {
                this._map.panTo(latlng);
            }

            console.log("Location displayed");
        }
    },
    settingsForm: function (tag) {
        var _this = this;
        var hdg1 = document.createElement('h5');
        hdg1.textContent = 'My Location Options';
        tag.appendChild(hdg1);
        this._controls.marker = ra.html.input.colour(tag, '', 'Colour of My Location marker', this.mylocationOptions.marker, 'color');
        this._controls.panToLocation = ra.html.input.yesNo(tag, '', "Pan to location", this.mylocationOptions, 'panToLocation');
        tag.appendChild(document.createElement('hr'));
        this._controls.accuracy.display = ra.html.input.yesNo(tag, '', "Display circle showing accuracy of location", this.mylocationOptions.accuracy, 'display');
        var accuracy = document.createElement('div');
        tag.appendChild(accuracy);
        this._controls.accuracy.display.addEventListener("ra-input-change", function (e) {
            if (_this.mylocationOptions.accuracy.display) {
                accuracy.style.display = 'inherit';
            } else {
                accuracy.style.display = 'none';
            }
        });
        this._controls.accuracy.fill = ra.html.input.fillStyle(accuracy, '', '', this.mylocationOptions.accuracy.fill);
        tag.appendChild(document.createElement('hr'));
        var comment = document.createElement('p');
        comment.innerHTML = 'Unfortunately browser technology does not allow the location to be found if the browser is not active. ' +
                'When using a smart phone the browser cannot access the location if the device goes into standby mode.';
        tag.appendChild(comment);

    },
    resetSettings: function () {


        //     ra.html.input.yesNoReset(this._controls.continuous, true);
        //     ra.html.input.yesNoReset(this._controls.accuracy.display, true);
        //  ra.html.input.yesNoReset(this.join, true);
        //  this._map.fire("draw:color-change", null);
    },
    _readSettings: function () {
        //  ra.settings.read('__raDraw', this._userOptions);
        //   this._map.fire("draw:color-change", null);
    },
    saveSettings: function (save) {
        //   ra.settings.save(save, '__raDraw', this._userOptions);
    }
});
L.control.mylocation = function (options) {
    return new L.Control.MyLocation(options);
};
