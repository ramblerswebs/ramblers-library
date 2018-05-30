L.Control.GpxUpload = L.Control.extend({
    options: {
        title: 'Up load a walking route from a GPX file',
        position: 'bottomright'
    },
    onAdd: function (map) {
        this._map = map;
        ra_gpx_upload_this = this;
        var container = L.DomUtil.create('div', 'leaflet-control-gpx-upload leaflet-bar leaflet-control');
        this._createIcon(container);
        container.title = this.options.title;
        this._container = container;
        container.getElementById('gpx-file-upload').addEventListener('change', this._uploadGpx, false);
        return container;
    },
    setRouteItems: function (itemsCollection) {
        this._itemsCollection = itemsCollection;
    },
    _createIcon: function (container) {
        //  var div='<div class="image-upload"><label for="gpx-file-upload"><img src="ramblers/leaflet/leaflet/images/icon-48-upload.png"/></label><input id="gpx-file-upload" type="file" accept=".gpx"/></div>';
        var div = L.DomUtil.create('div', 'image-upload', container);
        div.innerHTML = '<label for="gpx-file-upload"><img src="ramblers/leaflet/gpx/images/upload.png"/></label><input id="gpx-file-upload" type="file" accept=".gpx"/>';
        return div;
    },
    _gpxreader: function (gpx, drawlayer, options) {
        var _MAX_POINT_INTERVAL_MS = 15000;

        var _DEFAULT_MARKER_OPTS = {
            wptIconUrls: {
                '': 'ramblers/leaflet/gpx/images/pin-icon-wpt.png'
            },
            iconSize: [25, 41],
            shadowSize: [41, 41],
            iconAnchor: [12, 41],
            shadowAnchor: [25, 41],
            clickable: false
        };
        var _DEFAULT_POLYLINE_OPTS = {
            color: '#782327'
        };
        var _DEFAULT_GPX_OPTS = {
            parseElements: ['track', 'route', 'waypoint']
        };
        options.max_point_interval = options.max_point_interval || _MAX_POINT_INTERVAL_MS;
        options.marker_options = this._ra_gpx_merge_objs(
                _DEFAULT_MARKER_OPTS,
                options.marker_options || {});
        options.polyline_options = this._ra_gpx_merge_objs(
                _DEFAULT_POLYLINE_OPTS,
                options.polyline_options || {});
        options.gpx_options = this._ra_gpx_merge_objs(
                _DEFAULT_GPX_OPTS,
                options.gpx_options || {});
        L.Util.setOptions(this, options);
        // Base icon class for track pins.
        L.GPXTrackIcon = L.Icon.extend({options: options.marker_options});
        //this._gpx = gpx;

        this._ra_gpx_parse(gpx, drawlayer, options, this.options.async);

    },
    _ra_gpx_merge_objs: function (a, b) {
        var _ = {};
        for (var attr in a) {
            _[attr] = a[attr];
        }
        for (var attr in b) {
            _[attr] = b[attr];
        }
        return _;
    },
    _ra_gpx_parse: function (input, drawlayer, options, async) {

        if (input.substr(0, 5) === '<?xml') { // direct XML has to start with a <
            var parser = new DOMParser();
            if (async) {
                setTimeout(function () {
                    this._ra_gpx_parse_gpx_data(parser.parseFromString(input, "text/xml"), drawlayer, options);
                });
            } else {
                this._ra_gpx_parse_gpx_data(parser.parseFromString(input, "text/xml"), drawlayer, options);
            }
        } else {
            // file is not xml
        }
    },
    _ra_gpx_parse_gpx_data: function (xml, drawlayer, options) {
        var j, i, el;
        var tags = [];
        var parseElements = options.gpx_options.parseElements;
        if (parseElements.indexOf('route') > -1) {
            tags.push(['rte', 'rtept']);
        }
        if (parseElements.indexOf('track') > -1) {
            tags.push(['trkseg', 'trkpt']);
        }

        for (j = 0; j < tags.length; j++) {
            el = xml.getElementsByTagName(tags[j][0]);
            for (i = 0; i < el.length; i++) {
                var coords = this._ra_gpx_parse_trkseg(el[i], tags[j][1]);
                if (coords.length === 0)
                    continue;
                // add track
                var l = new L.Polyline(coords, options.polyline_options);
                drawlayer.addLayer(l);
                drawlayer.fire('addline', {line: l});
            }
        }

        // parse waypoints and add markers for each of them
        if (parseElements.indexOf('waypoint') > -1) {
            el = xml.getElementsByTagName('wpt');
            for (i = 0; i < el.length; i++) {
                var ll = new L.LatLng(
                        el[i].getAttribute('lat'),
                        el[i].getAttribute('lon'));

                name = this._ra_get_text(el[i], 'name');
                desc = this._ra_get_text(el[i], 'desc');
                symKey = this._ra_get_text(el[i], 'sym');

                // add WayPointMarker, based on "sym" element if avail and icon is configured
                var symIcon;
                if (options.marker_options.wptIcons && options.marker_options.wptIcons[symKey]) {
                    symIcon = options.marker_options.wptIcons[symKey];
                } else if (options.marker_options.wptIconUrls && options.marker_options.wptIconUrls[symKey]) {
                    symIcon = new L.GPXTrackIcon({iconUrl: options.marker_options.wptIconUrls[symKey]});
                } else {
                    console.log('No icon or icon URL configured for symbol type "' + symKey
                            + '"; ignoring waypoint.');
                    symIcon = new L.GPXTrackIcon({iconUrl: options.marker_options.wptIconUrls['']});

                }

                var marker = new L.Marker(ll, {
                    clickable: true,
                    title: name,
                    icon: symIcon
                });
                marker.name = name;
                marker.desc = desc;
                marker.symbol = symKey;
                marker.bindPopup("<b>" + name + "</b>" + (desc.length > 0 ? '<br>' + desc : '')).openPopup();
                //  this.fire('addpoint', {point: marker, point_type: 'waypoint'});
                drawlayer.addLayer(marker);
                //  layers.push(marker);
            }
        }


    },
    _ra_get_text: function (elem, tag) {
        var textEl = elem.getElementsByTagName(tag);
        var text = '';
        if (textEl.length > 0) {
            text = textEl[0].textContent;
        }
        return text;
    },
    _ra_gpx_parse_trkseg: function (line, tag) {
        var el = line.getElementsByTagName(tag);
        if (!el.length)
            return [];
        var coords = [];
        var last = null;
        for (var i = 0; i < el.length; i++) {
            var tag;
            var ll = new L.LatLng(el[i].getAttribute('lat'), el[i].getAttribute('lon'), -999);
            //           ll.meta = {ele: null};
//            tag = el[i].getElementsByTagName('ele');
//            if (tag.length > 0) {
//                ll.meta.ele = parseFloat(tag[0].textContent);
//            }else{
//                ll.meta.ele=0;
//            }
            last = ll;
            coords.push(ll);
        }
        return coords;
    },
    _uploadGpx: function (evt) {

        var files = evt.target.files; // FileList object
        var file = files[0];
        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                ra_gpx_upload_this._gpxreader(reader.result, ra_gpx_upload_this._itemsCollection, {async: false});
            };
        })(file);

        // Read in the image file as a data URL.
        reader.readAsText(file);
        return false;
    }

});

L.control.gpxupload = function (options) {
    return new L.Control.GpxUpload(options);
};
