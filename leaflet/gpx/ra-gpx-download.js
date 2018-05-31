L.Control.GpxDownload = L.Control.extend({
    options: {
        title: 'Download a walking route as GPX file',
        titledisabled: 'No routes or markers defined',
        position: 'bottomright'
    },
    onAdd: function (map) {
        this._map = map;
        this.enabled = false;
        this.supported = true;
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
        if (status === "off") {
            this.enabled = false;
        }
        if (status === "auto") {
            this.enabled = this._itemsCollection.getLayers().length !== 0;
        }
        if (this.supported === false) {
            this.enabled = false;
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
            var drawnItems = this._itemsCollection;
            var hasItems = drawnItems.getLayers().length !== 0;
            if (!hasItems) {
                alert('No routes or markers defined');
            } else {
                var data = this._createGPXdata();
                try {
                    var blob = new Blob([data], {type: "application/gpx+xml;charset=utf-8"});
                    saveAs(blob, "route.gpx");
                } catch (e) {
                    blurt('Your web browser does not support his option!');
                }
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
        ra_gpx_download_this = this;
        this._itemsCollection.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                gpxData += ra_gpx_download_this._addMarker(layer);
            }
            if (layer instanceof L.Polyline) {
                gpxData += ra_gpx_download_this._addTrack(layer);
            }
        });

        gpxData += '</gpx>';
        return gpxData;
    },
    _addMarker: function (marker) {
        var data = '<wpt lat="' + marker._latlng.lat + '" lon="' + marker._latlng.lng + '">' + "\n";
        if (marker.hasOwnProperty('name')) {
            data += '<name>' + marker.name + '</name>' + "\n";
        }
        if (marker.hasOwnProperty('desc')) {
            data += '<desc><![CDATA[' + marker.desc + ']]</desc>' + "\n";
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
        data += ra_gpx_download_this._listpath(latlngs);

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
