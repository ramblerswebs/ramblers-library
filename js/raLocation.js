var ra;
if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.data) === "undefined") {
    ra.data = {};
}
if (typeof (ra.data.location) === "undefined") {
    ra.data.location = {};
    ra.data.location.position = null;
    ra.data.location.found = false;
    ra.data.location.error = '';
}
//ra.location = null;
ra.loc = (function () {
    var loc = {};
    loc.directions = function ($lat, $long) {
        var page = -'';
        if (ra.data.location.found) {
            var myloc = ra.data.location.position.coords;
            page = "https://maps.google.com?saddr=" + myloc.latitude.toString() + "," + myloc.longitude.toString() + "&daddr=" + $lat.toString() + "," + $long.toString();
        } else {
            alert("Sorry - Unable to find your location, we will ask Google to try");
            page = "https://www.google.com/maps/dir/Current+Location/" + $lat.toString() + "," + $long.toString();
        }
        // console.log(page);
        window.open(page, "_blank", "scrollbars=yes,width=900,height=580,menubar=yes,resizable=yes,status=yes");
    };
    loc.getPosition = function (options = {desiredAccuracy: 100, maxWait: 10000}) {
        navigator.geolocation.getAccurateCurrentPosition(loc._onSuccess, loc._onError, loc._onProgress,
                options);
    };

    loc._onSuccess = function (position) {
        ra.data.location.position = position;
        ra.data.location.found = true;
        ra.data.location.error = "";
        var e = document.createEvent('HTMLEvents');
        e.initEvent('accuratepositionfound', false, true);
        e.result = ra.data.location;
        document.dispatchEvent(e);

    };
    loc._onError = function (error) {
        ra.data.location.position = null;
        ra.data.location.found = false;
        ra.data.location.error = error;
        var e = document.createEvent('HTMLEvents');
        e.initEvent('accuratepositionerror', false, true);
        e.result = ra.data.location;
        document.dispatchEvent(e);
    };
    loc._onProgress = function (position) {
        if (!ra.data.location.found) {
            ra.data.location.position = position;
            ra.data.location.found = false;
            ra.data.location.error = "";
             var e = document.createEvent('HTMLEvents');
            e.initEvent('accuratepositionprogress', false, true);
            e.result = ra.data.location;
            document.dispatchEvent(e);
        }
    };

    return loc;
}
());


// https://github.com/gregsramblings/getAccurateCurrentPosition
// navigator.geolocation.getAccurateCurrentPosition(onSuccess, onError, onProgress, {desiredAccuracy:20, maxWait:15000});

navigator.geolocation.getAccurateCurrentPosition = function (geolocationSuccess, geolocationError, geoprogress, options) {
    var lastCheckedPosition,
            locationEventCount = 0,
            watchID,
            timerID;

    options = options || {};

    var checkLocation = function (position) {
        lastCheckedPosition = position;
        locationEventCount = locationEventCount + 1;
        // We ignore the first event unless it's the only one received because some devices seem to send a cached
        // location even when maxaimumAge is set to zero
        if ((position.coords.accuracy <= options.desiredAccuracy) && (locationEventCount > 1)) {
            clearTimeout(timerID);
            navigator.geolocation.clearWatch(watchID);
            foundPosition(position);
        } else {
            geoprogress(position);
        }
    };

    var stopTrying = function () {
        navigator.geolocation.clearWatch(watchID);
        foundPosition(lastCheckedPosition);
    };

    var onError = function (error) {
        clearTimeout(timerID);
        navigator.geolocation.clearWatch(watchID);
        geolocationError(error);
    };

    var foundPosition = function (position) {
        geolocationSuccess(position);
    };

    if (!options.maxWait)
        options.maxWait = 10000; // Default 10 seconds
    if (!options.desiredAccuracy)
        options.desiredAccuracy = 20; // Default 20 meters
    if (!options.timeout)
        options.timeout = options.maxWait; // Default to maxWait

    options.maximumAge = 0; // Force current locations only
    options.enableHighAccuracy = true; // Force high accuracy (otherwise, why are you using this function?)

    watchID = navigator.geolocation.watchPosition(checkLocation, onError, options);
    timerID = setTimeout(stopTrying, options.maxWait); // Set a timeout that will abandon the location loop
};