var L;
var map;
var gridsquare10;
var gridsquare100;
var document;
var postcodelayer

//function raLoadLeaflet() {
map = new L.Map("leafletmap", {
    center: new L.LatLng(54.221592, -3.355007),
    zoom: 5,
    fullscreenControl: true});

var addGoogle = false;
// [set addGoogle]

// map types
var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> '}).addTo(map);
if (addGoogle) {
    var roads = L.gridLayer.googleMutant({
        type: 'roadmap' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    });
    var satellite = L.gridLayer.googleMutant({
        type: 'satellite' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    });
    var hybrid = L.gridLayer.googleMutant({
        type: 'hybrid' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    });
    var terrain = L.gridLayer.googleMutant({
        type: 'terrain' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    });
    mapLayers = {'Open Street Map': osm,
        'Google': roads,
        'Google Satellite': satellite,
        'Google Hybrid': hybrid,
        'Google Terrain': terrain
    };
} else {
    mapLayers = {'Open Street Map': osm
    };
}



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

var markerStart = L.icon({
    iconUrl: "[base]/ramblers/images/marker-start.png",
    iconSize: [35, 35]
});
var markerArea = L.icon({
    iconUrl: "[base]/ramblers/images/marker-area.png",
    iconSize: [35, 35]
});
var markerCancelled = L.icon({
    iconUrl: "[base]/ramblers/images/marker-cancelled.png",
    iconSize: [35, 35]
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
// [FitBounds]

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
// add marker and layer group to contain postcode markers
postcodeIcon = L.icon({
    iconUrl: 'ramblers/leaflet/images/postcode-icon.png',
    iconSize: [24, 18], // size of the icon
    shadowSize: [26, 20], // size of the shadow
    iconAnchor: [12, 9], // point of the icon which will correspond to marker's location
    shadowAnchor: [0, 0], // the same for the shadow
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
});
postcodeIconClosest = L.icon({
    iconUrl: 'ramblers/leaflet/images/postcode-icon-closest.png',
    iconSize: [24, 18], // size of the icon
    shadowSize: [26, 20], // size of the shadow
    iconAnchor: [12, 9], // point of the icon which will correspond to marker's location
    shadowAnchor: [0, 0], // the same for the shadow
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
});
postcodelayer = L.featureGroup([]);
postcodelayer.addTo(map);

L.control.layers(mapLayers, overlayMaps, {collapsed: true}).addTo(map);
var geocoder = L.Control.geocoder({
    defaultMarkGeocode: true,
    collapsed: true,
    geocoder: L.Control.Geocoder.nominatim({
        geocodingQueryParams: {countrycodes: 'gb'}
    })
}).addTo(map);

L.control.postcodeStatus().addTo(map);
L.control.mouse().addTo(map);

// Zoom control
L.control.scale().addTo(map);

//}
//;
//window.onload = function () {
//   raLoadLeaflet();
//};