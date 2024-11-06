var L, ra, OsGridRef, Element;
if (typeof (ra) === "undefined") {
    ra = {};
}
ra.leafletmap = function (tag, options) {

    ra.logger.toServer(["createMap", window.location.href]);
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
        attribution: "Map data &copy; <a href=\"https://openstreetmap.org\" target=\"_blank\">OpenStreetMap</a>"}).addTo(this.map);
    this.mapLayers["Open Topo Map"] = new L.TileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        maxNativeZoom: 15,
        attribution: 'Kartendaten: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, <a href="http://viewfinderpanoramas.org">SRTM</a> | Kartendarstellung: &copy; <a href="https://opentopomap.org" target=\"_blank\">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'});
    if (options.licenseKeys.bingkey !== null) {
        try {
            this.mapLayers["Bing Aerial"] = new L.BingLayer(options.licenseKeys.bingkey, {type: 'Aerial'});
            this.mapLayers["Bing Aerial (Labels)"] = new L.BingLayer(options.licenseKeys.bingkey, {type: 'AerialWithLabels'});
            this.mapLayers["Bing Ordnance Survey"] = new L.BingLayer(options.licenseKeys.bingkey, {type: 'ordnanceSurvey',
                //    minZoom: 11.5,
                //   minNativeZoom: 11.5,
                //   maxZoom: 18,
                attribution: 'Bing/OS Crown Copyright'});
        } catch (err) {

        }

    }
    if (options.licenseKeys.ESRIkey !== null) {
        this.mapLayers["Esri_WorldImagery"] = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'

        });
        this.mapLayers["Esri_WorldTopoMap"] = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
        });
    }
    if (options.licenseKeys.OSTestkey !== null) {

//        this.mapLayers["Ordnance Survey  Walking"] = L.tileLayer('https://api.os.uk/maps/raster/v1/zxy/Leisure_27700/{z}/{x}/{y}.png?key=' + options.licenseKeys.OSTestkey, {
//            minZoom: 0,
//            maxZoom: 9
//        });
//        this.mapLayers["Ordnance Survey Light"] = L.tileLayer('https://api.os.uk/maps/raster/v1/zxy/Light_3857/{z}/{x}/{y}.png?key=' + options.licenseKeys.OSTestkey, {
//            maxZoom: 20,
//            attribution:'Map &copy; Ordnance Survey'
//        });
//        this.mapLayers["Ordnance Survey Outdoor"] = L.tileLayer('https://api.os.uk/maps/raster/v1/zxy/Outdoor_3857/{z}/{x}/{y}.png?key=' + options.licenseKeys.OSTestkey, {
//            maxZoom: 20,
//            attribution: 'Map &copy; Ordnance Survey'
//        });
//        this.mapLayers["Ordnance Survey Road"] = L.tileLayer('https://api.os.uk/maps/raster/v1/zxy/Road_3857/{z}/{x}/{y}.png?key=' + options.licenseKeys.OSTestkey, {
//            maxZoom: 20,
//            attribution: 'Map &copy; Ordnance Survey'
//        });
        const customStyleJson = 'https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/master/OS_VTS_3857_Outdoor.json';
        this.mapLayers["Ordnance Survey Outdoor"] = L.maplibreGL({
            style: customStyleJson,
            attribution: 'Map &copy; Ordnance Survey',
            transformRequest: (url, resourceType) => {
                if (resourceType !== 'Style' && url.startsWith('https://api.os.uk')) {
                    url = new URL(url);
                    if (!url.searchParams.has('key'))
                        url.searchParams.append('key', options.licenseKeys.OSTestkey);
                    if (!url.searchParams.has('srs'))
                        url.searchParams.append('srs', 3857);
                    return {
                        url: new Request(url).url
                    };
                }
            }
        });
    }
    if (options.licenseKeys.OSkey !== null) {
        const customStyleJson2 = 'https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/master/OS_VTS_3857_Road.json';
        this.mapLayers["Ordnance Survey Road"] = L.maplibreGL({
            minZoom: 7,
            maxZoom: 19,
            maxBounds: [
                [-10.76418, 47],
                [1.9134116, 61.331151]
            ],
            style: customStyleJson2,
            attribution: 'Map &copy; Ordnance Survey',
            transformRequest: (url, resourceType) => {
                if (resourceType !== 'Style' && url.startsWith('https://api.os.uk')) {
                    url = new URL(url);
                    if (!url.searchParams.has('key'))
                        url.searchParams.append('key', options.licenseKeys.OSkey);
                    if (!url.searchParams.has('srs'))
                        url.searchParams.append('srs', 3857);
                    return {
                        url: new Request(url).url
                    };
                }
            }
        });
    }

    if (options.licenseKeys.thunderForestkey !== null) {
        this.mapLayers["Thunderforest Outdoor"] = L.tileLayer('https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=' + options.licenseKeys.thunderForestkey, {
            maxZoom: 20
        });
    }

    if (options.licenseKeys.mapBoxkey !== null) {
        this.mapLayers["Mapbox"] = basemapd = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
            tileSize: 512,
            maxZoom: 18,
            zoomOffset: -1,
            id: 'mapbox/streets-v12',
            accessToken: options.licenseKeys.mapBoxkey
        });
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
    this.controls.zoomlevelOSMsg.getContainer().style.backgroundColor = "#eeeeee";
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

    if (options.licenseKeys.bingkey) {
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
        ra.logger.toServer(["changeMap", window.location.href, e.name]);
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

// top right controls
    this.controls.layers = L.control.layers(this.mapLayers).addTo(this.map);
    if (options.topoMapDefault) {
        this.map.addLayer(this.mapLayers["Open Topo Map"]);
    } else {
        this.map.addLayer(this.mapLayers["Open Street Map"]);
    }
//   this.mapLayers["Ordnance Survey  Walking"].addTo(this.map);
    var _this = this;

// this.controls.settings.setErrorDiv(this.errorDivControl());
    this.map.on('zoomend', function () {
        _this.osZoomLevel();
    });
    this.map.on('baselayerchange', function (e) {
        _this.baseTiles = e.name;
        _this.baseTiles = e.layer.options.type;
        _this.osZoomLevel();
    });
    if (options.rightclick !== null) {
        this.controls.rightclick.mapControl(this.controls.layers);
    }

    this.osZoomLevel = function () {
        this.controls.zoomlevelOSMsg.setText("");
        if (this.baseTiles === 'ordnanceSurvey') {
            var zoom = this.map.getZoom();
            if (zoom === 17) {
                this.controls.zoomlevelOSMsg.setErrorText("Ordnance Survey Maps: Cannot zoom in any further");
            }
            if (zoom > 17) {
                this.map.setZoom(17);
            }
            if (zoom === 11.5) {
                this.controls.zoomlevelOSMsg.setErrorText("Ordnance Survey Maps: Cannot zoom out any further");
            }
            if (zoom < 11.5) {
                this.map.setZoom(11.5);
            }
            // console.log("zoom:" + zoom);
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