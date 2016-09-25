var L, map, OsGridRef;
L.Control.MousePosition = L.Control.extend({
    options: {
        position: 'bottomleft',
        separator: ', ',
        emptyString: 'Unavailable',
        lngFirst: false,
        numDigits: 5,
        lngFormatter: undefined,
        latFormatter: undefined,
        prefix: "Lat/Long: "
    },
    onAdd: function (map) {
        this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
        L.DomEvent.disableClickPropagation(this._container);
        map.on('mousemove', this._onMouseMove, this);
        this._container.innerHTML = this.options.emptyString;
        return this._container;
    },
    onRemove: function (map) {
        map.off('mousemove', this._onMouseMove);
    },
    _onMouseMove: function (e) {
        var text = getMouseMoveAction(e, map);
        this._container.innerHTML = text;
    }

});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
        this.addControl(this.positionControl);
    }
});

L.control.mousePosition = function (options) {
    return new L.Control.MousePosition(options);
};


function getMouseMoveAction(e, map) {
    var zoom = map.getZoom();
    var p = new LatLon(e.latlng.lat, e.latlng.lng);
    var grid = OsGridRef.latLonToOsGrid(p);
    var gr;
    var gridref;

    if (zoom > 16) {
        gr = grid.toString(8);
        gridref = '8 figure grid reference<br/><span class="osgridref">' + gr + "</span><br/>";
    }
    if (zoom > 12 & zoom <= 16) {
        gr = grid.toString(6);
        gridref = '6 figure grid reference<br/><span class="osgridref">' + gr + "</span><br/>";
    }
    if (zoom <= 12) {
        gr = grid.toString(6);
        gridref = '6 figure grid reference<br/><span class="osgridref">' + gr + "</span><br/>";
    }
    if (gr === "") {
        gridref = "Outside OS Grid<br/>";
    }

    if (zoom > 12) {
        var bounds = osGridToLatLongSquare(grid, 100);
        // change rectangle
        gridsquare100.setLatLngs(bounds);

    }
    if (zoom > 16) {
        var bounds2 = osGridToLatLongSquare(grid, 10);
        //   change rectangle
        gridsquare10.setLatLngs(bounds2);
    } else {
        //  gridsquare10.setLatLngs([[84, -89], [84.00001, -89.000001]]);
    }
    var lng = e.latlng.lng.toFixed(5);
    var lat = e.latlng.lat.toFixed(5);
    var value = "Lat/long: " + lat + ", " + lng;
    return  gridref + value;
}

function osGridToLatLongSquare(gridref, size) {
    //  if (!(gridref instanceof OsGridRef))
    //      throw new TypeError('gridref is not OsGridRef object');

    var E1 = Math.floor(gridref.easting / size) * size;
    var N1 = Math.floor(gridref.northing / size) * size;
    var E2 = E1 + size;
    var N2 = N1 + size;
    var g1 = new OsGridRef(E1, N1);
    var g2 = new OsGridRef(E1, N2);
    var g3 = new OsGridRef(E2, N2);
    var g4 = new OsGridRef(E2, N1);
    var ll1 = OsGridRef.osGridToLatLon(g1);
    var ll2 = OsGridRef.osGridToLatLon(g2);
    var ll3 = OsGridRef.osGridToLatLon(g3);
    var ll4 = OsGridRef.osGridToLatLon(g4);

    var bounds = [[ll1.lat, ll1.lon],
        [ll2.lat, ll2.lon],
        [ll3.lat, ll3.lon],
        [ll4.lat, ll4.lon],
        [ll1.lat, ll1.lon]];
    return bounds;
}
function osMapGrid(L, layer) {
    var style = {color: '#333366', weight: 1, opacity: 0.2};
    var east, north;
    var gr, latlong, lines, i;
    for (east = 0; east < 700500; east += 100000) {
        lines = new Array();
        i = 0;
        for (north = 0; north < 1300500; north += 10000) {
            gr = new OsGridRef(east, north);
            latlong = OsGridRef.osGridToLatLon(gr);
            lines[i] = new L.latLng(latlong.lat, latlong.lon);
            i++;
        }
        // L.polyline(lines, style).addTo(map);
        layer.addLayer(L.polyline(lines, style));
    }
    for (north = 0; north < 1300500; north += 100000) {
        lines = new Array();
        i = 0;
        for (east = 0; east < 700500; east += 10000) {
            gr = new OsGridRef(east, north);
            latlong = OsGridRef.osGridToLatLon(gr);
            lines[i] = new L.latLng(latlong.lat, latlong.lon);
            i++;
        }
        // L.polyline(lines, style).addTo(map);
        layer.addLayer(L.polyline(lines, style));
    }
}
