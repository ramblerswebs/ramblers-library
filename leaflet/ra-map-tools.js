var L;
L.Control.RATools = L.Control.extend({
    options: {
        id: null,
        position: 'topright'
    },
    onAdd: function (map) {
        this._map = map;

        var container = L.DomUtil.create('div', 'leaflet-control-ra-map-tools');
        if (this.options.id !== null) {
            container.setAttribute('id', this.options.id);
        }
        return container;
 },
});
L.control.racontainer = function (options) {
    return new L.Control.RAContainer(options);
};