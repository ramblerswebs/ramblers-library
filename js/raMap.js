var L, ra, OsGridRef;
if (typeof (ra) === "undefined") {
    ra = {};
}
ra.map = (function () {
    var my = {};
    my.defaultMapOptions = {};
    my.getMapLink = function (latitude, longitude, $text) {
        var $code = "http://maps.google.com/maps?z=13&amp;t=h&amp;ll=[lat],[long]";
        $code = $code.replace("[lat]", latitude, $code);
        $code = $code.replace("[long]", longitude, $code);
        return   "<span class='mappopup' onClick=\"javascript:window.open('" + $code + "', '_blank','toolbar=yes,scrollbars=yes,left=50,top=50,width=800,height=600');\">[" + $text + "]</span>";
    };
    my.icon = (function () {
        var icon = {};

        icon.postcode = function () {
            if (typeof (icon._postcode) === "undefined") {
                icon._postcode = L.icon({
                    iconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/postcode-icon.png',
                    iconSize: [24, 18], // size of the icon
                    shadowSize: [26, 20], // size of the shadow
                    iconAnchor: [12, 9], // point of the icon which will correspond to marker's location
                    shadowAnchor: [0, 0], // the same for the shadow
                    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
                });
            }
            return icon._postcode;
        };
        icon.postcodeClosest = function () {
            if (typeof (icon._postcodeClosest) === "undefined") {
                icon._postcodeClosest = L.icon({
                    iconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/postcode-icon-closest.png',
                    iconSize: [24, 18], // size of the icon
                    shadowSize: [26, 20], // size of the shadow
                    iconAnchor: [12, 9], // point of the icon which will correspond to marker's location
                    shadowAnchor: [0, 0], // the same for the shadow
                    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
                });
            }
            return icon._postcodeClosest;
        };
        icon.redmarker = function () {
            if (typeof (icon._redmarker) === "undefined") {
                icon._redmarker = L.icon({
                    iconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/redmarker.png',
                    iconSize: [32, 32], // size of the icon
                    shadowSize: [26, 20], // size of the shadow
                    iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
                    shadowAnchor: [0, 0], // the same for the shadow
                    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
                });
            }
            return icon._redmarker;
        };
        icon.s0 = function () {
            if (typeof (icon._s0) === "undefined") {
                icon._s0 = L.icon({
                    iconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/rejected.png',
                    iconSize: [15, 15]
                });
            }
            return icon._s0;
        };
        icon.s1 = function () {
            if (typeof (icon._s1) === "undefined") {
                icon._s1 = L.icon({
                    iconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/1star.png',
                    iconSize: [19, 19]
                });
            }
            return icon._s1;
        };
        icon.s2 = function () {
            if (typeof (icon._s2) === "undefined") {
                icon._s2 = L.icon({
                    iconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/2star.png',
                    iconSize: [21, 21]
                });
            }
            return icon._s2;
        };
        icon.s3 = function () {
            if (typeof (icon._s3) === "undefined") {
                icon._s3 = L.icon({
                    iconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/3star.png',
                    iconSize: [23, 23]
                });
            }
            return icon._s3;
        };
        icon.s4 = function () {
            if (typeof (icon._s4) === "undefined") {
                icon._s4 = L.icon({
                    iconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/4star.png',
                    iconSize: [25, 25]
                });
            }
            return icon._s4;
        };
        icon.s5 = function () {
            if (typeof (icon._s5) === "undefined") {
                icon._s5 = L.icon({
                    iconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/5star.png',
                    iconSize: [27, 27]
                });
            }
            return icon._s5;
        };
        icon.markerRoute = function () {
            if (typeof (icon._markerRoute) === "undefined") {
                icon._markerRoute = L.icon({
                    iconUrl: ra.baseDirectory() + "libraries/ramblers/images/marker-route.png",
                    iconSize: [30, 40],
                    iconAnchor: [15, 36]
                });
            }
            return icon._markerRoute;
        };
        icon.markerStart = function () {
            if (typeof (icon._markerStart) === "undefined") {
                icon._markerStart = L.icon({
                    iconUrl: ra.baseDirectory() + "libraries/ramblers/images/marker-start.png",
                    iconSize: [35, 35]
                });
            }
            return icon._markerStart;
        };
        icon.markerArea = function () {
            if (typeof (icon._markerArea) === "undefined") {
                icon._markerArea = L.icon({
                    iconUrl: ra.baseDirectory() + "libraries/ramblers/images/marker-area.png",
                    iconSize: [35, 35]
                });
            }
            return icon._markerArea;
        };
        icon.markerCancelled = function () {
            if (typeof (icon._markerCancelled) === "undefined") {
                icon._markerCancelled = L.icon({
                    iconUrl: ra.baseDirectory() + "libraries/ramblers/images/marker-cancelled.png",
                    iconSize: [35, 35]
                });
            }
            return icon._markerCancelled;
        };
        icon.walkingarea = function () {
            if (typeof (icon._walkingarea) === "undefined") {
                icon._walkingarea = L.icon({
                    iconUrl: ra.baseDirectory() + "libraries/ramblers/images/area.png",
                    iconSize: [40, 35]
                });
            }
            return icon._walkingarea;
        };
        icon.walkinggroup = function () {
            if (typeof (icon._walkinggroup) === "undefined") {
                icon._walkinggroup = L.icon({
                    iconUrl: ra.baseDirectory() + "libraries/ramblers/images/group.png",
                    iconSize: [40, 35]
                });
            }
            return icon._walkinggroup;
        };
        icon.walkingspecial = function () {
            if (typeof (icon._walkingspecial) === "undefined") {
                icon._walkingspecial = L.icon({
                    iconUrl: ra.baseDirectory() + "libraries/ramblers/images/specialgroup.png",
                    iconSize: [40, 35]
                });
            }
            return icon._walkingspecial;
        };

        icon.grade = function (nationalGrade) {
            var icon = null;
            switch (nationalGrade) {
                case "Easy Access":
                    icon = L.icon({
                        iconUrl: ra.baseDirectory() + "libraries/ramblers/images/grades/e.png",
                        iconSize: [40, 35]
                    });
                    break;
                case "Easy":
                    icon = L.icon({
                        iconUrl: ra.baseDirectory() + "libraries/ramblers/images/grades/ea.png",
                        iconSize: [40, 35]
                    });
                    break;
                case "Leisurely":
                    icon = L.icon({
                        iconUrl: ra.baseDirectory() + "libraries/ramblers/images/grades/l.png",
                        iconSize: [40, 35]
                    });
                    break;
                case "Moderate":
                    icon = L.icon({
                        iconUrl: ra.baseDirectory() + "libraries/ramblers/images/grades/m.png",
                        iconSize: [40, 35]
                    });
                    break;
                case "Strenuous":
                    icon = L.icon({
                        iconUrl: ra.baseDirectory() + "libraries/ramblers/images/grades/s.png",
                        iconSize: [40, 35]
                    });
                    break;
                case "Technical":
                    icon = L.icon({
                        iconUrl: ra.baseDirectory() + "libraries/ramblers/images/grades/t.png",
                        iconSize: [40, 35]
                    });
                    break;
                default:
                    break;
            }
            return icon;
        };
        icon.setMarker = function (marker, name) {
            var icon1;
            if (name === "") {
                icon1 = L.icon({
                    iconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/marker-icon.png',
                    iconSize: [25, 41], // size of the icon
                    iconAnchor: [12, 41],
                    popupAnchor: [0, -41]
                });
                marker.setIcon(icon1);
                return;
            }
            var file = ra.baseDirectory() + "libraries/ramblers/gpxsymbols/exists.php?file=" + name + ".png";
            marker.file = ra.baseDirectory() + "libraries/ramblers/gpxsymbols/" + name + ".png";
            ra.ajax.getUrl(file, "", marker, icon._setIcon);
        };
        icon._setIcon = function (marker, response) {
            var url = marker.file;
            var icon1;
            marker.file = null;
            if (response === 'true') {
                icon1 = L.icon({
                    iconUrl: url,
                    iconSize: [32, 37],
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -41]
                });
            } else {
                icon1 = L.icon({
                    iconUrl: ra.baseDirectory() + 'libraries/ramblers/leaflet/images/redmarker.png',
                    iconSize: [36, 41], // size of the icon
                    iconAnchor: [18, 41],
                    popupAnchor: [0, -41]
                });
            }
            marker.setIcon(icon1);
        };
        return icon;
    }
    ());
    my.os = (function () {
        var os = {};
        os.display = function (map, layer) {
            var boundstr = "Bounds: <br/>";
            for (j = 0; j < map.bounds.length; j++) {
                var rect;
                var bounds = map.bounds[j];
                var pt1 = os.getPointInfo(bounds.eastingmin, bounds.northingmin);
                var pt2 = os.getPointInfo(bounds.eastingmax, bounds.northingmax);
                var area = [pt1.latlng, pt2.latlng];
                boundstr += pt1.gr + " to " + pt2.gr + "<br/>";
            }
            //  console.log(map.type + " " + map.number);
            //  console.log(boundstr);
            for (j = 0; j < map.bounds.length; j++) {
                var rect;
                var bounds = map.bounds[j];
                var pt1 = os.getPointInfo(bounds.eastingmin, bounds.northingmin);
                var pt2 = os.getPointInfo(bounds.eastingmin, bounds.northingmax);
                var pt3 = os.getPointInfo(bounds.eastingmax, bounds.northingmax);
                var pt4 = os.getPointInfo(bounds.eastingmax, bounds.northingmin);
                var area = [pt1.latlng, pt2.latlng, pt3.latlng, pt4.latlng];
                if (map.scale === "50000") {
                    rect = L.polygon(area, {color: "#ff0000", weight: 1});
                } else {
                    rect = L.polygon(area, {color: "#ff7800", weight: 1});
                }
                var msg = "<h4>" + map.type + " " + map.number + "</h4>";
                msg += "<p>" + map.title + "</p>";
                msg += "<p>Scale: 1:" + map.scale.substr(0, 2) + "k</p>";
                msg += boundstr;
                rect.bindPopup(msg);
                layer.addLayer(rect);
            }
        };
        os.getPointInfo = function (east, north) {
            var value = {};
            var os = new OsGridRef(east, north);
            var pt = OsGridRef.osGridToLatLon(os);
            value.latlng = L.latLng(pt.lat, pt.lon);
            value.gr = os.toString(6);
            return value;
        }
        ;
        return os;
    }
    ());
    my.places = (function () {
        var places = {};
        // starting or meeting place markers
        places.addMarker = function ($gr, $no, $lat, $long) {
            var $icon;
            switch ($no) {
                case 0:
                    $icon = ra.map.icon.s0();
                    break;
                case 1:
                    $icon = ra.map.icon.s1();
                    break;
                case 2:
                    $icon = ra.map.icon.s2();
                    break;
                case 3:
                    $icon = ra.map.icon.s3();
                    break;
                case 4:
                    $icon = ra.map.icon.s4();
                    break;
                case 5:
                    $icon = ra.map.icon.s5();
                    break;
            }

            var marker = L.marker([$lat, $long], {icon: $icon, gridref: $gr, no: $no, lat: $lat, long: $long});
            marker.gr = $gr;
            var text = "<br/><b>Searching for usage details ...</b>";
            marker.bindPopup("<b>Grid Ref " + $gr + "</b><br/>Lat/Long " + $lat + " " + $long + text, {maxWidth: 800});
            marker.on('click', places.onClickPlaceMarker, marker);
            return marker;
        };
        places.onClickPlaceMarker = function (e) {
            var marker = e.target;
            var $url = "https://places.walkinginfo.co.uk/details.php?gr=" + this.options.gridref;
            ra.ajax.getUrl($url, "", marker, places.displayDetails);
        };
        places.displayDetails = function (marker, result) {
            var popup = marker.getPopup();
            var ll = marker.getLatLng();
            var gr = new LatLon(ll.lat, ll.lng);
            gr = OsGridRef.latLonToOsGrid(gr);
            var json = JSON.parse(result);
            var nolikes = "";
            if (json.likes > 0) {
                nolikes = "<sup>" + json.likes + "</sup>";
            }
            var nodislikes = "";
            if (json.dislikes > 0) {
                nodislikes = "<sup>" + json.dislikes + "</sup>";
            }
            var like = "<span class=\"agreebutton hasTip\" title=\"VOTE: This location is correct\"><a href=\"javascript:ra.map.places.correct('" + marker.gr + "') \"> &#9745;</a>" + nolikes + " </span>";
            var dislike = "<span class=\"agreebutton hasTip\" title=\"VOTE: This location is INCORRECT\"><a href=\"javascript:ra.map.places.incorrect('" + marker.gr + "') \"> &#9746;</a>" + nodislikes + " </span>";
            var streetmap = "<span class=\"placebutton-green hasTip\" title=\"View location in streetmap.co.uk\"><a href=\"javascript:ra.link.streetmap('" + ll.lat + "," + ll.lng + "') \">Streetmap</a></span>";
            var google = "<span class=\"placebutton-green hasTip\" title=\"View location in Google maps\"><a href=\"javascript:googlemap(" + ll.lat + "," + ll.lng + ") \">Google Map</a></span>";
            var out = "<span class='placelocation'>Place Grid Ref " + marker.gr + " </span>" + like + dislike + streetmap + google;
            out += "<div id=" + marker.gr + "></div>";
            out += "<div >" + gr.toString(8) + "</div>";
            out += "<p><b>Description</b> [Date used / Score]</p>";
            out += "<ul>";
            var items = json.records;
            for (i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.desc === "") {
                    item.desc = "<i>no description</i>";
                }
                out += "<li>" + item.desc + " [" + item.lastread + "/" + item.score + "%]</li>";
            }
            out += "</ul>";
            popup.setContent(out);
            popup.update();
        };

        places.correct = function (gr) {
            var $url = "https://places.walkinginfo.co.uk/report.php?gr=" + gr + "&type=like";
            ra.ajax.getUrl($url, "", gr, places.votelike);
        };
        places.incorrect = function (gr) {
            var $url = "https://places.walkinginfo.co.uk/report.php?gr=" + gr + "&type=dislike";
            ra.ajax.getUrl($url, "", gr, places.votedislike);
        };
        places.votelike = function (gr, result) {
            document.getElementById(gr).innerHTML = "Correct vote recorded";
        };
        places.votedislike = function (gr, result) {
            document.getElementById(gr).innerHTML = "Incorrect vote recorded";
        };
        return places;
    }
    ());
    // distance in metres
    my.getGPXDistance = function (distance) {
        var dist, miles;
        dist = ra.units.metresTokm(distance);
        miles = ra.units.metresToMi(distance);
        return dist.toFixed(1) + ' km / ' + miles.toFixed(2) + 'mi';
    };
    my.getLngLats = function (latlngs) {
        var i = 0;
        var lnglats = [];
        var len = latlngs.length;
        for (i = 0; i < len; i++) {
            // change to long/lat rather than lat/long
            lnglats[i] = [];
            lnglats[i][0] = latlngs[i].lng;
            lnglats[i][1] = latlngs[i].lat;
        }
        return lnglats;
    };
    my.ragetLatlngs = function (lnglats) {
        var latlngs = [];
        for (const lnglat of lnglats) {
            var latlng = L.latLng(lnglat[1], lnglat[0]);
            latlngs.push(latlng);
        }
        return latlngs;
    };
    // remove segments less than 2 metres
    my.removeShortSegments = function (latlngsOrig) {
        var latlngs = [];
        var last = null;
        var dist;
        for (const latlng of latlngsOrig) {
            if (last !== null) {
                dist = last.distanceTo(latlng);
                if (dist > 2) {
                    latlngs.push(latlng);
                }
            } else {
                latlngs.push(latlng);
            }
            last = latlng;
        }
        return latlngs;
    };
    return my;
}
());

