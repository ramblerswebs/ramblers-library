
//
//
//
//
//ra.eventffs = class {
//  
//    constructor() {
//        this.fred = 'fvdjvnfdknvfdv';
//    }
//
//    registerPHPWalks = function () {
//        alert(this.fred);
//    }
//
//};
//ra.next=class extends ra.eventffs{
//    register = function () {
//        alert(this.fred+" next");
//    }
//};
//var fred = new ra.next();
//fred.registerPHPWalks();
//fred.register();
//
//class ra_event {
//    constructor() {
//        this.events = {};
//    }
//
//    registerPHPWalks = function (phpwalks) {
//        phpwalks.forEach(phpwalk => {
//            var newEvent = new ra.event(phpwalk);
//            newEvent.convertPHPWalk(phpwalk);
//            this.events[phpwalk.id] = newEvent;
//        });
//    }
//    ;
//}
//
//





////var ra;
//if (typeof (ra) === "undefined") {
//    ra = {};
//}
//if (typeof (ra.event) === "undefined") {
//    ra.event = {};
//}
//
//ra.event.timelocation = function (type, time, location) {
//    this.type = type;
//    this.time = time;
//    this.location = location;
//    this._addLocation = function () {
//        alert("timelocation alert");
//    };
//
//};
//ra.event.location = function (description, gridref, latitude, longitude, postcode) {
//    this.description = description;
//    this.gridref = gridref;
//    this.latitude = latitude;
//    this.longitude = longitude;
//    this.postcode = postcode;
//    this.exact = null;
//
//    this._addLocation = function () {
//
//    };
//
//};
//
////var loc = new ra.event.location("Description", "SK123456", 52.3, -1.2, "DE22 1JT");
////var tl = new ra.event.timelocation("Meet", "10am", location);
////tl._addLocation();
