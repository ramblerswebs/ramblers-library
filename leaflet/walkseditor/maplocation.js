var OsGridRef;
maplocation = function () {
    this.displayLocation = function (dataObject, tag) {
        var location = '';
        location = '<span class="error">No location specified</span>';
        if (!dataObject.hasOwnProperty('isLatLongSet')) {
            dataObject.isLatLongSet = false;
        }
        if (dataObject.isLatLongSet) {
            if (dataObject.gridref10 === "") {
                location = "Non UK:  Lat: " + dataObject.latitude.toFixed(5) + " Long: " + dataObject.longitude.toFixed(5);
            } else {
                location = "Grid Reference: " + dataObject.gridref10;
            }

            if (dataObject.hasOwnProperty('nearestpostcode')) {
                if (dataObject.nearestpostcode.hasOwnProperty('postcode')) {
                    location += ",  Nearest Postcode: " + dataObject.nearestpostcode.postcode;
                    location += " [" + dataObject.nearestpostcode.distance.toFixed(0) + " metres]";
                }
            }
            if (dataObject.hasOwnProperty('what3words_words')) {
                location += "<br/>///: " + dataObject.what3words_words;
                location += ", Nearest place " + dataObject.what3words_nearestPlace;
            }
        }
        tag.innerHTML = location;
    };
    this.setLocation = function (dataObject, latitude, longitude) {
        dataObject.latitude = latitude;
        dataObject.longitude = longitude;
        var p = new LatLon(latitude, longitude);
        var grid = OsGridRef.latLonToOsGrid(p);
        var gr8 = grid.toString(6);
        var gr10 = grid.toString(8);
        dataObject.gridref8 = gr8;
        dataObject.gridref10 = gr10;

        if (dataObject.hasOwnProperty('nearestpostcode')) {
            delete dataObject.nearestpostcode;
        }
        if (dataObject.hasOwnProperty('what3words_words')) {
            delete dataObject.what3words;
        }
        if (dataObject.hasOwnProperty('what3words_nearestPlace')) {
            delete dataObject.what3words;
        }
        dataObject.isLatLongSet = true;

    };
    this.getClosestPostcode = function (dataObject, tag) {
        var p = new LatLon(dataObject.latitude, dataObject.longitude);
        var grid = OsGridRef.latLonToOsGrid(p);
//        if (dataObject.hasOwnProperty('nearestpostcode')) {
//            delete dataObject.nearestpostcode;
//        }
        var east = Math.round(grid.easting);
        var north = Math.round(grid.northing);
        var url = "https://postcodes.theramblers.org.uk/index.php?easting=" + east + "&northing=" + north + "&dist=10&maxpoints=1";
        getJSON(url, function (err, pcs) {
            if (err !== null) {
                postcode = {};
            } else {
                if (pcs.length !== 0) {
                    var closest = pcs[0];
                    var postcode = {};
                    postcode.postcode = closest.Postcode.replace(/  /g, " ");
                    postcode.distance = closest.Distance;
                    var gr = new OsGridRef(closest.Easting, closest.Northing);
                    var latlong = OsGridRef.osGridToLatLon(gr);
                    postcode.latitude = latlong.lat;
                    postcode.longitude = latlong.lon;
                    let event = new Event("postcodefound", {bubbles: true}); // (2)
                    event.ra = {};
                    event.ra.postcode = postcode;
                    event.ra.dataObject = dataObject;
                    event.ra.tag = tag;
                    tag.dispatchEvent(event);
                }
            }
        });
    };
    this.clearLocation = function (dataObject) {
        delete dataObject.latitude;
        delete dataObject.longitude;
        delete dataObject.gridref8;
        delete dataObject.gridref10;
        delete dataObject.nearestpostcode;
        dataObject.isLatLongSet = false;
    };


};