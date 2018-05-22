var ramblersMap;
L.Control.GpxDownload = L.Control.extend({
    options: {
        title: 'Download a walking route as GPX file',
        titledisabled: 'No routes or markers defined',
        position: 'bottomright'
    },
    onAdd: function (map) {
        this._map = map;
        this.enabled = false;
        var container = L.DomUtil.create('div', 'leaflet-control-gpx-download leaflet-bar leaflet-control ra-download-toolbar-button-disabled');
        this._createIcon(container);
        this._container = container;

        L.DomEvent.on(this.link, 'click', this._downloadGpx, this);
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
            L.DomUtil.removeClass(this._container, 'ra-download-toolbar-button-disabled');
            this.link.title = this.options.title;
        } else {
            L.DomUtil.addClass(this._container, 'ra-download-toolbar-button-disabled');
            this.link.title = this.options.titledisabled;
        }
    },
    _createIcon: function (container) {
        var icon = L.DomUtil.create('a', '', container);
        this.link = icon;
        this.link.id = "leaflet-gpx-download";
        this.link.title = this.options.title;
        return this.link;
    },
    _downloadGpx: function (e) {
        if (this.enabled) {
            // var mapContainer = this._map.getContainer();
            var drawnItems = this._itemsCollection;
            var hasItems = drawnItems.getLayers().length !== 0;
            if (!hasItems) {
                alert('No routes or markers defined');
                this.link.removeAttribute('href');
                this.link.removeAttribute('download');
            } else {
                // var datajon = drawnItems.toGeoJSON();
                // console.log(datajon);
                //  var gpxData = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + togpx(data);
                //  var convertedData = 'data:application/javascript;charset=utf-8,' + encodeURIComponent(gpxData);
                var data = this._createGPXdata();
                var convertedData = 'data:application/javascript;charset=utf-8,' + encodeURIComponent(data);
                // Create export
                this.link.setAttribute('href', 'data:' + convertedData);
                this.link.setAttribute('download', 'route.gpx');
            }
        } 
    },
    _createGPXdata: function () {
        var gpxData = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        gpxData += '<gpx' + "\n";
        gpxData += 'version="1.0"' + "\n";
        gpxData += 'creator="Ramblers-Webs - http://www.ramblers-webs.org.uk"' + "\n";
        gpxData += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' + "\n";
        gpxData += 'xmlns="http://www.topografix.com/GPX/1/0"' + "\n";
        gpxData += 'xsi:schemaLocation="http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd">' + "\n";
        _this=this;
        this._itemsCollection.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                gpxData += _this._addMarker(layer);
            }
            if (layer instanceof L.Polyline) {
                gpxData += _this._addTrack(layer);
            }
        });

        gpxData += '</gpx>' + "\n";
        return gpxData;
    },
    _addMarker: function (marker) {
        var data = '<wpt lat="' + marker._latlng.lat + '" lon="' + marker._latlng.lng + '">' + "\n";
        if (marker.hasOwnProperty('name')) {
            data += '<name>' + marker.name + '</name>' + "\n";
        }
        if (marker.hasOwnProperty('desc')) {
            data += '<desc>< ![CDATA[' + marker.desc + ']]</desc>' + "\n";
        }
        if (marker.hasOwnProperty('symbol')) {
            data += '<sym>' + marker.symbol + '</sym>' + "\n";
        }
        data += '</wpt>\n';
        return data;
    },
    _addTrack: function (track) {
        var data = '<trk>' + "\n";
        data += '<trkseg>' + "\n";
        latlngs = track.getLatLngs();
        data += _this._listpath(latlngs);

        data += '</trkseg>' + "\n";
        data += '</trk>' + "\n";
        return data;
    },
    _listpath: function (latlngs) {
        var i, len;
        i = 0;
        var text = "";
        var elev = '';
        for (i = 0, len = latlngs.length; i < len; i++) {
            text += '<trkpt lat="' + latlngs[i].lat + '" lon="' + latlngs[i].lng + '">\n';
            if (latlngs[i].alt !== -999) {
                elev = ' <ele>' + latlngs[i].alt + '</ele>';
                text += elev + '\n';
            }
            text += '</trkpt>\n';
        }
        return text;
    }

});

L.control.gpxdownload = function (options) {
    return new L.Control.GpxDownload(options);
};
