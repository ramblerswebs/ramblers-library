var L, ra, document, OsGridRef;
L.Control.RA_Map_Settings = L.Control.extend({
    options: {
        id: null,
        title: 'Settings&Help',
        position: 'topright'
    },
    helpBase: "https://maphelp5.ramblers-webs.org.uk/",
    onAdd: function (map) {
        this._map = map;
        var _this = this;
        this.searchLayer = L.featureGroup([]);
        this.searchLayer.addTo(this._map);
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-control-display-settings');
        this._container = container;
        if (this.options.id !== null) {
            container.setAttribute('id', this.options.id);
        }
        container.title = this.options.title;
        container.addEventListener("click", function (e) {
            var settings = document.createElement('div');
            settings.setAttribute('class', 'settings'); // not needed
            ra.modal.display(settings, false);
            var title = document.createElement('h4');
            title.textContent = "Settings & Help";
            settings.appendChild(title);
            // tabs
            var cont = document.createElement('div');
            cont.setAttribute('class', 'tabs');
            settings.appendChild(cont);
            var tabs = document.createElement('div');
            tabs.setAttribute('class', 'ra-tabs-left ');
            cont.appendChild(tabs);
            var list = document.createElement('div');
            tabs.appendChild(list);
            // tab content 
            var content = document.createElement('div');
            content.setAttribute('class', 'tab-content');
            cont.appendChild(content);
            var first = true;
            var control = _this.leafletMap.plotControl();
            if (control !== null) {
                _this._addTabItem(cont, list, 'Plot Walking Route', 'route', first);
                var drawDiv = _this.addTabContentItem(content, "route", first);
                control.settingsForm(drawDiv);
                first = false;
            }

            var searchDiv;
            _this._addTabItem(cont, list, 'Search', 'search', first);
            searchDiv = _this.addTabContentItem(content, "search", first);
            first = false;
            _this.addSearch(searchDiv);

            control = _this.leafletMap.mouseControl();
            if (control !== null) {
                _this._addTabItem(cont, list, 'Ordnance Survey', 'osmaps', false);
                var osmapsDiv = _this.addTabContentItem(content, "osmaps", false);
                control.settingsForm(osmapsDiv);
            }

            control = _this.leafletMap.rightclickControl();
            if (control !== null) {
                _this._addTabItem(cont, list, 'Mouse Right Click', 'mouse', false);
                var mouseDiv = _this.addTabContentItem(content, "mouse", false);
                control.settingsForm(mouseDiv);
            }

            control = _this.leafletMap.mylocationControl();
            if (control !== null) {
                _this._addTabItem(cont, list, 'My Location', 'mylocation', false);
                var mylocation = _this.addTabContentItem(content, "mylocation", false);
                control.settingsForm(mylocation);
            }

            if (_this._helpPage !== '') {
                _this._addTabItem(cont, list, 'Help/Feedback', 'help', false);
                var helpDiv = _this.addTabContentItem(content, "help", false);
                _this.addHelp(helpDiv);
            }
            var padding = document.createElement('p');
            cont.appendChild(padding);
        });
        return container;
    },
    changeDisplay: function (display) {
        this._container.style.display = display;
    },
    helpPage: function (value) {
        this._helpPage = value;
    },
    setLeafletMap: function (value) {
        this.leafletMap = value;
    },
    addSearch: function (tag) {
        var _this = this;
        var feed = new feeds();
        feed.getSearchTags(tag, tag);
        tag.addEventListener("locationfound", function (e) {
            var raData = e.raData;
            var result = raData.item;
            _this.searchLayer.clearLayers();
            result.center = new L.LatLng(result.lat, result.lon);
            new L.Marker(result.center, {icon: ra.map.icon.redmarker()})
                    .bindPopup("<b>" + result.class + ": " + result.type + "</b><br/>" + result.display_name)
                    .addTo(_this.searchLayer)
                    .openPopup();
            _this._map.setView(result.center, 16);
        });
    },
    addHelp: function (tag) {
        if (this._helpPage !== '') {
            var helpcomment = document.createElement('div');
            helpcomment.setAttribute('class', 'help map-tools');
            helpcomment.innerHTML = "If you have a problem with the mapping facilities on this site then please contact the web site owner. Alternatively contact us via the mapping HELP below.</br></br>";
            tag.appendChild(helpcomment);

            var help = document.createElement('a');
            help.setAttribute('class', 'link-button mintcake');
            help.setAttribute('href', this.helpBase + this._helpPage);
            help.setAttribute('target', '_blank');
            help.style.cssFloat = "center";
            help.textContent = "View Mapping Help";
            tag.appendChild(help);

        }
    },
    _addTabItem: function (container, list, name, id, active) {
        var listItem;
        listItem = document.createElement('div');
        // listItem.setAttribute('data-toggle', 'tab');
        listItem.classList.add('ra-tab-item');
        if (active) {
            listItem.classList.add('active');
        }
        listItem.textContent = name;
        listItem.setAttribute('data-tab', id);
        list.appendChild(listItem);
        listItem.addEventListener('click', (function (e) {
            var tab = e.currentTarget;
            var elems = container.querySelectorAll(".active");
            elems.forEach(function (item, index) {
                item.classList.remove("active");
            });
            var id = tab.getAttribute('data-tab');
            var ele = document.getElementById(id);
            ele.classList.add('active');
            tab.classList.add('active');
        }));
    },
    addTabContentItem: function (content, id, active) {
        var item;
        item = document.createElement('div');
        item.setAttribute('id', id);
        if (active) {
            item.setAttribute('class', "tab-panel active");
        } else {
            item.setAttribute('class', "tab-panel");
        }
        content.appendChild(item);
        return item;
    },
}
);
L.control.ra_map_settings = function (options) {
    return new L.Control.RA_Map_Settings(options);
};