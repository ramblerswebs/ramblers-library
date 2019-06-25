/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var L, ramblersMap, ramblersCsvList, jplist;

function RamblersCsvList() {
    this.list = null;
    this.isES6 = isES6();
}

function displayCsvData() {
    setTagHtml('ra-pagination1', addPagination());
    displayCSVTable();
    testForMap();
    if (ramblersCsvList.list.displayMap) {
        ra_format("Map");
        ramblersMap.map.invalidateSize();
        addCSVMarkers();
    }
    if (ramblersCsvList.isES6) {
        jplist.init({
            storage: 'cookies', //'localStorage', 'sessionStorage' or 'cookies'
            storageName: 'my-page-storage' //the same storage name can be used to share storage between multiple pages
        });
    }
}
function testForMap() {
    ramblersCsvList.list.longitude = -1;
    ramblersCsvList.list.latitude = -1;
    for (var index = 0; index < ramblersCsvList.list.items.length; ++index) {

        var item = ramblersCsvList.list.items[index];
        if (item.longitude) {
            ramblersCsvList.list.longitude = index;
        }
        if (item.latitude) {
            ramblersCsvList.list.latitude = index;
        }
    }
    if (ramblersCsvList.list.longitude > -1 && ramblersCsvList.list.latitude > -1) {
        ramblersCsvList.list.displayMap = true;
    }
}
function displayCSVTable() {
    var out, index;
    var tag;
    tag = document.getElementById("dataTab");
    if (tag !== null) {
        out = displayCSVHeader(ramblersCsvList.list.items);
        out += '<tbody data-jplist-group=\"group1\">';
        for (index = 0; index < ramblersCsvList.list.rows; ++index) {
            out += displayCSVRow(ramblersCsvList.list.items, index);
        }

        out += '</tbody></table>';
        tag.innerHTML = out;
    }
}
function displayCSVHeader(items) {
    var out = "";
    var item, filter = "";
    out = '<table id="csvdetails"><thead><tr>';
    for (index = 0; index < items.length; ++index) {
        var sort1 = '';
        var sort2 = '';
        item = items[index];
        if (item.table) {
            if (item.sort) {
                sort1 = jplistSortButton("group1", item.name, item.type, "asc", "▲");
                sort2 = jplistSortButton("group1", item.name, item.type, "desc", "▼");
            }
            out += "<th>" + item.name + " " + sort1 + " " + sort2 + "</th>";
            if (item.filter) {
                filter += jplistFilter('group1', item.name);
            } else {
                filter += "";
            }

        }
    }
    filter += "";
    out += "</tr></thead>";
    return  filter + out;
}
function displayCSVRow(items, no) {
    var out = "";
    var item;
    out += '<tr data-jplist-item>';
    for (index = 0; index < items.length; ++index) {
        item = items[index];
        var td = "<td class='" + item.name + "'>";
        if (item.table) {
            switch (item.type) {
                case "link":
                    if (item.values[no] === "") {
                        out += td + " </td>";
                    } else {
                        out += td + " <a href='" + item.values[no] + "' target='_blank'>Link</a></td>";
                    }
                    break;
                case "number":
                    out += td + item.values[no] + "</td>";
                    break;
                default:
                    out += td + item.values[no] + "</td>";
            }
        }
    }
    out += '</tr>';
    return out;
}

