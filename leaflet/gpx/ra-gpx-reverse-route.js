var ramblersMap;
L.Control.ReverseRoute = L.Control.extend({
    options: {
        title: 'Reverse the direction of walking route',
        titledisabled: 'No routes defined',
        position: 'bottomright'
    },
    onAdd: function (map) {
        this._map = map;
        this.enabled = false;
        _this = this;
        var container = L.DomUtil.create('div', 'leaflet-control-reverse-route leaflet-bar leaflet-control ra-reverse-toolbar-button-disabled');
        this._createIcon(container);
        this._container = container;
        L.DomEvent.on(this.link, 'click', this._reverse_routes, this);
        return container;
    },
    setRouteItems: function (itemsCollection) {
        this._itemsCollection = itemsCollection;
    },
    setStatus: function (status) {
        _this.enabled = true;
        if (status == "off") {
            _this.enabled = false;
        }
        if (status == "auto") {
            _this.enabled = false;
            this._itemsCollection.eachLayer(function (layer) {
                if (layer instanceof L.Polyline) {
                    _this.enabled = true;
                }
            });
        }
        if (_this.enabled) {
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
    _reverse_routes: function (evt) {
        if (_this.enabled) {
            this._itemsCollection.eachLayer(function (layer) {
                if (layer instanceof L.Polyline) {
                    var points = layer.getLatLngs();
                    var reversed = points.reverse();
                    layer.setLatLngs(reversed);
                    //  following line ensures the new points are noticed byLeaflet.Draw
                    layer.fire('revert-edited', {layer: layer});
                }
            });
            this._itemsCollection.fire('reversed');
            blurt('Route(s) reversed')
        }
    }
});

L.control.reverseroute = function (options) {
    return new L.Control.GpxUpload(options);
};
