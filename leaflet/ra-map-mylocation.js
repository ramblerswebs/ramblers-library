var L, ramblersMap;
L.Control.MyLocation = L.Control.extend({
    options: {
        title: 'Display my location',
        position: 'topleft'
    },
    onAdd: function (map) {
        this._map = map;
        this.active = false;
        ramblersMap.MyLocation = this;
        this._map.myLocationLayer = L.featureGroup([]);
        this._map.myLocationLayer.addTo(this._map);
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-control-my-location');
        this._createIcon(container);
        this._container = container;

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(this.link, 'click', this._displaymylocationEvent, this);
        this.storeCurrentLocation();
        return container;
    },
    _createIcon: function (container) {
        this.link = L.DomUtil.create('a', '', container);
        this.link.id = "leaflet-mylocation";
        this.link.title = this.options.title;
        return this.link;
    },
    storeCurrentLocation: function () {
        var self = ramblersMap.MyLocation;
        self.locationfound=false;
        self.currentLocation = {
            lat: 51.48795,
            lng: -0.12370};
        ramblersMap.map.on('accuratepositionprogress', function (e) {
            self.currentLocation = e.latlng;
        });
        ramblersMap.map.on('accuratepositionfound', function (e) {
            self.currentLocation = e.latlng;
            self.locationfound=true;
        });
        ramblersMap.map.on('accuratepositionerror', function (e) {
            ramblersMap.MyLocation.locationfound=false;
            console.log(e.message);
        });

        ramblersMap.map.findAccuratePosition({
            maxWait: 5000, // defaults to 10000
            desiredAccuracy: 30 // defaults to 20
        });
    },
    _displaymylocationEvent: function (evt) {
        var self = ramblersMap.MyLocation;
        ramblersMap.map.myLocationLayer.clearLayers();
        if (self.active) {
            self.link.classList.remove("active");
        } else {
            self.link.classList.add("active");
            ramblersMap.map.setZoom(16);
            self._displaymylocation;
        }
        self.active = !self.active;
        self._displaymylocation(evt);
    },
    _closeMyLocation: function () {
        var self = ramblersMap.MyLocation;
        self.link.classList.remove("active");
        self.active = false;
        ramblersMap.map.off('accuratepositionprogress');
        ramblersMap.map.off('accuratepositionfound');
        ramblersMap.map.off('accuratepositionerror');
    },
    _displaymylocation: function (e) {

        function displayLocation(e) {

            ramblersMap.map.panTo(e.latlng);
            var popup = "Current location<br/>Accuracy is " + Math.ceil(e.accuracy) + " metres";
            var options = {color: '#0044DD'};
            var self = ramblersMap.MyLocation;
            self.currentLocation = e.latlng;
            var circleMarker = new L.CircleMarker(e.latlng, options);
            ramblersMap.map.myLocationLayer.addLayer(circleMarker);
            circleMarker.bindPopup(popup);
        }

        ramblersMap.map.on('accuratepositionprogress', function (e) {
            ramblersMap.map.myLocationLayer.clearLayers();
            displayLocation(e);
        });
        ramblersMap.map.on('accuratepositionfound', function (e) {
            ramblersMap.map.myLocationLayer.clearLayers();
            ramblersMap.MyLocation.locationfound=true;
            displayLocation(e);
            ramblersMap.MyLocation._closeMyLocation();
        });
        ramblersMap.map.on('accuratepositionerror', function (e) {
            console.log(e.message);
            ramblersMap.MyLocation.locationfound=false;
            ramblersMap.MyLocation._closeMyLocation();
        });

        ramblersMap.map.findAccuratePosition({
            maxWait: 5000, // defaults to 10000
            desiredAccuracy: 30 // defaults to 20
        });
    }
});

L.control.mylocation = function (options) {
    return new L.Control.MyLocation(options);
};
/**
 * Leaflet.AccuratePosition aims to provide an accurate device location when simply calling map.locate() doesn’t.
 * https://github.com/m165437/Leaflet.AccuratePosition
 *
 * Greg Wilson's getAccurateCurrentPosition() forked to be a Leaflet plugin
 * https://github.com/gwilson/getAccurateCurrentPosition
 *
 * Copyright (C) 2013 Greg Wilson, 2014 Michael Schmidt-Voigt
 */