function cluster(map) {
    this.progressDiv = 'ra-cluster-progress-bar';

    this._map = map;
    this.progressBar = document.getElementById(this.progressDiv);
    this.markersCG = L.markerClusterGroup({chunkedLoading: true, chunkProgress: this.updateClusterProgressBar, disableClusteringAtZoom: 12, maxClusterRadius: 50});
    this.markerList = [];
    this.progressBar.style.display = "none";
    this.markersCG.addLayers(this.markerList);
    this._map.addLayer(this.markersCG);

    this.updateClusterProgressBar = function (processed, total, elapsed) {
        if (elapsed > 1000) {
// if it takes more than a second to load, display the progress bar:
            this.progressBar.innerHTML = "Loading: " + Math.round(processed / total * 100) + "%";
            this.progressBar.style.display = "block";
        }
        if (processed === total) {
            this.progressBar.style.display = "none";// all markers processed - hide the progress bar:
        }
    };
    this.removeClusterMarkers = function () {
        this.markersCG.removeLayers(this.markerList);
        this.markerList = [];
        //     ramblersMap.markersCG.addLayers(ramblersMap.markerList);
    };
    this.addClusterMarkers = function () {
        this.markersCG.addLayers(this.markerList);
        if (this.markerList.length > 0) {
            var bounds = getBounds(this.markerList);
            this._map.fitBounds(bounds);
        }
    };
    this.addMarker = function ($popup, $lat, $long, $icon) {
        var marker = L.marker([$lat, $long], {icon: $icon});
        var $pop = $popup.replace(/&quot;/g, '"'); // replace quots in popup text
        marker.bindPopup($pop, {offset: new L.Point(0, -20)});
        this.markerList.push(marker);
    };

}
//var cluster = (function () {
//
//    var cluster = function (map) {
//       
//    this.progressDiv = 'ra-cluster-progress-bar';
//
//    this._map = map;
//    this.progressBar = document.getElementById(this.progressDiv);
//    this.markersCG = L.markerClusterGroup({chunkedLoading: true, chunkProgress: this.updateClusterProgressBar, disableClusteringAtZoom: 12, maxClusterRadius: 50});
//    this.markerList = [];
//    this.progressBar.style.display = "none";
//    this.markersCG.addLayers(this.markerList);
//    this._map.addLayer(this.markersCG);
//
//    this.updateClusterProgressBar = function (processed, total, elapsed) {
//        if (elapsed > 1000) {
//// if it takes more than a second to load, display the progress bar:
//            this.progressBar.innerHTML = "Loading: " + Math.round(processed / total * 100) + "%";
//            this.progressBar.style.display = "block";
//        }
//        if (processed === total) {
//            this.progressBar.style.display = "none";// all markers processed - hide the progress bar:
//        }
//    };
//    this.removeClusterMarkers = function () {
//        this.markersCG.removeLayers(this.markerList);
//        this.markerList = [];
//        //     ramblersMap.markersCG.addLayers(ramblersMap.markerList);
//    };
//    this.addClusterMarkers = function () {
//        this.markersCG.addLayers(this.markerList);
//        if (this.markerList.length > 0) {
//            var bounds = getBounds(this.markerList);
//            this._map.fitBounds(bounds);
//        }
//    };
//    this.addMarker = function ($popup, $lat, $long, $icon) {
//        var marker = L.marker([$lat, $long], {icon: $icon});
//        var $pop = $popup.replace(/&quot;/g, '"'); // replace quots in popup text
//        marker.bindPopup($pop, {offset: new L.Point(0, -20)});
//        this.markerList.push(marker);
//    };
//
//};
// 
//    return cluster;
//
//})();