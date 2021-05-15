var ra;

function saveAreaCode(e) {
    var areatag = document.getElementById("js-areas");
    var area = areatag.value;
    var msg = document.getElementById("js-areamsg");
    msg.textContent = 'Page will reload shortly and display the walks for this area';
    var days = 120;
    var name = 'AreaCode';
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else
        var expires = "";
    document.cookie = name + "=" + area + expires + "; path=/;samesite=Strict";
    location.reload();
}
function selectAreaCode() {
    var $url;
    $url = "https://groups.theramblers.org.uk/";
    var dum = "";
    var areaLayer = L.featureGroup([]);
    areaLayer.addTo(ramblersMap.map);
    ra.ajax.postUrl($url, "", dum, function (dum, json) {
        var groups = JSON.parse(json);
        groups.forEach(function (item, index) {
            if (item.scope === "A") {
                var $iclass = "area-icon ";
                var pt = new L.latLng(item.latitude, item.longitude);
                var title = '<a href="javascript:void(0)" onclick="dispAreaWalks(\'' + item.groupCode + '\')">' + item.name + '</a>';
                var icon = L.divIcon({className: $iclass, iconSize: null, html: title});
                var marker = L.marker(pt, {icon: icon});
                areaLayer.addLayer(marker);
            }
        });
    });
}
function dispAreaWalks(area) {
    var msg = document.getElementById("js-areamsg");
    msg.textContent = 'Page will reload shortly and display the walks for this area';
    var days = 120;
    var name = 'AreaCode';
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else {
        var expires = "";
    }
    document.cookie = name + "=" + area + expires + "; path=/;samesite=Strict";
    location.reload();
}
