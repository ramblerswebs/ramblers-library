var document;
preview = function () {
    this.display = function (tag, ramblers) {
        tag.innerHTML = '';
        this.displayWalk(tag, ramblers);
        this.displayComments(tag);
        this.displayJson(tag, ramblers);
    };

    this.displayWalk = function (tag, ramblers) {
        var items, type;
        // Basics section
        var walk = ramblers.walk;
        var displayDiv = document.createElement('div');
        displayDiv.setAttribute('class', 'display');
        tag.appendChild(displayDiv);
        var input = new raInputFields;

        var basicsDiv = document.createElement('div');
        basicsDiv.setAttribute('class', 'display section basics');
        displayDiv.appendChild(basicsDiv);

        input.addHeader(basicsDiv, "h2", "Basic Details");
        this.addDisplayItem(basicsDiv, "Date", walk.basics, 'date');
        this.addDisplayItem(basicsDiv, "", walk.basics, 'title');
        this.addDisplayItem(basicsDiv, "", walk.basics, 'description');

// Meeting type section

        var meetingDiv = document.createElement('div');
        meetingDiv.setAttribute('class', 'display section meeting');
        displayDiv.appendChild(meetingDiv);
        type = ramblers.walk.meeting.type;
        switch (type) {
            case 'car':
                input.addHeader(meetingDiv, "h2", "Meeting: Car share to the walk");
                break;
            case 'coach':
                input.addHeader(meetingDiv, "h2", "Meeting: Catch a coach to the walks");
                break;
            case 'public':
                input.addHeader(meetingDiv, "h2", "Meeting: Use public transport to the walk");
                break;
            case 'none':
                input.addHeader(meetingDiv, "h2", "Meet at the start of the walk");
                break;
            case 'undefined':
                input.addHeader(meetingDiv, "h2", "Meeting: Meeting arrangements not defined");
                break;
        }
        var title = "";
        items = ramblers.walk.meeting.locations;
        for (i = 0; i < items.length; i++) {
            var item = items[i];
            switch (type) {
                case 'car':
                    title = 'Car Share ';
                    break;
                case 'coach':
                    title = 'Pick Up ' + (i + 1).toString();
                    break;
                case 'public':
                    title = 'Pick Up ' + (i + 1).toString();
                    break;

            }
            if (items.length > 1) {
                this.addDisplayItem(meetingDiv, "", title, null);
            }
            this.addDisplayItem(meetingDiv, "Catch ", item, 'servicename');
            this.addDisplayItem(meetingDiv, "Time", item, 'time');
            this.addDisplayItem(meetingDiv, "Name", item, 'name');
            this.addDisplayItem(meetingDiv, "Grid Ref", item, 'gridref8');
        }

// Start Section

        var startDiv = document.createElement('div');
        startDiv.setAttribute('class', 'display section start');
        displayDiv.appendChild(startDiv);
        item = null;

        type = ramblers.walk.start.type;
        switch (type) {
            case 'undefined':
                input.addHeader(startDiv, "h2", "Start/Walking Area");
                var tab = document.createElement('p');
                tab.textContent = 'Error: Not defined';
                startDiv.appendChild(tab);
                break;
            case 'area':
                input.addHeader(startDiv, "h2", "Walking Areas: Where is the walk going to be?");
                item = ramblers.walk.start.area;
                break;
            case 'start':
                input.addHeader(startDiv, "h2", "Start: Where is the walk going to be?");
                item = ramblers.walk.start.location;
                break;
        }
        this.addDisplayItem(startDiv, "Time", item, 'time');
        this.addDisplayItem(startDiv, "Place", item, 'name');
        this.addDisplayItem(startDiv, "Grid Ref", item, 'gridref8');

// Walks Section

        var walksDiv = document.createElement('div');
        walksDiv.setAttribute('class', 'display section walk');
        displayDiv.appendChild(walksDiv);

        input.addHeader(walksDiv, "h2", "Walk Length, Difficulty");

        var items = ramblers.walk.walks;
        for (i = 0; i < items.length; i++) {
            var item = items[i];
            this.addDisplayItem(walksDiv, "Distance", item, 'distance');
            this.addDisplayItem(walksDiv, "Units", item, 'units');
            this.addDisplayItem(walksDiv, "Type", item, 'type');
            this.addDisplayItem(walksDiv, "National Grade", item, 'natgrade');
            this.addDisplayItem(walksDiv, "Local Grade", item, 'localgrade');
            this.addDisplayItem(walksDiv, "Pace", item, 'pace');
            this.addDisplayItem(walksDiv, "Ascent", item, 'ascent');
            this.addDisplayItem(walksDiv, "Duration", item, 'duration');
        }

// Contacts Section

        var contactDiv = document.createElement('div');
        contactDiv.setAttribute('class', 'display section contact');
        displayDiv.appendChild(contactDiv);

        input.addHeader(contactDiv, "h2", "Who to Contact about the Walk");
        this.addDisplayItem(contactDiv, "Name", walk.contact, 'displayName');
        this.addDisplayItem(contactDiv, "Telephone", walk.contact, 'telephone1');
    };

    this.addDisplayItem = function (tag, title, obj, property) {
        var value = null;
        if (obj === null) {
            return;
        }
        if (property === null) {
            value = obj;
        } else {
            if (obj.hasOwnProperty(property)) {
                value = obj[property];
            }
        }
        if (value === null) {
            return;
        }
        var item = document.createElement('p');
        //   item.setAttribute('class', 'section basics');
        var text = "";
        if (title !== "") {
            text += "<b>" + title + ": </b>";
        }
        item.innerHTML = text + value;
        tag.appendChild(item);
    };

    this.displayComments = function (tag) {
        var htmlString = "<p> Comments about the form </p>"
                + "<ul >"
                + "<li> Walks should have levels of status: draft, awaiting approval, approved, cancelled, completed </li>"
                + "<li> Should they also have a deleted status? </li> "
                + "<li> Form should allow incomplete information while the walk is in draft status, so dates could be defined while the other details are gathered </li>"
                + "<li> What data is required for Coach walks? </li>"
                + "<li> What data is required for Public Transport walks? </li>"
                + "<li> Most walks will have either a single Meeting place or no Meeting place </li>"
                + "<li> Most walks will have a single walk of one distance </li>"
                + "<li> Some walks, especially Coach walks often have a selection of walks to choose from, some Areas hold a get together with multiple walks </li>"
                + "<li> Pace - should this have predefined ranges or be an absolute value in mile / hour or km / hour? </li>"
                + "<li> Ascent - should this have predefined ranges or be an absolute value in feet or metres? </li>"
                + "<li> Duration - given distance, pace and ascent we can estimate the walk duration and display this </li>"
                + "</ul>";
        var comment = document.createElement('div');
        comment.innerHTML = htmlString;
        tag.appendChild(comment);
     
    };
     this.displayJson = function (tag, ramblers) {
              var hr = document.createElement('hr');
        tag.appendChild(hr);
        var div = document.createElement('div');
        tag.appendChild(div);
        div.innerHTML = "<pre>" + JSON.stringify(ramblers.walk, undefined, 4) + "</pre>";
       
    };
};