var L, ramblersMap;
L.Control.SmartRoute = L.Control.extend({
    options: {
        title: 'Smart Routing - follow paths',
        position: 'bottomright'
    },
    onAdd: function (map) {
        this._map = map;
        // default is off as relies on Map Tools being loaded first.
        this.enabled = false;
        var containerAll = L.DomUtil.create('div', 'leaflet-control-smart-route ra-smart-toolbar-button-disabled');
        this.containerAll = containerAll;
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control', containerAll);
        this._createIcon(container);
        this._container = container;
        L.DomEvent.disableClickPropagation(containerAll);
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(this.link, 'click', this._smart_routes, this);
        ramblersMap.SmartRoute = this;
        return containerAll;
    },
    disable: function () {
        this.containerAll.style.display = "none";
    },
    enable: function () {
        this.containerAll.style.display = "initial";
    },
    setRouteItems: function (itemsCollection) {
        this._itemsCollection = itemsCollection;
    },
    _createIcon: function (container) {
        var icon = L.DomUtil.create('a', '', container);
        this.link = icon;
        this.link.id = "leaflet-smart-route";
        this.link.title = this.options.title;
        return this.link;
    },
    _smart_routes: function () {
        ramblersMap.SmartRoute.enabled = !ramblersMap.SmartRoute.enabled;

        if (ramblersMap.SmartRoute.enabled) {
            L.DomUtil.removeClass(this._container, 'ra-smart-toolbar-button-disabled');
            // ramblersMap.DrawControl.options.draw.polyline.shapeOptions.opacity = 0;
            ramblersMap.SmartRouteControl.setOpacityZero();
        } else {
            L.DomUtil.addClass(this._container, 'ra-smart-toolbar-button-disabled');
            ramblersMap.SmartRouteControl.resetOpacity();
        }
    },
    displaySmartPoints: function (layers) {
        var no = 0;
        var latlngs = [];
        for (const property in layers) {
            latlngs[no] = {};
            latlngs[no] = layers[property]._latlng;
            no += 1;
        }
        if (latlngs.length <= 1) {
            ramblersMap.map.SmartRouteLayer.clearLayers();
            return;
        }
        ramblersMap.SmartRoute.pending = true;
        let request = new XMLHttpRequest();
        request.open('POST', "https://api.openrouteservice.org/v2/directions/foot-hiking/geojson");
        request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('Authorization', ramblersMap.ORSkey);
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                //console.log('Status:', this.status);
                //console.log('Headers:', this.getAllResponseHeaders());
                //console.log('Body:', this.responseText);
                var data = JSON.parse(this.responseText);
                if (this.status === 200) {
                    //console.log('Data retrieved');
                    var headers = this.getAllResponseHeaders();
                    if (!ramblersMap.SmartRoute.checkLimits(headers)) {
                        return;
                    }
                    ramblersMap.SmartRouteControl.drawSmartRoute(data); // also saves latlngs
                    if (ramblersMap.SmartRoute.saveroute) {
                        ramblersMap.SmartRouteControl.saveSmartRoute();
                        ramblersMap.SmartRoute.saveroute = false;
                    }
                } else {
                    alert("Unable to fetch route, status " + this.status);
                }
                ramblersMap.SmartRoute.pending = false;
            }
        };
        var body = {};
        body.instructions = false;
        body.geometry_simplify = true;
        body.coordinates = getLngLats(latlngs);
        var search = JSON.stringify(body);
        request.send(search);
    },
    drawSmartRoute: function (data) {
        var geometry = data.features[0].geometry;
        ramblersMap.map.SmartRouteLayer.clearLayers();
        var latlngs = ragetLatlngs(geometry.coordinates);
        ramblersMap.SmartRoute.latlngs = latlngs; // latlngs for when we save route.
        var style = ramblersMap.DrawStyle;
        ramblersMap.map.SmartRouteLayer.addLayer(L.polyline(latlngs, style));

    },
    setOpacityZero: function () {
        //console.log("Opacity set to ZERO");
        var style = {};
        style.color = ramblersMap.DrawStyle.color;
        style.weight = ramblersMap.DrawStyle.weight;
        style.opacity = 0;
        ramblersMap.DrawControl.setDrawingOptions({
            polyline: {shapeOptions: style}});
    },
    resetOpacity: function () {
        // console.log("Opacity reset");
        var style = ramblersMap.DrawStyle;
        ramblersMap.DrawControl.setDrawingOptions({
            polyline: {shapeOptions: style}});
    },
    checkLimits: function (headers) {
        var available = 0;
        var lines = headers.split('\r\n');
        var items = [];
        lines.forEach(splitLine);
        function splitLine(value) {
            var temp = value.split(': ');
            if (temp.length > 1) {
                items[temp[0]] = temp[1];
            }
        }
        if (typeof items["x-ratelimit-remaining"] !== 'undefined') {
            available = parseInt(items["x-ratelimit-remaining"]);
        }
        if (available < 20) {
            alert('Our usage of the Open Routing Service has reached the limit for today.\n\rPlease try again tomorrow or continue with straight line segments.');
            ramblersMap.SmartRoute.turnOffSmartRouting();
            return false;
        }

        return true;
    },
    turnOffSmartRouting: function () {
        ramblersMap.SmartRoute.enabled = false;
        ramblersMap.SmartRouteControl.resetOpacity();
        ramblersMap.map.removeControl(ramblersMap.SmartRouteControl);
    },

    saveSmartRoute: function () {
        if (ramblersMap.SmartRoute.latlngs !== null) {
            //console.log("Save");
            var layer;
            var layers = ramblersMap.drawnItems.getLayers();

            // only save if route has not been cancelled
            if (layers.length > ramblersMap.SmartRoute.NoLayers) {
                // delete the draw layer and replace
                layer = layers[layers.length - 1];
                ramblersMap.drawnItems.removeLayer(layer);
                ramblersMap.SmartRouteControl.resetOpacity();
                var line = new L.Polyline(ramblersMap.SmartRoute.latlngs, ramblersMap.DrawStyle);
                ramblersMap.SmartRoute.latlngs = null;
                ramblersMap.drawnItems.addLayer(line);
                ramblersMap.drawnItems.fire('upload:addline', {line: line});
                ramblersMap.SmartRouteControl.setOpacityZero();
            }
            ramblersMap.map.SmartRouteLayer.clearLayers();
        }
    }
});

L.control.smartroute = function (options) {
    return new L.Control.SmartRoute(options);
};