L.Map.include({
    _defaultAccuratePositionOptions: {
        maxWait: 10000,
        desiredAccuracy: 20
    },

    findAccuratePosition: function (options) {

        if (!navigator.geolocation) {
            this._handleAccuratePositionError({
                code: 0,
                message: 'Geolocation not supported.'
            });
            return this;
        }

        this._accuratePositionEventCount = 0;
        this._accuratePositionOptions = L.extend(this._defaultAccuratePositionOptions, options);
        this._accuratePositionOptions.enableHighAccuracy = true;
        this._accuratePositionOptions.maximumAge = 0;

        if (!this._accuratePositionOptions.timeout)
            this._accuratePositionOptions.timeout = this._accuratePositionOptions.maxWait;

        var onResponse = L.bind(this._checkAccuratePosition, this),
                onError = L.bind(this._handleAccuratePositionError, this),
                onTimeout = L.bind(this._handleAccuratePositionTimeout, this);

        this._accuratePositionWatchId = navigator.geolocation.watchPosition(
                onResponse,
                onError,
                this._accuratePositionOptions);

        this._accuratePositionTimerId = setTimeout(
                onTimeout,
                this._accuratePositionOptions.maxWait);
    },

    _handleAccuratePositionTimeout: function () {
        navigator.geolocation.clearWatch(this._accuratePositionWatchId);

        if (typeof this._lastCheckedAccuratePosition !== 'undefined') {
            this._handleAccuratePositionResponse(this._lastCheckedAccuratePosition);
        } else {
            this._handleAccuratePositionError({
                code: 3,
                message: 'Timeout expired'
            });
        }

        return this;
    },

    _cleanUpAccuratePositioning: function () {
        clearTimeout(this._accuratePositionTimerId);
        navigator.geolocation.clearWatch(this._accuratePositionWatchId);
    },

    _checkAccuratePosition: function (pos) {
        var accuracyReached = pos.coords.accuracy <= this._accuratePositionOptions.desiredAccuracy;

        this._lastCheckedAccuratePosition = pos;
        this._accuratePositionEventCount = this._accuratePositionEventCount + 1;

        if (accuracyReached && (this._accuratePositionEventCount > 1)) {
            this._cleanUpAccuratePositioning();
            this._handleAccuratePositionResponse(pos);
        } else {
            this._handleAccuratePositionProgress(pos);
        }
    },

    _prepareAccuratePositionData: function (pos) {
        var lat = pos.coords.latitude,
                lng = pos.coords.longitude,
                latlng = new L.LatLng(lat, lng),
                latAccuracy = 180 * pos.coords.accuracy / 40075017,
                lngAccuracy = latAccuracy / Math.cos(Math.PI / 180 * lat),
                bounds = L.latLngBounds(
                        [lat - latAccuracy, lng - lngAccuracy],
                        [lat + latAccuracy, lng + lngAccuracy]);

        var data = {
            latlng: latlng,
            bounds: bounds,
            timestamp: pos.timestamp
        };

        for (var i in pos.coords) {
            if (typeof pos.coords[i] === 'number') {
                data[i] = pos.coords[i];
            }
        }

        return data;
    },

    _handleAccuratePositionProgress: function (pos) {
        var data = this._prepareAccuratePositionData(pos);
        this.fire('accuratepositionprogress', data);
    },

    _handleAccuratePositionResponse: function (pos) {
        var data = this._prepareAccuratePositionData(pos);
        this.fire('accuratepositionfound', data);
    },

    _handleAccuratePositionError: function (error) {
        var c = error.code,
                message = error.message ||
                (c === 1 ? 'permission denied' :
                        (c === 2 ? 'position unavailable' : 'timeout'));

        this._cleanUpAccuratePositioning();

        this.fire('accuratepositionerror', {
            code: c,
            message: 'Geolocation error: ' + message + '.'
        });
    }
});