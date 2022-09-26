var document, ra, FullCalendar;
if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.walkseditor) === "undefined") {
    ra.walkseditor = {};
}
ra.walkseditor.viewAllwalks = function (mapOptions, data) {
    this.data = data;
    this.mapOptions = mapOptions;
    this.allowWMExport = false;
    this.settings = {
        currentDisplay: "Table",
        filter: {}
    };
    this.loggedOn = this.data.newUrl !== null;

    var i, clen, item;
    var items = this.data.items;
    for (i = 0, clen = items.length; i < clen; ++i) {
        item = items[i];
        //  try {
        var json = item.content;
        var status = item.status;
        var category = item.category_name;
        item.walk = new ra.walkseditor.draftWalk();
        item.walk.init(status, category, this.loggedOn);
        item.walk.createFromJson(json);
        var buttons = {
            delete: item.deleteUrl,
            edit: item.editUrl,
            duplicate: item.duplicateUrl
        };
        item.walk.setButtons(buttons);
        item.content = '';
        if (item.deleteUrl !== null) {
            this.allowWMExport = true;
        }
    }
    // sort data into date order
    this.data.items.sort(function (a, b) {
        var da = a.walk.data.basics.date;
        var db = b.walk.data.basics.date;
        if (!ra.date.isValidString(da)) {
            da = '';
        }
        if (!ra.date.isValidString(db)) {
            db = '';
        }

        if (da < db) {
            return -1;
        }
        if (da > db) {
            return 1;
        }
        return 0;
    });
    this.masterdiv = document.getElementById(this.mapOptions.divId);
    this.jplistGroup = ra.uniqueID();
    this.myjplist = new ra.jplist(this.jplistGroup);
    this.tableColumns = [{name: 'Status'},
        {name: 'Date', sort: {type: 'date', colname: 'wDate'}},
        {name: 'Meeting'},
        {name: 'Start'},
        {name: 'Title', sort: {type: 'text', colname: 'wTitle'}},
        {name: 'Difficulty'},
        {name: 'Contact', sort: {type: 'text', colname: 'wContact'}}];

    this.load = function () {
        var tags = [
            {name: 'heading', parent: 'root', tag: 'h2'},
            {name: 'buttons', parent: 'root', tag: 'div', attrs: {class: 'alignRight'}},
            {name: 'walksFilter', parent: 'root', tag: 'div', attrs: {class: 'walksFilter'}},
            {name: 'container', parent: 'root', tag: 'div'},

            {name: 'table', parent: 'container', tag: 'table', attrs: {class: 'ra-tab-options'}},
            {name: 'row', parent: 'table', tag: 'tr'},
            {name: 'table', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'Table'},
            {name: 'list', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'List'},
            {name: 'map', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'Map'},
            {name: 'calendar', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'Calendar'},
            //          {name: 'issues', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'Issues'},
            {name: 'gpxouter', parent: 'root', tag: 'div', attrs: {class: 'gpxouter'}},
            {name: 'legend', parent: 'root', tag: 'div'},
            {name: 'diagnostics', parent: 'root', tag: 'div', attrs: {class: 'diagnostics'}}
        ];

        this.elements = ra.html.generateTags(this.masterdiv, tags);
        this.legend(this.elements.legend);
        this.elements.heading.innerHTML = 'Display Draft Walks Programme';
        if (this.loggedOn) {
            this.addButton(this.elements.buttons, 'Create New Walk', this.data.newUrl);
        } else {
            var login = document.createElement('div');
            login.innerHTML = 'Log in to add/edit walks';
            this.elements.buttons.appendChild(login);
        }

        var self = this;

        this.elements.table.addEventListener("click", function () {
            self.removeRecordDisplay();
            self.ra_format("Table");
        });
        this.elements.list.addEventListener("click", function () {
            self.removeRecordDisplay();
            self.ra_format("List");
        });
        this.elements.map.addEventListener("click", function () {
            self.removeRecordDisplay();
            self.ra_format("Map");
        });
        this.elements.calendar.addEventListener("click", function () {
            self.removeRecordDisplay();
            self.ra_format("Calendar");
        });

        this.setFilters(this.data.items);
        self.ra_format(self.settings.currentDisplay);
        this.displayDiagnostics(this.elements.diagnostics);

        document.addEventListener("reDisplayWalks", function () {
            self.setWalkDisplay();
            self.removeRecordDisplay();
            self.ra_format(self.settings.currentDisplay);
        });
    };
    this.setWalkDisplay = function () {
        var items = this.data.items;
        var i;
        for (i = 0, clen = items.length; i < clen; ++i) {
            item = items[i];
            item.walk.setDisplayWalk(this.settings.filter);
        }
    };
    this.displayDiagnostics = function (tag) {
        if (this.loggedOn) {
            var details = document.createElement('details');
            tag.appendChild(details);
            var summary = document.createElement('summary');
            summary.textContent = "Diagnostics";
            details.appendChild(summary);
            var div = document.createElement('div');
            details.appendChild(div);
            div.innerHTML = "<pre>" + JSON.stringify(this.data.items, undefined, 4) + "</pre>";
        }
    };
    this.removeRecordDisplay = function () {
        this.elements.gpxouter.innerHTML = '';
    };
    this.ra_format = function (option) {
        this.settings.currentDisplay = option;
        //    this.elements.status.classList.remove('active');
        this.elements.table.classList.remove('active');
        this.elements.list.classList.remove('active');
        this.elements.map.classList.remove('active');
        this.elements.calendar.classList.remove('active');
        switch (option) {
            case "Table":
                this.elements.table.classList.add('active');
                this.displayTable(this.elements.gpxouter);
                break;
            case "List":
                this.elements.list.classList.add('active');
                this.displayList(this.elements.gpxouter);
                break;
            case "Map":
                this.elements.map.classList.add('active');
                this.displayMap(this.elements.gpxouter);
                break;
            case "Calendar":
                this.elements.calendar.classList.add('active');
                this.displayCalendar(this.elements.gpxouter);
                break;
        }
    };
    this.addExportToWMButton = function (tag) {
        if (!this.allowWMExport) {
            return;
        }
        var wmexport = document.createElement('button');
        wmexport.setAttribute('class', 'link-button tiny button mintcake');
        wmexport.title = 'Create CSV Upload fine for Walks Manager';
        wmexport.textContent = 'Export to Walks Manager';
        tag.appendChild(wmexport);
        var _this = this;
        wmexport.addEventListener('click', function () {
            _this.ExportWalksToWM();
        });
    };
    this.ExportWalksToWM = function () {
        alert("This feature is being developed and will not be final until fully tested with Walks Manager");
        var data = "";
        data = data + this.exportHeader();
        for (i = 0, clen = items.length; i < clen; ++i) {
            item = items[i];
            if (item.walk.displayWalk) {
                data = data + item.walk.exportToWMLine(item.walk);
            }
        }
        try {
            var blob = new Blob([data], {type: "application/gpx+xml;charset=utf-8"});
            var name = "WalksManagerUpload.csv";
            saveAs(blob, name);
        } catch (e) {
            alert('Your web browser does not support this option!');
        }
    };
    this.exportHeader = function () {
        var data = [];
        data.push('Date');
        data.push('Title');
        data.push('Description');
        data.push('Additional details');
        data.push('Walk leaders');
        data.push('Linear or Circular');
        data.push('Start time');
        data.push('Starting latitude');
        data.push('Starting longitude');
        data.push('Starting postcode');
        data.push('Starting gridref');
        data.push('Starting w3w');
        data.push('Starting location details');
        data.push('Meeting time');
        data.push('Meeting latitude');
        data.push('Meeting longitude');
        data.push('Meeting postcode');
        data.push('Meeting gridref');
        data.push('Meeting w3w');
        data.push('Meeting location details');
        data.push('Est finish time');
        data.push('Finish latitude');
        data.push('Finish longitude');
        data.push('Finishing postcode');
        data.push('Finishing gridref');
        data.push('Finishing w3w');
        data.push('Finishing location details');
        data.push('Difficulty');
        data.push('Distance km');
        data.push('Distance miles');
        data.push('Ascent metres');
        data.push('Ascent feet');

        data.push('Refreshments available (Pub/cafe)');
        data.push('Toilets available');

        data.push('Accessible by public transport');
        data.push('Car parking available');
        data.push('Car sharing available');
        data.push('Coach trip');

        data.push('Dog friendly');
        data.push('Introductory walk');
        data.push('No stiles');
        data.push('Family-friendly');
        data.push('Wheelchair accessible');


        var out = ra.arrayToCSV(data) + "\n\r";
        return out;
    };
    this.displayTable = function (tag) {
        var items = this.data.items;
        var i, clen, item;
        var comment = document.createElement('p');
        comment.innerHTML = "Click on walk to view details";
        tag.appendChild(comment);
        this.addExportToWMButton(tag);
        var pagination = document.createElement('div');
        tag.appendChild(pagination);
        this.itemsPerPage = 10;
        this.myjplist.addPagination(items.length, pagination, this.jplistGroup, this.itemsPerPage);

        var table = document.createElement('table');
        tag.appendChild(table);
        this.displayTableHeader(table);
        var tbody = document.createElement('tbody');
        table.appendChild(tbody);
        tbody.setAttribute('data-jplist-group', this.jplistGroup);

        var $class = "odd";
        var first = false;
        var done = false;
        for (i = 0, clen = items.length; i < clen; ++i) {
            item = items[i];

            if (item.walk.displayWalk) {
                var status = item.walk.dateStatus();
                if (!done) {
                    if (status === ra.walkseditor.DATETYPE.Future) {
                        first = true;
                        done = true;
                    }
                }

                this.displayWalkRow(this.tableColumns, tbody, item, $class, first);
                first = false;
                if ($class === 'odd') {
                    $class = 'even';
                } else {
                    $class = 'odd';
                }
            }
        }
        this.myjplist.init('something');
    };
    this.displayList = function (tag) {

        var items = this.data.items;
        var i, clen, item;
        var comment = document.createElement('p');
        comment.innerHTML = "Click on walk to view details";
        tag.appendChild(comment);
        this.addExportToWMButton(tag);
        var pagination = document.createElement('div');
        tag.appendChild(pagination);
        this.itemsPerPage = 10;
        this.myjplist.addPagination(items.length, pagination, this.jplistGroup, this.itemsPerPage);

        var div = document.createElement('div');
        div.setAttribute('data-jplist-group', this.jplistGroup);
        tag.appendChild(div);
        var odd = true;

        var first = false;
        var done = false;

        for (i = 0, clen = items.length; i < clen; ++i) {
            item = items[i];
            if (item.walk.displayWalk) {
                var status = item.walk.dateStatus();
                if (!done) {
                    if (status === ra.walkseditor.DATETYPE.Future) {
                        first = true;
                        done = true;
                    }
                }

                var walkDiv = document.createElement('div');
                if (odd) {
                    walkDiv.classList.add("odd");
                } else {
                    walkDiv.classList.add("even");
                }

                walkDiv.setAttribute('data-jplist-item', '');

                var walk = item.walk;
                odd = !odd;
                walkDiv.classList.add("pointer");
                if (first) {
                    walkDiv.classList.add("first");
                }
                walkDiv.classList.add("draftwalk");
                walk.addDisplayClasses(walkDiv.classList);

                div.appendChild(walkDiv);
                var out = walk.getWalkDate('list') + ', ' +
                        walk.getWalkMeeting('list') + ', ' +
                        walk.getWalkStart('list') + ', ' +
                        walk.getWalkTitle() + ', ' +
                        walk.getWalkDifficulty('list') +
                        walk.getWalkContact('list');
                out += "<br/><div class='alignRight'>" + walk.getStatusCategory(' ', this.settings.noCategories) + "</div>";
                walkDiv.innerHTML = out;
                first = false
                walkDiv.ra = {};
                walkDiv.ra.walk = walk;
                walkDiv.setAttribute('title', 'View walk details');
                walkDiv.addEventListener('click', function () {
                    this.ra.walk.displayDetails();
                });
            }
        }
        this.myjplist.init('something');
    };

    this.displayMap = function (tag) {
        var tags = [
            {name: 'comments', parent: 'root', tag: 'div'},
            {name: 'mapped', parent: 'root', tag: 'div'}
        ];
        var mapTags = ra.html.generateTags(tag, tags);
        var comment = document.createElement('p');
        comment.innerHTML = "Walks without a start/walking area are plotted in North Seaa";
        mapTags.comments.appendChild(comment);
        var lmap = new ra.leafletmap(mapTags.mapped, this.mapOptions);
        var map = lmap.map;
        //  var layer = L.featureGroup().addTo(map);
        var mycluster = new cluster(map);
        var items = this.data.items;
        var i, clen, item;
        for (i = 0, clen = items.length; i < clen; ++i) {
            item = items[i];
            if (item.walk.displayWalk) {
                var walk = item.walk;
                walk.getAsMarker(mycluster);
            }
        }
        mycluster.addClusterMarkers();
        mycluster.zoomAll();
    };

    this.displayCalendar = function (tag) {
        var tags = [
            {name: 'comments', parent: 'root', tag: 'div'},
            {name: 'dates', parent: 'root', tag: 'div'},
            {name: 'calendar', parent: 'dates', tag: 'div', attrs: {class: 'ra-tab'}}
        ];
        var mapTags = ra.html.generateTags(tag, tags);
        var comment = document.createElement('p');
        comment.innerHTML = "Walks without a date are displayed 'Today'";
        mapTags.comments.appendChild(comment);
        var comment2 = document.createElement('p');
        comment2.innerHTML = "Click on walk to edit details";
        mapTags.comments.appendChild(comment2);
        var comment3 = document.createElement('p');
        comment3.innerHTML = "Click on date to add walk for that date";
        mapTags.comments.appendChild(comment3);
        var events = this.getEvents();
        var _this = this;
        var calendar = new FullCalendar.Calendar(mapTags.calendar, {
            height: 'auto',
            selectable: true,
            displayEventTime: false,
            eventTextColor: '#000000',
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
                var items = _this.data.items;
                var i, clen, item;
                for (i = 0, clen = items.length; i < clen; ++i) {
                    item = items[i];
                    if (item.id === info.event.id) {
                        item.walk.displayDetails();
                    }
                }
            },
            select: function (info) {
                var option;

                if (_this.data.newUrl !== null) {
                    if (_this.data.newUrl.includes('?')) { // allow for SEO
                        option = "&";
                    } else {
                        option = "?";
                    }
                    var walkdate = info.startStr;
                    var today = new Date();
                    var now = ra.date.YYYYMMDD(today);
                    if (walkdate > now) {
                        var url = _this.data.newUrl + option + "date=" + walkdate.replaceAll("-", "%20");
                        window.location.replace(url);
                    } else {
                        alert('Walk MUST be in the future');
                    }
                } else {
                    alert('You must log on to be able to add walks');
                }
            }
        });
        calendar.render();
    };
    this.getEvents = function () {
        var events = [];
        var items = this.data.items;
        var i, clen, item;
        for (i = 0, clen = items.length; i < clen; ++i) {
            item = items[i];
            if (item.walk.displayWalk) {
                var walk = item.walk;
                var event = walk.getAsEvent();
                event.id = item.id;
                events.push(event);
            }
        }

        return events;
    };
    this.displayTableHeader = function (table) {
        var thead = document.createElement('thead');
        table.appendChild(thead);
        var tr = document.createElement('tr');
        thead.appendChild(tr);
        var index, len, col;
        for (index = 0, len = this.tableColumns.length; index < len; ++index) {
            col = this.tableColumns[index];
            var th = document.createElement('th');
            th.innerHTML = col.name;
            if (typeof (col.sort) !== "undefined") {
                // this.myjplist.sortButton(th, col.sort.colname, col.sort.type, "asc", "▲");
                // this.myjplist.sortButton(th, col.sort.colname, col.sort.type, "desc", "▼");
            }
            tr.appendChild(th);
        }
    };


    this.addButton = function (div, name, url) {
        var button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('ra-button');
        button.innerHTML = name;
        button.addEventListener('click', function () {
            window.location.replace(url);
        });
        div.appendChild(button);
        return button;
    };
    this.displayWalkRow = function (columns, table, item, $class, $first) {
        var walk = item.walk;
        var tr = document.createElement('tr');
        tr.setAttribute('data-jplist-item', '');
        walk.addDisplayClasses(tr.classList);

        tr.classList.add($class);
        if ($first) {
            tr.classList.add('first');
        }

        table.appendChild(tr);
        var index, len, col;
        for (index = 0, len = columns.length; index < len; ++index) {
            col = columns[index];
            var td = document.createElement('td');
            td.innerHTML = this.tableValue(walk, col.name);
            if (typeof (col.sort) !== "undefined") {
                //  td.setAttribute('class', col.sort.colname);
            }
            td.classList.add('pointer');
            td.setAttribute('title', 'View walk details');
            td.addEventListener('click', function () {
                walk.displayDetails();
            });

            tr.appendChild(td);
        }

    };

    this.tableValue = function (walk, name) {
        switch (name) {
            case "State":
                return   walk.getWalkStatus();
                break;
            case "Category":
                return   walk.getWalkCategory();
                break;
            case "Date":
                return   walk.getWalkDate('table');
                break;
            case "Meeting":
                return  walk.getWalkMeeting('table');
                break;
            case "Start":
                return  walk.getWalkStart('table');
                break;
            case "Title":
                return walk.getWalkTitle();
                break;
            case "Difficulty":
                return walk.getWalkDifficulty('table');
                break;
            case "Issues":
                return walk.getNoWalkIssues();
                break;
            case "Messages":
                return walk.getWalkMessages('summary');
                break;
            case "Contact":
                return  walk.getWalkContact('table');
                break;
            case "Notes":
                return  walk.getWalkNotes('table');
                break;
            case "Status":
                return  walk.getStatusCategory('<br/>', this.settings.noCategories);
                break;
        }
        return 'unknown';
    };

    this.setFilters = function (items) {
        if (items.length === 0) {
            return;
        }
        var filter = new ra.filter(this.settings.filter);
        var result = this.getWalksStats(items);
        filter.setFilterGroup(result.status);
        filter.setFilterGroup(result.category);
        filter.setFilterGroup(result.issues);
        filter.setFilterGroup(result.editorNotes);
        filter.setFilterGroup(result.dates, true);
        filter.setFilterGroup(result.timeSpan);
        filter.setFilterGroup(result.dow);

        var tag = this.elements.walksFilter;
        if (tag !== null) {
            filter.addOpenClose(tag, "Filter");
            var div = document.createElement('div');
            div.setAttribute('class', 'filter-columns');
            div.style.display = "none";
            tag.appendChild(div);
            filter.addFilter(div, 'Status', result.status);
            filter.addFilter(div, 'Category', result.category);
            filter.addFilter(div, 'Issues', result.issues);

            filter.addFilter(div, 'Dates', result.dates, true, true);
            filter.addFilter(div, 'No date/Past/Future', result.timeSpan);

            filter.addFilter(div, 'Day of the Week', result.dow);
            filter.addFilter(div, 'Editor notes', result.editorNotes);

        }
    };
    this.getWalksStats = function (items) {
        var result = {
            status: {},
            category: {},
            issues: {None: {no: 0, name: 'No Issues', id: 'RA_NoIssues'},
                Has: {no: 0, name: 'Issues', id: 'RA_Issues'}},
            dates: {min: {no: '9999-99-99', name: 'Start', id: 'RA_DateStart'},
                max: {no: '0000-00-00', name: 'End ', id: 'RA_DateEnd'}},
            timeSpan: {noDate: {no: 0, name: 'No Date', id: 'RA_noDate'},
                past: {no: 0, name: 'Past', id: 'RA_DatePast'},
                future: {no: 0, name: 'Future', id: 'RA_DateFuture'}},
            dow: {Monday: {no: 0, name: 'Monday', id: 'RA_DayOfWeek_0'},
                Tuesday: {no: 0, name: 'Tuesday', id: 'RA_DayOfWeek_1'},
                Wednesday: {no: 0, name: 'Wednesday', id: 'RA_DayOfWeek_2'},
                Thursday: {no: 0, name: 'Thursday', id: 'RA_DayOfWeek_3'},
                Friday: {no: 0, name: 'Friday', id: 'RA_DayOfWeek_4'},
                Saturday: {no: 0, name: 'Saturday', id: 'RA_DayOfWeek_5'},
                Sunday: {no: 0, name: 'Sunday', id: 'RA_DayOfWeek_6'}},
            editorNotes: {None: {no: 0, name: 'No notes', id: 'RA_NoNotes'},
                Has: {no: 0, name: 'Has notes', id: 'RA_Notes'}}

        };
        var i, len;
        var walk, yyyymmdd;
        len = items.length;


        for (i = 0, len = items.length; i < len; ++i) {
            walk = items[i].walk;
            var status = items[i].status;
            if (!result.status.hasOwnProperty(status)) {
                result.status[status] = {no: 0};
                result.status[status].name = status;
                result.status[status].id = 'RA_Status_' + status;
            }
            result.status[status].no += 1;

            var category = items[i].category_name;
            if (!result.category.hasOwnProperty(category)) {
                result.category[category] = {no: 0};
                result.category[category].name = category;
                result.category[category].id = 'RA_Category_' + category;
            }
            result.category[category].no += 1;

            var walkdate = walk.getObjProperty(walk.data, "basics.date", "");
            var today = new Date().toISOString().slice(0, 10);
            if (ra.date.isValidString(walkdate)) {
                var dayofweek = ra.date.dow(walkdate);
                result.dow[dayofweek].no += 1;
                // result.dateSet.Set.no += 1;
                yyyymmdd = ra.date.YYYYMMDD(walkdate);
                if (yyyymmdd < result.dates.min.no) {
                    result.dates.min.no = yyyymmdd;
                }
                if (yyyymmdd > result.dates.max.no) {
                    result.dates.max.no = yyyymmdd;
                }
                if (yyyymmdd > today) {
                    result.timeSpan.future.no += 1;
                } else {
                    result.timeSpan.past.no += 1;
                }


            } else {
                result.timeSpan.noDate.no += 1;
            }
            var no = walk.getNoWalkIssues();
            if (no === 0) {
                result.issues.None.no += 1;
            } else {
                result.issues.Has.no += 1;
            }

            if (walk.hasEditorNotes()) {
                result.editorNotes.Has.no += 1;
            } else {
                result.editorNotes.None.no += 1;
            }

        }
        this.settings.noCategories = Object.keys(result.category).length;
        return result;
    };
    this.legend = function (tag) {

        var tags = [
            {name: 'details', parent: 'root', tag: 'details', attrs: {open: true}},
            {name: 'summary', parent: 'details', tag: 'summary', textContent: 'Legend', attrs: {class: 'ra legendsummary'}},
            {name: 'draft', parent: 'details', tag: 'div', attrs: {class: 'ra legend draft'}},
            {parent: 'draft', tag: 'div', attrs: {class: 'legendbox'}, textContent: 'Draft'},

            {name: 'waiting', parent: 'details', tag: 'div', attrs: {class: 'ra legend waiting'}},
            {parent: 'waiting', tag: 'div', attrs: {class: 'legendbox'}, textContent: 'Awaiting Approval'},

            {name: 'publicwalks', parent: 'details', tag: 'h5', textContent: 'Viewable by Public'},
            {name: 'published', parent: 'details', tag: 'div', attrs: {class: 'ra legend published'}},
            {parent: 'published', tag: 'div', attrs: {class: 'legendbox'}, textContent: 'Published'},

            {name: 'cancelled', parent: 'details', tag: 'div', attrs: {class: 'ra legend cancelled'}},
            {parent: 'cancelled', tag: 'div', attrs: {class: 'legendbox'}, textContent: 'Cancelled'}

            //        {name: 'pastheading', parent: 'details', tag: 'h5', textContent: 'Past Walks'},
            //        {name: 'past', parent: 'details', tag: 'div', attrs: {class: 'ra legend past'}},
            //        {parent: 'past', tag: 'div', attrs: {class: 'legendbox status-Past'}, textContent: 'Past'}

        ];
        ra.html.generateTags(tag, tags);
    };
};