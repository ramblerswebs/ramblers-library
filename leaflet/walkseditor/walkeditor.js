var ramblers, ramblersMap;
function walkeditor(data) {
    this.data = data;

    this.addEditForm = function (editDiv) {
        // first clear any old form from div
        editDiv.innerHTML = "";
        var form = document.createElement('div'); // was form
        form.setAttribute('class', 'ra_container');
        form.setAttribute('id', 'ra_container');
        editDiv.appendChild(form);

        var input = new raInputFields;

        // Basics section

        var basicsDiv = document.createElement('div');
        basicsDiv.setAttribute('class', 'section basics');
        form.appendChild(basicsDiv);

        input.addHeader(basicsDiv, "h2", "Basic Details");
        this.addBasics(basicsDiv);

        // Meeting type section

        var optionsDiv = document.createElement('div');
        optionsDiv.setAttribute('class', 'section meeting');
        form.appendChild(optionsDiv);

        input.addHeader(optionsDiv, "h2", "Meeting: Travelling to the Walk");
        this.addMeetingType(optionsDiv);

        // Start Section

        var startDiv = document.createElement('div');
        startDiv.setAttribute('class', 'section start');
        form.appendChild(startDiv);

        input.addHeader(startDiv, "h2", "Start: Where is the walk going to be?");
        this.addStartType(startDiv);

        // Walks Section

        var walksDiv = document.createElement('div');
        walksDiv.setAttribute('class', 'section walk');
        form.appendChild(walksDiv);

        input.addHeader(walksDiv, "h2", "Walk Length, Difficulty");
        var walks = new raWalkItems();
        walks.add(walksDiv, 'js-Walk', true);

        // Contacts Section

        var contactDiv = document.createElement('div');
        contactDiv.setAttribute('class', 'section contact');
        form.appendChild(contactDiv);

        input.addHeader(contactDiv, "h2", "Who to Contact about the Walk");
        this.addContact(contactDiv);
    };


    this.addBasics = function (tag) {
        var data = this.data;
        if (tag === null) {
            throw new Error("raWalkType container is null");
        }
        var options = {
            public: "Public",
            member: "Member Only",
            print: "Print Only"
        };
        if (!data.walk.hasOwnProperty('basics')) {
            data.walk.basics = {};
        }
        var basics = data.walk.basics;
        var input = new raInputFields;
        var itemDiv = input.itemsItemDivs(tag);

        this._date = input.addDate(itemDiv, 'date', 'Date of walk', basics, 'date');
        this._title = input.addText(itemDiv, 'walktitle', "Title:", basics, 'title');
        this._desc = input.addTextArea(itemDiv, 'desc', "Description:", 4, basics, 'description');
        this._notes = input.addTextArea(itemDiv, 'notes', "Additional Notes:", 2, basics, 'notes');
        this._restrictions = input.addSelect(itemDiv, 'moptions', 'Restrictions (viewable by) ', options, basics, 'restriction');

        return;

    };
    this.addMeetingType = function (tag) {
        var data = this.data;
        if (tag === null) {
            throw new Error("raWalkType tag is null");
        }
        if (!data.walk.hasOwnProperty('meeting')) {
            data.walk.meeting = {};
        }
        var meeting = data.walk.meeting;
        var options = {
            undefined: "Undefined",
            none: "We meet up at the start of the walk",
            car: "We allow walkers to meet up and car share to start of walk",
            coach: 'We catch a coach to the walk',
            public: 'We use public transport to the walk (Bus, Tram, Train)'
        };
        var input = new raInputFields;
        this._option = input.addSelect(tag, 'moptions', 'How do you get to the walk? ', options, meeting, 'type');

        this._option.addEventListener("change", function () {
            var editor = new walkeditor;
            editor.setMeetingType(this.value);
        });
        this._meetingsDiv = document.createElement('div');
        this._meetingsDiv.setAttribute('class', 'ra_meetings');
        this._meetingsDiv.setAttribute('id', 'ra_meetings');
        tag.appendChild(this._meetingsDiv);
        this.setMeetingType(this._option.value);

        return;
    };
    this.setMeetingType = function (type) {
        var tag = document.getElementById("ra_meetings");
        tag.innerHTML = "";
        // ramblers.walk.meeting = {};
        ramblers.walk.meeting.type = type;
        var input = new raInputFields;
        switch (type) {
            case 'undefined':
                break;
            case 'none':
                input.addHeader(tag, "h3", "Meeting at start of walk");
                input.addHeader(tag, "p", "Walkers travel independently to start of walk.");
                break;
            case 'car':
                input.addHeader(tag, "h3", "Car Share to start of Walk");
                var items = new raWalkItems();
                items.add(tag, 'js-CarShare', false);
                break;
            case 'coach':
                input.addHeader(tag, "h3", "Coach pick up locations");
                var items = new raWalkItems();
                items.add(tag, 'js-Pickup', true);
                break;
            case 'public':
                input.addHeader(tag, "h3", "Public transport details");
                var items = new raWalkItems();
                items.add(tag, 'js-PublicTrans', true);
                break;
            default:
                alert("Type error - please report this issue");
        }
    };

    this.addCarShare = function (tag) {
        var data = ramblers;
        if (tag === null) {
            throw new Error("js-CarShare container is null");
        }

        if (!data.walk.meeting.hasOwnProperty('locations')) {
            data.walk.meeting.locations = [];
        }
        var locations = data.walk.meeting.locations;

        var no = findItemNumber(tag);
        if (locations.length - 1 < no) {
            locations[no] = {};
        }
        var input = new raInputFields;
        this._time = input.addTime(tag, 'time', 'Meeting Time', locations[no], 'time');
        var itemsDiv = document.createElement('div');
        itemsDiv.setAttribute('class', 'location-group');
        tag.appendChild(itemsDiv);
        this._place = input.addLocation(itemsDiv, locations[no]);
        this._info = input.addText(tag, 'locations', "Car Share Info:", locations[no], 'info');
        return;

    };
    this.addPickUp = function (tag) {
        var data = ramblers;
        if (tag === null) {
            throw new Error("raWalkType container is null");
        }
        if (!data.walk.meeting.hasOwnProperty('locations')) {
            data.walk.meeting.locations = [];
        }
        var locations = data.walk.meeting.locations;
        var no = findItemNumber(tag);
        if (locations.length - 1 < no) {
            locations[no] = {};
        }
        var input = new raInputFields;
        this._time = input.addTime(tag, 'time', 'Pickup Time', locations[no], 'time');
        var itemsDiv = document.createElement('div');
        itemsDiv.setAttribute('class', 'location-group');
        tag.appendChild(itemsDiv);

        this._place = input.addLocation(itemsDiv, locations[no]);
        //      selectLocationItem(itemsDiv, locations, false);
        return;

    };

    this.addPublicTrans = function (tag) {
        var data = ramblers;
        if (tag === null) {
            throw new Error("raWalkType container is null");
        }
        if (!data.walk.meeting.hasOwnProperty('locations')) {
            data.walk.meeting.locations = [];
        }
        var locations = data.walk.meeting.locations;
        var no = findItemNumber(tag);
        if (locations.length - 1 < no) {
            locations[no] = {};
        }
        var input = new raInputFields;
        this._time = input.addTime(tag, 'time', 'Service Time: ', locations[no], 'time');
        this._servicename = input.addText(tag, 'name', "Service Name:", locations[no], 'servicename');
        var itemsDiv = document.createElement('div');
        itemsDiv.setAttribute('class', 'location-group');
        tag.appendChild(itemsDiv);
        this._place = input.addLocation(itemsDiv, locations[no]);
        //    selectLocationItem(itemsDiv, locations, false);
        return;

    };
    this.addStartType = function (tag) {
        var startingsDiv;
        if (tag === null) {
            throw new Error("raWalkType tag is null");
        }
        var options = {
            undefined: "Undefined",
            start: "You can meet at the start of the walk",
            area: "The walk will be in this general area"
        };
        if (!ramblers.walk.hasOwnProperty('start')) {
            ramblers.walk.start = {};
        }
        var start = ramblers.walk.start;
        var input = new raInputFields;

        this._option = input.addSelect(tag, 'moptions', 'Walk start? ', options, start, 'type');

        startingsDiv = document.createElement('div');
        startingsDiv.setAttribute('class', 'js-start');
        startingsDiv.setAttribute('id', 'js-start');
        tag.appendChild(startingsDiv);

        this.setStartTypeOption(this._option.value);

        this._option.addEventListener("change", function () {
            var editor = new walkeditor;
            editor.setStartTypeOption(this.value);
        });
        return;
    };

    this.setStartTypeOption = function (type) {
        var tag = document.getElementById("js-start");
        tag.innerHTML = "";
        ramblers.walk.start.type = type;
        var input = new raInputFields;
        switch (type) {
            case 'undefined':
                break;
            case 'start':
                input.addHeader(tag, "h3", "Details of the starting location");
                input.addHeader(tag, "p", "Walkers can travel independently to start of walk");
                var editor = new walkeditor();
                editor.addStart(tag);
                break;
            case 'area':
                input.addHeader(tag, "h3", "General area in which the walk will be held");
                input.addHeader(tag, "p", "Walkers, who wish to go to start of walk, will need to contact group");
                var editor = new walkeditor();
                editor.addArea(tag);
                break;
            default:
                alert("Starting Type error - please report this issue");
        }
    };

    this.addStart = function (tag) {
        var data = ramblers;
        if (tag === null) {
            throw new Error("raWalkType container is null");
        }
        if (!data.walk.start.hasOwnProperty('location')) {
            data.walk.start.location = {};
        }
        var location = data.walk.start.location;
        var input = new raInputFields;
        var itemDiv = input.itemsItemDivs(tag);
        this._time = input.addTime(itemDiv, 'time', 'Start Time', location, 'time');
        var itemsDiv2 = document.createElement('div');
        itemsDiv2.setAttribute('class', 'location-group');
        itemDiv.appendChild(itemsDiv2);
        this._place = input.addLocation(itemsDiv2, location);
        //    selectLocationItem(itemsDiv2, location,true);
        this._returntime = input.addTime(itemDiv, 'returntime', 'Approx Return Time', data.walk.start, 'returntime');
    };


    this.addArea = function (tag) {
        var data = ramblers;
        if (tag === null) {
            throw new Error("raWalkType container is null");
        }
        if (!data.walk.start.hasOwnProperty('area')) {
            data.walk.start.area = {};
        }
        delete  data.walk.start.area.nearestpostcode;
        var startArea = data.walk.start.area;
        var input = new raInputFields;
        var itemDiv = input.itemsItemDivs(tag);
        this._place = input.addLocation(itemDiv, startArea, 'area');
        this._returntime = input.addTime(itemDiv, 'returntime', 'Approx Return Time', data.walk.start, 'returntime');

    };
    this.addWalk = function (tag) {
        var data = ramblers;
        if (tag === null) {
            throw new Error("js-Walk container is null");
        }
        var mPace = {
            undefined: "Undefined",
            slow: "Slow",
            medium: "Medium",
            fast: "Fast"
        };
        var mWalk = {
            undefined: "Undefined",
            circular: "Circular",
            linear: "Linear",
            figure: "Figure of Eight"
        };
        var mUnits = {
            undefined: "Undefined",
            miles: "Miles",
            km: "Kilometres"
        };
        var mNatGrades = {
            undefined: "Undefined",
            easyaccess: "Easy Access",
            easy: "Easy",
            leisurely: 'Leisurely ',
            moderate: 'Moderate ',
            strenuous: 'Strenuous ',
            technical: 'Technical '
        };
        if (!data.walk.hasOwnProperty('walks')) {
            data.walk.walks = [];
        }
        var walks = data.walk.walks;
        var no = findItemNumber(tag);
        if (walks.length - 1 < no) {
            walks[no] = {};
        }
        var input = new raInputFields;
        this._dist = input.addNumber(tag, 'dist', "Distance:", walks[no], 'distance');
        this._unit = input.addSelect(tag, 'distanceunits', 'Distance is in ', mUnits, walks[no], 'units');
        this._type = input.addSelect(tag, 'walktype', 'The walk is ', mWalk, walks[no], 'type');
        this._natgrade = input.addSelect(tag, 'natgrade', 'National Grade ', mNatGrades, walks[no], 'natgrade');
        this._localgrade = input.addText(tag, 'localgrade', "Local Grade:", walks[no], 'localgrade');
        this._pace = input.addText(tag, 'pace', 'Pace ', mPace, walks[no], 'pace');
        this._ascent = input.addText(tag, 'ascent', "Ascent:", walks[no], 'ascent');
        this._duration = input.addText(tag, 'duration', "Duration:", walks[no], 'duration');

    };

    this.addContact = function (tag) {
        var data = ramblers;
        if (tag === null) {
            throw new Error("raWalkType container is null");
        }
        var options = {
            undefined: "Undefined",
            isLeader: "Yes they are the Leader",
            isNotLeader: "No - not the leader"
        };
        if (!data.walk.hasOwnProperty('contact')) {
            data.walk.contact = {};
        }
        var contact = data.walk.contact;
        var input = new raInputFields;
        var itemDiv = input.itemsItemDivs(tag);
        //  selectContactItem(itemDiv, contact);
        input.addPredefinedContactButton(itemDiv, contact);
        this._displayName = input.addText(itemDiv, 'name', "Display Name:", contact, 'displayName');
        this._email = input.addEmail(itemDiv, 'email', "Email Address:", contact, 'email');
        this._tel1 = input.addText(itemDiv, 'tel1', "Contact Telephone 1:", contact, 'telephone1');
        this._tel2 = input.addText(itemDiv, 'tel2', "Contact Telephone 2:", contact, 'telephone2');
        this._option = input.addSelect(itemDiv, 'moptions', 'Contact is walks Leader ', options, contact, 'contactType');
        return;
    };

    this.sortData = function () {
        var walk = this.data.walk;
        if (!walk.hasOwnProperty('meeting')) {
            walk.meeting = {};
        }
        if (!walk.meeting.hasOwnProperty('locations')) {
            walk.meeting.locations = [];
        }
        if (!walk.hasOwnProperty('walks')) {
            walk.walks = [];
        }
        walk.meeting.locations = walk.meeting.locations.sort(this.dynamicSort("time"));
        walk.walks = walk.walks.sort(this.dynamicSort("distance"));
    };

    this.dynamicSort = function (property) {
        return function (tag1, tag2) {
            var value1 = tag1[property];
            var value2 = tag2[property];
            var no1 = Number(value1);
            var no2 = Number(value2);
            if (isNaN(no1) || isNaN(no2))
            {
                return value1 > value2;
            } else {
                return no1 > no2;
            }
        };
    };

}
;
function raWalkItems() {

    this.add = function (tag, itemName, many) {

        if (tag === null) {
            throw new Error("raWalkItems container is null");
        }

        var itemsDiv = document.createElement('div');
        itemsDiv.setAttribute('class', 'js-items');
        tag.appendChild(itemsDiv);

        if (many) {
            this._addItem = document.createElement('button');
            this._addItem.setAttribute('type', 'button');
            this._addItem.setAttribute('class', 'actionbutton');
            this._addItem.setAttribute('data-object', itemName);
            this._addItem.textContent = "Add";
            tag.appendChild(this._addItem);
            this._addItem.addEventListener("click", this.addButton);
            this._sortItems = document.createElement('button');
            this._sortItems.setAttribute('type', 'button');
            this._sortItems.setAttribute('class', 'actionbutton');
            this._sortItems.textContent = "Sort";
            tag.appendChild(this._sortItems);
            this._sortItems.addEventListener("click", function (e) {
                ramblers.controller.clickEditButton();
            });
        }
        // add extra items if they are in the input already
        var howmany = 1;
        if (!ramblers.walk.hasOwnProperty('walks')) {
            ramblers.walk.walks = [];
        }
        if (!ramblers.walk.meeting.hasOwnProperty('locations')) {
            ramblers.walk.meeting.locations = [];
        }

        var arr = [];
        switch (itemName) {
            case 'js-Walk':
                arr = ramblers.walk.walks;
                break;
            case 'js-CarShare':
                arr = ramblers.walk.meeting.locations;
                break;
            case 'js-Pickup':
                arr = ramblers.walk.meeting.locations;
                break;
            case 'js-PublicTrans':
                arr = ramblers.walk.meeting.locations;
                break;
            default:
            // code block
        }
        howmany = arr.length;
        var i = 0;
        do {
            var itemDiv = document.createElement('div');
            itemDiv.setAttribute('class', 'js-item');
            itemsDiv.appendChild(itemDiv);
            this.addItem(itemDiv, itemName);
            i += 1;
        } while (i < howmany);
        return;

    };
    this.addItem = function (itemDiv, type) {
        switch (type) {
            case 'js-Walk':
                var editor = new walkeditor;
                editor.addWalk(itemDiv);
                break;
            case 'js-CarShare':
                var editor = new walkeditor;
                editor.addCarShare(itemDiv);
                break;
            case 'js-Pickup':
                var editor = new walkeditor;
                editor.addPickUp(itemDiv);
                break;
            case 'js-PublicTrans':
                var editor = new walkeditor;
                editor.addPublicTrans(itemDiv);
                break;
            default:
            // code block
        }

        this._deleteItem = document.createElement('button');
        this._deleteItem.setAttribute('type', 'button');
        this._deleteItem.setAttribute('class', 'actionbutton delete');
        this._deleteItem.setAttribute('data-object', type);
        this._deleteItem.textContent = "Delete";
        itemDiv.appendChild(this._deleteItem);
        this._deleteItem.addEventListener("click", this.deleteButton);
    };
    this.addButton = function () {
        var type = this.getAttribute("data-object");
        var itemsDiv = this.previousSibling;
        var itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', 'js-item');
        itemsDiv.appendChild(itemDiv);
        var items = new raWalkItems();
        items.addItem(itemDiv, type);
    };
    this.deleteButton = function () {
        var tag = this;
        var no = findItemNumber(tag);
        var parent = this.parentNode;
        if (parent.className === "js-item") {
            parent.parentNode.removeChild(parent);
        } else {
            alert("Remove: Invalid parent node - please report issue");
        }
        //  remove item from walk object
        var type = tag.getAttribute("data-object");
        switch (type) {
            case 'js-Walk':
                delete  ramblers.walk.walks[no];

                var arr = ramblers.walk.walks.filter(function (val) {
                    return val;
                });
                ramblers.walk.walks = arr;
                break;
            case 'js-Pickup':
                delete  ramblers.walk.meeting.locations[no];
                var arr = ramblers.walk.meeting.locations.filter(function (val) {
                    return val;
                });
                ramblers.walk.meeting.locations = arr;
                break;
            case 'js-PublicTrans':
                delete  ramblers.walk.meeting.locations[no];
                var arr = ramblers.walk.meeting.locations.filter(function (val) {
                    return val;
                });
                ramblers.walk.meeting.locations = arr;
                break;
            default:
                alert("Delete item program error");
        }
    };

}
;