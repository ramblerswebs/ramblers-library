/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ra;
var raOrganisationMap = (function () {

    var raOrganisationMap = function (options) {
        var masterdiv = document.getElementById(options.divId);
        this.lmap = new leafletMap(masterdiv, options);
        this.cluster = new cluster(this.lmap.map);
        this.load = function (data) {
            this.addMarkers(data.areas);
            //    this.addMarkers(data.groups);
            this.cluster.addClusterMarkers();
            this.cluster.zoomAll();
        };
        this.addMarkers = function (areas) {
            var area, group;
            for (const name in areas) {
                area = areas[name];
                this.addMarker(area);
                for (const groupname in area.groups) {
                    group = area.groups[groupname];
                    this.addMarker(group, area);
                }
            }
        };
        this.addMarker = function (item, area) {
            var $popup, $lat, $long, $iclass, $areatext = "", $icon,$website;
            var $url, $lat, $long, $desc, $title, $code;


            $title = item.name.replace("'", "&apos;");


            $long = item.longitude;
            $lat = item.latitude;
            $url = item.url;
            $website = item.website;
            //  $desc = "<br/>"+htmlentities(item.description);
            $desc = "<br/>" + item.description;
            $desc = $desc.replace("\n", '<br />');
            $desc = $desc.replace("\r", '');
            $code = " [" + item.code + "]";
            switch (item.scope) {
                case "A":
                    $iclass = "group-icon a";
                    break;
                case "G":
                    $iclass = "group-icon g";
                    $areatext = "Part of " + area.name + " area";
                    break;
                default:
                    $iclass = "group-icon s";
                    $areatext = "Part of " + area.name + " area";
                    break;
            }
            var $class = "group" + item.scope;
            $popup = "<div class='" + $class + "'><h4><a href='" + $url + "' target='_blank'>" + $title + "</a>" + $code + "</h4>" + $areatext + $desc + "</div>";
     if ($website){
         $popup += "<a href='" + $website + "' target='_blank'>" + $website + "</a>";
     }
         $icon = L.divIcon({className: $iclass, iconSize: null, html: $title});

            this.cluster.addMarker($popup, $lat, $long, {icon: $icon, riseOnHover: true, title: $title});

        };
    }
    ;

    return raOrganisationMap;

})();

