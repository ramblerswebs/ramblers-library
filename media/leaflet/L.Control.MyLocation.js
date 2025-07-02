
var L, ra, document, Infinity;
L.Control.MyLocation = L.Control.extend({

    options: {
        position: 'topleft',
        strings: {
            title: "My Location - Show me where I am"
        },
        showPopup: true,
        setView: 'untilPanOrZoom',
        flyTo: false, // have to set this to false because we have to do setView manually
        keepCurrentZoomLevel: false,
        returnToPrevBounds: false,
        showCompass: true,
        clickBehavior: {inView: 'stop', outOfView: 'setView', inViewNotFollowing: 'inView'},
        locateOptions: {
            maxZoom: Infinity,
            watch: true, // if you overwrite this, visualization cannot be updated
            enableHighAccuracy: true
        }
    },
    _controls: {

    },
    initialize(options) {
        // set default options if nothing is set (merge one step deep)
        for (const i in options) {
            if (typeof this.options[i] === 'object') {
                L.extend(this.options[i], options[i]);
            } else {
                this.options[i] = options[i];
            }
        }

    },
    onAdd: function (map) {
        this.map = map;
        var _this = this;
        this._readSettings();
        var container = L.DomUtil.create('div', 'leaflet-control-mylocation');
        container.addEventListener("mousedown", function (e) {
            _this.map.stop(); // stop any cuurent flyTo
        });
        this.location = L.control.locate(this.options).addTo(map);
        // move control inside this one
        var moveEl = this.location.getContainer();
        var newParent = container;
        newParent.appendChild(moveEl);

        return container;
    },
    getLocationControl: function () {
        return this.location;
    },
    onRemove: function (map) {
        // Nothing to do here
    },
    settingsForm: function (tag) {
        var _this = this;
        var hdg1 = document.createElement('h3');
        hdg1.textContent = 'My Location Options';
        tag.appendChild(hdg1);
        var text = `These options work in conjunction with the <b>My Location</b> button, and control how your current location is presented on the map. The <b>My Location</b> tool is most useful when you are using the map in the field, for example, when walking a route.`;
        var comment = document.createElement('p');
        comment.innerHTML = text;
        tag.appendChild(comment);
        this._controls.showCompass = ra.html.input.yesNo(tag, '', "Show Compass: Show the compass bearing on top of the location marker", this.options, 'showCompass');
        this._controls.enableHighAccuracy = ra.html.input.yesNo(tag, '', "Enable High Accuracy: To enable high accuracy (GPS) mode", this.options.locateOptions, 'enableHighAccuracy');
        this._controls.flyTo = ra.html.input.yesNo(tag, '', "Fly to location: Smooth pan and zoom to the location of the marker", this.options, 'flyTo');
        this._controls.keepCurrentZoomLevel = ra.html.input.yesNo(tag, '', "Keep current Zoom Level: Only pan to the location", this.options, 'keepCurrentZoomLevel');
        this._controls.returnToPrevBounds = ra.html.input.yesNo(tag, '', "Return to previous view: When control is disabled, set the view back to the previous view", this.options, 'returnToPrevBounds');
        var options = [{name: 'Never', value: false},
            {name: 'First time only', value: 'once'},
            {name: 'Always', value: 'always'},
            {name: 'Until user pans map', value: 'untilPan'},
            {name: 'Until user pans or zooms map ', value: 'untilPanOrZoom'}];
        this._controls.setView = ra.html.input.combo(tag, '', "As you move: Set the map view (zoom and pan) to the user's location as you move", this.options, 'setView', options);
        this._controls.showCompass.addEventListener("ra-input-change", function (e) {
            _this._optionChanged();
        });
        this._controls.enableHighAccuracy.addEventListener("ra-input-change", function (e) {
            _this._optionChanged();
        });
        this._controls.flyTo.addEventListener("ra-input-change", function (e) {
            _this._optionChanged();
        });
        this._controls.keepCurrentZoomLevel.addEventListener("ra-input-change", function (e) {
            _this._optionChanged();
        });
        this._controls.returnToPrevBounds.addEventListener("ra-input-change", function (e) {
            _this._optionChanged();
        });
        this._controls.setView.addEventListener("ra-input-change", function (e) {
            _this._optionChanged();
        });
    },
    _optionChanged: function () {
        ra.settings.changed();
        this._resetOptions();
    },
    _resetOptions: function () {
        //  this.location.remove();
        var opts = this.location.options;
        opts.setView = this.options.setView;
        opts.flyTo = this.options.flyTo;
        opts.keepCurrentZoomLevel = this.options.keepCurrentZoomLevel;
        opts.returnToPrevBounds = this.options.returnToPrevBounds;
        opts.showCompass = this.options.showCompass;
        opts.locateOptions.enableHighAccuracy = this.options.locateOptions.enableHighAccuracy;

    },
    _addComment: function (tag, inHtml) {
        var comment = document.createElement('span');
        comment.innerHTML = inHtml;
        comment.style.paddingLeft = "50px";
        tag.appendChild(comment);
    },
    resetSettings: function () {
        ra.html.input.yesNoReset(this._controls.showCompass, true);
        ra.html.input.yesNoReset(this._controls.enableHighAccuracy, true);
        ra.html.input.yesNoReset(this._controls.flyTo, false);
        ra.html.input.comboReset(this._controls.setView, 'untilPanOrZoom');
        ra.html.input.yesNoReset(this._controls.keepCurrentZoomLevel, false);
        ra.html.input.yesNoReset(this._controls.returnToPrevBounds, false);
    },
    _readSettings: function () {
        ra.settings.read('__mylocation', this.options);
    },
    saveSettings: function (save) {
        ra.settings.save(save, '__mylocation', this.options);
    }
});
L.control.mylocation = function (opts) {
    return new L.Control.MyLocation(opts);
};
