/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var raOrganisationMap = (function () {

    var raOrganisationMap = function (options) {
        var masterdiv = document.getElementById(options.divId);
        this.lmap = new leafletMap(masterdiv, options);
        this.cluster = new cluster(this.lmap.map);
        this.load = function (data) {
            this.addMarkers(data.areas);
            this.addMarkers(data.groups);
            this.cluster.addClusterMarkers();
            this.cluster.zoomAll();
        };
        this.addMarkers = function (items) {
            for (var index = 0; index < items.length; ++index) {
                var item = this.items[index];
                this.addMarker(item);
            }
        };
        this.addMarker = function (item) {
        var $popup, $lat, $long;
          switch (item.scope) {
            case "A":
                $iclass = "group-icon a";
                $text = "Ramblers Area [" + item.code + "]";
                break;
            case "G":
                $iclass = "group-icon g";
                $text = $areatext + "Group [" + item.code + "]";
                break;
            default:
                $iclass = "group-icon s";
                $text = $areatext + "Special Group [" + item.code + "]";
                break;
        }
        $popup = "<div style='font-size:120%'>" + this.displayGPXName(route) + "</div>";
        $popup += '<b>Distance</b> - ' + ra.map.getGPXDistance(route.distance) + '<br/>';
        $popup += this.formatAltitude(route);
        $lat = item.latitude;
        $long = item.longitude;
        this.cluster.addMarker($popup, $lat, $long, ra.map.icon.markerRoute());
    };
    }
    ;

    return raOrganisationMap;

})();

