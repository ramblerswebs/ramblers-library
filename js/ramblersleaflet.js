function addWalk($list, $class, $date, $title, $dist, $gr, $lat, $long, $url, $icon)
{
    var marker = L.marker([$lat, $long], {icon: $icon});
    var $walk = "<div class='" + $class + "'><b><a href='" + $url + "' target='_blank'>" + $date + "<br/>" + $title + "<br/>" + $dist + "</a></b></div>";
    // var $map = "<a href='http://streetmap.co.uk/loc/" + $lat + "," + $long + "' target='_blank'>[OS Map]</a>";
    var $map = "<a href=\"javascript:streetmap('" + $gr + "')\" >[OS Map]</a>";
    var $directions = "<a href=\"javascript:directions(" + $lat + "," + $long + ")\" >[Directions]</a>";
    //  var $directions = "<a href='https://maps.google.com?saddr=Current+Location&daddr=" + $lat + "," + $long + "' target='_blank'>[Directions]</a>";
    var $photos = "<a href=\"javascript:photos('" + $gr + "')\" >[Photos]</a>";
    var $popup = $walk + $map + $directions + $photos;
    marker.bindPopup($popup);
    $list.push(marker);

}

function photos($gr) {
    page = "http://www.geograph.org.uk/gridref/" + $gr;
    window2 = open(page, "_blank", "scrollbars=yes,width=990,height=480,menubar=yes,resizable=yes,status=yes");
}
function streetmap($gr) {
    page = "http://www.streetmap.co.uk/grid/" + $gr + "&z=115";
    window2 = open(page, "_blank", "scrollbars=yes,width=900,height=580,menubar=yes,resizable=yes,status=yes");
}
function directions($lat, $long) {
    //  var $directions = "<a href='https://maps.google.com?saddr=Current+Location&daddr=" + $lat + "," + $long + "' target='_blank'>[Directions]</a>";

    page = "https://maps.google.com?saddr=Current+Location&daddr=" + $lat.toString() + "," + $long.toString();
    window2 = open(page, "_blank", "scrollbars=yes,width=900,height=580,menubar=yes,resizable=yes,status=yes");
}
