var OsGridRef, ramblers;
feeds = function () {

    this.getSearchTags = function (eventTag, contentTag) {
        var formDiv = document.createElement("div");
        contentTag.appendChild(formDiv);

        var label = document.createElement('h4');
        label.setAttribute('class', 'caps');
        label.textContent = 'Location Search  ';
        formDiv.appendChild(label);

        var inputField = document.createElement('input');
        inputField.setAttribute('type', 'text');
        inputField.setAttribute('class', 'map-search');
        inputField.setAttribute('placeholder', 'Enter place name or grid reference');
        inputField.textContent = 'Location Search  ';
        formDiv.appendChild(inputField);

        var ukField = document.createElement('input');
        ukField.setAttribute('type', 'checkbox');
        ukField.setAttribute('id', 'ukonly');
        ukField.setAttribute('checked', true);
        formDiv.appendChild(ukField);

        var ukLabel = document.createElement('label');
        ukLabel.setAttribute('for', 'ukonly');
        ukLabel.setAttribute('class', 'map-search');
        ukLabel.textContent = "Uk Only";
        formDiv.appendChild(ukLabel);

        var searchBtn = this.searchButton(formDiv);

        var comment1 = document.createElement('p');
        comment1.setAttribute('class', 'smaller');
        comment1.innerHTML = 'You may enter a OS Grid Reference, of any length, a post code or a road or place name with the town or county. You may qualify a road or place name e.g. Bulls Head, Foolow or London Road, Derby.  ';
        comment1.innerHTML += " You may also specify a location using <a href='https://what3words.com/about-us/' target='_blank'>What3Words</a>, e.g for Ramblers' Central Office menu.label.slam";
        formDiv.appendChild(comment1);

        inputField.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                // click search button
                searchBtn.dispatchEvent(new Event("click"));
            }
        });

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
        acceptBtn.style.display = "none";
        formDiv.appendChild(acceptBtn);

        searchBtn.ra = {};
        searchBtn.ra.feedhelper = this;
        searchBtn.ra.inputField = inputField;
        searchBtn.ra.searchBtn = searchBtn;
        searchBtn.ra.selectDiv = selectDiv;
        searchBtn.ra.acceptBtn = acceptBtn;
        searchBtn.ra.selectTag = selectTag;

        searchBtn.ra.ukField = ukField;
        searchBtn.addEventListener("click", function (e) {
            var target = e.currentTarget;
            selectTitle.textContent = 'Searching ...';
            target.ra.feedhelper.getPossibleMapLocations(target.ra);
        });
        searchBtn.addEventListener("mapLocations", function (e) {
            var feed = e.target.ra.feedhelper;
            //   alert("mapLocations " + e.target.tagName); // Hello from H1
            feed.setUpSelectTagForMapSearch(selectTitle, selectTag, e.error, e.data, function (item) {
                item.class = capitalizeFirstLetter(item.class);
                item.type = capitalizeFirstLetter(item.type);
                item.display_name = item.display_name.replace(", United Kingdom", "");
                return "-  " + item.display_name;
            });
        });
        acceptBtn.addEventListener("click", function (e) {
            var items = selectTag.ra.items;
            var item = items[selectTag.value];
            //  alert("accept" + item.display_name);
            let event = new Event("locationfound", {bubbles: true}); // (2)
            event.ra = {};
            event.ra.item = item;
            eventTag.dispatchEvent(event);
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
    this.getSearchMapModal = function (e) {
        var eventTag = e.target;
        var $html = '<div id="js-search-content"></div>';
        $html += '<p></p>';
        displayModal($html);
        var contentTag = document.getElementById("js-search-content");
        this.getSearchTags(eventTag, contentTag);
    };
    this.getPossibleMapLocations = function (ra) { // called via an event on input field
        var inputField = ra.inputField;
        var input = inputField.value;
        var ukonly = ra.ukField.checked;
        var searchBtn = ra.searchBtn;
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
            result[0].display_name = gr8 + " / " + gr10;
            result[0].class = "Ordnance Survey";
            result[0].type = "Grid Reference";
            let event = new Event("mapLocations", {});
            event.error = null;
            event.data = result;
            searchBtn.dispatchEvent(event);
            found = true;
        } catch (err) {
        }
        if (!found) {
            //var input = "index.home.raft";
            var regex = /^\/{0,}[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}$/i;
            if (regex.test(input)) {
                // print(text + " is the format of a three word address");
                inputField.addEventListener("what3wordsfound", function (e) {
                    var ra = e.ra;
                    let event = new Event("mapLocations", {});
                    var result = [];

                    event.error = ra.err;
                    if (ra.err === null) {
                        result[0] = {};
                        result[0].lat = ra.coordinates.lat;
                        result[0].lon = ra.coordinates.lng;
                        result[0].display_name = ra.nearestPlace + " - " + ra.words;
                        result[0].class = "What3words";
                        result[0].type = "Location";
                    }
                    if (ra.err === 400) {
                        event.error = null;
                    }
                    event.data = result;
                    searchBtn.dispatchEvent(event);
                });
                What3WordsToLocation(inputField, input);
                return;
            }
        }

        if (!found) {
            // try place look up
            var url = "https://nominatim.openstreetmap.org/search?q=" + input + "&format=json&limit=20";
            if (ukonly) {
                url = url + "&countrycodes=gb";
            }
            //   var url = "https://nominatim.openstreetmap.org/search?q=" + input + "&format=json&countrycodes=gb";
            getJSON(url, function (err, result) {
                let event = new Event("mapLocations", {});
                event.error = err;
                event.data = result;
                searchBtn.dispatchEvent(event);
            }
            );
        }

    };
    this.setUpSelectTagForMapSearch = function (selectTitle, selectTag, error, items, itemFormatFunction) {
        // sort items into class order
        function compare(a, b) {
            // Use toUpperCase() to ignore character casing
            const classa = a.class.toUpperCase() + "/" + a.type.toUpperCase();
            const classb = b.class.toUpperCase() + "/" + b.type.toUpperCase();

            let comparison = 0;
            if (classa > classb) {
                comparison = 1;
            } else if (classa < classb) {
                comparison = -1;
            }
            return comparison;
        }

        items = items.sort(compare);
        var category = "";
        selectTag.innerHTML = '';
        selectTitle.textContent = '';
        if (error !== null) {
            selectTitle.innerHTML = "<p>Error: Sorry something went wrong: " + error + "</p>";
            return;
        } else {
            if (items.length === 0) {
                selectTitle.innerHTML = "<p class='error'>No items found</p>";
                selectTag.style.display = "none";
            }
            if (items.length > 0) {
                selectTag.style.display = "block";
                selectTitle.textContent = 'Select item from list, you may need to tap to see list, then use the Accept button that will appear.';
                if (items.length > 10) {
                    selectTag.setAttribute('size', 10);
                } else {
                    selectTag.setAttribute('size', items.length + 1);
                }
                selectTag.ra = {};
                selectTag.ra.items = items; // save items for accept button
                selectTag.setAttribute('class', 'map-search');
                var option = document.createElement("option");
                option.value = -1;
                option.text = "Please select an item below";
                option.setAttribute('selected', true);
                selectTag.appendChild(option);
                var i;
                for (i = 0; i < items.length; i++) {
                    var item = items[i];
                    var nextcategory = "[" + capitalizeFirstLetter(item.class) + ": " + capitalizeFirstLetter(item.type) + "]";
                    if (category !== nextcategory) {
                        category = nextcategory;
                        var cat = document.createElement("optgroup");
                        cat.setAttribute('label', category);
                        selectTag.appendChild(cat);
                    }

                    option = document.createElement("option");
                    option.value = i;
                    option.text = itemFormatFunction(item);
                    selectTag.appendChild(option);
                }
            }
        }


    };
    this.setUpSelectTag = function (selectTitle, selectTag, error, items, itemFormatFunction) {
        selectTag.innerHTML = '';
        selectTitle.textContent = '';
        if (error !== null) {
            selectTitle.innerHTML = "<p>Error: Sorry something went wrong: " + error + "</p>";
            return;
        } else {
            if (items.length === 0) {
                selectTitle.innerHTML = "<p class='error'>No items found</p>";
                selectTag.style.display = "none";
            }
            if (items.length > 0) {
                selectTag.style.display = "block";
                selectTitle.textContent = 'Select item from list, you may need to tap to see list, then use the Accept button that will appear.';
                if (items.length > 21) {
                    selectTag.setAttribute('size', 21);
                } else {
                    selectTag.setAttribute('size', items.length + 1);
                }
                selectTag.ra = {};
                selectTag.ra.items = items; // save items for accept button
                selectTag.setAttribute('class', 'map-search');
                var option = document.createElement("option");
                option.value = -1;
                option.text = "Please select an item below";
                selectTag.appendChild(option);
                var i;
                for (i = 0; i < items.length; i++) {
                    var item = items[i];
                    option = document.createElement("option");
                    if (i == 0) {
                        option.setAttribute('selected', true);
                    }
                    option.value = i;
                    option.text = itemFormatFunction(item);
                    selectTag.appendChild(option);
                }
            }
        }


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
        inputField.setAttribute('class', 'map-search');
        inputField.setAttribute('placeholder', 'Enter name');
        formDiv.appendChild(inputField);

        var searchBtn = this.searchButton(formDiv);

        var comment1 = document.createElement('p');
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

        searchBtn.ra = {};
        searchBtn.ra.feedhelper = findButton.feedhelper;
        searchBtn.ra.inputField = inputField;
        searchBtn.ra.selectDiv = selectDiv;
        searchBtn.ra.acceptBtn = acceptBtn;
        searchBtn.ra.selectTag = selectTag;
        //    selectTag.ra=searchBtn.ra;
        searchBtn.addEventListener("click", function (e) {
            var target = e.target;
            target.ra.feedhelper.getPossibleRecords(e, url);
        });
        searchBtn.addEventListener("records", function (e) {
            var feed = e.target.ra.feedhelper;
            //   alert("mapLocations " + e.target.tagName); // Hello from H1
            feed.setUpSelectTag(selectTitle, selectTag, e.error, e.data, record);
        });
        selectTag.addEventListener("click", function (e) {
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
        return btn;
    };
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
};