var L, ra, OsGridRef, Element;

function leafletMap(tag, options) {

    this.options = options;

    this.controls = {layers: null,
        tools: null,
        zoom: null,
        elevation: null,
        print: null,
        mylocation: null,
        scale: null,
        mouse: null,
        rightclick: null,
        plotroute: null};

    this.userOptions = {layers: null,
        tools: null,
        zoom: null,
        elevation: null,
        print: null,
        mylocation: null,
        scale: null,
        mouse: null,
        rightclick: null,
        plotroute: null};
    this.mapDiv = null;
    var tags = [
        {name: 'container', parent: 'root', tag: 'div', attrs: {class: 'ra-map-container'}},
        {name: 'cluster', parent: 'root', tag: 'div', attrs: {id: 'ra-cluster-progress-bar'}},
        {name: 'map', parent: 'container', tag: 'div', style: {height: options.mapHeight, width: options.mapWidth}},
        {name: 'copyright', parent: 'container', tag: 'div'}
    ];
    var tagcopy = [
        {parent: 'root', tag: 'p', attrs: {class: 'mapcopyright'}, textContent: 'OS data © Crown copyright and database 2021;   Royal Mail data © Royal Mail copyright and Database 2021'},
        {parent: 'root', tag: 'p', attrs: {class: 'mapcopyright'}, textContent: '© openrouteservice.org by HeiGIT | Map data © OpenStreetMap contributors'},
        {parent: 'root', tag: 'p', attrs: {class: 'mapcopyright'}, textContent: 'Maps Icons Collection https://mapicons.mapsmarker.com'}
    ];


    var elements = ra.html.generateTags(tag, tags);
    this.mapDiv = elements.map;
    if (options.copyright) {
        ra.html.generateTags(elements.copyright, tagcopy);
    }

    if (!options.cluster) {
        elements.cluster.style.display = 'none';
    }

    this.map = new L.Map(this.mapDiv, {
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
    if (options.bing) {
        this.mapLayers["Bing Aerial"] = new L.BingLayer(options.bingkey, {type: 'Aerial'});
        this.mapLayers["Bing Aerial (Labels)"] = new L.BingLayer(options.bingkey, {type: 'AerialWithLabels'});
        this.mapLayers["Ordnance Survey"] = new L.BingLayer(options.bingkey, {type: 'ordnanceSurvey',
            attribution: 'Bing/OS Crown Copyright'});
    }
    // top right control for error messages
    L.control.racontainer({id: 'ra-error-text', position: 'topright'}).addTo(this.map);

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
    this.controls.zoom = this.map.addControl(new L.Control.Zoom());
    if (options.fullscreen) {
        this.controls.fullscreen = this.map.addControl(new L.Control.Fullscreen());
        var self = this;
        this.map.addEventListener('fullscreenchange', function () {
            // let modal know if map full screen;
            ra.modal.fullscreen(self.map.isFullscreen(), self.map);
        });
    }
    if (options.print) {
        var self = this;
        this.controls.print = L.control.browserPrint({
            title: 'Print',
            documentTitle: 'The Ramblers - working for walkers',
            printModes: ["Portrait", "Landscape"],
            closePopupsOnPrint: false
        }).addTo(this.map);
        if (options.bing) {
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
    }
    if (options.mylocation) {
        this.controls.mylocation = L.control.mylocation().addTo(this.map);
    }
    // top right controls
    this.controls.layers = L.control.layers(this.mapLayers).addTo(this.map);
    if (options.topoMapDefault) {
        this.map.addLayer(this.mapLayers["Open Topo Map"]);
    } else {
        this.map.addLayer(this.mapLayers["Open Street Map"]);
    }
    if (options.maptools) {
        try {
            this.controls.tools = L.control.ra_map_tools();
            this.controls.tools.userOptions(this.userOptions);
            this.controls.tools.helpPage(options.helpPage);
            this.controls.tools.addTo(this.map);
        } catch (err) {
            document.getElementById("ra-error-text").innerHTML = "ERROR: " + err.message;
        }
    }
    // bottom left controls
    if (options.startingplaces) {
        L.control.usageAgreement().addTo(this.map);
    }
    if (options.rightclick) {
        try {
            this.controls.rightclick = L.control.rightclick().addTo(this.map);
            if (this.controls.layers === null) {
                alert('Program error in rambler leaflet map');
            }
            this.controls.rightclick.mapControl(this.controls.layers);
            this.userOptions.rightclick = this.controls.rightclick.userOptions();
        } catch (err) {
            document.getElementById("ra-error-text").innerHTML = "ERROR: " + err.message;
        }
    }

    if (options.mouseposition && !L.Browser.mobile) {
        try {
            this.controls.mouse = L.control.mouse().addTo(this.map);
            this.userOptions.mouse = this.controls.mouse.userOptions();
        } catch (err) {
            document.getElementById("ra-error-text").innerHTML = "ERROR: " + err.message;
        }

    }

    this.controls.scale = L.control.scale().addTo(this.map);
//    this.map.on('LayersControlEvent', function (ev) {
//        alert(ev.latlng); // ev is an event object (MouseEvent in this case)
//    });
    var _this = this;
    this.map.on('baselayerchange', function (e) {
        _this.currentLayer = e.layer;
        //alert('Changed to ' + e.name);
    });

    // bottom right controls
    if (options.controlcontainer) {
        L.control.racontainer({id: 'js-gewmapButtons'}).addTo(this.map);
    }

    if (options.initialview) {
        var pt = L.latLng(options.initialview.latitude, options.initialview.longitude);
        this.map.setView(pt, options.initialview.zoom);
    }

}

leafletMap.prototype.SetPlotUserOptions = function (value) {
    this.userOptions.plotroute = value;
};
leafletMap.prototype.layersControl = function () {
    return this.controls.layers;
};
leafletMap.prototype.toolsControl = function () {
    return this.controls.tools;
};
leafletMap.prototype.zoomControl = function () {
    return this.controls.zoom;
};
leafletMap.prototype.mylocationControl = function () {
    return this.controls.mylocation;
};
leafletMap.prototype.elevationControl = function () {
    return this.controls.elevation;
};
leafletMap.prototype.fullscreenControl = function () {
    return this.controls.fullscreen;
};
leafletMap.prototype.printControl = function () {
    return this.controls.print;
};
leafletMap.prototype.mouseControl = function () {
    return this.controls.mouse;
};
leafletMap.prototype.scaleControl = function () {
    return this.controls.scale;
};
leafletMap.prototype.rightclickControl = function () {
    return this.controls.rightclick;
};
leafletMap.prototype.mapDiv = function () {
    return this.mapDiv;
};