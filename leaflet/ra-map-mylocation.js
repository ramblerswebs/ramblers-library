var L,ra,document;
L.Control.MyLocation = L.Control.extend({
    options: {
        title: 'Display my location',
        position: 'topleft'
    },
    onAdd: function (map) {
        this._map = map;
        this.active = false;
        this.currentLocation = null;
        this.locationfound = false;
        this._map.myLocationLayer = L.featureGroup([]);
        this._map.myLocationLayer.addTo(this._map);
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-control-my-location');
        this._createIcon(container);
        this._container = container;

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(this.link, 'click', this._displaymylocationEvent, this);
        return container;
    },
    _createIcon: function (container) {
        this.link = L.DomUtil.create('a', '', container);
        this.link.id = "leaflet-mylocation";
        this.link.title = this.options.title;
        return this.link;
    },
    _displaymylocationEvent: function (evt) {
        this._map.myLocationLayer.clearLayers();
        if (this.active) {
            this.link.classList.remove("active");
        } else {
            this.link.classList.add("active");
            this._map.setZoom(16);
        }
        this.active = !this.active;
        evt._this = this;
        this._displaymylocation(evt);
    },
    _closeMyLocation: function () {
        this.link.classList.remove("active");
        this.active = false;
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
            console.log(e.message);
            self.locationfound = false;
            self._closeMyLocation();
        });

        ra.loc.getPosition({
            maxWait: 5000, // defaults to 10000
            desiredAccuracy: 30 // defaults to 20
        });
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
    }
});

L.control.mylocation = function (options) {
    return new L.Control.MyLocation(options);
};
