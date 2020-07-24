var ramblersMap, ramblers, L;
mapdisplay = function () {

    this.add = function (tab) {
        var guide = document.createElement('div');
        guide.setAttribute('id', 'js-guide-div');
        tab.appendChild(guide);
        var container = document.createElement('div');
        container.setAttribute('class', 'map-container');
        tab.appendChild(container);
        var mapDiv = document.createElement('div');
        mapDiv.setAttribute('id', 'leafletmap');
        container.appendChild(mapDiv);
        var copy = document.createElement('p');
        tab.appendChild(copy);
        copy.innerHTML = "<p class='mapcopyright'>OS data © Crown copyright and database 2018;   Royal Mail data © Royal Mail copyright and Database 2018</p><p class='mapcopyright'>Maps Icons Collection https://mapicons.mapsmarker.com</p><br/></p>";
        raLoadLeaflet();
    };
    this.redisplay = function (e) {
        ramblersMap.map.invalidateSize();
    };
    this.addMapCopyRight = function (tag) {
        var html = "<p class='mapcopyright'>OS data © Crown copyright and database 2018;   Royal Mail data © Royal Mail copyright and Database 2018</p><p class='mapcopyright'>Maps Icons Collection https://mapicons.mapsmarker.com</p><br/></p>";
        tag.innerHTML = html;
    };
    this.displayMarkersOnMap = function () {
        var item, items, title;
        var i, no, nomarker = false;
        var lat, long;
        var map = ramblersMap.map;
        var layer;
        var line = [];

        var buttonsDiv = document.getElementById("js-gewmapButtons");
        buttonsDiv.innerHTML = "";
        var guideDiv = document.getElementById("js-guide-div");
        if (guideDiv !== null) {
            guideDiv.innerHTML = "";
            var guide = document.createElement('p');
            // guide.setAttribute('class', 'smaller');
            guide.innerHTML = "The locations for the following places have not been defined; either drag them to the correct location or use the <b>Find Approx Location</b> buttons in the Edit tab";
            //  guideDiv.appendChild(guide);
            var ulTag = document.createElement('ul');
            guideDiv.appendChild(ulTag);
            if (ramblers.editMode) {
                var guide2 = document.createElement('p');
                guide2.textContent = "You should drag the meeting/start markers to their correct locations, zoom in as necessary";
                guideDiv.appendChild(guide2);
            }
        }
        if (ramblers.markerLayer === null) {
            ramblers.markerLayer = L.featureGroup([]);
            map.addLayer(ramblers.markerLayer);
        }
        layer = ramblers.markerLayer;
        layer.clearLayers();
        no = 0;
        var type = ramblers.walk.meeting.type;
        items = ramblers.walk.meeting.locations;
        for (i = 0; i < items.length; i++) {
            switch (type) {
                case 'car':
                    title = 'Car Share ';
                    break;
                case 'coach':
                    title = 'Coach Pick Up ' + (i + 1).toString();
                    break;
                case 'public':
                    title = 'Public Transport Pick Up ' + (i + 1).toString();
                    break;
            }
            if (items[i].isLatLongSet) {
                lat = items[i].latitude;
                long = items[i].longitude;
            } else {
                this.noMarkerFor(title, ulTag);
                nomarker = true;
                lat = 50;
                long = -4.8 + 1.4 * no;
            }
            no += 1;
            line.push([lat, long]);
            this.addGwemMarker(items[i], title, 'meet');
        }

        type = ramblers.walk.start.type;
        switch (type) {
            case 'area':
                item = ramblers.walk.start.area;

                if (item.isLatLongSet) {
                    lat = item.latitude;
                    long = item.longitude;
                } else {
                    this.noMarkerFor('Walking area', ulTag);
                    nomarker = true;
                    lat = 50;
                    long = -4.8 + 1.4 * no;
                }
                no += 1;
                line.push([lat, long]);
                this.addGwemMarker(item, 'Walk will be around this area', 'area');
                break;
            case 'start':
                item = ramblers.walk.start.location;
                if (item.isLatLongSet) {
                    lat = item.latitude;
                    long = item.longitude;
                } else {
                    this.noMarkerFor('Start of Walk ', ulTag);
                    nomarker = true;
                    lat = 50;
                    long = -4.8 + 1.4 * no;
                }
                no += 1;
                line.push([lat, long]);
                this.addGwemMarker(item, 'Start of walk', 'start');
                break;
        }
        this.drawConnectionLine(line);
        this.addZoomAll(no);
        if (ramblers.editMode) {
            this.addEditWalk();
        }
        if (no > 0) {
            var bounds = layer.getBounds();
            ramblersMap.map.fitBounds(bounds, {padding: [150, 150], maxZoom: 16});
        }
        if (nomarker) {
            guideDiv.insertBefore(guide, guideDiv.childNodes[0]);
        }

    };
    this.addGwemMarker = function (item, title, type) {
        var lat = item.latitude;
        var long = item.longitude;
        var layer = ramblers.markerLayer;
        var icon;
        var marker;

        switch (type) {
            case 'meet':
                icon = L.icon({
                    iconUrl: ramblersMap.base + "libraries/ramblers/images/marker-route.png",
                    iconSize: [33, 50],
                    iconAnchor: [16, 45],
                    popupAnchor: [0, -45]
                });
                break;

            case 'start':
                icon = L.icon({
                    iconUrl: ramblersMap.base + "libraries/ramblers/images/marker-start.png",
                    iconSize: [35, 35],
                    iconAnchor: [16, 16],
                    popupAnchor: [0, -16]
                });
                break;
            case 'area':
                icon = L.icon({
                    iconUrl: ramblersMap.base + "libraries/ramblers/images/marker-area.png",
                    iconSize: [70, 70],
                    iconAnchor: [35, 35],
                    popupAnchor: [0, -35]
                });
                break;
            default:
                icon = L.icon({
                    iconUrl: ramblersMap.base + "libraries/ramblers/images/marker-start.png",
                    iconSize: [35, 35],
                    iconAnchor: [16, 16],
                    popupAnchor: [0, -16]
                });
                break;
        }
        var poptext = this.getMarkerPopupText(item, title, type);

        var popup = new L.Popup({'autoClose': false});
        popup.setLatLng([lat, long]);
        popup.setContent(poptext);
        if (ramblers.editMode) {
            marker = L.marker([lat, long], {draggable: true, icon: icon}).addTo(layer).bindPopup(popup).openPopup();
        } else {
            marker = L.marker([lat, long], {draggable: false, icon: icon}).addTo(layer).bindPopup(popup).openPopup();
        }
        if (ramblers.editMode) {
            marker.addEventListener('dragstart', this.dragStartHandler);
            marker.addEventListener('drag', this.dragHandler);
            marker.addEventListener('dragend', this.dragEndHandler);
            marker.addEventListener('onpostcodeupdate', this.postcodeupdate);
        }
        //  marker.raType = "marker";
        marker.ra = {};
        marker.ra.raObject = item;
        marker.ra.title = title;
        marker.ra.type = type;
        if (type !== 'area') {
            this.displayPostcode(item, marker);
        }
        // add button on map
        var buttonsDiv = document.getElementById("js-gewmapButtons");
        var zoomBtn = document.createElement('button');
        zoomBtn.setAttribute('type', 'button');
        zoomBtn.setAttribute('class', 'actionbutton');
        zoomBtn.textContent = title;
        zoomBtn.ra = {};
        zoomBtn.ra.dataObject = item;
        zoomBtn.ra.marker = marker;
        buttonsDiv.appendChild(zoomBtn);
        zoomBtn.addEventListener("click", function (e) {
            var button = e.target;
            var latLng = button.ra.marker.getLatLng();
            ramblersMap.map.setView(latLng, 16);
        });
        return;
    };
    this.getMarkerPopupText = function (item, title, type) {
        var popup = "<div><b>" + title + "</b>";
        if (type !== 'area') {
//            if (item.hasOwnProperty('time')) {
//                popup += "<br/>Time: " + item.time;
//            }
//            if (item.hasOwnProperty('name')) {
//                popup += "<br/>Name: " + item.name;
//            } else {
//                popup += "<br/>Location requires a name";
//            }
            if (item.gridref10 !== '') {
                popup += "<br/>Grid Ref: " + item.gridref10;
            } else {
                popup += "<br/>Location not in UK";
                popup += "<br/>Latitude: " + item.latitude.toFixed(5);
                popup += "<br/>Longitude: " + item.longitude.toFixed(5);
            }
//            if (item.hasOwnProperty('satnavpostcode')) {
//                popup += "<br/>Sat Nav Postcode: " + item.satnavpostcode;
//            }
            if (item.hasOwnProperty('nearestpostcode')) {
                popup += "<br/>Nearest Postcode: " + item.nearestpostcode.postcode + ", " + item.nearestpostcode.distance.toFixed(0) + " metres";
            }
               if (item.hasOwnProperty('what3words_words')) {
                popup += "<br/>///: " + item.what3words_words ;
            }
               if (item.hasOwnProperty('what3words_nearestPlace')) {
                popup += "<br/>Nearest Place: " + item.what3words_nearestPlace;
            }
        } else {
             if (item.hasOwnProperty('what3words_nearestPlace')) {
                popup += "<br/>Nearest Place: " + item.what3words_nearestPlace;
            }
            popup += "<br/>Walkers should not travel to area but use meeting place/travel arrangements";
        }
        if (ramblers.editMode) {
            popup += "<br/><i>Drag marker to correct location</i>";
        }
        return popup.replace(/&quot;/g, '"'); // replace quots in popup text 
    };
    this.dragStartHandler = function (e) {

        // Get the polyline's latlngs
        var latlngs = ramblers.dragLine.getLatLngs(),
                // Get the marker's start latlng
                latlng = this.getLatLng();
        // Iterate the polyline's latlngs
        for (var i = 0; i < latlngs.length; i++) {

            // Compare each to the marker's latlng
            if (latlng.equals(latlngs[i])) {

                // If equals store key in marker instance
                ramblers.dragLineLatlng = i;
            }
        }
    };
    this.dragHandler = function (e) {
        // Get the polyline's latlngs
        var latlngs = ramblers.dragLine.getLatLngs();
        // Get the marker's current latlng
        var latlng = this.getLatLng();
        // Replace the old latlng with the new
        latlngs.splice(ramblers.dragLineLatlng, 1, latlng);
        // Update the polyline with the new latlngs
        ramblers.dragLine.setLatLngs(latlngs);
    };
    this.dragEndHandler = function (e) {
        // Delete key from marker instance
        delete ramblers.dragLineLatlng;
        //store new position
        var item = e.target.ra.raObject;
        var type = e.target.ra.type;
        var latlng = this.getLatLng();
        var loc = new maplocation();
        var marker = e.target;
        loc.setLocation(item, latlng.lat, latlng.lng);
        if (marker.hasOwnProperty('ra')) {
            if (marker.ra.hasOwnProperty('pcMarker')) {
                ramblers.markerLayer.removeLayer(marker.ra.pcMarker);
                delete marker.ra.pcMarker;
            }
        }
        if (type !== 'area') {
            var guideDiv = document.getElementById("js-guide-div");
            guideDiv.addEventListener("postcodefound", function (e) {
                var data = {};
                data.marker = marker;
                data.item = item;
                data.postcode = e.ra.postcode;
                data.dataObject = e.ra.dataObject;
                data.dataObject.nearestpostcode = data.postcode;
                marker.fire("onpostcodeupdate", data);
            });
            loc.getClosestPostcode(item, guideDiv);
        }
        // reset popup
        var map = new mapdisplay;
        map.resetMarkerPopup(item, marker);

    };
    this.resetMarkerPopup = function (item, marker) {
        var popup = marker.getPopup();
        if (typeof (popup) !== "undefined") {
            var content = this.getMarkerPopupText(item, marker.ra.title, marker.ra.type);
            popup.setContent(content);
            marker.openPopup();
        }
    };


    this.drawConnectionLine = function (line) {
        if (line.count < 2) {
            return;
        }
        var layer = ramblers.markerLayer;
        var line = L.polyline(line, {color: '#8BA69C', opacity: 0.5, weight: 5}).addTo(layer);
        ramblers.dragLine = line;
        //   line.raType = "line";
    };
    this.addZoomAll = function (no) {
        if (no > 1) {
            var buttonsDiv = document.getElementById("js-gewmapButtons");

            var zoomBtn = document.createElement('button');
            zoomBtn.setAttribute('type', 'button');
            zoomBtn.setAttribute('class', 'actionbutton');
            zoomBtn.textContent = 'Zoom All';
            buttonsDiv.appendChild(zoomBtn);
            zoomBtn.addEventListener("click", function (e) {
                var bounds = ramblers.markerLayer.getBounds();
                ramblersMap.map.fitBounds(bounds, {padding: [150, 150], maxZoom: 16});
            });
        }
    };
    this.addEditWalk = function () {
        var buttonsDiv = document.getElementById("js-gewmapButtons");

        var editBtn = document.createElement('button');
        editBtn.setAttribute('type', 'button');
        editBtn.setAttribute('class', 'actionbutton');
        editBtn.textContent = 'Edit Walk';
        buttonsDiv.appendChild(editBtn);
        editBtn.addEventListener("click", function (e) {
            ramblers.controller.clickEditButton();
        });
    };

    this.postcodeupdate = function (e) {
        var map = new mapdisplay();
        map.displayPostcode(e.item, e.marker);
        let event = new Event("postcodeupdate", {bubbles: true}); // (2)
        event.ra = {};
        event.ra.item = e.item;
        event.ra.marker=e.marker;
        document.dispatchEvent(event);

    };
    this.displayPostcode = function (item, marker) {
        var layer = ramblers.markerLayer;
        if (!item.isLatLongSet) {
            return;
        }
        if (!marker.hasOwnProperty('ra')) { // remove PO marker
            marker.ra = {};
        }
        if (marker.ra.hasOwnProperty('pcMarker')) { // remove PO marker
            layer.removeLayer(marker.ra.pcMarker);
            delete marker.ra.pcMarker;
        }
        var map = new mapdisplay;
        map.resetMarkerPopup(item, marker);
        if (!item.hasOwnProperty('nearestpostcode')) {
            return;
        }
        var lat = item.nearestpostcode.latitude;
        var long = item.nearestpostcode.longitude;
        var pt = new L.latLng(lat, long);
        var style;
        var pcMarker;
        var popup = "<b>" + item.nearestpostcode.postcode + "</b>";
        pcMarker = L.marker(pt, {icon: ramblersMap.postcodeIconClosest}).bindPopup(popup);
        //   pcMarker.raType = 'postcode';
        style = {color: 'green', weight: 3, opacity: 0.2};
        layer.addLayer(pcMarker);
        marker.ra.pcMarker = pcMarker;
    };
    this.noMarkerFor = function (desc, tag) {
        var item = document.createElement('li');
        item.innerHTML = desc;
        tag.appendChild(item);
    };
    this.displayLocationOnMap = function () {
        var item, title;
        var no, nomarker = false;
        var lat, long;
        var map = ramblersMap.map;
        var layer;
        var line = [];
        var buttonsDiv = document.getElementById("js-gewmapButtons");
        buttonsDiv.innerHTML = "";
        var guideDiv = document.getElementById("js-guide-div");
        if (guideDiv !== null) {
            guideDiv.innerHTML = "";
            var guide2 = document.createElement('p');
            guide2.textContent = "You should drag the location marker to its correct location, zoom in as necessary";
            guideDiv.appendChild(guide2);
        }
        if (ramblers.markerLayer === null) {
            ramblers.markerLayer = L.featureGroup([]);
            map.addLayer(ramblers.markerLayer);
        }
        layer = ramblers.markerLayer;
        layer.clearLayers();
        no = 0;
        item = ramblers.record;
        title = 'Location';
        if (item.isLatLongSet) {
            lat = item.latitude;
            long = item.longitude;
            no = 1;
            line.push([lat, long]);
            this.drawConnectionLine(line);
            this.addGwemMarker(item, title, 'Location');
        }
        if (no > 0) {
            var bounds = layer.getBounds();
            ramblersMap.map.fitBounds(bounds, {padding: [150, 150], maxZoom: 16});
        }
        //     if (nomarker) {
        //         guideDiv.insertBefore(guide, guideDiv.childNodes[0]);
        //     }
    };
};