function addCSVMarkers() {
    for (var index = 0; index < ramblersCsvList.list.items.length; ++index) {
        if (index === 0) {
            var item = ramblersCsvList.list.items[index];
            for (var index2 = 0; index2 < item.values.length; ++index2) {
                addCSVMarker(index2);
            }
        }
    }
}
function addCSVMarker(no) {
    var $popup, $lat, $long;
    $popup = "<div style='font-size:120%'>";
    var items = ramblersCsvList.list.items
    for (var index = 0; index < items.length; ++index) {
        if (items[index].popup) {
            if (items[index].values[no] != "") {
                if (items[index].type == "link") {
$popup += '<b>' + items[index].name + '</b> - <a href="' + items[index].values[no] + '" target="_blank">Link</a><br/>';
                } else {
                    $popup += '<b>' + items[index].name + '</b> - ' + items[index].values[no] + '<br/>';
                }
            }
        }
    }
    $popup += "</div>";

    $lat = items[ramblersCsvList.list.latitude].values[no];
    $long = items[ramblersCsvList.list.longitude].values[no];

    addMarker($popup, $lat, $long, ramblersMap.markerRoute);
}
function ra_format(option) {
    document.getElementById("Map").classList.remove('active');
    document.getElementById("List").classList.remove('active');

    document.getElementById(option).classList.add('active');
    switch (option) {
        case 'List':
            document.getElementById("csvmap").style.display = "none";
            document.getElementById("csvlist").style.display = "inline";
            break;
        case 'Map':
            document.getElementById("csvlist").style.display = "none";
            document.getElementById("csvmap").style.display = "inline";
            document.getElementById("Map").style.display = "inline-block";
            ramblersMap.map.invalidateSize();
            break;
    }
}
function addPagination() {
    if (!ramblersCsvList.isES6) {
        return "<h3 class='oldBrowser'>You are using an old Web Browser!</h3><p class='oldBrowser'>We suggest you upgrade to a more modern Web browser, Chrome, Firefox, Safari,...</p>";
    }

    //  var $div = '<div class="ra-route-filter"><span><button>Sort By:</button> ';
    var $div = '<div class="clear"></div>\
            <div data-jplist-control=\"pagination\" \
            data-group=\"group1\" \
            data-items-per-page=\"10\" \
            data-current-page=\"0\" \
            data-name=\"pagination1\"> \
            <span data-type=\"info\"> \
            {startItem} - {endItem} of {itemsNumber} \
            </span> ';
    var $display = "";
    if (!ramblersCsvList.list.paginateList) {
        $display = ' style=\"display:none;\" ';
    }
    $div += '  <span' + $display + '> \
            <button type=\"button\" data-type=\"first\">First</button> \
            <button type=\"button\" data-type=\"prev\">Previous</button> \
            <span class=\"jplist-holder\" data-type=\"pages\"> \
                <button type=\"button\" data-type=\"page\">{pageNumber}</button> \
            </span> \
            <button type=\"button\" data-type=\"next\">Next</button> \
            <button type=\"button\" data-type=\"last\">Last</button> \
            </span> \
            <!-- items per page select --> \
    <select data-type=\"items-per-page\"' + $display + '> \
        <option value=\"10\"> 10 per page </option> \
        <option value=\"20\"> 20 per page </option> \
        <option value=\"30\"> 30 per page </option> \
        <option value=\"0\"> view all </option> \
    </select> ';
    $div += '</div> ';
    return $div;
}
function DELETEaddJPlistSortItem(col, title, type, order, selected) {
    var sel = '';
    if (selected) {
        sel = ' data-selected="true"';
    }
    var out = '<a class="dropdown-item"href="#" data-path=."' + col +
            '" data-order="' + order + '" data-type="' + type + '"' + sel + ' >' + title + '</a> ';
    return out;
}
function jplistFilter(group, name) {
    var out = '<input \
     data-jplist-control="textbox-filter"  data-group="' + group + '" \
     data-name="my-filter-' + name + '" \
     data-path=".' + name + '" type="text" \
     value="" placeholder="Filter by ' + name + '" />';
    return out;
}
function jplistSortButton(group, name, type, order, text) {
    var out = '<button class="csvlistsortbutton' + order + '" \
        data-jplist-control="sort-buttons" \
        data-path=".' + name + '" \
        data-group="' + group + '" \
        data-order="' + order + '" \
        data-type="' + type + '" \
        data-name="sortbutton" \
        data-selected="false" \
        data-mode="radio">' + text + '</button>';
    return out;
}