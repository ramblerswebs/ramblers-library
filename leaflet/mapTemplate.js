var L;
var map;
var gridsquare10;
var gridsquare100;
var document;

//function raLoadLeaflet() {
map = new L.Map("leafletmap", {center: new L.LatLng(54.221592, -3.355007), zoom: 5});
// Zoom control
L.control.scale().addTo(map);
// search control
new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.OpenStreetMap({countrycodes: "gb"}),
    position: "topright",
    zoomLevel: 14,
    showMarker: false
}).addTo(map);
// map types
var osm = new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> "
});

var ggl = new L.Google("ROADMAP");
var ggl2 = new L.Google("HYBRID");
var ggl3 = new L.Google("SATELLITE");
map.addLayer(osm);
mapLayers = {"Open Street Map": osm, "Google": ggl, "Google Satellite": ggl3, "Google Hybrid": ggl2};
// progress bar for custers
var progress = document.getElementById("ra-cluster-progress");
var progressBar = document.getElementById("ra-cluster-progress-bar");

function updateProgressBar(processed, total, elapsed, layersArray) {
    if (elapsed > 1000) {
        // if it takes more than a second to load, display the progress bar:
        progress.style.display = "block";
        progressBar.style.width = Math.round(processed / total * 100) + "%";
    }

    if (processed === total) {
        // all markers processed - hide the progress bar:
        progress.style.display = "none";
    }
}

// [FitBounds]

var markerStart = L.icon({
    iconUrl: "[base]/ramblers/images/marker-start.png",
    iconSize: [22, 35]
});
var markerArea = L.icon({
    iconUrl: "[base]/ramblers/images/marker-area.png",
    iconSize: [22, 35]
});
var markerCancelled = L.icon({
    iconUrl: "[base]/ramblers/images/marker-cancelled.png",
    iconSize: [22, 35]
});
var walkingarea = L.icon({
    iconUrl: "[base]/ramblers/images/area.png",
    iconSize: [40, 35]
});
var walkinggroup = L.icon({
    iconUrl: "[base]/ramblers/images/group.png",
    iconSize: [40, 35]
});
var walkingspecial = L.icon({
    iconUrl: "[base]/ramblers/images/specialgroup.png",
    iconSize: [40, 35]
});
var markersCG = L.markerClusterGroup({chunkedLoading: false, chunkProgress: updateProgressBar});

var markerList = [];
function makeGroup(color) {
    return new L.MarkerClusterGroup({
        iconCreateFunction: function (cluster) {
            return new L.DivIcon({
                iconSize: [20, 20],
                html: '<div style="text-align:center;color:#fff;background:' +
                        color + '">' + cluster.getChildCount() + '</div>'
            });
        }
    }).addTo(map);
}

// [[Add markers here]]

markersCG.addLayers(markerList);
map.addLayer(markersCG);

// create an orange rectangle
gridsquare100 = L.rectangle([[84, -89], [84.00001, -89.000001]],
        {color: "#ff7800", weight: 1}).addTo(map);
gridsquare10 = L.rectangle([[84, -89], [84.00001, -89.000001]],
        {color: "#884000", weight: 1}).addTo(map);
osgrid = L.layerGroup([]);
osMapGrid(L, osgrid);
var overlayMaps = {
    "OS 100Km Grid": osgrid
};
osgrid.addTo(map);

L.control.layers(mapLayers, overlayMaps, {collapsed: false}).addTo(map);

L.control.mousePosition().addTo(map);


//}
//;
//window.onload = function () {
//   raLoadLeaflet();
//};