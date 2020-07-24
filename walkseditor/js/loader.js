/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ramblers, document;
function loadEditWalk(fields) {
    ramblers = new Ramblers();
    ramblers.fields = JSON.parse(fields);
    ramblers.editMode = true;
    setupWalksRecord();
    var tag = document.getElementById('js-outer-content');
    ramblers.controller = new walkcontroller(tag);
    ramblers.controller.editor();
    ramblers.controller.setSubmitButton();
}
function loadViewWalk(fields) {
    ramblers = new Ramblers();
    ramblers.fields = JSON.parse(fields);
    ramblers.editMode = false;
    setupWalksRecord();
    var tag = document.getElementById('js-outer-content');
    ramblers.controller = new walkcontroller(tag);
    ramblers.controller.viewer();
}
function setupWalksRecord() {
    var tag = document.getElementById(ramblers.fields.content);
    if (tag !== null) {
        var json = tag.value;
        if (json === "") {
            json = "{}";
        }
    }
    ramblers.walk = JSON.parse(json);
    if (!ramblers.walk.hasOwnProperty("basics")) {
        ramblers.walk.basics = {};
    }
    if (!ramblers.walk.hasOwnProperty("meeting")) {
        ramblers.walk.meeting = {};
    }
    if (!ramblers.walk.meeting.hasOwnProperty("locations")) {
        ramblers.walk.meeting.locations = [];
    }
    if (!ramblers.walk.meeting.hasOwnProperty("type")) {
        ramblers.walk.meeting.type = "undefined";
    }
    if (!ramblers.walk.hasOwnProperty("start")) {
        ramblers.walk.start = {};
    }
    if (!ramblers.walk.start.hasOwnProperty("type")) {
        ramblers.walk.start.type = "undefined";
    }
    if (!ramblers.walk.hasOwnProperty("walks")) {
        ramblers.walk.walks = [{}];
    }
    if (!ramblers.walk.hasOwnProperty("contact")) {
        ramblers.walk.contact = {};
    }
}
;
addContent = function () {
// no content to add!
};
function loadEditPlace(fieldIDs) {
    ramblers = new Ramblers();
    ramblers.fields = JSON.parse(fieldIDs);
    ramblers.editMode = true;
    ramblers.record = {};
    var fields = ramblers.fields;
    var property;
    for (property in fields) {
        if (fields.hasOwnProperty(property)) {
            var buttonID = fields[property];
            ramblers.record[property] = document.getElementById(buttonID).value;
        }
    }
    if (ramblers.record.latitude === "") {
        ramblers.record.latitude = 0;
    } else {
        ramblers.record.latitude = parseFloat(ramblers.record.latitude);
    }
    if (ramblers.record.longitude === "") {
        ramblers.record.longitude = 0;
    } else {
        ramblers.record.longitude = parseFloat(ramblers.record.longitude);
    }


    if (ramblers.record.latitude === 0 && ramblers.record.longitude === 0) {
        ramblers.record.isLatLongSet = false;
    } else {
        ramblers.record.isLatLongSet = true;
    }


    var tag = document.getElementById('js-outer-content');
    ramblers.controller = new placecontroller(tag);
    ramblers.controller.placeEditor();
    ramblers.controller.setSubmitButton();
}
this.findItemNumber = function (tag) {
// called when a field within an item changes
// called when adding new item
    var item = tag;
    while (item.className !== "js-item") {
        item = item.parentElement;
    }

    return countSiblings(item);
};
countSiblings = function (tag) {
    var next = tag;
    var i = 0;
    while (next.previousSibling !== null) {
        i += 1;
        next = next.previousSibling;
    }
    return i;
};