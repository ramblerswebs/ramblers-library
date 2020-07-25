var OsGridRef, ramblers;
feeds = function () {

    this.getSearchMapModal = function (e) {
        var findButton = e.target;
        var $html = '';
        $html += '<div id="js-location-search"></div>';
        $html += '<p></p>';
        displayModal($html);
        var formDiv = document.getElementById("js-location-search");
        var label = document.createElement('label');
        label.textContent = 'Location Search  ';
        formDiv.appendChild(label);
        var inputField = document.createElement('input');
        inputField.setAttribute('type', 'text');
        inputField.setAttribute('class', 'gwem');
        inputField.setAttribute('placeholder', 'Enter place name or grid reference');
        inputField.textContent = 'Location Search  ';
        formDiv.appendChild(inputField);
        this.searchButton(formDiv);
//        var btn = document.createElement('button');
//        btn.setAttribute('type', 'submit');
//        btn.setAttribute('class', 'btn hasTooltip');
//        formDiv.appendChild(btn);
//        var icon = document.createElement('i');
//        icon.setAttribute('data-original-title', 'Search');
//        icon.setAttribute('class', 'icon-search');
//        btn.appendChild(icon);
        var comment1 = document.createElement('p');
        comment1.setAttribute('class', 'smaller');
        comment1.textContent = 'You may enter a Grid Reference, of any length, a post code or a road or place name with the town or county. You may qualify a road or place name e.g. Bulls Head, Foolow or London Road, Derby';
        formDiv.appendChild(comment1);
        var selectDiv = document.createElement('div');
        formDiv.appendChild(selectDiv);
        var selectTitle = document.createElement('p');
        selectDiv.appendChild(selectTitle);
        var selectTag = document.createElement('select');
        selectTag.style.display = "none";
        selectDiv.appendChild(selectTag);
        var acceptBtn = document.createElement('button');
        acceptBtn.setAttribute('type', 'button');
        acceptBtn.setAttribute('class', 'actionbutton');
        acceptBtn.textContent = 'Accept & View Map';
        formDiv.appendChild(acceptBtn);
        acceptBtn.style.display = "none";
        inputField.ra = {};
        inputField.ra.feedhelper = findButton.feedhelper;
        inputField.ra.selectDiv = selectDiv;
        inputField.ra.acceptBtn = acceptBtn;
        inputField.ra.selectTag = selectTag;
        inputField.addEventListener("change", function (e) {
            var target = e.target;
            target.ra.feedhelper.getPossibleMapLocations(e);
        });
        inputField.addEventListener("mapLocations", function (e) {
            var feed = e.target.ra.feedhelper;
            //   alert("mapLocations " + e.target.tagName); // Hello from H1
            feed.setUpSelectTag(selectTitle, selectTag, e, e.data, function (item) {
                return item.display_name;
            });


        });
        acceptBtn.addEventListener("click", function (e) {
            var items = selectTag.ra.items;
            var item = items[selectTag.value];
            //  alert("accept" + item.display_name);
            let event = new Event("locationfound", {bubbles: true}); // (2)
            event.ra = {};
            event.ra.item = item;
            findButton.dispatchEvent(event);
            //       ramblers.controller.displayMarkersOnMap();
            var closeBtn = document.getElementById("btnClose");
            closeBtn.dispatchEvent(new Event("click"));
        });
        selectTag.addEventListener("change", function () {
            if (selectTag.value < 0) {
                acceptBtn.style.display = "none";
            } else {
                acceptBtn.style.display = "block";
            }
        });
        selectTag.addEventListener("dblclick", function () {
            if (selectTag.value < 0) {
                acceptBtn.style.display = "none";
            } else {
                acceptBtn.style.display = "block";
                acceptBtn.dispatchEvent(new Event("click"));
            }
        });

    };

    this.getPossibleMapLocations = function (e) { // called via an event on input field
        var inputField = e.target;
        var input = inputField.value;
        var found = false;
        try {
            var gr;
            var latlng;
            gr = OsGridRef.parse(input);
            var gr8 = gr.toString(6);
            var gr10 = gr.toString(8);
            latlng = OsGridRef.osGridToLatLon(gr);
            var result = [];
            result[0] = {};
            result[0].lat = latlng.lat;
            result[0].lon = latlng.lon;
            result[0].display_name = "Grid Reference: " + gr8 + " / " + gr10;
            let event = new Event("mapLocations", {});
            event.error = null;
            event.data = result;
            inputField.dispatchEvent(event);
            found = true;
        } catch (err) {
        }
        if (!found) {
            // try place look up
            var url = "https://nominatim.openstreetmap.org/search?q=" + input + "&format=json&countrycodes=gb";
            getJSON(url, function (err, result) {
                let event = new Event("mapLocations", {});
                event.error = err;
                event.data = result;
                inputField.dispatchEvent(event);
            }
            );
        }

    };
    this.setUpSelectTag = function (selectTitle, selectTag, e, items, itemFormatFunction) {
        var err = e.error;
        selectTag.innerHTML = '';
        selectTitle.textContent = '';

        if (err !== null) {
            selectTitle.innerHTML = "<p>Error: Sorry something went wrong: " + err + "</p>";
            return;
        } else {
            if (items.length === 0) {
                selectTitle.innerHTML = "<p>No items found</p>";
                selectTag.style.display = "none";
            }
            if (items.length > 0) {
                selectTag.style.display = "block";

                selectTitle.textContent = 'Select item';
                if (items.length > 21) {
                    selectTag.setAttribute('size', 21);
                } else {
                    selectTag.setAttribute('size', items.length + 1);
                }
                selectTag.ra = {};
                selectTag.ra.items = items; // save items for accept button
                selectTag.setAttribute('class', 'gwem');
                var option = document.createElement("option");
                option.value = -1;
                option.text = "Please select an item below";
                selectTag.appendChild(option);
                var i;
                for (i = 0; i < items.length; i++) {
                    var item = items[i];
                    option = document.createElement("option");
                    option.value = i;
                    option.text = itemFormatFunction(item);
                    selectTag.appendChild(option);
                }
            }
        }


    };
    displaySelectListResults = function (ramblersInfo) {

        var url = ramblersInfo.url;
        getJSON(url, function (err, result) {
            var items = [];
            if (result.hasOwnProperty('data')) {
                items = result.data;
            } else {
                items = result;
            }
            var selectDiv = ramblersInfo.selectDiv;
            if (err !== null) {
                selectDiv.innerHTML = "<p>Error: Sorry something went wrong: " + err + "</p>";
            } else {
                if (items.length === 0) {
                    selectDiv.innerHTML = "<p>No items found</p>";
                } else {
                    var i;
                    var selectTitle = document.createElement('p');
                    selectTitle.textContent = 'Select item';
                    selectDiv.appendChild(selectTitle);
                    // save items
                    ramblersInfo.selectItems = items;
                    var selectTag = document.createElement('select');
                    if (items.length > 21) {
                        selectTag.setAttribute('size', 21);
                    } else {
                        selectTag.setAttribute('size', items.length + 1);
                    }
                    selectTag.setAttribute('class', 'gwem');
                    selectDiv.appendChild(selectTag);
                    var option = document.createElement("option");
                    option.value = -1;
                    option.text = "Please select an item below";
                    selectTag.appendChild(option);
                    for (i = 0; i < items.length; i++) {
                        var item = items[i];
                        option = document.createElement("option");
                        option.value = i;
                        option.text = ramblersInfo.formatItemForSelect(item);
                        selectTag.appendChild(option);
                    }
                    selectTag.addEventListener("change", function () {
                        if (selectTag.value < 0) {
                            ramblersInfo.acceptBtn.style.display = "none";
                        } else {
                            var item = ramblersInfo.selectItems[selectTag.value];
                            ramblersInfo.selectedItem = item;
                            ramblersInfo.acceptBtn.style.display = "block";
                        }
                    });
                    selectTag.addEventListener("dblclick", function () {
                        if (selectTag.value < 0) {
                            ramblersInfo.acceptBtn.style.display = "none";
                        } else {
                            var item = ramblersInfo.selectItems[selectTag.value];
                            ramblersInfo.selectedItem = item;
                            ramblersInfo.acceptBtn.style.display = "block";
                            ramblersInfo.acceptBtn.dispatchEvent(new Event("click"));
                        }
                    });
                }
            }
        });
    };

    this.getPredefinedSearchModal = function (e, title, context, record, url) {
        var findButton = e.target;
        var $html = '';
        $html += '<div id="js-location-search"></div>';
        $html += '<p></p>';
        displayModal($html);
        var formDiv = document.getElementById("js-location-search");
        var label = document.createElement('label');
        label.textContent = title;
        formDiv.appendChild(label);
        var inputField = document.createElement('input');
        inputField.setAttribute('type', 'text');
        inputField.setAttribute('class', 'gwem');
        inputField.setAttribute('placeholder', 'Enter name');
        formDiv.appendChild(inputField);
        this.searchButton(formDiv);
        var comment1 = document.createElement('p');
        comment1.setAttribute('class', 'smaller');
        comment1.textContent = context;
        formDiv.appendChild(comment1);
        var selectDiv = document.createElement('div');
        formDiv.appendChild(selectDiv);
        var selectTitle = document.createElement('p');
        selectDiv.appendChild(selectTitle);
        var selectTag = document.createElement('select');
        selectTag.style.display = "none";
        selectDiv.appendChild(selectTag);
        var acceptBtn = document.createElement('button');
        acceptBtn.setAttribute('type', 'button');
        acceptBtn.setAttribute('class', 'actionbutton');
        acceptBtn.textContent = 'Accept';
        formDiv.appendChild(acceptBtn);
        acceptBtn.style.display = "none";
        inputField.ra = {};
        inputField.ra.feedhelper = findButton.feedhelper;
        inputField.ra.selectDiv = selectDiv;
        inputField.ra.acceptBtn = acceptBtn;
        inputField.ra.selectTag = selectTag;
        inputField.addEventListener("change", function (e) {
            var target = e.target;
            target.ra.feedhelper.getPossibleRecords(e, url);
        });
        inputField.addEventListener("records", function (e) {
            var feed = e.target.ra.feedhelper;
            //   alert("mapLocations " + e.target.tagName); // Hello from H1
            feed.setUpSelectTag(selectTitle, selectTag, e, e.data, record);
        });
        acceptBtn.addEventListener("click", function (e) {
            var items = selectTag.ra.items;
            var item = items[selectTag.value];
            //  alert("accept" + item.display_name);
            let event = new Event("recordfound", {bubbles: true}); // (2)
            event.ra = {};
            event.ra.item = item;
            findButton.dispatchEvent(event);
            var closeBtn = document.getElementById("btnClose");
            closeBtn.dispatchEvent(new Event("click"));
        });
        selectTag.addEventListener("change", function () {
            if (selectTag.value < 0) {
                acceptBtn.style.display = "none";
            } else {
                acceptBtn.style.display = "block";
            }
        });
        selectTag.addEventListener("dblclick", function () {
            if (selectTag.value < 0) {
                acceptBtn.style.display = "none";
            } else {
                acceptBtn.style.display = "block";
                acceptBtn.dispatchEvent(new Event("click"));
            }
        });

    };
    this.getPossibleRecords = function (e, urlbase) { // called via an event on input field
        var inputField = e.target;
        var input = inputField.value;
        var url = urlbase + input;
        getJSON(url, function (err, result) {
            let event = new Event("records", {});
            event.error = err;
            if (typeof (result) !== "undefined" && result !== null) {
                event.data = result.data;
            } else {
                event.data = [];
            }
            inputField.dispatchEvent(event);
        });
    };
    this.searchButton = function (tag) {
        var btn = document.createElement('button');
        btn.setAttribute('type', 'submit');
        btn.setAttribute('class', 'btn hasTooltip');
        tag.appendChild(btn);
        var icon = document.createElement('i');
        icon.setAttribute('data-original-title', 'Search');
        icon.setAttribute('class', 'icon-search');
        btn.appendChild(icon);
    };
};