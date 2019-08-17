L.Control.ReverseRoute = L.Control.extend({
    options: {
        title: 'Reverse the direction of walking route',
        titledisabled: 'No routes defined',
        position: 'bottomright'
    },
    onAdd: function (map) {
        this._map = map;
        this.enabled = false;
        _ra_gpx_reverse_this = this;
        var containerAll = L.DomUtil.create('div', 'leaflet-control-reverse-route ra-reverse-toolbar-button-disabled');
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control', containerAll);
        this._createIcon(container);
        this._container = container;
        L.DomEvent.disableClickPropagation(containerAll);
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(this.link, 'click', this._reverse_routes, this);
        this._appendButtons(containerAll);
        this.holder.style.display = "none";
        return containerAll;
    },
    setRouteItems: function (itemsCollection) {
        this._itemsCollection = itemsCollection;
    },
    setStatus: function (status) {
        _ra_gpx_reverse_this.enabled = true;
        if (status == "off") {
            _ra_gpx_reverse_this.enabled = false;
        }
        if (status == "auto") {
            _ra_gpx_reverse_this.enabled = false;
            this._itemsCollection.eachLayer(function (layer) {
                if (layer instanceof L.Polyline) {
                    _ra_gpx_reverse_this.enabled = true;
                }
            });
        }
        if (_ra_gpx_reverse_this.enabled) {
            L.DomUtil.removeClass(this._container, 'ra-reverse-toolbar-button-disabled');
            this.link.title = this.options.title;
        } else {
            L.DomUtil.addClass(this._container, 'ra-reverse-toolbar-button-disabled');
            this.link.title = this.options.titledisabled;
        }
    },
    _createIcon: function (container) {
        var icon = L.DomUtil.create('a', '', container);
        this.link = icon;
        this.link.id = "leaflet-reverse-route";
        this.link.title = this.options.titledisabled;
        return this.link;
    },
    _appendButtons: function (container) {
        this.holder = L.DomUtil.create('div', 'leaflet-gpx-options', container);

        this.status = L.DomUtil.create('div', 'status', this.holder);
        this.status.innerHTML = "Route reversed";
    },
    _reverse_routes: function (evt) {
        if (_ra_gpx_reverse_this.enabled) {
            this._itemsCollection.eachLayer(function (layer) {
                if (layer instanceof L.Polyline) {
                    var points = layer.getLatLngs();
                    var reversed = points.reverse();
                    layer.setLatLngs(reversed);
                    //  following line ensures the new points are noticed byLeaflet.Draw
                    layer.fire('revert-edited', {layer: layer});
                }
            });
            this._itemsCollection.fire('reverse:reversed');
            this.holder.style.display = "inline-block";
            setTimeout(function () {
                _ra_gpx_reverse_this.holder.style.display = "none";
            }, 3000);
            //blurt('Route(s) reversed')
        }
    }
});

L.control.reverseroute = function (options) {
    return new L.Control.ReverseRoute(options);
};
