var L, ra, OsGridRef;
L.Control.Tools = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var _this = this;
        this._map = map;

        this._container = document.createElement('div');
        this._button = L.DomUtil.create('div', 'ra-map-tools-icon leaflet-bar leaflet-control', this._container);
        this._button.title = 'Mapping tools';
        this._toolsDiv = L.DomUtil.create('div', 'leaflet-tools-container', this._container);

        this._toolsDiv.style.display = 'none';

        this._container.addEventListener("mouseenter", function (e) {
            _this._toolsDiv.style.display = 'grid';
        });
        this._container.addEventListener("mouseover", function (e) {
            _this._toolsDiv.style.display = 'grid';
        });
        this._toolsDiv.addEventListener("mouseleave", function (e) {
            _this._toolsDiv.style.display = 'none';
        });
        this._container.addEventListener("mouseleave", function (e) {
            _this._toolsDiv.style.display = 'none';
        });
        this._container.addEventListener("click", function (e) {
            if (_this._toolsDiv.style.display === 'grid') {
                _this._toolsDiv.style.display = 'none';
            } else {
                _this._toolsDiv.style.display = 'grid';
            }
        });
        return this._container;
    },
    getToolsDiv: function () {
        return this._toolsDiv;
    },

    onRemove: function (map) {
        //  map.off('mousemove', this._update);
    }

});
L.control.tools = function (options) {
    return new L.Control.Tools(options);
};

L.Control.ZoomAll = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var _this = this;
        this._map = map;
        this._container = L.DomUtil.create('div', 'ra-zoomall-icon leaflet-bar leaflet-control', this._container);
        this._container.title = 'Zoom to display all information';
        this._container.addEventListener("click", function (e) {
            var bounds = L.latLngBounds([]);
            //  console.log("S T A R T");
            _this._map.eachLayer(function (layer) {
                //  console.log("OPTIONS: " + JSON.stringify(layer.options));
                if (layer.options) {
                    //   console.log("PANE: " + layer.options.pane);
                    switch (layer.options.pane) {
                        case"markerPane":
                            if (typeof layer.getBounds === 'function') {
                                var layerBounds = layer.getBounds();
                                //  console.log(JSON.stringify(layerBounds));
                                bounds.extend(layerBounds);
                            } else {
                                var latlng = layer.getLatLng();
                                //   console.log(JSON.stringify(latlng));
                                bounds.extend(latlng);
                            }
                            break;
                        case "overlayPane":
                            if (typeof layer.getBounds === 'function') {
                                if (!layer.options.hasOwnProperty('ignore')) {
                                    var layerBounds = layer.getBounds();
                                    //   console.log(JSON.stringify(layerBounds));
                                    bounds.extend(layerBounds);
                                }

                            }
                            break;
                    }
                }
            });
            // once we've looped through all the features, zoom the map to the extent of the collection
            // _this._map.fitBounds(bounds ,{padding: [50,50]});
            _this._map.flyToBounds(bounds, {padding: [50, 50], duration: 1});
        });
        return this._container;
    },

    onRemove: function (map) {
        //  map.off('mousemove', this._update);
    }

});
L.control.zoomall = function (options) {
    return new L.Control.ZoomAll(options);
};