var L, ra, document;
L.Control.MyLocation = L.Control.extend({
    options: {
        title: 'Display my location',
        position: 'topleft'
    },
    mylocationOptions: {
        continuous: true,
        continuousOptions: {
            timeInterval: 10,
            displayTrack: false,
            color: '#0080C0',
            weight: 2,
            opacity: 0.5}
    },

    onAdd: function (map) {
        this._map = map;
        this.active = false;
        this.currentLocation = null;
        this.locationfound = false;
        this._map.myLocationLayer = L.featureGroup([]);
        this._map.myLocationLayer.addTo(this._map);
        this._map.myLocationTrackLayer = L.featureGroup([]);
        this._map.myLocationTrackLayer.addTo(this._map);
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-control-my-location');
        this._createIcon(container);
        this._container = container;

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(this.link, 'click', this._displaymylocationEvent, this);
        this.process = null;
        ra.loc.getPosition({
            maxWait: 10000, // defaults to 10000
            desiredAccuracy: 30 // defaults to 20
        });
        this._setTitle();
        return container;
    },
    _createIcon: function (container) {
        this.link = L.DomUtil.create('a', '', container);
        this.link.title = this.options.title;
        if (this.mylocationOptions.continuous) {
            this.link.classList.add("continuous");
        } else {
            this.link.classList.add("single");
        }
        return this.link;
    },
    changeDisplay: function (display) {
        this._container.style.display = display;
    },
    _displaymylocationEvent: function (evt) {
        //  this._map.myLocationLayer.clearLayers();
        //  if (this.process !== null) {
        this.active = !this.active;
        clearInterval(this.process);
        //   }
        this.link.classList.remove("single");
        this.link.classList.remove("continuous");
        if (this.mylocationOptions.continuous) {
            this.link.classList.add("continuous");
        } else {
            this.link.classList.add("single");
        }
        this._setTitle();
        if (this.active) {
            this.link.classList.add("active");
            //          this._map.setZoom(16);
            evt._this = this;
            this._displaymylocation(evt);
        } else {
            this.link.classList.remove("active");
        }
    },
    _turnOffPositioning: function () {
        clearInterval(this.process);
        this.link.classList.remove("active");
        this.active = false;
        this.link.title = this.options.title;
        this.link.classList.remove("single");
        this.link.classList.remove("continuous");
        if (this.mylocationOptions.continuous) {
            this.link.classList.add("continuous");
        } else {
            this.link.classList.add("single");
        }
        this._setTitle();
    },
    _setTitle: function () {
        if (this.active) {
            if (this.mylocationOptions.continuous) {
                this.link.title = this.options.title + ' - searching, updating every '
                        + this.mylocationOptions.continuousOptions.timeInterval + ' seconds';
            } else {
                this.link.title = this.options.title + ' - searching';
            }

        } else {
            if (this.mylocationOptions.continuous) {
                this.link.title = this.options.title + " - Continuous mode";

            } else {
                this.link.title = this.options.title + " - Single mode";
            }
        }
    },
    _closeMyLocation: function () {
        if (this.mylocationOptions.continuous) {

        } else {
            this.link.classList.remove("active");
            this.active = false;
            this._setTitle();
        }

    },
    _displaymylocation: function (e) {
        var self = e._this;

        document.addEventListener('accuratepositionprogress', function (e) {
            self._map.myLocationLayer.clearLayers();
            self.displayLocation(e.result);
        });
        document.addEventListener('accuratepositionfound', function (e) {
            self._map.myLocationLayer.clearLayers();
            self.locationfound = true;
            self.displayLocation(e.result);
            self._closeMyLocation();
        });
        document.addEventListener('accuratepositionerror', function (e) {
            //  console.log(e.message);
            self.locationfound = false;
            self._closeMyLocation();
        });
        self.process = null;
        var frequency = self.mylocationOptions.continuousOptions.timeInterval * 1000;
        if (self.mylocationOptions.continuous) {
            self.process = setInterval(function () {
                ra.loc.getPosition({
                    maxWait: 5000, // defaults to 10000
                    desiredAccuracy: 20 // defaults to 20
                });
            }, frequency);
        } else {
            ra.loc.getPosition({
                maxWait: 5000, // defaults to 10000
                desiredAccuracy: 20 // defaults to 20
            });
        }
        var a = 1;

    },
    displayLocation: function (e) {
        var pos = e.position.coords;
        var latlng = L.latLng(pos.latitude, pos.longitude);
        this._map.panTo(latlng);
        var popup = "Current location<br/>Accuracy is " + Math.ceil(pos.accuracy) + " metres";
        var options = {color: '#0044DD'};
        this.currentLocation = latlng;
        var circleMarker = new L.CircleMarker(latlng, options);
        this._map.myLocationLayer.addLayer(circleMarker);
        circleMarker.bindPopup(popup);
        console.log("Updated");
    },
    settingsForm: function (tag) {
        var _this = this;
        var hdg1 = document.createElement('h5');
        hdg1.textContent = 'My Location Options';
        tag.appendChild(hdg1);

        var continuous = ra.html.input.yesNo(tag, '', "Regularly update my location ", this.mylocationOptions, 'continuous');
        var update = document.createElement('div');
        tag.appendChild(update);
        var label = document.createElement('label');
        label.textContent = "My location will be automatically updated ever few seconds";
        update.appendChild(label);
        var frequency = ra.html.input.number(update, '', 'Number of seconds [%n] between updates', this.mylocationOptions.continuousOptions, 'timeInterval', 10, 120, 0.5);
        var displayTrack = ra.html.input.yesNo(update, '', "Display track of my location", this.mylocationOptions.continuousOptions, 'displayTrack');

        var display = document.createElement('div');
        update.appendChild(display);
        var line = ra.html.input.lineStyle(display, 'divClass', 'Track style', this.mylocationOptions.continuousOptions);
        line.addEventListener("change", function (e) {
            _this._turnOffPositioning();
        });

        if (_this.mylocationOptions.continuous) {
            update.style.display = 'inherit';
            if (_this.mylocationOptions.continuousOptions.displayTrack) {
                display.style.display = 'inherit';
            } else {
                display.style.display = 'none';
            }
        } else {
            update.style.display = 'none';
        }

        continuous.addEventListener("change", function (e) {
            _this._turnOffPositioning();
            if (_this.mylocationOptions.continuous) {
                update.style.display = 'inherit';
                if (_this.mylocationOptions.continuousOptions.displayTrack) {
                    display.style.display = 'inherit';
                } else {
                    display.style.display = 'none';
                }
            } else {
                update.style.display = 'none';
            }
        });
        displayTrack.addEventListener("change", function (e) {
            _this._turnOffPositioning();
            if (_this.mylocationOptions.continuous) {
                update.style.display = 'inherit';
                if (_this.mylocationOptions.continuousOptions.displayTrack) {
                    display.style.display = 'inherit';
                } else {
                    display.style.display = 'none';
                }
            } else {
                update.style.display = 'none';
            }
        });

    }
});

L.control.mylocation = function (options) {
    return new L.Control.MyLocation(options);
};
