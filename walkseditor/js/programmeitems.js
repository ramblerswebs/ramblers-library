var ra;
if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.walkseditor) === "undefined") {
    ra.walkseditor = {};
}

ra.walkseditor.programme = function () {
    this.items = [];
    this.getItems = function () {
        return this.items;
    };
    this.getWalks = function () {
        var walks = [];
        this.items.forEach(function (item, index) {
            var walk = item.getWalk();
            walks.push(walk);
        });
        return walks;
    };
    this.getWalksJson = function () {
        var walks = [];
        this.items.forEach(function (item, index) {
            var walk = item.getWalk();
            walks.push(walk.data);
        });
        return JSON.stringify(walks, null, 5);
    };
    this.addWalk = function (walk) {
        var item = new ra.walkseditor.programmeItem(walk);
        this.items.push(item);
        this._sortItems();
    };
    this.duplicateWalk = function (walk) {
        var newJson = JSON.stringify(walk.data);
        var newWalk = new ra.walkseditor.draftWalk();
        newWalk.createFromJson(newJson);
        this.addWalk(newWalk);
    };
    this.deleteWalk = function (walk) {
        var _this = this;
        this.items.forEach(function (item, index) {
            var awalk = item.getWalk();
            if (awalk === walk) {
                _this.removeItem(item);
            }
        });
    };
    this.addItem = function (item) {
        this.items.push(item);
        this._sortItems();
    };

    this.removeItem = function (item) {
        var index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
        }
    };
    this.clearItems = function () {
        this.items = [];
    };
    this.sort = function () {
        this._sortItems();
    };

    this._sortItems = function () {
        this.items.sort(function (a, b) {
            var da = a.getWalk().data.basics.date;
            var db = b.getWalk().data.basics.date;
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
    };
};

ra.walkseditor.programmeItem = function (walk = null) {
    if (walk === null) {
        this._walk = new ra.walkseditor.draftWalk();
    } else {
        this._walk = walk;
    }

    this._status = 'Draft';
    this._category = "None";

    this.getWalk = function () {
        return  this._walk;
    };
    this.setStatus = function (value) {
        this._status = value;
    };
    this.getStatus = function () {
        return  this._status;
    };
    this.setCategory = function (value) {
        this._category = value;
    };
    this.getCategory = function () {
        return  this._category;
    };

};