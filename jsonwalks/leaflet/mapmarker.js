/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ra;

var raWalksMap = (function () {
    var raWalksMap = function () {
        this.options = null;
        this.settings = {
            mapFormat: ["{gradeimgRight}", "{dowddmm}", "{lf}", "{title}", "{lf}", "{distance}", "{,grade}", "{lf}", "{startOSMap}", "{startDirections}"]
        };
        this.legend = '<p><strong>Zoom</strong> in to see where our walks are going to be. <strong>Click</strong> on a walk to see details.</p>' +
                '<p><img src="libraries/ramblers/images/marker-start.png" alt="Walk start" height="26" width="16">&nbsp; Start locations&nbsp; <img src="libraries/ramblers/images/marker-cancelled.png" alt="Cancelled walk" height="26" width="16"> Cancelled walk&nbsp; <img src="libraries/ramblers/images/marker-area.png" alt="Walking area" height="26" width="16"> Walk in that area.</p>';

        this.load = function (mapOptions, data) {
            this.options = mapOptions;
            this.data = data;
            var tags = [
                {name: 'container', parent: 'root', tag: 'div'},
                {name: 'legendtop', parent: 'container', tag: 'div'},
                {name: 'map', parent: 'container', tag: 'div', attrs: {id: 'ra-map'}},
                {name: 'legendbottom', parent: 'container', tag: 'div'}
            ];

            this.masterdiv = document.getElementById(this.options.divId);

            this.elements = ra.html.generateTags(this.masterdiv, tags);
            switch (this.data.legendposition) {
                case "top":
                    this.elements.legendtop.innerHTML = this.legend;
                    break;
                case "bottom":
                    this.elements.legendbottom.innerHTML = this.legend;
                    break;
                default:
                    this.elements.legendtop.innerHTML = this.legend;
                    this.elements.legendbottom.innerHTML = this.legend;
            }

            this.lmap = new leafletMap(this.elements.map, this.options);
            this.map = this.lmap.map;
            this.cluster = new cluster(this.map);
            this._allwalks = ra.walk.convertPHPWalks(data.walks);
            ra.walk.registerWalks(this._allwalks);
            var $walks = this._allwalks;
//            if (document.getElementById("leafletmap") !== null) {
//                raLoadLeaflet();
//            }
            // this.setFilters($walks);
            this.displayWalks($walks);
        };
        this.displayWalks = function ($walks) {
            this.cluster.removeClusterMarkers();
            var index, len, $walk;
            if ($walks.length === 0) {
                return;
            }
            for (index = 0, len = $walks.length; index < len; ++index) {
                $walk = $walks[index];
                this.addWalkMarker($walk);
            }
            this.cluster.addClusterMarkers();
            return;
        };
        this.addWalkMarker = function ($walk) {
            var $long, $lat, $icon, $class, $details, $map;
            var $popup;
            var $this = this.settings;
            $long = $walk.startLocation.longitude;
            $lat = $walk.startLocation.latitude;

            if ($walk.startLocation.exact) {
                $icon = ra.map.icon.markerStart;
            } else {
                $icon = ra.map.icon.markerArea;
            }
            if (ra.walk.isCancelled($walk)) {
                $icon = ra.map.icon.markerCancelled;
            }
            $details = ra.walk.getWalkValues($walk, this.settings.mapFormat);
            $class = $this.walkClass + $walk.status;
            $details = "<div class='" + $class + "'>" + $details + "</div>";
            $popup = $details;
            $popup = $popup.replace('"', "&quot;");
            this.cluster.addMarker($popup, $lat, $long, $icon);
            return;
        };
    };

    return raWalksMap;

})();
