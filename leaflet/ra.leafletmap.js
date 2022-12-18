var L, ra, OsGridRef, Element;
if (typeof (ra) === "undefined") {
    ra = {};
}
ra.leafletmap = function (tag, options) {

    this.options = options;

    this.controls = {layers: null,
        settins: null,
        zoom: null,
        zoomAll: null,
        elevation: null,
        errorDiv: null,
        print: null,
        mylocation: null,
        scale: null,
        mouse: null,
        rightclick: null,
        search: null,
        plotroute: null,
        zoomlevelOSMsg: null,
        osinfo: null};

    this._mapDiv = null;

    var tags = [
        {name: 'container', parent: 'root', tag: 'div', attrs: {class: 'ra-map-container'}},
        {name: 'map', parent: 'container', tag: 'div', style: {height: options.mapHeight, width: options.mapWidth}},
        {name: 'copyright', parent: 'container', tag: 'div'}
    ];
    var tagcopy = [
        {parent: 'root', tag: 'p', attrs: {class: 'mapcopyright'}, textContent: 'OS data © Crown copyright and database 2021;   Royal Mail data © Royal Mail copyright and Database 2021'},
        {parent: 'root', tag: 'p', attrs: {class: 'mapcopyright'}, textContent: '© openrouteservice.org by HeiGIT | Map data © OpenStreetMap contributors'},
        {parent: 'root', tag: 'p', attrs: {class: 'mapcopyright'}, textContent: 'Maps Icons Collection https://mapicons.mapsmarker.com'}
    ];

    var elements = ra.html.generateTags(tag, tags);
    this._mapDiv = elements.map;

    this.minHeight = this._mapDiv.clientHeight; // save initial map height
    if (options.copyright) {
        ra.html.generateTags(elements.copyright, tagcopy);
    }
    var self = this;
    this.map = new L.Map(this._mapDiv, {
        center: new L.LatLng(54.221592, -3.355007),
        zoom: 5,
        zoomSnap: 0.25,
        maxZoom: 18,
        zoomControl: false
    });
    this.mapLayers = new Object();
// map types
    this.mapLayers["Open Street Map"] = new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Map data &copy; <a href=\"https://openstreetmap.org\">OpenStreetMap</a>"}).addTo(this.map);
    this.mapLayers["Open Topo Map"] = new L.TileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        maxNativeZoom: 16,
        attribution: 'Kartendaten: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, <a href="http://viewfinderpanoramas.org">SRTM</a> | Kartendarstellung: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'});
    if (options.bingkey !== null) {
        try {
            this.mapLayers["Bing Aerial"] = new L.BingLayer(options.bingkey, {type: 'Aerial'});
            this.mapLayers["Bing Aerial (Labels)"] = new L.BingLayer(options.bingkey, {type: 'AerialWithLabels'});
            this.mapLayers["Ordnance Survey"] = new L.BingLayer(options.bingkey, {type: 'ordnanceSurvey',
                attribution: 'Bing/OS Crown Copyright'});
        } catch (err) {

        }

    }
    // get my location for directions
    this.map.locate();

    this.map.on('locationerror', function () {
        ra.loc.setPositionError();
    });
    this.map.on('locationfound', function (e) {
        ra.loc.setPosition(e);
    });

    // top right control for error messages
    this.controls.errorDiv = L.control.racontainer({position: 'topright'}).addTo(this.map);
    //this.controls.errorDiv.setText(ra.html.getBrowserStatus());
    this.controls.zoomlevelOSMsg = L.control.racontainer({position: 'topright'}).addTo(this.map);

    // top left controls
    if (options.displayElevation) {
        this.controls.elevation = L.control.elevation({
            position: "topleft",
            theme: "steelblue-theme", //default: lime-theme
            width: 600,
            height: 125,
            margins: {
                top: 10,
                right: 20,
                bottom: 30,
                left: 50
            },
            useHeightIndicator: true, //if false a marker is drawn at map position
            interpolation: "linear", //see https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-area_interpolate
            hoverNumber: {
                decimalsX: 1, //decimals on distance (always in km)
                decimalsY: 0, //deciamls on hehttps://www.npmjs.com/package/leaflet.coordinatesight (always in m)
                formatter: undefined //custom formatter function may be injected
            },
            xTicks: undefined, //number of ticks in x axis, calculated by default according to width
            yTicks: undefined, //number of ticks on y axis, calculated by default according to height
            collapsed: true, //collapsed mode, show chart on click or mouseover
            imperial: false    //display imperial units instead of metric
        });
        this.controls.elevation.addTo(this.map);
    }
    this.controls.zoom = L.control.zoom({position: 'topleft'}).addTo(this.map);
    this.controls.fullscreen = L.control.fullscreen({position: 'topleft'}).addTo(this.map);
    this.controls.print = L.control.browserPrint({
        title: 'Print',
        documentTitle: 'The Ramblers - working for walkers',
        printModes: [L.control.browserPrint.mode.portrait("Protrait", "A4"),
            L.control.browserPrint.mode.landscape("Landscape", "A4"),
            L.control.browserPrint.mode.custom("Select Area", "A4")],
        contentSelector: "[leaflet-browser-print-content]",
        pagesSelector: "[leaflet-browser-print-pages]",
        manualMode: false,
        closePopupsOnPrint: false
    }).addTo(this.map);

    if (options.bingkey) {
        L.Control.BrowserPrint.Utils.registerLayer(
                L.BingLayer,
                "L.BingLayer",
                function (layer) {
                    var bing = L.bingLayer(layer.key, layer.options);
                    // fix as above object fails to set url
                    bing._url = self.currentLayer._url;
                    return bing;
                }
        );
    }
    if (options.helpPage !== '') {
        this.controls.help = L.control.help({helpPageUrl: options.helpPage}).addTo(this.map);
    }

    this.controls.search = L.control.search({position: 'topleft'}).addTo(this.map);
    this.controls.mylocation = L.control.mylocation({position: 'topleft'}).addTo(this.map);
    this.controls.zoomAll = L.control.zoomall().addTo(this.map);
    this.controls.osinfo = L.control.osinfo().addTo(this.map);
    this.controls.rightclick = L.control.rightclick().addTo(this.map);
    this.controls.settings = L.control.settings();
    // this.controls.settings.setHelpPage(options.helpPage);
    this.controls.settings.addTo(this.map);
    this.controls.settings.setLeafletMap(this);

    var tools = L.control.tools().addTo(this.map);
    tools.moveMapControl(this.controls.zoom);
    tools.moveMapControl(this.controls.zoomAll);
    tools.moveMapControl(this.controls.print);
    tools.moveMapControl(this.controls.mylocation);
    tools.moveMapControl(this.controls.search);
    tools.moveMapControl(this.controls.fullscreen);
    tools.moveMapControl(this.controls.rightclick);
    tools.moveMapControl(this.controls.osinfo);
    tools.moveMapControl(this.controls.settings);
    if (options.helpPage !== '') {
        tools.moveMapControl(this.controls.help);
    }

    this.controls.resizer = L.control.resizer({onlyOnHover: false, direction: 's'}).addTo(this.map);

    this.controls.resizer.addEventListener('drag', function () {
        var newHeight = self._mapDiv.clientHeight;
        if (newHeight < self.minHeight) {
            self._mapDiv.style.height = self.minHeight + "px";
            //  only allow map to be larger
        }

    });

    // bottom left controls 
    if (options.mouseposition !== null) {
        this.controls.mouse = L.control.mouse().addTo(this.map);
    }

    this.controls.scale = L.control.scale().addTo(this.map);

    var _this = this;
    this.map.on('baselayerchange', function (e) {
        _this.currentLayer = e.layer;
        //alert('Changed to ' + e.name);
    });

    // bottom right controls
    if (options.controlcontainer) {
        // used by walks editor
        L.control.racontainer().addTo(this.map);
    }

    if (options.initialview) {
        var pt = L.latLng(options.initialview.latitude, options.initialview.longitude);
        this.map.setView(pt, options.initialview.zoom);
    }
    //this.map.addEventListener('fullscreenchange', function () {
    // let modal know if map full screen;
    //  ra.modals.fullscreen(self.map.isFullscreen(), self.map);
    //});
    // top right controls
    this.controls.layers = L.control.layers(this.mapLayers).addTo(this.map);
    if (options.topoMapDefault) {
        this.map.addLayer(this.mapLayers["Open Topo Map"]);
    } else {
        this.map.addLayer(this.mapLayers["Open Street Map"]);
    }
    var _this = this;

    // this.controls.settings.setErrorDiv(this.errorDivControl());
    this.map.on('zoomend', function () {
        _this.osZoomLevel();
    });
    this.map.on('baselayerchange', function (e) {
        _this.baseTiles = e.name;
        _this.osZoomLevel();
    });
    if (options.rightclick !== null) {
        this.controls.rightclick.mapControl(this.controls.layers);
    }


    this.osZoomLevel = function () {
        this.controls.zoomlevelOSMsg.setText("");
        if (this.baseTiles === 'Ordnance Survey') {
            var zoom = this.map.getZoom();
            //  this.controls.zoomlevelOSMsg.setErrorText("Info: Zoom "+zoom);
            if (zoom <= 11) {
                this.controls.zoomlevelOSMsg.setErrorText("Info: Zoom in to see Ordnance Survey Maps");
            }
            if (zoom > 17) {
                this.controls.zoomlevelOSMsg.setErrorText("Info: Zoom out to see Ordnance Survey Maps");
            }
        }
    };
    this.map.on('browser-print-end', function (e) {
        tag.scrollIntoView();
    });
    this.map.on('browser-print-end', function (e) {
        tag.scrollIntoView();
    });


    this.SetPlotUserControl = function (value) {
        this.controls.plotroute = value;
    };
    this.plotControl = function () {
        return this.controls.plotroute;
    };
    this.layersControl = function () {
        return this.controls.layers;
    };
    this.settingsControl = function () {
        return this.controls.settings;
    };
    this.zoomControl = function () {
        return this.controls.zoom;
    };
    this.mylocationControl = function () {
        return this.controls.mylocation;
    };
    this.elevationControl = function () {
        return this.controls.elevation;
    };
    this.fullscreenControl = function () {
        return this.controls.fullscreen;
    };
    this.printControl = function () {
        return this.controls.print;
    };
    this.mouseControl = function () {
        return this.controls.mouse;
    };
    this.scaleControl = function () {
        return this.controls.scale;
    };
    this.rightclickControl = function () {
        return this.controls.rightclick;
    };
    this.osInfoControl = function () {
        return this.controls.osinfo;
    };

    this.errorDivControl = function () {
        return this.controls.errorDiv;
    };
    this.mapDiv = function () {
        return this._mapDiv;
    };
};


