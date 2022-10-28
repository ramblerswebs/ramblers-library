var document, ra, FullCalendar;
if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.walkseditor) === "undefined") {
    ra.walkseditor = {};
}
ra.walkseditor.DATETYPE = {
    NoDate: 1,
    Past: 2,
    Future: 3
};
ra.walkseditor.draftWalk = function (  ) {
    const isERROR = 'error';
    const isWarning = 'warning';
    const isInformation = 'warning';
    //   this.status = "None";
    this.category = "None";
    this.loggedOn = false;
    this.displayWalk = true;
    this.data = {
        admin: {version: '1.0',
            created: new Date(),
            updated: null,
            status: 'Draft',
            cancelledReason: ''},
        basics: {},
        meeting: {type: "undefined",
            locations: []
        },
        start: {
            type: "undefined"
        },
        walks: [{}],
        contact: {},
        notes: {
            comments: ''
        }
    };

    this.buttons = {delete: null,
        edit: null,
        duplicate: null};

    this.init = function (status, category, loggedOn) {
        this.setWalkStatus(status);
        this.category = category;
        this.loggedOn = loggedOn;
    };
    this.createWithDate = function (date) {
        this.date = date;
    };
    this.setButtons = function (value) {
        this.buttons = value;
    };
    this.createFromJson = function (json) {
        var data;
        try {
            data = JSON.parse(json);
            if (typeof data.basics !== 'undefined') {
                this.data.basics = data.basics;
            }
            if (typeof data.meeting !== 'undefined') {
                this.data.meeting = data.meeting;
            }
            if (typeof data.start !== 'undefined') {
                this.data.start = data.start;
            }
            if (typeof data.walks !== 'undefined') {
                this.data.walks = data.walks;
            }
            if (typeof data.contact !== 'undefined') {
                this.data.contact = data.contact;
            }
            if (typeof data.facilities !== 'undefined') {
                this.data.facilities = data.facilities;
            }
            if (typeof data.transport !== 'undefined') {
                this.data.transport = data.transport;
            }
            if (typeof data.accessibility !== 'undefined') {
                this.data.accessibility = data.accessibility;
            }
            if (typeof data.notes !== 'undefined') {
                this.data.notes = data.notes;
            }

        } catch (err) {
            alert('Cannot process walk (json=' + json + ' )');
        }

    };

    this.setDisplayWalk = function (filters) {
        this.displayWalk = false;
        var status = "RA_Status_" + this.getWalkStatus();
        if (!filters[status]) {
            return;
        }

        var category = "RA_Category_" + this.category;
        if (!filters[category]) {
            return;
        }

        var issues = this.getNoWalkIssues();
        if (issues > 0) {
            if (!filters.RA_Issues) {
                return;
            }
        } else {
            if (!filters.RA_NoIssues) {
                return;
            }
        }

        if (this.dateSet()) {
            var walkDate = this.YYYYMMDD();
            if (walkDate < filters.RA_DateStart) {
                return;
            }
            if (walkDate > filters.RA_DateEnd) {
                return;
            }
            var today = new Date().toISOString().slice(0, 10);
            if (!filters.RA_DatePast) {
                if (walkDate < today) {
                    return;
                }
            }
            if (!filters.RA_DateFuture) {
                if (walkDate >= today) {
                    return;
                }
            }
            var dow = this.dow();
            switch (dow) {
                case "Monday":
                    if (!filters.RA_DayOfWeek_0) {
                        return;
                    }

                    break;
                case "Tuesday":
                    if (!filters.RA_DayOfWeek_1) {
                        return;
                    }
                    break;
                case "Wednesday":
                    if (!filters.RA_DayOfWeek_2) {
                        return;
                    }
                    break;
                case "Thursday":
                    if (!filters.RA_DayOfWeek_3) {
                        return;
                    }
                    break;
                case "Friday":
                    if (!filters.RA_DayOfWeek_4) {
                        return;
                    }
                    break;
                case "Saturday":
                    if (!filters.RA_DayOfWeek_5) {
                        return;
                    }
                    break;
                case "Sunday":
                    if (!filters.RA_DayOfWeek_6) {
                        return;
                    }
                    break;
                default:
                    break;
            }
        } else {
            if (!filters.RA_noDate) {
                return;
            }
        }
        var notes = this.hasEditorNotes();
        if (notes > 0) {
            if (!filters.RA_Notes) {
                return;
            }
        } else {
            if (!filters.RA_NoNotes) {
                return;
            }
        }
        this.displayWalk = true;
        return;
    };
    this.addDisplayClasses = function (cl) {
        cl.add(this.getWalkStatusClass());
        if (this.dateStatus() === ra.walkseditor.DATETYPE.Past) {
            cl.add('status-Past');
        }
        return;
    };
    this.getEventClassesArray = function () {
        var out = [];
        out.push('pointer');
        out.push(this.getWalkStatusClass());

        switch (this.dateStatus()) {
            case ra.walkseditor.DATETYPE.Past:
                out.push('status-Past');
                break;
            case ra.walkseditor.DATETYPE.Future:
                out.push('status-Future');
                break;
            default:
                out.push('status-NoDate');
        }
        return out;
    };
    this.dateSet = function () {
        var basics = this.data.basics;
        if (basics.hasOwnProperty('date')) {
            return true;
        } else {
            return false;
        }
    };
    this.dow = function () {
        if (this.dateSet()) {
            var basics = this.data.basics;
            return  ra.date.dow(basics.date);
        } else {
            return null;
        }
    };

    this.exportToWMLine = function () {
        var distance = '';
        var units = '';
        var natgrade = '';

        var data = [];
        data.push(ra.getObjProperty(this.data, 'basics.date', ''));
        data.push(ra.getObjProperty(this.data, 'basics.title', ''));
        data.push(ra.getObjProperty(this.data, 'basics.description', ''));
        data.push(ra.getObjProperty(this.data, 'basics.notes', ''));
        data.push(ra.getObjProperty(this.data, 'contact.displayName', ''));
        //  data.push(ra.getObjProperty(this.data, 'contact.email', ''));
        //  data.push(ra.getObjProperty(this.data, 'contact.telephone1', ''));
        //  data.push(ra.getObjProperty(this.data, 'contact.telephone2', ''));
        //  data.push(ra.getObjProperty(this.data, 'contact.contactType', ''));
        var walks = ra.getObjProperty(this.data, 'walks', null);
        if (walks.length > 0) {
            var walk1 = walks[0];
            data.push(ra.getObjProperty(walk1, 'type', ''));
            distance = ra.getObjProperty(walk1, 'distance', '');
            units = ra.getObjProperty(walk1, 'units', '');
            natgrade = ra.getObjProperty(walk1, 'natgrade', '');
        } else {
            data.push('null');
        }
        var start = ra.getObjProperty(this.data, 'start.location', null);
        this._exportLocation(data, ra.getObjProperty(this.data, 'start.location', null));
        var meetloc = ra.getObjProperty(this.data, 'meeting.locations', []);
        if (meetloc.length > 0) {
            this._exportLocation(data, meetloc[0]);
        } else {
            this._exportLocation(data, null);
        }

        this._exportLocation(data, ra.getObjProperty(this.data, 'finish.location', null));

        data.push(natgrade);
        switch (units) {
            case "miles":
                data.push('');
                data.push(distance);
                break;
            case "km":
                data.push(distance);
                data.push('');
                break;
            default:
                data.push('');
                data.push('');
        }
        data.push('');  // ascent
        data.push('');
        data.push(ra.getObjProperty(this.data, 'facilities.refresh.value', ''));
        data.push(ra.getObjProperty(this.data, 'facilities.toilet.value', ''));
        data.push(ra.getObjProperty(this.data, 'transport.access.value', ''));
        data.push(ra.getObjProperty(this.data, 'transport.park.value', ''));
        data.push(ra.getObjProperty(this.data, 'transport.share.value', ''));
        data.push(ra.getObjProperty(this.data, 'transport.coach.value', ''));
        data.push(ra.getObjProperty(this.data, 'accessibility.dog.value', ''));
        data.push(ra.getObjProperty(this.data, 'accessibility.intro.value', ''));
        data.push(ra.getObjProperty(this.data, 'accessibility.nostiles.value', ''));
        data.push(ra.getObjProperty(this.data, 'accessibility.family.value', ''));
        data.push(ra.getObjProperty(this.data, 'accessibility.wheelchair.value', ''));

        var out = ra.arrayToCSV(data) + "\n\r";
        return out;
    };
    this._exportLocation = function (dataarray, data) {
        if (data === null) {
            dataarray.push('');
            dataarray.push('');
            dataarray.push('');
            dataarray.push('');
            dataarray.push('');
            dataarray.push('');
            dataarray.push('');
        } else {
            dataarray.push(ra.getObjProperty(data, 'time', ''));
            dataarray.push(ra.getObjProperty(data, 'latitude', ''));
            dataarray.push(ra.getObjProperty(data, 'longitude', ''));
            dataarray.push(ra.getObjProperty(data, 'postcode.value', ''));
            dataarray.push(''); //  GR
            dataarray.push(''); //  W3W
            dataarray.push(ra.getObjProperty(data, 'name', ''));
        }

    };
    this.displayDetails = function () {
        var $html = "<div id='ramblers-details-buttons1' ></div>";
        $html += this.walkDetails();
        $html += "<div id='ramblers-details-buttons2' ></div>";
        $html += "<div id='ramblers-diagnostics' ></div>";
        ra.modals.createModal($html, false);
        this._addMaptoWalk();
        this.addButtons(document.getElementById('ramblers-details-buttons1'));
        this.addButtons(document.getElementById('ramblers-details-buttons2'));
        if (this.loggedOn) {
            var tag = document.getElementById('ramblers-diagnostics');
            var details = document.createElement('details');
            tag.appendChild(details);
            var summary = document.createElement('summary');
            summary.textContent = "Diagnostics";
            details.appendChild(summary);
            var div = document.createElement('div');
            details.appendChild(div);
            div.innerHTML = "<pre>" + JSON.stringify(this.data, undefined, 4) + "</pre>";
        }
    };


    this.addButtons = function (tag) {

        //      this.addButton(div, 'View', item.viewUrl);
        if (this.buttons.edit !== null) {
            this.addButton(tag, 'Edit', this.buttons.edit, ra.walkseditor.help.editQuestion());
        }
        if (this.buttons.duplicate !== null) {
            this.addButton(tag, 'Duplicate', this.buttons.duplicate);
        }
        if (this.buttons.delete !== null) {
            this.addButton(tag, 'Delete', this.buttons.delete, ra.walkseditor.help.deleteQuestion());
        }

        return;
    };
    this.addButton = function (div, name, url, confirmMsg = '') {
        var button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('ra-button');
        button.innerHTML = name;
        var _this = this;
        button.addEventListener('click', function () {
            var ok = true;
            if (confirmMsg !== '') {
                switch (_this.getWalkStatus()) {
                    case "Published":
                    case "Cancelled":
                        ok = confirm(confirmMsg);
                        break;
                }
            }
            if (ok) {
                window.location.replace(url);
            }
        });
        div.appendChild(button);
    };

    this.checkFields = function () {
        this.errors = 0;
        this.notifications = [];
        this.checkFieldsBasics();
        this.checkFieldsMeeting();
        this.checkFieldsStart();
        this.checkFieldsWalks();
        this.checkFieldsContact();
    };
    this.checkFieldsBasics = function () {
        var walk = this.data;
        if (ra.getObjProperty(walk, 'basics') === null) {
            this.notificationMsg("No basics section found");
        }
        if (ra.getObjProperty(walk, 'basics.date') === null) {
            this.notificationMsg("Basics: No walk date found");
        }
        if (ra.getObjProperty(walk, 'basics.title') === null) {
            this.notificationMsg("Basics: No walk title found");
        }
        if (ra.getObjProperty(walk, 'basics.description') === null) {
            this.notificationMsg("Basics: No walk description found", isWarning);
        }
        if (ra.getObjProperty(walk, 'basics.description') === '') {
            this.notificationMsg("Basics: No walk description found", isWarning);
        }
    };
    this.checkFieldsMeeting = function () {
        var walk = this.data;
        if (ra.getObjProperty(walk, 'meeting') === null) {
            this.notificationMsg("No meeting found");
        }
        var meet = ra.getObjProperty(walk, 'meeting');
        var type = ra.getObjProperty(meet, 'type');
        if (type === null) {
            this.notificationMsg("Meeting type not defined");
        }

        switch (type) {
            case 'undefined':
                this.notificationMsg("Meeting type not defined");
                break;
            case 'car':
            case 'coach':
            case 'public':
                var meets = ra.getObjProperty(meet, 'locations');
                meets.forEach(element => {
                    if (ra.getObjProperty(element, 'time') === null) {
                        this.notificationMsg("Meeting time not defined");
                    }
                    if (ra.getObjProperty(element, 'name') === null) {
                        this.notificationMsg("Meeting location name not defined");
                    }

                    if (ra.getObjProperty(element, 'latitude') === null) {
                        this.notificationMsg("Meeting location latitude/longitude not defined");
                    }
                });
                break;
            case 'none':
            default:
        }
    };
    this.checkFieldsStart = function () {
        var walk = this.data;
        var type = ra.getObjProperty(walk, 'start.type');
        switch (type) {
            case 'area':
                var meetingType = ra.getObjProperty(walk, 'meeting.type');
                if (meetingType === null || meetingType === 'undefined' || meetingType === 'none') {
                    this.notificationMsg("Information: You have not supplied a meeting point nor a starting place", isWarning);
                }
                if (ra.getObjProperty(walk, 'start.location.name') === null) {
                    this.notificationMsg("Walk area name not defined");
                }
                if (ra.getObjProperty(walk, 'start.location.latitude') === null) {
                    this.notificationMsg("Walk area latitude/longitude not defined");
                }
                break;
            case 'start':
                if (ra.getObjProperty(walk, 'start.location.time') === null) {
                    this.notificationMsg("Start time not defined");
                }
                if (ra.getObjProperty(walk, 'start.location.name') === null) {
                    this.notificationMsg("Start name not defined");
                }
                if (ra.getObjProperty(walk, 'start.location.latitude') === null) {
                    this.notificationMsg("Start latitude/longitude not defined");
                }
                break;
            default:
                this.notificationMsg("Start information not defined");
        }
    };
    this.checkFieldsWalks = function () {
        var walk = this.data;
        var walks = ra.getObjProperty(walk, 'walks');
        if (walks === null) {
            this.notificationMsg("No walk defined");
        } else {
            walks.forEach(singlewalk => {
                var dist = ra.getObjProperty(singlewalk, 'distance');
                if (dist === null || dist === '') {
                    this.notificationMsg("Walk - No distance specified");
                }
                if (ra.getObjProperty(singlewalk, 'units') === null) {
                    this.notificationMsg("Walk - No distance units (miles/km) specified");
                }
                if (ra.getObjProperty(singlewalk, 'natgrade') === null) {
                    this.notificationMsg("Walk - No national grade has been assigned");

                }
                if (ra.getObjProperty(singlewalk, 'type') === null) {
                    this.notificationMsg("Walk - No walk shape assigned, circular,linear");
                }
                if (ra.getObjProperty(singlewalk, 'type') === "undefined") {
                    this.notificationMsg("Walk - No walk shape assigned, circular,linear");
                }
            });
        }
    };
    this.checkFieldsContact = function () {
        var walk = this.data;

        if (ra.getObjProperty(walk, 'contact') === null) {
            this.notificationMsg("Contact - Not defined");
        }
        if (ra.getObjProperty(walk, 'contact.displayName') === null) {
            this.notificationMsg("Contact - No name defined");
        }
        var type = ra.getObjProperty(walk, 'contact.contactType');
        if (type === null || type === 'undefined') {
            this.notificationMsg("Contact - No type, Leader/Not leader, defined");
        }
        var email = ra.getObjProperty(walk, 'email.title') !== null;
        var tel1 = ra.getObjProperty(walk, 'contact.telephone1') !== null;
        var tel2 = ra.getObjProperty(walk, 'contact.telephon2') !== null;
        if (email || tel1 || tel2) {
            // at least one contact method defined
        } else {
            this.notificationMsg("Information:  Contact - No contact method defined (email or telephone)", isWarning);
        }
    };

    this.setWalkStatus = function (status, reason = '') {
        this.data.admin.status = status;
        if (status === "Cancelled") {
            this.data.admin.cancelledReason = reason;
    }
    };
    this.getWalkStatus = function () {
        return this.data.admin.status;
    };
    this.getWalkStatusClass = function () {
        var status = this.getWalkStatus().replace(/ /g, "_");
        switch (status) {
            case 'Approved':
            case 'Cancelled':
                var d = ra.getObjProperty(this.data, 'basics.date');
                var value = ra.date.getDateTime(d);
                var today = new Date();
                if (value < today) {
                    return 'status-' + status; // + ' status-Past';
                }
        }
        return 'status-' + status;
    };
    this.dateStatus = function () {
        var d = ra.getObjProperty(this.data, 'basics.date', null);
        if (ra.date.isValidString(d)) {
            var value = ra.date.getDateTime(d);
            var today = new Date();
            if (value < today) {
                return ra.walkseditor.DATETYPE.Past;
            } else {
                return ra.walkseditor.DATETYPE.Future;
            }
        }
        return ra.walkseditor.DATETYPE.NoDate;
    };
    this.getWalkCategory = function () {
        return this.category;
    };
    this.getWalkDate = function (view) {
        var d = ra.getObjProperty(this.data, 'basics.date');
        var past = '';
        if (d !== null) {
            if (ra.date.isValidString(d)) {
                var status = this.dateStatus();
                if (status === ra.walkseditor.DATETYPE.Past) {
                    past = " [PAST]";
                }
                switch (view) {
                    case 'table':
                        return  "<b>" + ra.date.dowdd(d) + "</b><br/>" + " " + ra.date.month(d) + " " + ra.date.YY(d) + past;
                    case 'list':
                    case 'details':
                        return  "<b>" + ra.date.dowdd(d) + "</b>" + " " + ra.date.month(d) + " " + ra.date.YY(d) + past;
                }
            }
        }
        return 'Date not defined';
    };
    this.getWalkBasics = function (view) {
        var title = ra.getObjProperty(this.data, 'basics.title');
        var description = ra.getObjProperty(this.data, 'basics.description');
        var notes = ra.getObjProperty(this.data, 'basics.notes');
        var out = '';
        out += '<h3>Title: ' + title + '</h3>';
        out += '<h3>Date: ' + this.getWalkDate('details') + '</h3>';
        if (description === null) {
            description = '';
        }
        if (notes === null) {
            notes = '';
        }
        out += '<h4>Description: </h4>' + description;
        out += '<h4>Notes: </h4>' + notes;

        return out;
    };
    this.getWalkMeeting = function (view) {
        var startTag = "", endTag = "";
        switch (view) {
            case 'table':
            case 'list':
                break;
            case 'details':
                startTag = "<p>";
                endTag = "</p>";
                break;
            default:
                break;
        }
        var type = ra.getObjProperty(this.data, 'meeting.type');
        if (type === null) {
            return  startTag + "Meeting type not defined ????" + endTag;
        }
        var out = type;
        switch (type) {
            case 'car':
                out = startTag + 'Car Share' + endTag;
                break;
            case 'coach':
                out = startTag + 'Coach walk' + endTag;
                break;
            case 'public':
                out = startTag + 'Using public transport' + endTag;
                break;
            case 'none':
                out = startTag + 'Meet at start of walk' + endTag;
                break;
            default:
                return  startTag + "Meeting type not defined" + endTag;
        }


        var meets = ra.getObjProperty(this.data, 'meeting.locations');
        meets.forEach(element => {
            out += this.displayLocation(element, view, 'Meeting');

        });
        return out;
    };
    this.getWalkStart = function (view) {
        var startTag = "", endTag = "";
        switch (view) {
            case 'table':
            case 'list':
                break;
            case 'details':
                startTag = "<p>";
                endTag = "</p>";
                break;
            default:
                break;
        }
        var type = ra.getObjProperty(this.data, 'start.type');
        var out = "";
        var location = ra.getObjProperty(this.data, 'start.location');
        switch (type) {
            case 'start':
                out += this.displayLocation(location, view, 'start');
                break;
            case 'area':
                var name = ra.getObjProperty(location, 'location.name', '[?Place name?]');
                var gr = ra.getObjProperty(location, 'location.gridref8', '[?no grid ref?]');
                switch (view) {
                    case 'table':
                        out += 'General Area: ';
                        out += name;
                        out += "</br/>Around Grid Ref " + gr;
                        break;
                    case 'list':
                        out += 'General Area: ';
                        out += name;
                        out += ", Around Grid Ref " + gr;
                        break;
                    case 'details':
                        out += '<p>General Area: </p>';
                        out += name;
                        out += "</br/>Around Grid Ref " + gr;
                        break;
                }
                break;
            default:
                out = startTag + "Start type not defined" + endTag;
        }
        return out;
    };
    this.displayLocation = function (location, view, type) {
        var out = '';
        var time = ra.getObjProperty(location, 'time', '[?Time?]');
        var name = ra.getObjProperty(location, 'name', '[?Place?]');
        var lat = ra.getObjProperty(location, 'latitude', 0);
        var long = ra.getObjProperty(location, 'longitude', 0);
        var gr = ra.getObjProperty(location, 'gridref8', null);
        var gr10 = ra.getObjProperty(location, 'gridref10', null);
        if (gr === "") {
            gr = 'Outside UK';
        } else {
            if (gr === null) {
                gr = '[?no grid ref?]';
            } else {
                gr = gr + "/" + gr10;
            }
        }

        var pc = ra.getObjProperty(location, 'postcode.value', '');
        var w3w = ra.getObjProperty(location, 'w3w', '');
        switch (view) {
            case 'table':
                out += time + ' at ' + name + ' (' + gr + ' ' + pc + ')';
                break;
            case 'list':
                out += ', ' + time + ' at ' + name + ' (' + gr + ' ' + pc + ')';
                break;
            case 'details':
                out += '<b>Time: </b>' + time;
                out += '<br/><b>Place: </b>' + name;
                out += '<ul>';
                out += '<li><b>Lat/Long: </b>' + lat.toFixed(5) + "/" + long.toFixed(5) + "</li>";
                out += '<li><b>Grid Ref: </b>' + gr + "</li>";
                out += '<li><b>Postcode: </b>' + pc + "</li>";
                out += '<li><b>W3W: </b>' + w3w + "</li>";
                out += "<li><b>Maps</b>" + this.displayMaps(location) + "</ul>";
                out += '</ul>';
        }
        return out;
    };
    this.displayMaps = function (location) {
        var out = '';

        var maps = ra.getObjProperty(location, 'osmaps', null);
        if (maps === null) {
            return out;
        }
        out = "<ul>";
        maps.forEach(map => {
            out += '<li>' + map.type + " " + map.number + " - " + map.title + "</li>";
        });
        out += "</ul>";
        return out;
    };
    this.getWalkTitle = function (view = 'default') {
        var d = ra.getObjProperty(this.data, 'basics.title');
        if (d !== null) {
            return  "<b>" + d + "</b>";
        }
        return '????';
    };
    this.getWalkDifficulty = function (view) {
        var out = '';
        if (view === 'details') {
            out += "<ul>";
        }
        var walks = ra.getObjProperty(this.data, 'walks');
        walks.forEach(element => {
            var distance = ra.getObjProperty(element, 'distance', '[?Distance?]');
            var units = ra.getObjProperty(element, 'units', '[?miles/km?]');
            var natgrade = ra.getObjProperty(element, 'natgrade', '[?National grade?]');
            switch (view) {
                case 'table':
                    out += distance + ' ' + units + ' ' + natgrade + '<br/>';
                    break;
                case 'list':
                    out += distance + ' ' + units + ', ';
                    break;
                case 'details':
                    var localgrade = ra.getObjProperty(element, 'localgrade');
                    var leader = ra.getObjProperty(element, 'leader');
                    var ascent = ra.getObjProperty(element, 'ascent');
                    var duration = ra.getObjProperty(element, 'duration');
                    out += '<li>' + distance + ' ' + units + ' ' + natgrade;
                    if (localgrade !== null) {
                        out += " / " + localgrade;
                    }
                    if (ascent !== null) {
                        out += " A: " + ascent;
                    }
                    if (duration !== null) {
                        out += " D: " + duration;
                    }
                    if (leader !== null) {
                        out += " L: " + leader;
                    }
                    out += '</li>';

                    break;
            }

        });
        if (view === 'details') {
            out += "</ul>";
        }
        return out;

    };

    this.getWalkContact = function (view) {
        var d = ra.getObjProperty(this.data, 'contact');
        var out = '';
        if (typeof (d.displayName) === "undefined") {
            out += '[?No contact name?]';
        } else {
            out += d.displayName;
        }

        switch (view) {
            case 'table':
                if (typeof (d.email) !== "undefined") {
                    out += '<br/>' + this.obscureInfo(d.email, this.loggedOn);
                }
                if (typeof (d.telephone1) !== "undefined") {
                    out += '<br/>' + this.obscureInfo(d.telephone1, this.loggedOn);
                }
                if (typeof (d.telephone2) !== "undefined") {
                    out += '<br/>' + this.obscureInfo(d.telephone2, this.loggedOn);
                }
                break;
            case 'list':
                if (typeof (d.telephone1) !== "undefined") {
                    out += ', ' + this.obscureInfo(d.telephone1, this.loggedOn);
                }
                break;
            case 'details':
                if (typeof (d.email) !== "undefined") {
                    out += '<br/>' + this.obscureInfo(d.email, this.loggedOn);
                }
                if (typeof (d.telephone1) !== "undefined") {
                    out += '<br/>' + this.obscureInfo(d.telephone1, this.loggedOn);
                }
                if (typeof (d.telephone2) !== "undefined") {
                    out += '<br/>' + this.obscureInfo(d.telephone2, this.loggedOn);
                }
                break;
        }
        return out;
    };
    this.getStatusCategory = function (delimiter, noCategories) {
        var notes = '';
        notes += '[' + this.getWalkStatus() + "]";
        if (noCategories > 1) {
            notes += delimiter + "[" + this.category + "]";
        }
        if (this.hasEditorNotes()) {
            notes += delimiter + "[Editor Notes]";
        }
        var no = this.getNoWalkIssues();
        if (no > 0) {
            notes += delimiter + "[" + no.toString() + " issues]";
        }
        return notes;

    };
    this.getWalkFacilities = function () {
        var out = "";
        out += this.getWalkFacilitiesItem("Facilities", 'facilities');
        out += this.getWalkFacilitiesItem("Transport", 'transport');
        out += this.getWalkFacilitiesItem("Accessibility", 'accessibility');
        if (out === "") {
            out = "No facilities, transport, accessibility flags";
        }
        return out;

    };
    this.getWalkFacilitiesItem = function (title, section) {
        var out = "";
        var d = ra.getObjProperty(this.data, section);
        if (d !== null) {
            for (var key in d) {
                var item = d[key];
                if (item.value) {
                    out += "<li>" + item.name + "</li>";
                }
            }
        }
        if (out !== "") {
            out = "<b>" + title + "</b><br/><ul>" + out + "</ul>";
        }
        return out;
    };

    this.getNoWalkIssues = function () {
        this.checkFields();
        return this.errors;

    };
    this.getWalkMessages = function (view = 'all') {
        this.checkFields();
        switch (view) {
            case 'summary':
                //  var sum = this.notifications.slice(0, 3);
                //  return sum.join('<br/>');
                break;
            case 'all':
                break;
        }
        return this.notifications.join('');

    };
    this.getWalkNotes = function (view) {
        var d = ra.getObjProperty(this.data, 'notes.comments');
        var out = '';
        switch (view) {
            case 'table':
                out += d;
                break;
            case 'list':
                out += d;
                break;
            case 'details':
                out += d;
                break;
        }
        return out;
    };
    this.getAsEvent = function () {
        var meetingTime = '';

        var d = ra.getObjProperty(this.data, 'basics.date');
        var startTime = ra.getObjProperty(this.data, 'start.location.time');
        var meeting = ra.getObjProperty(this.data, 'meeting.locations');
        if (meeting !== null) {
            meetingTime = ra.getObjProperty(meeting[0], 'time');
            if (meetingTime === "undefined") {
                meetingTime = null;
            }
        }
        var title = ra.getObjProperty(this.data, 'basics.title');
        if (title === null) {
            title = 'No title defined';
        }
        if (d === null) {
            var now = new Date();
            var iso = now.toISOString();
            d = iso.substring(0, iso.indexOf('T'));
        }

        var event = {};
        if (meetingTime !== null) {
            //      d = d + "T" + meetingTime + ":00";
        } else {
            if (startTime !== null) {
                //          d = d + "T" + startTime + ":00";
            }
        }
        event.start = d;
        event.title = title;
        event.classNames = this.getEventClassesArray();


        return event;
    };
    this.getAsMarker = function (cluster) {
        var type = ra.getObjProperty(this.data, 'start.type');
        var icon, popup, popupoffset, title;
        var lat;
        var lng;
        var date = ra.getObjProperty(this.data, 'basics.date');
        var title = ra.getObjProperty(this.data, 'basics.title');
        var time = ra.getObjProperty(this.data, 'start.location.time');
        var name = ra.getObjProperty(this.data, 'start.location.name');
        var gr = ra.getObjProperty(this.data, 'start.location.gridref8');
        var _this = this;
        popup = "<b>Date: " + date + "<br/>Title: " + title + "</b><br/>";
        switch (type) {
            case 'start':
                lat = ra.getObjProperty(this.data, 'start.location.latitude');
                lng = ra.getObjProperty(this.data, 'start.location.longitude');
                if (lat === null) {
                    lat = 53.70774;
                }
                if (lng === null) {
                    lng = 0.76326;
                }
                popup += "<b>Walk start</b><br/>Time:" + time;
                popup += "<br/>Name:" + name;
                popup += "<br/>GR: " + gr;
                icon = ra.map.icon.markerStart();
                title = 'Start of walk';
                popupoffset = [0, -10];
                break;
            case 'area':
                lat = ra.getObjProperty(this.data, 'start.location.latitude');
                lng = ra.getObjProperty(this.data, 'start.location.longitude');
                if (lat === null) {
                    lat = 53.70774;
                }
                if (lng === null) {
                    lng = 0.76326;
                }
                popup += "<b>General area for walk only</b><br/>Name: " + name;
                popup += "<br/>Contact group if you wish to join the walk at the start";
                icon = ra.map.icon.markerArea();
                title = 'General area of walk';
                popupoffset = [0, -10];
                break;
            default:
                lat = 53.70774;
                lng = 0.76326;
                icon = ra.map.icon.markerArea();
                title = 'Start not defined';
                popup = 'Start not defined';
                popupoffset = [0, -10];
        }
        //      var marker = L.marker([lat, lng], {icon: icon, title: title, riseOnHover: true}).addTo(layer);
        //     marker.bindPopup(popup, {offset: popupoffset, autoClose: false}).closePopup();
        var pp = document.createElement('div');
        pp.setAttribute('class', 'pointer');
        pp.setAttribute('title', 'View walk details');
        pp.innerHTML = popup;
        pp.addEventListener('click', function () {
            _this.displayDetails();
        });
        var marker = cluster.addMarker(pp, lat, lng, {icon: icon, title: title, riseOnHover: true});

    };


    this.hasEditorNotes = function () {
        var notes = ra.getObjProperty(this.data, 'notes.comments');
        if (notes !== null) {
            return notes.length > 0;
        }
        return false;

    };

    this.displayJson = function (tag, walk, gwemWalk) {
        var hr = document.createElement('hr');
        tag.appendChild(hr);
        var details = document.createElement('details');
        tag.appendChild(details);
        var summary = document.createElement('summary');
        summary.textContent = "Diagnostics";
        details.appendChild(summary);
        var div = document.createElement('div');
        details.appendChild(div);
        div.innerHTML = "<pre>" + JSON.stringify(walk, undefined, 4) + "</pre>";
        var div = document.createElement('div');
        details.appendChild(div);
        div.innerHTML = "<pre>" + JSON.stringify(gwemWalk, undefined, 4) + "</pre>";
    };
    this.notificationMsg = function (msg, type = isERROR) {
        if (type === isERROR) {
            this.errors += 1;
        }
        var iclass = "ra-we-issues";
        if (type === isERROR) {
            iclass += " error";
        }
        this.notifications.push('<div class="' + iclass + '">' + msg + '</div>');
    };
    this.setWalkValues = function () {

    };

    this.walkDetails = function () {

        var PHP_EOL = "\n";
        var $html = "";

        $html += "<div class='walkstdfulldetails stdfulldetails walk draft' >" + PHP_EOL;
        $html += "<div class=\'group " + this.getWalkStatusClass() + "'><b>Preview of Walk - " + this.getWalkStatus() + " </b></div>" + PHP_EOL;

        $html += "<div class='ra preview section'>" + PHP_EOL;
        $html += '<b>Basics:</b><br/>' + this.getWalkBasics('details');
        $html += "</div>" + PHP_EOL;

        $html += "<div class='ra preview section'>";
        $html += '<b>Meeting:</b>' + this.getWalkMeeting('details');
        $html += "</div>" + PHP_EOL;

        $html += "<div class='ra preview section'>";
        $html += '<b>Start:</b>' + this.getWalkStart('details');
        $html += "</div>" + PHP_EOL;

        $html += "<div class='ra preview section'>";
        $html += '<b>Walk(s):</b><br/>' + this.getWalkDifficulty('details');
        $html += "</div>" + PHP_EOL;

        $html += "<div class='ra preview section'>";
        $html += '<b>Contact:</b><br/>' + this.getWalkContact('details');
        $html += "</div>" + PHP_EOL;

        var mapdiv = "detailsMapDiv";
        $html += "<div id='" + mapdiv + "'></div>" + PHP_EOL;

        $html += "<div class='ra preview section'>" + PHP_EOL;
        $html += this.getWalkFacilities();

        $html += "</div>" + PHP_EOL;
        $html += "<div class='ra preview section'>" + PHP_EOL;
        $html += '<b>Issues:</b><br/>' + this.getWalkMessages();
        $html += "</div>" + PHP_EOL;

        var notes = this.getWalkNotes('details');
        if (notes !== '') {
            $html += "<div class='ra preview section'>" + PHP_EOL;
            $html += '<b>Editor Notes:</b><br/>' + notes;
            $html += "</div>" + PHP_EOL;
        }
        $html += "</div>" + PHP_EOL;

        return $html;
    };
    this._addMaptoWalk = function () {

        var tag = document.getElementById("detailsMapDiv");
        var lmap = new ra.leafletmap(tag, ra.defaultMapOptions);
        var map = lmap.map;
        var points = 0;
        var layer = L.featureGroup().addTo(map);
        var type = ra.getObjProperty(this.data, 'meeting.type');
        if (type !== null) {
            var out = '';
            switch (type) {
                case 'car':
                    out = 'Car Share at ';
                    break;
                case 'coach':
                    out = 'Coach walk pickup at ';
                    break;
                case 'public':
                    out = 'Using public transport at ';
                    break;
                case 'none':
                    break;
                default:
            }
            if (out !== '') {
                var meets = ra.getObjProperty(this.data, 'meeting.locations');
                meets.forEach(element => {
                    var time = ra.getObjProperty(element, 'time', '???');
                    var name = ra.getObjProperty(element, 'name', '???');
                    var gr = ra.getObjProperty(element, 'gridref8');
                    var lat = ra.getObjProperty(element, 'latitude');
                    var long = ra.getObjProperty(element, 'longitude');
                    var pc = ra.getObjProperty(element, 'postcode.value', null);
                    var pcLat = ra.getObjProperty(element, 'postcode.latitude');
                    var pcLng = ra.getObjProperty(element, 'postcode.longitude');
                    if (lat !== null && long !== null) {
                        out += time + ' from ' + name + ', ' + gr;

                        var marker = L.marker([lat, long]).addTo(layer);
                        marker.bindPopup(out);
                        points += 1;
                        if (pc !== null) {
                            ra.map.addPostcodeIcon(pc, [pcLat, pcLng], layer);
                        }
                    }
                });
            }
        }

        var type = ra.getObjProperty(this.data, 'start.type');
        var out = "";
        var icon;
        var lat = null;
        var long = null;
        switch (type) {
            case 'start':
                var time = ra.getObjProperty(this.data, 'start.location.time', '???');
                var name = ra.getObjProperty(this.data, 'start.location.name', '???');
                var gr = ra.getObjProperty(this.data, 'start.location.gridref8');
                lat = ra.getObjProperty(this.data, 'start.location.latitude');
                long = ra.getObjProperty(this.data, 'start.location.longitude');
                var pc = ra.getObjProperty(this.data, 'start.location.postcode.value', null);
                var pcLat = ra.getObjProperty(this.data, 'start.location.postcode.latitude');
                var pcLng = ra.getObjProperty(this.data, 'start.location.postcode.longitude');
                icon = ra.map.icon.markerStart();
                out = "Start of walk<br/>";
                out += time;
                out += " from " + name;
                out += ", " + gr;
                if (pc !== null) {
                    ra.map.addPostcodeIcon(pc, [pcLat, pcLng], layer);
                }
                break;
            case 'area':
                var name = ra.getObjProperty(this.data, 'start.location.name');
                var gr = ra.getObjProperty(this.data, 'start.location.gridref8');
                var lat = ra.getObjProperty(this.data, 'start.location.latitude');
                var long = ra.getObjProperty(this.data, 'start.location.longitude');
                icon = ra.map.icon.markerArea();
                out += 'General area: os walk<br/>';
                out += name;
                out += ", Grid Ref " + gr;
                break;
        }
        var options = {
            icon: icon
        };
        if (lat !== null && long !== null) {
            var marker = L.marker([lat, long], options).addTo(layer);
            marker.bindPopup(out);
            points += 1;
        }
        if (points > 0) {

            var bounds = layer.getBounds();
            map.fitBounds(bounds, {maxZoom: 15, padding: [20, 20]});

        }
    };

    this.gradeCSS = function (nationalGrade) {
        var $class = "";
        switch (nationalGrade) {
            case "Easy Access":
                $class = "grade-ea";
                break;
            case "Easy":
                $class = "grade-e";
                break;
            case "Leisurely":
                $class = "grade-l";
                break;
            case "Moderate":
                $class = "grade-m";
                break;
            case "Strenuous":
                $class = "grade-s";
                break;
            case "Technical":
                $class = "grade-t";
                break;
            default:
                break;
        }
        return $class;
    };
    this.obscureInfo = function ($text, $canedit) {
        if ($canedit) {
            return $text;
        } else {
            var $no = $text.length;
            if ($no < 5) {
                return "*".repeat($no);
            }
            var $out = $text;
            for (var $i = 0; $i <= $no - 5; $i++) {
                var $char = $out.substr($i, 1);
                if ($char !== "@" && $char !== " ") {
                    $out = $out.replaceAt($i, "*");
                }
            }

            return $out;
        }
    };
    this.YYYYMMDD = function () {
        if (this.dateSet()) {
            var basics = this.data.basics;
            return  ra.date.YYYYMMDD(basics.date);
        } else {
            return null;
        }
    };
    String.prototype.replaceAt = function (index, char) {
        var a = this.split("");
        a[index] = char;
        return a.join("");
    };


};
