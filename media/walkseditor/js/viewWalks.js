var document, ra, FullCalendar;
if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.walkseditor) === "undefined") {
    ra.walkseditor = {};
}
ra.walkseditor.viewWalks = function (tag, mapOptions, programme, loggedOn = false) {
    this.masterdiv = tag;
    this.programme = programme;
    this.mapOptions = mapOptions;
    this.allowWMExport = false;
    this._loggedOn = loggedOn;
    this.filter = null;
    this.settings = {
        currentDisplay: "Table"
    };

    this.jplistGroup = ra.uniqueID();
    this.myjplist = new ra.jplist(this.jplistGroup);
    this.tableColumns = [{name: 'CHECKBOX'},
        {name: 'Status'},
        {name: 'Date', sortxx: {type: 'text', colname: 'wDate'}},
        {name: 'Meeting'},
        {name: 'Start'},
        {name: 'Title', sortxx: {type: 'text', colname: 'wTitle'}},
        {name: 'Difficulty'},
        {name: 'Contact', sortxx: {type: 'text', colname: 'wContact'}}];

    this.load = function () {
        var tags = [
            {name: 'buttons', parent: 'root', tag: 'div', attrs: {class: 'alignRight'}},
            {name: 'walksFilter', parent: 'root', tag: 'div', attrs: {class: 'walksFilter'}},
            {name: 'pastwalks', parent: 'root', tag: 'div', attrs: {class: 'walksPast walksFilter'}},
            {name: 'container', parent: 'root', tag: 'div'},
            {name: 'table', parent: 'container', tag: 'table', attrs: {class: 'ra-tab-options'}},
            {name: 'row', parent: 'table', tag: 'tr'},
            {name: 'table', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'Table'},
            {name: 'list', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'List'},
            {name: 'map', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'Map'},
            {name: 'calendar', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'Calendar'},
            //          {name: 'issues', parent: 'row', tag: 'td', attrs: {class: 'ra-tab'}, textContent: 'Issues'},
            {name: 'gpxouter', parent: 'root', tag: 'div', attrs: {class: 'gpxouter'}}
        ];

        this.elements = ra.html.generateTags(this.masterdiv, tags);

        var self = this;

        this.elements.table.addEventListener("click", function (e) {
            if (e.altKey) {
                self.displayDiagnostics();
            }
            self.ra_format("Table");
        });
        this.elements.list.addEventListener("click", function (e) {
            if (e.altKey) {
                self.displayDiagnostics();
            }
            self.ra_format("List");
        });
        this.elements.map.addEventListener("click", function (e) {
            if (e.altKey) {
                self.displayDiagnostics();
            }
            self.ra_format("Map");
        });
        this.elements.calendar.addEventListener("click", function (e) {
            if (e.altKey) {
                self.displayDiagnostics();
            }
            self.ra_format("Calendar");
        });

        this.programme.setFilters(this.elements.walksFilter);
        this.addPastWalksOption(this.elements.pastwalks);
        self.ra_format(self.settings.currentDisplay);
        document.addEventListener("reDisplayWalks", function () {
            self.programme.setWalkDisplay();
            self.removeRecordDisplay();
            self.ra_format(self.settings.currentDisplay);
        });
    };

    this.displayDiagnostics = function () {
        var tag = document.createElement('div');
        var heading = document.createElement('h3');
        tag.appendChild(heading);
        var div = document.createElement('div');
        tag.appendChild(div);
        div.innerHTML = "<pre>" + JSON.stringify(this.programme, undefined, 4) + "</pre>";
        ra.modals.createModal(tag, true);
    };
    this.removeRecordDisplay = function () {
        this.elements.gpxouter.innerHTML = '';
    };

    this.ra_format = function (option) {
        this.settings.currentDisplay = option;
        this.removeRecordDisplay();
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

    this.displayTable = function (tag) {
        var walks = this.programme.getWalks();
        var i, clen;
        var comment = document.createElement('p');
        comment.innerHTML = "Click on walk to view details";
        tag.appendChild(comment);
        //     var wmexport = new ra.walkseditor.exportToWM();
        //     wmexport.button(tag, items);
        var pagination = document.createElement('div');
        tag.appendChild(pagination);
        this.itemsPerPage = 10;
        this.myjplist.addPagination(walks.length, pagination, this.jplistGroup, this.itemsPerPage);

        var table = document.createElement('table');
        tag.appendChild(table);
        this.displayTableHeader(table);
        var tbody = document.createElement('tbody');
        table.appendChild(tbody);
        tbody.setAttribute('data-jplist-group', this.jplistGroup);

        var $class = "odd";
        var first = false;
        var done = false;
        for (i = 0, clen = walks.length; i < clen; ++i) {
            var walk = walks[i];

            if (walk.displayWalk) {
                var status = walk.dateStatus();
                if (!done) {
                    if (status === ra.walkseditor.DATETYPE.Future) {
                        first = true;
                        done = true;
                    }
                }

                this.displayWalkRow(this.tableColumns, tbody, walk, $class, first);
                first = false;
                if ($class === 'odd') {
                    $class = 'even';
                } else {
                    $class = 'odd';
                    ``
                }
            }
        }
        this.myjplist.init('draft-programme');
        this.myjplist.updateControls();
    };

    this.displayList = function (tag) {

        var walks = this.programme.getWalks();
        var i, clen;
        var comment = document.createElement('p');
        comment.innerHTML = "Click on walk to view details";
        tag.appendChild(comment);
        //   var wmexport = new ra.walkseditor.exportToWM();
        //   wmexport.button(tag, items);
        var pagination = document.createElement('div');
        tag.appendChild(pagination);
        this.itemsPerPage = 10;
        this.myjplist.addPagination(walks.length, pagination, this.jplistGroup, this.itemsPerPage);

        var div = document.createElement('div');
        div.setAttribute('data-jplist-group', this.jplistGroup);
        tag.appendChild(div);
        var odd = true;

        var first = false;
        var done = false;

        for (i = 0, clen = walks.length; i < clen; ++i) {
            var walk = walks[i];

            if (walk.displayWalk) {
                var status = walk.dateStatus();
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
                out += "<br/><div class='alignRight'>" + walk.getStatusCategory(' ', this.settings.singleCategory) + "</div>";
                walkDiv.innerHTML = out;
                first = false;
                walkDiv.ra = {};
                walkDiv.ra.walk = walk;
                walkDiv.setAttribute('title', 'View walk details');
                walkDiv.addEventListener('click', function () {
                    walk.previewWalk();

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
        var mycluster = new ra.map.cluster(map);
        var walks = this.programme.getWalks();
        var i, clen;
        for (i = 0, clen = walks.length; i < clen; ++i) {

            var walk = walks[i];
            if (walk.displayWalk) {
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
                var walks = _this.programme.getWalks();
                var i, clen;
                for (i = 0, clen = walks.length; i < clen; ++i) {
                    var walk = walks[i];
                    if (walk._eventid === info.event.id) {
                        walk.previewWalk();
                    }
                }
            },
            select: function (info) {
                if (_this._loggedOn !== null) {
                    var walkdate = info.startStr;
                    var today = new Date();
                    var now = ra.date.YYYYMMDD(today);
                    if (walkdate > now) {
                        //     var url = _this._newUrl + option + "date=" + walkdate.replaceAll("-", "%20");
                        //    window.location.replace(url);
                        let event = new Event("preview-walk-newdate");
                        event.ra = {};
                        event.ra.date = walkdate;
                        document.dispatchEvent(event);
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
        var walks = this.programme.getWalks();
        var i, clen;
        for (i = 0, clen = walks.length; i < clen; ++i) {

            var walk = walks[i];
            if (walk.displayWalk) {

                var event = walk.getAsEvent();
                walk._eventid = i.toString();
                event.id = walk._eventid;
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
            if (col.name !== 'CHECKBOX') {
                th.innerHTML = col.name;
            } else {
                th.innerHTML = "<input type='checkbox' class='' >";
            }

            if (typeof (col.sort) !== "undefined") {
                this.myjplist.sortButton(th, col.sort.colname, col.sort.type, "asc", "▲");
                this.myjplist.sortButton(th, col.sort.colname, col.sort.type, "desc", "▼");
            }
            tr.appendChild(th);
        }
    };

    this.displayWalkRow = function (columns, table, walk, $class, $first) {
        var tr = document.createElement('tr');
        tr.setAttribute('data-jplist-item', '');
        walk.addDisplayClasses(tr.classList);

        tr.classList.add($class);
        if ($first) {
            tr.classList.add('first');
        }
        table.appendChild(tr);
        //   var _this = this;
        var index, len, col;
        for (index = 0, len = columns.length; index < len; ++index) {
            col = columns[index];
            var td = document.createElement('td');
            td.innerHTML = this.tableValue(walk, col.name);
            if (typeof (col.sort) !== "undefined") {
                td.setAttribute('class', col.sort.colname);
            }
            td.classList.add('pointer');
            td.setAttribute('title', 'View walk details');
            if (index !== 0) {
                td.addEventListener('click', function () {
                    walk.previewWalk();
                });
            }
            tr.appendChild(td);
        }
    };

    this.tableValue = function (walk, name) {
        switch (name) {
            case "CHECKBOX":
                return   "<input type='checkbox' class='' >";
                break;
            case "State":
                return   walk.getStatus();
                break;
            case "Category":
                return   walk.getCategory();
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
                return  walk.getStatusCategory('<br/>', this.settings.singleCategory);
                break;
        }
        return 'unknown';
    };
    this.addPastWalksOption = function (tag) {
       
        var el1 = document.getElementById('ID12345Ndd');
        if (el1 !== null) {
            ra.html.triggerEvent(el1, 'click');
        }
        var el2 = document.getElementById('ID12345Future');
        if (el2 !== null) {
            setTimeout(() => {
                ra.html.triggerEvent(el2, 'click');
            }, 500);

        }
        // });
    };

    this.getWalksStats = function (walks) {
        var result = {
            group: {},
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
            contact: {},
            editorNotes: {None: {no: 0, name: 'No notes', id: 'RA_NoNotes'},
                Has: {no: 0, name: 'Has notes', id: 'RA_Notes'}}

        };
        var i, len;
        var walk, yyyymmdd;
        len = walks.length;


        for (i = 0, len = walks.length; i < len; ++i) {
            walk = walks[i];
            var code = walk.getGroupCode();
            var name = walk.getGroupName();
            if (!result.group.hasOwnProperty(code)) {
                result.group[code] = {no: 0};
                result.group[code].name = name;
                result.group[code].id = 'RA_Group_' + code;
            }
            result.group[code].no += 1;

            var status = walk.getStatus();
            if (!result.status.hasOwnProperty(status)) {
                result.status[status] = {no: 0};
                result.status[status].name = status;
                result.status[status].id = 'RA_Status_' + status;
            }
            result.status[status].no += 1;

            var category = walk.getCategory();
            if (!result.category.hasOwnProperty(category)) {
                result.category[category] = {no: 0};
                result.category[category].name = category;
                result.category[category].id = 'RA_Category_' + category;
            }
            result.category[category].no += 1;

            var contact = walk.getContact();
            if (!result.contact.hasOwnProperty(contact)) {
                result.contact[contact] = {no: 0};
                result.contact[contact].name = contact;
                result.contact[contact].id = 'RA_Contact_' + contact;
            }
            result.contact[contact].no += 1;

            var walkdate = ra.getObjProperty(walk.data, "basics.date", "");
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
        this.settings.singleCategory = Object.keys(result.category).length === 1;
        return result;
    };

};