/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ra, jplist, FullCalendar, displayGradesRowClass, displayTableRowClass, displayListRowClass;

if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.display) === "undefined") {
    ra.display = {};
}
ra.display.walksTabs = function (mapOptions, data) {
    this.events = new ra.events();
    this.map = null;
    this.lmap = null;
    this.cluster = null;
    this.elements = null;
    this.settings = {
        walkClass: "walk",
        displayClass: "detailsView",
        displayStartTime: true,
        displayStartDescription: true,
        displayDetailsPrompt: true,
        tabOrder: ["Grades", "Table", "List", "Calendar", "Map"],
        tableFormat: [{"title": "Date", "items": ["{dowddmm}"]}, {"title": "Meet", "items": ["{meet}", "{,meetGR}", "{,meetPC}"]}, {"title": "Start", "items": ["{start}", "{,startGR}", "{,startPC}"]}, {"title": "Title", "items": ["{title}", "{mediathumbr}"]}, {"title": "Difficulty", "items": ["{difficulty+}"]}, {"title": "Contact", "items": ["{contact}"]}],
        listFormat: ["{dowdd}", "{,meet}", "{,start}", "{,title}", "{,distance}", "{,contactname}", "{,telephone}"],
        gradesFormat: ["{gradeimg}", "{dowddmm}", "{,title}", "{,distance}", "{,contactname}"],
        calendarFormat: ["{gradeimgMiddle}", "{title}", "{,distance}", ",", " ", "{meetTime}", "{< or >startTime}"],
        withMonth: ["{dowShortddmm}", "{dowddmm}", "{dowddmmyyyy}"],
        jplistGroup: ra.uniqueID(),
        jplistName: "name1",
        itemsPerPage: 20,
        currentView: "Grades",
        options: null
    };
    this.myjplist = new ra.jplist(this.settings.jplistGroup);
    this.optionTag = {};
    this.mapOptions = mapOptions;
    this.settings.jplistName = 'jpl' + mapOptions.divId;
    if (data.customTabOrder !== null) {
        this.settings.tabOrder = data.customTabOrder;
    }
    if (data.customGradesFormat !== null) {
        this.settings.gradesFormat = data.customGradesFormat;
    }
    if (data.customListFormat !== null) {
        this.settings.listFormat = data.customListFormat;
    }
    if (data.customTableFormat !== null) {
        this.settings.tableFormat = data.customTableFormat;
    }
    if (data.customCalendarFormat !== null) {
        this.settings.CalendarFormat = data.customCalendarFormat;
    }
    this.legendposition = data.legendposition;
    if (data.displayClass !== "") {
        this.settings.displayClass = data.displayClass;
    }

    data.walks.forEach(phpwalk => {
        var newEvent = new ra.event();
        newEvent.convertPHPWalk(phpwalk);
        this.events.registerEvent(newEvent);
        ra.walk.registerEvent(newEvent);
    });
    data.walks = null;
    ra.walk.displayUrlWalkPopup();
    this.load = function () {

        var tags = [
            {name: 'outer', parent: 'root', tag: 'div'},
            {name: 'walksFilter', parent: 'outer', tag: 'div', attrs: {class: 'walksFilter'}},
            {name: 'raoptions', parent: 'outer', tag: 'div'},
            {name: 'inner', parent: 'outer', tag: 'div', attrs: {id: 'rainner'}},
            {name: 'rapagination1', parent: 'inner', tag: 'div'},
            {name: 'rawalks', parent: 'inner', tag: 'div', textContent: 'Processing data - this should be replaced shortly.'},
            {name: 'rapagination2', parent: 'inner', tag: 'div'},
            {name: 'map', parent: 'inner', tag: 'div'}
        ];
        this.masterdiv = document.getElementById(this.mapOptions.divId);
        this.elements = ra.html.generateTags(this.masterdiv, tags);
        if (!this.mapOptions.paginationTop) {
            this.elements.rapagination1.style.diaplay = 'none';
        }
        if (!this.mapOptions.paginationBottom) {
            this.elements.rapagination2.style.diaplay = 'none';
        }
        var b = ra.baseDirectory();
        var sImg = b + "media/lib_ramblers/images/marker-start.png";
        var cImg = b + "media/lib_ramblers/images/marker-cancelled.png";
        var aImg = b + "media/lib_ramblers/images/marker-area.png";
        var $legend1 = '<strong>Zoom</strong> in to see where our walks are going to be. <strong>Click</strong> on a walk to see details.';
        var $legend2 = '<img src="' + sImg + '" alt="Walk start" height="26" width="26">&nbsp; Start locations&nbsp; <img src="' + cImg + '" alt="Cancelled walk" height="26" width="26"> Cancelled walk&nbsp; <img src="' + aImg + '" alt="Walking area" height="26" width="26"> Walk in that area.';
        if (this.legendposition === 'top') {
            var leg = document.createElement('p');
            leg.innerHTML = $legend1;
            this.elements.map.appendChild(leg);
            leg = document.createElement('p');
            leg.innerHTML = $legend2;
            this.elements.map.appendChild(leg);
        }
        this.lmap = new ra.leafletmap(this.elements.map, this.mapOptions);
        this.map = this.lmap.map;
        this.cluster = new cluster(this.map);
        this.processOptions(this.elements.raoptions);
        this.events.setAllWalks();
        this.checkColumnNotBlank(this.settings.tableFormat);
        this.events.setFilters(this.elements.walksFilter);
        setTimeout(function () {
            // lets the map/list tabs be displayed straight away
            _this.displayWalks();
        }, 1);
        var _this = this;
        document.addEventListener("reDisplayWalks", function () {
            _this.events.setDisplayFilter();
            _this.displayWalks();
        });
    };
    this.displayWalks = function () {
        var no = this.events.getNoEventsToDisplay();
        switch (this.settings.currentView) {
            case "Grades":
            case "List":
            case "Table":
                this.displayMap("hidden");
                if (this.events.length() === 0) {
                    ra.html.setTag(this.elements.rawalks, '<h3>Sorry there are no walks at the moment.</h3>');
                    return;
                }
                this.addPagination(no, this.elements.rapagination1);
                this.addPagination(no, this.elements.rapagination2);
                ra.html.setTag(this.elements.rawalks, this.displayWalksText(false));
                if (!this.settings.noPagination) {
                    this.myjplist.init('ra-display');
                }

                break;
            case "Calendar":
                this.displayMap("hidden");
                ra.html.setTag(this.elements.rapagination1, "");
                ra.html.setTag(this.elements.rapagination2, "");
                //   this.addToDiaryButton(this.elements.rapagination2);
                ra.html.setTag(this.elements.rawalks, "");
                this.displayWalksCalendar();
                break;
            case "Map":
                ra.html.setTag(this.elements.rapagination1, "");
                ra.html.setTag(this.elements.rapagination2, "");
                ra.html.setTag(this.elements.rawalks, "");
                this.displayMap("visible");
                this.displayWalksMap();
                break;
            case "Contacts":
                this.displayMap("hidden");
                this.addPagination(no, this.elements.rapagination1);
                this.addPagination(no, this.elements.rapagination2);
                ra.html.setTag(this.elements.rawalks, this.displayContacts());
                if (!this.settings.noPagination) {
                    this.myjplist.init('ra-display');
                }
                break;
        }
    };
    this.displayMap = function (which) {
        var tag = this.elements.map;

        if (tag) {
//  tag.style.visibility = which;
            if (which === "hidden") {
                tag.style.display = "none";
                this.setPaginationMargin("on");
            } else {
                tag.style.display = "block";
                this.setPaginationMargin("off");
                this.map.invalidateSize();
            }
        }
    };
    this.setPaginationMargin = function (which) {
        var tag1 = this.elements.rapagination1;
        var tag2 = this.elements.rapagination2;
        if (tag1 && tag2) {
            if (which === "on") {
                tag1.style.paddingBottom = "5px";
                tag2.style.paddingTop = "5px";
            } else {
                tag1.style.paddingBottom = "0px";
                tag2.style.paddingTop = "0px";
            }
        }
    };
    this.displayWalksText = function (printing) {

        var $out = "";
        var header = "";
        var footer = "";
        var odd = true;
        var month = "";
        var $class = "";
        var no = 0;
        var should = this.shouldDisplayMonth();
        this.events.forEachFiltered($walk => {
            no += 1;
            if (odd) {
                $class = "odd";
            } else {
                $class = "even";
            }
            var displayMonth = month !== $walk.getIntValue("basics", "displayMonth") && should;
            switch (this.settings.currentView) {
                case "Grades":
                    $out += this.displayWalk_Grades($walk, $class, displayMonth);
                    break;
                case "List":
                    $out += this.displayWalk_List($walk, $class, displayMonth);
                    break;
                case "Table":
                    $out += this.displayWalk_Table($walk, $class, displayMonth);
                    break;
            }
            month = $walk.getIntValue("basics", "displayMonth");
            odd = !odd;
        });
        if (no === 0) {
            $out = "<h3>Sorry, but no walks meet your filter search</h3>";
            ra.html.setTag(this.elements.rapagination1, "");
            ra.html.setTag(this.elements.rapagination2, "");
        } else {
            header = this.displayWalksHeader(printing);
            footer = this.displayWalksFooter();
        }
        return  header + $out + footer;
    };
    this.checkColumnNotBlank = function (tableformat) {
        var content;
        // check if any columns are blank
        tableformat.forEach($col => {
            $col.blank = true;
            this.events.forEachFiltered($walk => {
                if ($col.blank) {
                    content = $walk.getEventValues($col.items);
                    if (content !== '') {
                        $col.blank = false;
                    }
                }
            });
        });
    };
    this.shouldDisplayMonth = function () {
        var $result = true;
        switch (this.settings.currentView) {
            case "Grades":
                this.settings.gradesFormat.forEach($item => {
                    if (this.settings.withMonth.includes($item)) {
                        $result = false;
                    }
                });
                break;
            case "List":
                this.settings.listFormat.forEach($item => {
                    if (this.settings.withMonth.includes($item)) {
                        $result = false;
                    }
                });
                break;
            case "Table":
                this.settings.tableFormat.forEach($col => {
                    $col.items.forEach($item => {
                        if (this.settings.withMonth.includes($item)) {
                            $result = false;
                        }
                    });
                });
                break;
        }
        return  $result;
    };
    this.displayWalksHeader = function (printing = false) {
        var $out = "";
        switch (this.settings.currentView) {
            case "Grades":
            case "List":
            case "Table":
                if (printing) {
                    $out += "<h3>Walks programme</h3>";
                }
                break;
        }
        switch (this.settings.currentView) {
            case "Grades":
                if (this.settings.displayDetailsPrompt & !printing) {
                    $out += "<p class='noprint'>Click on item to display full details of walk</p>";
                }
                $out += "<div data-jplist-group=\"" + this.settings.jplistGroup + "\">";
                break;
            case "List":
                if (this.settings.displayDetailsPrompt & !printing) {
                    $out += "<p class='noprint'>Click on item to display full details of walk</p>";
                }
                $out += "<div data-jplist-group=\"" + this.settings.jplistGroup + "\">";
                break;
            case "Table":
                if (this.settings.displayDetailsPrompt & !printing) {
                    $out += "<p class='noprint'>Click on item to display full details of walk</p>";
                }
                $out += "<table class='" + this.settings.displayClass + "'>\n";
                var should = this.shouldDisplayMonth();
                if (!should) {
                    $out += this.displayTableHeader();
                }
                $out += "<tbody data-jplist-group=\"" + this.settings.jplistGroup + "\">";
                break;
        }
        return $out;
    };
    this.displayWalksFooter = function () {
        var $out = "";
        switch (this.settings.currentView) {
            case "Grades":
                $out += "</div>";
                $out += "<div style='height:5px;'>  </div>";
                break;
            case "List":
                $out += "</div>";
                $out += "<div style='height:5px;'>  </div>";
                break;
            case "Table":
                $out += "</tbody></table>\n";
                break;
        }
        return $out;
    };
    this.displayWalk_Grades = function ($walk, $class, $displayMonth) {
        var $text, $image;
        var $out = "", $out1 = "";
        var $customClass = $class;
        if (typeof displayGradesRowClass === 'function') {
            $customClass = displayGradesRowClass($walk);
        }
        $out1 += "<div data-jplist-item >";
        if ($displayMonth) {

            $out1 += "<h3>" + $walk.getIntValue("basics", "displayMonth") + "</h3>";
        }
        $out1 += "<div  class='" + $customClass + " walk" + $walk.admin.status + "' >";
        $image = '<span class="walkdetail" >';
        $out += $walk.getEventValues(this.settings.gradesFormat);
        $text = $out1 + $image + $walk.addTooltip($out) + "\n</span></div>\n";
        $text += "</div>\n";
        return $text;
    };
    this.displayWalk_List = function ($walk, $class, $displayMonth) {
        var $items = this.settings.listFormat;
        var $out = "";
        var $customClass = $class;
        if (typeof displayListRowClass === 'function') {
            $customClass = displayListRowClass($walk);
        }
        $out += "<div data-jplist-item >";
        if ($displayMonth) {
            $out += "<h3>" + $walk.getIntValue("basics", "displayMonth") + "</h3>";
        }
        $out += "<div class='" + $customClass + " walk" + $walk.admin.status + "' >";
        $out += $walk.addTooltip($walk.getEventValues($items));
        return  $out + "</div>\n";
    };
    this.displayTableHeader = function () {
        var $out = "<tr>";
        this.settings.tableFormat.forEach($col => {
            if (!$col.blank) {
                $out += "<th>" + $col.title + "</th>";
            }
        });
        return $out + "</tr>";
    };
    this.displayWalk_Table = function ($walk, $class, $displayMonth) {
        //  var $out = "<tr data-jplist-item class='" + $class + " walk" + $walk.admin.status + "' >"
        var $out = "";
        var $customClass = "";
        if ($displayMonth) {
            $out += "<tr data-jplist-item ><td>";
            $out += "<h3>" + $walk.getIntValue("basics", "displayMonth") + "</h3>";
            $out += "</td></tr>";
        }
        if (typeof displayTableRowClass === 'function') {
            $customClass = displayTableRowClass($walk);
            $out += "<tr data-jplist-item class='" + $customClass + " walk" + $walk.admin.status + "' >";
        } else {
            $out += "<tr data-jplist-item class='" + $class + " walk" + $walk.admin.status + "' >";
        }
        this.settings.tableFormat.forEach($col => {
            if (!$col.blank) {
                $out += "<td>" + $walk.addTooltip($walk.getEventValues($col.items)) + "</td>";
            }
        });
        $out += "</tr>";
        return $out;
    };
    this.displayContacts = function () {
        var $contacts = [];
        var out;
        this.events.forEachFiltered($walk => {
            var contactName = $walk.getEventValue("{contactperson}");
            var telephone1 = $walk.getEventValue("{telephone1}");
            var telephone2 = $walk.getEventValue("{telephone2}");
            var $contact = {name: contactName, telephone1: telephone1, telephone2: telephone2};
            if (!ra.contains($contacts, $contact)) {
                $contacts.push($contact);
            }
        });
        $contacts.sort(function (a, b) {
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1;
            }
            return -1;
        });
        var dispTel1, dispTel2;
        dispTel1 = $contacts.find(function (contact) {
            return contact.telephone1 !== "";
        });
        dispTel2 = $contacts.find(function (contact) {
            return contact.telephone2 !== "";
        });
        out = "<table class='" + this.settings.displayClass + " contacts'>\n";
        out += "<tr><th>Name";
        if (dispTel1) {
            out += "</th><th>Telephone";
        }
        if (dispTel2) {
            out += "</th><th>Alt Telephone";
        }
        out += "</th></tr><tbody data-jplist-group=\"" + this.settings.jplistGroup + "\">";
        $contacts.forEach($contact => {
            out += "<tr data-jplist-item><td>" + $contact.name;
            if (dispTel1) {
                out += "</td><td>" + $contact.telephone1;
            }
            if (dispTel2) {
                out += "</td><td>" + $contact.telephone2;
            }
            out += "</td></tr>";
        });
        out += "</tbody></table>";
        return out;
    };
    this.displayWalksCalendar = function () {
        if (this.events.length() === 0) {
            ra.html.setTag(this.elements.rawalks, '<h3>Sorry there are no walks at the moment.</h3>');
        }
        var events = [];
        var $items = this.settings.calendarFormat;
        this.events.forEachFiltered($walk => {
            var event = {};
            event.id = $walk.admin.id;
            event.start = $walk.basics.walkDate;
            if ($walk.basics.multiDate) {
                event.end = $walk.basics.finishDate;
            }
            event.raContent = '<div><span class="ra wrap">' + $walk.getEventValues($items, false) + '</span></div>';
            event.textColor = '#111111';
            if ($walk.admin.status === 'Cancelled') {
                event.textColor = 'red';
                event.backgroundColor = 'white';
            } else {
                event.backgroundColor = '#EFEFEF';
                event.borderColor = '#AAAAAA';
            }

            event.classNames = ['pointer'];
            event.display = 'block';
            //    event.eventContent = {html: '<div class="fc-event-main-frame"><span class="ra wrap">' + $walk.getEventValues( $items, false) + '</span></div>'};
            //  event.eventContent = {html: '<div class="fc-event-main-frame"><span class="ra wrap">xgbdfhngdnhg</span></div>'};
            event.eventContent = {html: ''};
            events.push(event);
        });
        var calendarTab = this.elements.rawalks;
        var calendar = new FullCalendar.Calendar(calendarTab, {
            height: 'auto',
            selectable: true,
            displayEventTime: false,
            headerToolbar: {center: 'dayGridMonth,listMonth'}, // buttons for switching between views
            events: events,
            views: {
                dayGrid: {
                    eventTimeFormat: {
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: false
                    }
                },
                timeGrid: {
                    // options apply to timeGridWeek and timeGridDay views
                },
                week: {
                    // options apply to dayGridWeek and timeGridWeek views
                },
                day: {
                    // options apply to dayGridDay and timeGridDay views
                }
            },
            eventClick: function (info) {
                var id = info.event.id;
                ra.walk.displayWalkID(info, id);
            },
            eventContent: function (arg) {
                return {
                    html: arg.event.extendedProps.raContent
                };
            }

        });
        calendar.render();
    };
    this.displayWalksMap = function () {
        this.cluster.removeClusterMarkers();
        if (this.events.length() === 0) {
            return;
        }
        this.events.forEachFiltered($walk => {
            $walk.addWalkMarker(this.cluster, this.settings.walkClass);
        });
        this.cluster.addClusterMarkers();
        this.cluster.zoomAll();
        return;
    };
    this.addPagination = function (no, tag) {
        this.myjplist.addPagination(no, tag, this.settings.jplistName, this.settings.itemsPerPage);
        this.addPrintButton(tag);
        this.addToDiaryButton(tag);
        return;
    };
    this.addPrintButton = function (tag) {
        var printButton = document.createElement('button');
        printButton.setAttribute('class', 'link-button tiny button mintcake right');
        printButton.textContent = 'Print';
        tag.appendChild(printButton);
        var _this = this;
        printButton.addEventListener('click', function () {
            _this.events.setDisplayFilter();
            var content = _this.displayWalksText(true);
            ra.html.printHTML(content);
        });
    };
    this.addToDiaryButton = function (tag) {
        var diary = document.createElement('button');
        diary.setAttribute('class', 'link-button tiny button mintcake right');
        diary.title = 'Download an .ICS file, import to Diary';
        diary.textContent = 'Add to Calendar';
        tag.appendChild(diary);
        var _this = this;
        diary.addEventListener('click', function () {
            _this.events.setDisplayFilter();
            var file = new ra.ics.file();
            _this.events.forEachFiltered($walk => {
                $walk.addWalktoIcs(file);
            });
            file.download();
        });
    };
    this.processOptions = function (optionsDiv) {
        var table = document.createElement('table');
        table.setAttribute('class', 'ra-tab-options');
        optionsDiv.appendChild(table);
        var row = document.createElement('tr');
        table.appendChild(row);
        var first = true;
        var _this = this;
        this.settings.tabOrder.forEach(function (value, index, array) {
            switch (value) {
                case "List":
                case "Table":
                case "Calendar":
                case "Map":
                case "Grades":
                case "Contacts":
                    if (first) {
                        _this.settings.currentView = value;
                    }
                    _this.addDisplayOption(value, first, row);
                    first = false;
                    break;
                default:
                    alert("Invalid tab option " + value);
            }
        });
        this.settings.defaultOptions += "</tr></table>";
    };
    this.addDisplayOption = function (name, active, row) {
        var col = document.createElement('td');
        row.appendChild(col);
        col.setAttribute('class', 'ra-tab');
        col.setAttribute('data-display-option', name);
        col.textContent = name;
        this.optionTag[name] = col;
        if (active) {
            col.classList.add('active');
        }
        var _this = this;
        col.addEventListener("click", function () {
            var option = this.getAttribute('data-display-option');
            var oldOption = _this.settings.currentView;
            _this.optionTag[oldOption].classList.remove('active');
            _this.settings.currentView = option;
            _this.optionTag[option].classList.add('active');
            let e = new Event("reDisplayWalks", {bubbles: true});
            document.dispatchEvent(e);
        });
    };
};
