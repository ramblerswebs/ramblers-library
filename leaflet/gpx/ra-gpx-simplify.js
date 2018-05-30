L.Control.GpxSimplify = L.Control.extend({
    options: {
        title: 'Simplify - reduce number of point defining walking route',
        titledisabled: 'No routes defined',
        position: 'bottomright'
    },
    onAdd: function (map) {
        this._map = map;
        this.enabled = false;
        var container = L.DomUtil.create('div', 'leaflet-control-gpx-simplify leaflet-bar leaflet-control ra-simplify-toolbar-button-disabled');
        this._createIcon(container);
        this._container = container;

        L.DomEvent.on(this.link, 'click', this._simplifyGpx, this);
        return container;
    },
    setRouteItems: function (itemsCollection) {
        this._itemsCollection = itemsCollection;
    },
    setStatus: function (status) {
        this.enabled = true;
        if (status == "off") {
            this.enabled = false;
        }
        if (status == "auto") {
            this.enabled = this._itemsCollection.getLayers().length !== 0;
        }
        if (this.enabled) {
            L.DomUtil.removeClass(this._container, 'ra-simplify-toolbar-button-disabled');
            this.link.title = this.options.title;
        } else {
            L.DomUtil.addClass(this._container, 'ra-simplify-toolbar-button-disabled');
            this.link.title = this.options.titledisabled;
        }
    },
    _createIcon: function (container) {
        var icon = L.DomUtil.create('a', '', container);
        this.link = icon;
        this.link.id = "leaflet-gpx-simplify";
        this.link.title = this.options.title;
        return this.link;
    },
    _simplifyGpx: function (e) {
        if (this.enabled) {
            tolerance = .0001;
            this._itemsCollection.eachLayer(function (layer) {
                if (layer instanceof L.Polyline) {
                    var points = layer.getLatLngs();
                    var newPoints = simplify(points, tolerance);
                    layer.setLatLngs(newPoints);
                    //  following line ensures the new points are noticed byLeaflet.Draw
                    layer.fire('revert-edited', {layer: layer});
                    blurt("Track reduced from " + points.length + " to " + newPoints.length + " points")
                }
            });
        }
        this._itemsCollection.fire('simplified');
    }
});
L.control.gpxsimplify = function (options) {
    return new L.Control.GpxDownload(options);
};
