var ramblers, ramblersMap, OsGridRef, document;
function raInputFields() {

    this.addText = function (tag, divClass, label, raobject, property) {
        var itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', divClass);
        tag.appendChild(itemDiv);
        var _label = document.createElement('label');
        _label.setAttribute('class', 'we-label gwem');
        _label.textContent = label;
        var inputTag = document.createElement('input');
        inputTag.setAttribute('class', ' gwem');
        inputTag.setAttribute('type', 'text');
        inputTag.raobject = raobject;
        inputTag.raproperty = property;

        if (raobject.hasOwnProperty(property)) {  // Initialise value
            inputTag.value = raobject[property];
        }
        inputTag.addEventListener("input", function (e) {
            e.target.raobject[e.target.raproperty] = e.target.value;
        });
        itemDiv.appendChild(_label);
        itemDiv.appendChild(inputTag);
        return inputTag;
    };
    this.addComment = function (tag, divClass, label, comment) {
        var itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', divClass);
        tag.appendChild(itemDiv);
        var _label = document.createElement('label');
        _label.setAttribute('class', 'we-label gwem');
        _label.textContent = label;
        var inputTag = document.createElement('span');
        inputTag.setAttribute('class', ' gwem');
        inputTag.setAttribute('type', 'text');
        inputTag.textContent = comment;
        itemDiv.appendChild(_label);
        itemDiv.appendChild(inputTag);
        return inputTag;
    };
    this.addNumber = function (tag, divClass, label, raobject, property) {
        var inputTag = this.addText(tag, divClass, label, raobject, property);

        inputTag.addEventListener("input", function (e) {
            e.target.value = e.target.value.toLowerCase();
        });
        return inputTag;
    };
    this.addPostcode = function (tag, divClass, label, raobject, property) {
        var inputTag = this.addText(tag, divClass, label, raobject, property);

        inputTag.addEventListener("input", function (e) {
            e.target.value = e.target.value.toUpperCase();
        });
        return inputTag;
    };
    this.addEmail = function (tag, divClass, label, raobject, property) {
        var inputTag = this.addText(tag, divClass, label, raobject, property);
        inputTag.addEventListener("input", function (e) {
            e.target.value = e.target.value.toLowerCase();
        });
        return inputTag;
    };
    this.addTextArea = function (tag, divClass, label, rows, raobject, property) {
        var itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', divClass);
        tag.appendChild(itemDiv);
        var _label = document.createElement('label');
        _label.setAttribute('class', 'we-label gwem');
        _label.textContent = label;
        var inputTag = document.createElement('textarea');
        inputTag.setAttribute('class', ' gwem');
        inputTag.setAttribute('class', 'gwem');
        inputTag.setAttribute('rows', rows);
        inputTag.style.width = '95%';
        inputTag.raobject = raobject;
        inputTag.raproperty = property;
        if (raobject.hasOwnProperty(property)) {  // Initialise value
            inputTag.value = raobject[property];
        }
        inputTag.addEventListener("change", function (e) {
            e.target.raobject[e.target.raproperty] = e.target.value;
        });
        itemDiv.appendChild(_label);
        itemDiv.appendChild(inputTag);
        return inputTag;
    };

    this.addHeader = function (tag, headTag, label) {
        var heading = document.createElement(headTag);
        heading.textContent = label;
        tag.appendChild(heading);
        return heading;
    };
    this.addTime = function (tag, divClass, label, raobject, property) {
        var itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', divClass);
        tag.appendChild(itemDiv);
        var _label = document.createElement('label');
        _label.setAttribute('class', 'we-label gwem');
        _label.textContent = label;
        var inputTag = document.createElement('input');
        inputTag.setAttribute('data-clocklet', 'format: HH:mm');
        if (raobject.hasOwnProperty(property)) {  // Initialise value
            inputTag.value = raobject[property];
        }
        inputTag.addEventListener("focusout", function (e) {
            e.target.raobject[e.target.raproperty] = e.target.value;
        });
        inputTag.setAttribute('class', " time gwem");
        inputTag.raobject = raobject;
        inputTag.raproperty = property;
        itemDiv.appendChild(_label);
        itemDiv.appendChild(inputTag);
        return inputTag;
    };
    this.addDate = function (tag, divClass, label, raobject, property) {
        var itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', divClass);
        tag.appendChild(itemDiv);
        var _label = document.createElement('label');
        _label.setAttribute('class', 'we-label gwem');
        _label.textContent = label;
        var inputTag = document.createElement('input');
        inputTag.setAttribute('type', "date");
        inputTag.setAttribute('class', 'gwem');
        var spanItem = document.createElement('span');
        itemDiv.appendChild(_label);
        itemDiv.appendChild(inputTag);
        itemDiv.appendChild(spanItem); // to hold day of the week
        inputTag.raobject = raobject;
        inputTag.raproperty = property;
        if (raobject.hasOwnProperty(property)) {  // Initialise value
            inputTag.value = raobject[property];
        }
        inputTag.addEventListener("change", function (e) {
            e.target.raobject[e.target.raproperty] = e.target.value;
        });
        inputTag.addEventListener("change", function (e) {
            var d = new Date(e.target.value);
            var weekday = new Array(7);
            weekday[0] = "Sunday";
            weekday[1] = "Monday";
            weekday[2] = "Tuesday";
            weekday[3] = "Wednesday";
            weekday[4] = "Thursday";
            weekday[5] = "Friday";
            weekday[6] = "Saturday";

            var n = weekday[d.getDay()];
            e.target.nextSibling.textContent = "   " + n;
        });
        return inputTag;
    };
    this.addSelect = function (tag, divName, labelName, values, raobject, property) {
        var div = document.createElement('div');
        div.setAttribute('class', divName);
        tag.appendChild(div);
        var label = document.createElement('label');
        label.setAttribute('class', 'we-label gwem');
        label.textContent = labelName;
        div.appendChild(label);
        var inputTag = document.createElement('select');
        inputTag.setAttribute('class', 'gwem');
        inputTag.raobject = raobject;
        inputTag.raproperty = property;
        div.appendChild(inputTag);
        for (var key in values) {
            var value = values[key];
            var option = document.createElement("option");
            option.value = key;
            option.text = value;
            inputTag.appendChild(option);
        }
        if (raobject.hasOwnProperty(property)) {  // Initialise value
            inputTag.value = raobject[property];
        }
        inputTag.addEventListener("change", function (e) {
            e.target.raobject[e.target.raproperty] = e.target.value;
        });
        return inputTag;
    };

    this.addLocation = function (tag, raobject, location = '') {
        raobject.isLatLongSet = false;
        if (raobject.hasOwnProperty('latitude')) {
            if (raobject.hasOwnProperty('longitude')) {
                if (raobject.latitude === 0 && raobject.longitude === 0) {
                    raobject.isLatLongSet = false;
                } else {
                    raobject.isLatLongSet = true;
                }
            }
        }
        var itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', 'location-group');
        tag.appendChild(itemDiv);
        var table = document.createElement('table');
        table.setAttribute('class', 'no-extra');
        itemDiv.appendChild(table);
        var tr = document.createElement('tr');
        table.appendChild(tr);
        var tdleft = document.createElement('td');
        tr.appendChild(tdleft);
        var tdright = document.createElement('td');
        tr.appendChild(tdright);
        var label = document.createElement('label');
        label.setAttribute('class', 'we-label gwem');
        label.textContent = "Location:";
        tdleft.appendChild(label);
        var displayDiv = document.createElement('div');
        displayDiv.setAttribute('class', 'specifiedlocation');
        tdright.appendChild(displayDiv);
        var comment = document.createElement('span');
        comment.setAttribute('class', 'smaller');
        comment.textContent = "Select a location using the Find button below, and then use the map to drag the marker to the exact location";
        tdright.appendChild(comment);
        var buttonsDiv = document.createElement('div');
        buttonsDiv.setAttribute('class', 'map find buttons');
        tdright.appendChild(buttonsDiv);
        this.addMapFindLocationButton(buttonsDiv);

        var viewMap = document.createElement('button');
        viewMap.setAttribute('type', 'button');
        viewMap.setAttribute('class', 'actionbutton');
        viewMap.textContent = "View on map";
        buttonsDiv.appendChild(viewMap);
        var clearItem = document.createElement('button');
        clearItem.setAttribute('type', 'button');
        clearItem.setAttribute('class', 'actionbutton');
        clearItem.textContent = "Clear location";
        buttonsDiv.appendChild(clearItem);
        if (location === '') {
            this.addPredefinedLocationButton(buttonsDiv, raobject);
        }
        if (location !== 'area') {
            this.addText(itemDiv, 'location', "Abbreviated name:", raobject, 'abbr');
            this.addText(itemDiv, 'location', "Place name:", raobject, 'name');
            this.addPostcode(itemDiv, 'location', "Satnav Postcode:", raobject, 'satnavpostcode');
            this.addComment(itemDiv, 'location', '', 'Only use Sat Nav Postcode if nearest postcode is not suitable');
        } else {
            this.addText(itemDiv, 'location', "Name of Area:", raobject, 'name');

        }
        displayDiv.innerHTML = '<span class="error">No location specified</span>';
        var loc = new maplocation();
        loc.displayLocation(raobject, displayDiv);
        itemDiv.addEventListener("locationfound", function (e) {
            var item = e.ra.item;
            var loc = new maplocation();
            loc.setLocation(raobject, item.latitude, item.longitude);
            loc.displayLocation(raobject, displayDiv);
            loc.getClosestPostcode(raobject, displayDiv);
            fetchWhat3Words(displayDiv, raobject, item.latitude, item.longitude);
            //       ramblers.controller.clickMapButton();
        });
        displayDiv.addEventListener("postcodefound", function (e) {
            var postcode = e.ra.postcode;
            var dataObject = e.ra.dataObject;
            dataObject.nearestpostcode = postcode;
            loc.displayLocation(raobject, displayDiv);
            // need to redisplay markers if we have moved to map view
             ramblers.controller.displayMarkersOnMap();
        });
        displayDiv.addEventListener("what3wordsfound", function (e) {
            var dataObject = e.ra.dataObject;
            if (e.ra.err === null) {
                dataObject.what3words = {};
                dataObject.what3words_words = e.ra.words;
                dataObject.what3words_nearestPlace = e.ra.nearestPlace;
            }
            loc.displayLocation(raobject, displayDiv);
            // need to redisplay markers if we have moved to map view
            ramblers.controller.displayMarkersOnMap();
        });
        viewMap.addEventListener("click", function (e) {
            ramblers.controller.clickMapButton();
        });
        clearItem.addEventListener("click", function (e) {
            var loc = new maplocation();
            loc.clearLocation(raobject);
            loc.displayLocation(raobject, displayDiv);
        });
        if (raobject.isLatLongSet) {
            if (raobject.gridref10 !== "") {
                // fire event to force postcode to be found
                let event = new Event("locationfound", {bubbles: true}); // (2)
                event.ra = {};
                event.ra.item = {}
                event.ra.item.latitude = raobject.latitude;
                event.ra.item.longitude = raobject.longitude;
                itemDiv.dispatchEvent(event);
            }
    }

    };

    this.addMapFindLocationButton = function (tag) {

        var findButton = document.createElement('button');
        findButton.setAttribute('type', 'button');
        findButton.setAttribute('class', 'actionbutton');
        findButton.textContent = "Find approx location";
        findButton.addEventListener("locationfound", function (e) { // (1)
            let event = new Event("locationfound", {bubbles: true}); // (2)
            event.ra = {};
            event.ra.item = e.ra.item;
            event.ra.item.latitude = parseFloat(e.ra.item.lat);
            event.ra.item.longitude = parseFloat(e.ra.item.lon);
            tag.dispatchEvent(event);
        });
        tag.appendChild(findButton);
        var feed = new feeds();
        findButton.feedhelper = feed;
        findButton.addEventListener("click", function (e) {
            var target = e.target;
            target.feedhelper.getSearchMapModal(e);
        });
    };
    this.addPredefinedLocationButton = function (tag, dataObject) {
        var findButton = document.createElement('button');
        findButton.setAttribute('type', 'button');
        findButton.setAttribute('class', 'grey');
        findButton.textContent = "Load predefined Location";
        findButton.addEventListener("recordfound", function (e) { // (1)
            var item = e.ra.item;
            dataObject.abbr = item.abbr;
            dataObject.name = item.name;
            dataObject.gridref10 = item.gridreference;
            dataObject.latitude = item.latitude;
            dataObject.longitude = item.longitude;
            ramblers.controller.clickEditButton();
        });
        tag.appendChild(findButton);
        var feed = new feeds();
        findButton.feedhelper = feed;
        findButton.addEventListener("click", function (e) {
            var target = e.target;
            var title = 'Predefined Location Search';
            var context = 'Search for predefined location';
            var url = ramblersMap.base + "index.php?option=com_ra_walkseditor&task=places.controller&format=json&search=";
            var record = function (item) {
                return item.name + "   (" + item.gridreference + ")";
            };
            target.feedhelper.getPredefinedSearchModal(e, title, context, record, url);
        });
    };
    this.addPredefinedContactButton = function (tag, dataObject) {
        var findButton = document.createElement('button');
        findButton.setAttribute('type', 'button');
        findButton.setAttribute('class', 'grey');
        findButton.textContent = "Load predefined Contact";
        findButton.addEventListener("recordfound", function (e) { // (1)
            var item = e.ra.item;
            dataObject.displayName = item.displayname;
            dataObject.email = item.email;
            dataObject.telephone1 = item.telephone1;
            dataObject.telephone2 = item.telephone2;
            ramblers.controller.clickEditButton();
        });
        tag.appendChild(findButton);
        var feed = new feeds();
        findButton.feedhelper = feed;
        findButton.addEventListener("click", function (e) {
            var target = e.target;
            var title = 'Contact Search';
            var context = 'Search for predefined contact details';
            var url = ramblersMap.base + "index.php?option=com_ra_walkseditor&task=contacts.controller&format=json&search=";
            var record = function (item) {
                return item.displayname + "   (" + item.contactname + ", " + item.email + ", " + item.telephone1 + ", " + item.telephone2 + ")";
            };
            target.feedhelper.getPredefinedSearchModal(e, title, context, record, url);
        });
    };

    this.itemsItemDivs = function (tag) {
        var itemsDiv = document.createElement('div');
        itemsDiv.setAttribute('class', 'js-items');
        tag.appendChild(itemsDiv);

        var itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', 'js-item');
        itemsDiv.appendChild(itemDiv);
        return itemDiv;
    };

}