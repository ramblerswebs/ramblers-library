/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ra;
if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.display) === "undefined") {
    ra.display = {};
}
ra.display.walksMap = function (mapOptions, data) {
    this.options = null;
    this.walkClass = "walk";
    var b = ra.baseDirectory();
    var sImg = b + "libraries/ramblers/images/marker-start.png";
    var cImg = b + "libraries/ramblers/images/marker-cancelled.png";
    var aImg = b + "libraries/ramblers/images/marker-area.png";
    this.legend = '<p><strong>Zoom</strong> in to see where our walks are going to be. <strong>Click</strong> on a walk to see details.</p>';
    this.legend += '<img src="' + sImg + '" alt="Walk start" height="26" width="26">&nbsp; Start locations&nbsp; <img src="' + cImg + '" alt="Cancelled walk" height="26" width="26"> Cancelled walk&nbsp; <img src="' + aImg + '" alt="Walking area" height="26" width="26"> Walk in that area.';
    this.options = mapOptions;
    this.data = data;

    this.load = function ( ) {
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

        this.lmap = new ra.leafletmap(this.elements.map, this.options);
        this.map = this.lmap.map;
        this.cluster = new cluster(this.map);
        this._allwalks = ra.walk.convertPHPWalks(this.data.walks);
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
            ra.walk.addWalkMarker(this.cluster, $walk, this.walkClass);
        }
        this.cluster.addClusterMarkers();
        this.cluster.zoomAll();
        return;
    };

};