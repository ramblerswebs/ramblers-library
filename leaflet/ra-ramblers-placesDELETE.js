L.Control.RamblersPlaces = L.Control.extend({
    options: {
        title: 'Display Ramblers meeting & staring places',
        position: 'topleft',
        starOptions: ["Fetch", "5 Star", "4 Star", "3 Star", "2 Star", "1 Star"],
    },
    onAdd: function (map) {
        this._map = map;
       // _ra_places_this = this;
        var container = L.DomUtil.create('div', 'leaflet-control-ramblers-places leaflet-bar leaflet-control');
        this._createIcon(container);
        this._container = container;
        this._appendButtons(container);
        L.DomEvent.on(this.link, 'click', this._ramblers_places, this);
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.addListener(container, 'mouseover', this._displayButtons, this);
        L.DomEvent.addListener(container, 'mouseout', this._hideButtons, this);

        return container;
    },
    setRouteItems: function (itemsCollection) {
        this._itemsCollection = itemsCollection;
    },
    _createIcon: function (container) {
        var icon = L.DomUtil.create('a', '', container);
        this.link = icon;
        this.link.id = "leaflet-ramblers-places";
        this.link.title = this.options.titledisabled;
        return this.link;
    },
    _appendButtons: function (container) {
        this.holder = L.DomUtil.create('ul', 'leaflet-places-actions', container);
        for (var i = 0; i < this.options.starOptions.length; i++) {
            var option = this.options.starOptions[i];
            var element = L.DomUtil.create('li', '', this.holder);
            element.innerHTML = option;
            L.DomEvent.addListener(element, 'click', this._any_star, this);
        }

    },
    _displayButtons: function () {
        this.holder.style.display = "inline-block";
    },
    _hideButtons: function () {
        this.holder.style.display = "none";
    },
    _ramblers_places: function (evt) {




    },
    _any_star: function (evt) {
        var option = evt.explicitOriginalTarget.data;
        alert("any star" + option);
    }
});

L.control.ramblersPlaces = function (options) {
    return new L.Control.RamblersPlaces(options);
};
