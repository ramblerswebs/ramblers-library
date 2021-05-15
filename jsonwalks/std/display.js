/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ra, jplist, addFilterFormats;

if (typeof (ra) === "undefined") {
    ra = {};
}

var raDisplay = (function () {

    var raDisplay = function () {
        // var display = {};
        this._allwalks = null;
        this.map = null;

        this.elements = null;
        this.settings = {
            walkClass: "walk",
            displayClass: "",
            displayDefault: "Details",
            displayStartTime: true,
            displayStartDescription: true,
            tableFormat: [{"title": "Date", "items": ["{dowddmm}"]}, {"title": "Meet", "items": ["{meet}", "{,meetGR}", "{,meetPC}"]}, {"title": "Start", "items": ["{start}", "{,startGR}", "{,startPC}"]}, {"title": "Title", "items": ["{mediathumbr}", "{title}"]}, {"title": "Difficulty", "items": ["{difficulty+}"]}, {"title": "Contact", "items": ["{contact}"]}],
            listFormat: ["{dowdd}", "{,meet}", "{,start}", "{,title}", "{,distance}", "{,contactname}", "{,telephone}"],
            detailsFormat: ["{gradeimg}", "{dowddmm}", "{,title}", "{,distance}", "{,contactname}"],
            mapFormat: ["{gradeimgRight}", "{dowddmm}", "{lf}", "{title}", "{lf}", "{distance}", "{,grade}", "{lf}", "{startOSMap}", "{startDirections}"],
            //  defaultOptions: "<table><tr><td class='ra-tab active' id='Details' onclick=\"javascript:ra_format('Details')\">Grades</td><td class='ra-tab' id='Table' onclick=\"javascript:ra_format('Table')\">Table</td><td class='ra-tab' id='List' onclick=\"javascript:ra_format('List')\">List</td><td class='ra-tab' id='Map' onclick=\"javascript:ra_format('Map')\">Map</td></tr></table>",
            withMonth: ["{dowShortddmm}", "{dowddmm}", "{dowddmmyyyy}"],
            jplistName: "group1",
            filterTag: "js-walksFilterPos2",
            filter: {},
            options: null
        };
        this.options = {filterPosition: 3,
            defaultView: "Details",
            detailsView: true,
            tableView: true,
            listView: true,
            mapView: true,
            contactsView: false,
            diagnostics: false,
            listFormat: null,
            tableFormat: null,
            detailsFormat: null};
        this.optionTag = {};
        this.load = function (mapOptions, data) {

            this.mapOptions = mapOptions;

            var tags = [
                {name: 'outer', parent: 'root', tag: 'div', attrs: {id: 'raouter'}},
                {parent: 'outer', tag: 'div', attrs: {id: 'js-filterDiagnostics'}},
                {parent: 'outer', tag: 'div', attrs: {id: 'js-walksFilterPos2'}},
                {name: 'raoptions', parent: 'outer', tag: 'div', attrs: {id: 'raoptions'}},
                {name: 'inner', parent: 'outer', tag: 'div', attrs: {id: 'rainner'}},
                {parent: 'inner', tag: 'div', attrs: {id: 'js-walksFilterPos3'}},
                {name: 'pagTop', parent: 'inner', tag: 'div', attrs: {id: 'rapagination-1'}},
                {parent: 'inner', tag: 'div', attrs: {id: 'rawalks'}, textContent: 'Processing data - this should be replaced shortly.'},
                {name: 'pagBottom', parent: 'inner', tag: 'div', attrs: {id: 'rapagination-2'}},
                {name: 'map', parent: 'inner', tag: 'div', attrs: {id: 'ra-map'}}
            ];

            this.masterdiv = document.getElementById(mapOptions.divId);

            this.elements = ra.html.generateTags(this.masterdiv, tags);
            if (!mapOptions.paginationTop) {
                this.elements.pagTop.style.diaplay = 'none';
            }
            if (!mapOptions.paginationBottom) {
                this.elements.pagBottom.style.diaplay = 'none';
            }
            var $legend1 = '<strong>Zoom</strong> in to see where our walks are going to be. <strong>Click</strong> on a walk to see details.';
            var $legend2 = '<img src="libraries/ramblers/images/marker-start.png" alt="Walk start" height="26" width="16">&nbsp; Start locations&nbsp; <img src="libraries/ramblers/images/marker-cancelled.png" alt="Cancelled walk" height="26" width="16"> Cancelled walk&nbsp; <img src="libraries/ramblers/images/marker-area.png" alt="Walking area" height="26" width="16"> Walk in that area.';
            if (data.legendposition === 'top') {
                var leg = document.createElement('p');
                leg.innerHTML = $legend1;
                this.elements.map.appendChild(leg);
                leg = document.createElement('p');
                leg.innerHTML = $legend2;
                this.elements.map.appendChild(leg);
            }
            this.lmap = new leafletMap(this.elements.map, mapOptions);
            this.map = this.lmap.map;
            this.cluster = new cluster(this.map);
            if (data.customListFormat !== null) {
                this.settings.listFormat = data.customListFormat;
            }
            if (data.customTableFormat !== null) {
                this.settings.tableFormat = data.customTableFormat;
            }
            if (data.customDetailsFormat !== null) {
                this.settings.detailsFormat = data.customDetailsFormat;
            }
            this.settings.displayClass = data.displayClass;
            if (typeof addFilterFormats === 'function') {
                this.options = JSON.parse(addFilterFormats());
            }
            this.processOptions(this.options, this.elements.raoptions);
            this.getOptions();
            this._allwalks = ra.walk.convertPHPWalks(data.walks);
            ra.walk.registerWalks(this._allwalks);
            var $walks = this.getAllWalks();
//            if (document.getElementById("leafletmap") !== null) {
//                raLoadLeaflet();
//            }
            this.setFilters($walks);
            this.displayWalks($walks);
            // to support Area walks display
            document.cookie = "AreaCode=;expires=Thu, 01 Jan 1970; path=/;samesite=Strict";
        };

        this.getOptions = function () {
            this.settings.filter.RA_Display_Format = this.settings.displayDefault;
            var $tag = document.getElementById("raDisplayOptions");
            if ($tag) {
                var $text = $tag.innerHTML;
                this.settings.options = $text;
                document.getElementById("raDisplayOptions").innerHTML = "";
                // this.elements.raoptions.innerHTML = this.settings.options;
                //document.getElementById(display.settings.filter.RA_Display_Format).style.backgroundColor = '#AAAAAA';
                document.getElementById(this.settings.filter.RA_Display_Format).classList.add('active');
            } else {
                //    alert("we are here");

                //   this.elements.raoptions.innerHTML = this.settings.defaultOptions;
            }
        };

        this.getAllWalks = function () {
            var $walks = this._allwalks;
            var index, len, $walk;
            for (index = 0, len = $walks.length; index < len; ++index) {
                $walk = $walks[index];
                $walk.display = true;
            }
            return $walks;
        };
        this.getWalks = function () {
            var $walks = this._allwalks;
            var index, len, $walk;
            for (index = 0, len = $walks.length; index < len; ++index) {
                $walk = $walks[index];
                $walk.display = this.displayWalk($walk);
            }
            return $walks;
        };

        this.displayWalks = function ($walks) {
            var no = 0;
            var index, len, $walk;

            for (index = 0, len = $walks.length; index < len; ++index) {
                $walk = $walks[index];
                if ($walk.display) {
                    no += 1;
                }
            }

            switch (this.settings.filter.RA_Display_Format) {
                case "Details":
                case "List":
                case "Table":
                    this.displayMap("hidden");
                    if ($walks.length === 0) {
                        ra.html.setTag("rawalks", '<h3>Sorry there are no walks at the moment.</h3>');
                        return;
                    }
                    ra.html.setTag("rapagination-1", this.addPagination(no));
                    ra.html.setTag("rapagination-2", this.addPagination(no));
                    ra.html.setTag("rawalks", this.displayWalksText($walks));
                    // jplist.init();
                    if (!this.settings.noPagination) {
                        if (ra.isES6() && no !== 0) {
                            jplist.init({
                                storage: 'sessionStorage', //'localStorage', 'sessionStorage' or 'cookies'
                                storageName: 'ra-jplist' //the same storage name can be used to share storage between multiple pages
                            });
                        }
                    }

                    break;
                case "Map":
                    ra.html.setTag("rapagination-1", "");
                    ra.html.setTag("rapagination-2", "");
                    ra.html.setTag("rawalks", "");
                    this.displayMap("visible");
                    this.displayWalksMap($walks);
//                    if (ramblersMap.markerList.length !== 0) {
//                        var bounds = getBounds(ramblersMap.markerList);
//                        ramblersMap.map.fitBounds(bounds);
//                    }
                    break;
                case "Contacts":
                    this.displayMap("hidden");
                    ra.html.setTag("rapagination-1", addPagination(no));
                    ra.html.setTag("rapagination-2", addPagination(no));
                    ra.html.setTag("rawalks", displayContacts($walks));
                    if (!this.settings.noPagination) {
                        if (ra.isES6()) {
                            jplist.init({
                                storage: 'sessionStorage', //'localStorage', 'sessionStorage' or 'cookies'
                                storageName: 'ra-jplist' //the same storage name can be used to share storage between multiple pages
                            });
                        }
                    }
                    break;
            }
        };
        this.displayMap = function (which) {
            var tag = this.elements.map;
            ;
            if (tag) {
//  tag.style.visibility = which;
                if (which === "hidden") {
                    tag.style.display = "none";
                    setPaginationMargin("on");
                } else {
                    tag.style.display = "block";
                    setPaginationMargin("off");
                    this.map.invalidateSize();
                }
            }
        };
        setPaginationMargin = function (which) {
            var tag1 = document.getElementById("rapagination-1");
            var tag2 = document.getElementById("rapagination-2");
            if (tag1 && tag2) {
                if (which === "on") {
                    tag1.style.paddingBottom = "5px";
                    tag2.style.paddingTop = "5px";
                } else {
                    tag1.style.paddingBottom = "0px";
                    tag2.style.paddingTop = "0px";
                }
            }
        };

        this.displayWalksText = function ($walks) {
            var index, len, $walk;
            var $out = "";
            var header = "";
            var footer = "";
            var odd = true;
            var month = "";
            var $class = "";
            var no = 0;
            var should = this.shouldDisplayMonth();

            for (index = 0, len = $walks.length; index < len; ++index) {
                $walk = $walks[index];
                if ($walk.display) {
                    no += 1;
                    if (odd) {
                        $class = "odd";
                    } else {
                        $class = "even";
                    }
                    var displayMonth = month !== $walk.month && should;
                    switch (this.settings.filter.RA_Display_Format) {
                        case "Details":
                            $out += this.displayWalk_Details($walk, $class, displayMonth);
                            break;
                        case "List":
                            $out += this.displayWalk_List($walk, $class, displayMonth);
                            break;
                        case "Table":
                            $out += this.displayWalk_Table($walk, $class, displayMonth);
                            break;
                    }
                    month = $walk.month;
                    odd = !odd;
                }
            }

            if (no === 0) {
                $out = "<h3>Sorry, but no walks meet your filter search</h3>";
                ra.html.setTag("rapagination-1", "");
                ra.html.setTag("rapagination-2", "");
                header = "";
                footer = "";
            } else {
                header = this.displayWalksHeader($walks);
                footer = this.displayWalksFooter();
            }
            return  header + $out + footer;
        };
        this.shouldDisplayMonth = function () {
            var index, len, $item;
            switch (this.settings.filter.RA_Display_Format) {
                case "Details":
                    var $items = this.settings.detailsFormat;
                    for (var index = 0, len = $items.length; index < len; ++index) {
                        $item = $items[index];
                        if (this.settings.withMonth.includes($item)) {
                            return false;
                        }
                    }
                    break;
                case "List":
                    var $items = this.settings.listFormat;
                    for (index = 0, len = $items.length; index < len; ++index) {
                        $item = $items[index];
                        if (this.settings.withMonth.includes($item)) {
                            return false;
                        }
                    }
                    break;
                case "Table":
                    var cindex, clen;
                    var $cols = this.settings.tableFormat;
                    for (cindex = 0, clen = $cols.length; cindex < clen; ++cindex) {
                        $items = $cols[cindex].items;
                        for (index = 0, len = $items.length; index < len; ++index) {
                            $item = $items[index];
                            if (this.settings.withMonth.includes($item)) {
                                return false;
                            }
                        }
                    }
                    break;
            }
            return true;
        };

        this.displayWalksHeader = function ($walks) {
            var $out = "";
            switch (this.settings.filter.RA_Display_Format) {
                case "Details":
                    if (this.settings.displayDetailsPrompt) {
                        $out += "<p class='noprint'>Click on item to display full details of walk</p>";
                    }
                    $out += "<div data-jplist-group=\"" + this.settings.jplistName + "\">";
                    break;
                case "List":
                    if (this.settings.displayDetailsPrompt) {
                        $out += "<p class='noprint'>Click on item to display full details of walk</p>";
                    }
                    $out += "<div data-jplist-group=\"" + this.settings.jplistName + "\">";
                    break;
                case "Table":
                    if (this.settings.displayDetailsPrompt) {
                        $out += "<p class='noprint'>Click on item to display full details of walk</p>";
                    }
                    $out += "<table class='" + this.settings.displayClass + "'>\n";
                    var should = this.shouldDisplayMonth();
                    if (!should) {
                        $out += this.displayTableHeader();
                    }
                    $out += "<tbody data-jplist-group=\"" + this.settings.jplistName + "\">";
                    break;
            }
            return $out;
        };
        this.displayTableHeader = function () {
            var $cols = this.settings.tableFormat;
            var $out = "<tr>";
            var index, len, $heading;
            for (index = 0, len = $cols.length; index < len; ++index) {
                $heading = $cols[index].title;
                $out += "<th>" + $heading + "</th>";
            }
            return $out + "</tr>";
        };
        this.displayWalksFooter = function () {
            var $out = "";
            switch (this.settings.filter.RA_Display_Format) {
                case "Details":
                    $out += "</div>";
                    $out += "<div style='height:20px;'>  </div>";
                    break;
                case "List":
                    $out += "</div>";
                    $out += "<div style='height:20px;'>  </div>";
                    break;
                case "Table":
                    $out += "</tbody></table>\n";
                    break;
            }
            return $out;
        };
        this.resetDisplay = function (tag) {
            var htmltag = document.getElementById(tag);
            if (htmltag) {
                htmltag.parentElement.style.display = "list-item";
            }
        };

//        this.ra_format = function (option) {
//            document.getElementById(this.settings.filter.RA_Display_Format).classList.remove('active');
//            this.settings.filter.RA_Display_Format = option;
//            document.getElementById(this.settings.filter.RA_Display_Format).classList.add('active');
//            var $walks = this.getWalks();
//            this.displayWalks($walks);
//        };

        this.displayWalk = function ($walk) {
            var $display = true;
            switch ($walk.dayofweek) {
                case "Monday":
                    $display = this.settings.filter.RA_DayOfWeek_0;
                    this.resetDisplay("RA_DayOfWeek_0");
                    break;
                case "Tuesday":
                    $display = this.settings.filter.RA_DayOfWeek_1;
                    this.resetDisplay("RA_DayOfWeek_1");
                    break;
                case "Wednesday":
                    $display = this.settings.filter.RA_DayOfWeek_2;
                    this.resetDisplay("RA_DayOfWeek_2");
                    break;
                case "Thursday":
                    $display = this.settings.filter.RA_DayOfWeek_3;
                    this.resetDisplay("RA_DayOfWeek_3");
                    break;
                case "Friday":
                    $display = this.settings.filter.RA_DayOfWeek_4;
                    this.resetDisplay("RA_DayOfWeek_4");
                    break;
                case "Saturday":
                    $display = this.settings.filter.RA_DayOfWeek_5;
                    this.resetDisplay("RA_DayOfWeek_5");
                    break;
                case "Sunday":
                    $display = this.settings.filter.RA_DayOfWeek_6;
                    this.resetDisplay("RA_DayOfWeek_6");
                    break;
                default:
                    break;
            }
            if (!$display) {
                return false;
            }
            switch ($walk.nationalGrade) {
                case "Easy Access":
                    $display = this.settings.filter.RA_Diff_ea;
                    this.resetDisplay("RA_Diff_ea");
                    break;
                case "Easy":
                    $display = this.settings.filter.RA_Diff_e;
                    this.resetDisplay("RA_Diff_e");
                    break;
                case "Leisurely":
                    $display = this.settings.filter.RA_Diff_l;
                    this.resetDisplay("RA_Diff_l");
                    break;
                case "Moderate":
                    $display = this.settings.filter.RA_Diff_m;
                    this.resetDisplay("RA_Diff_m");
                    break;
                case "Strenuous":
                    $display = this.settings.filter.RA_Diff_s;
                    this.resetDisplay("RA_Diff_s");
                    break;
                case "Technical":
                    $display = this.settings.filter.RA_Diff_t;
                    this.resetDisplay("RA_Diff_t");
                    break;
                default:
                    break;
            }
            if (!$display) {
                return false;
            }
            var dist = Math.ceil($walk.distanceMiles);
            switch (dist) {
                case 0:
                case 1:
                case 2:
                case 3:
                    $display = this.settings.filter.RA_Dist_0;
                    this.resetDisplay("RA_Dist_0");
                    break;
                case 4:
                case 5:
                    $display = this.settings.filter.RA_Dist_1;
                    this.resetDisplay("RA_Dist_1");
                    break;
                case 6:
                case 7:
                case 8:
                    $display = this.settings.filter.RA_Dist_2;
                    this.resetDisplay("RA_Dist_2");
                    break;
                case 9:
                case 10:
                    $display = this.settings.filter.RA_Dist_3;
                    this.resetDisplay("RA_Dist_3");
                    break;
                case 11:
                case 12:
                case 13:
                    $display = this.settings.filter.RA_Dist_4;
                    this.resetDisplay("RA_Dist_4");
                    break;
                case 14:
                case 15:
                    $display = this.settings.filter.RA_Dist_5;
                    this.resetDisplay("RA_Dist_5");
                    break;
                default:
                    $display = this.settings.filter.RA_Dist_6;
                    this.resetDisplay("RA_Dist_6");
                    break;
            }
            if (!$display) {
                return false;
            }
            $display = this.settings.filter[$walk.groupCode];
            if (!$display) {
                return false;
            }
            var d1 = $walk.walkDate.substring(0, 10);
            var d = this.settings.filter["RA_DateStart"];
            if (d !== "") {
                $display = d1 >= d;
            }
            if (!$display) {
                return false;
            }
            var d = this.settings.filter["RA_DateEnd"];
            if (d !== "") {
                $display = d1 <= d;
            }
            if (!$display) {
                return false;
            }

            return $display;
        };
        this.displayWalk_Details = function ($walk, $class, $displayMonth) {
            var $text, $image;
            var $out = "", $out1 = "";

            if ($displayMonth) {
                $out1 += "<div data-jplist-item >";
                $out1 += "<h3>" + $walk.month + ra.walk.addYear($walk) + "</h3>";
                $out1 += "<div class='" + $class + " walk" + $walk.status + "' >";
            } else {
                $out1 += "<div data-jplist-item class='" + $class + " walk" + $walk.status + "' >";
            }
            $image = '<span class="walkdetail" >';
            $out += ra.walk.getWalkValues($walk, this.settings.detailsFormat);

//   $out += "<span class='ra-detailsimg'></span>";
            // $out += getCloseImg();
            $text = $out1 + $image + ra.walk.newTooltip($walk, $out) + "\n</span></div>\n";
            if ($displayMonth) {
                $text += "</div>\n";
            }
            return $text;
        };

        this.displayWalk_List = function ($walk, $class, $displayMonth) {
            var $items = this.settings.listFormat;
            var $out = "";
            if ($displayMonth) {
                $out += "<div data-jplist-item >";
                $out += "<h3>" + $walk.month + ra.walk.addYear($walk) + "</h3>";
                $out += "</div>\n";
                $out += "<div data-jplist-item class='" + $class + " walk" + $walk.status + "' >";
            } else {
                $out += "<div data-jplist-item class='" + $class + " walk" + $walk.status + "' >";
            }
            // $out +=  ra.walk.addWalkLink($walk.id, ra.walk.getWalkValues($walk, $items), "");
            $out += ra.walk.getWalkValues($walk, $items);
            return $out + "</div>\n";
        };
        this.displayWalk_Table = function ($walk, $class, $displayMonth) {
            var $cols = this.settings.tableFormat;
            //  var $out = "<tr data-jplist-item class='" + $class + " walk" + $walk.status + "' >"
            var $out = "";
            var $customClass = "";
            if ($displayMonth) {
                $out += "<tr data-jplist-item ><td>";
                $out += "<h3>" + $walk.month + ra.walk.addYear($walk) + "</h3>";
                $out += "</td></tr>";
            }
            if (typeof displayTableRowClass === 'function') {
                $customClass = displayTableRowClass($walk);
                $out += "<tr data-jplist-item class='" + $customClass + " walk" + $walk.status + "' >";
            } else {
                $out += "<tr data-jplist-item class='" + $class + " walk" + $walk.status + "' >";
            }
            var index, len, $items;
            for (index = 0, len = $cols.length; index < len; ++index) {
                $out += "<td>";
                $items = $cols[index].items;
                $out += ra.walk.getWalkValues($walk, $items);
                //  $out += ra.walk.addWalkLink($walk.id, ra.walk.getWalkValues($walk, $items), "");
                $out += "</td>";
            }


            $out += "</tr>";
            return $out;
        };

        this.displayContacts = function ($walks) {
            var $contacts = [];
            var index, len, $walk, out;
            for (index = 0, len = $walks.length; index < len; ++index) {
                $walk = $walks[index];
                if ($walk.display) {
                    var $contact = {name: $walk.contactName, telephone1: $walk.telephone1, telephone2: $walk.telephone2};
                    if (!ra.contains($contacts, $contact)) {
                        $contacts.push($contact);
                    }
                }
            }
            $contacts.sort(function (a, b) {
                return a.name.toLowerCase() > b.name.toLowerCase();
            });
            var dispTel1, dispTel2;
            if (ra.isES6()) {
                // typeof x === "undefined";
                dispTel1 = typeof $contacts.find(checkContactTelephone1) !== "undefined";
                dispTel2 = typeof $contacts.find(checkContactTelephone2) !== "undefined";
            } else {
                dispTel1 = true;
                dispTel2 = false;
            }
            out = "<table class='" + this.settings.displayClass + " contacts'>\n";
            out += "<tr><th>Name";
            if (dispTel1) {
                out += "</th><th>Telephone1";
            }
            if (dispTel2) {
                out += "</th><th>Telephone2";
            }
            out += "</th></tr><tbody data-jplist-group=\"" + this.settings.jplistName + "\">";
            for (index = 0, len = $contacts.length; index < len; ++index) {
                $contact = $contacts[index];
                out += "<tr data-jplist-item><td>" + $contact.name;
                if (dispTel1) {
                    out += "</td><td>" + $contact.telephone1;
                }
                if (dispTel2) {
                    out += "</td><td>" + $contact.telephone2;
                }
                out += "</td></tr>";
            }
            out += "</tbody></table>";
            return out;
        };

        checkContactTelephone1 = function (contact) {
            return contact.telephone1 !== "";
        };
        checkContactTelephone2 = function (contact) {
            return contact.telephone2 !== "";
        };

        this.displayWalksMap = function ($walks) {
            this.cluster.removeClusterMarkers();
            var index, len, $walk;
            if ($walks.length === 0) {
                return;
            }
            for (index = 0, len = $walks.length; index < len; ++index) {
                $walk = $walks[index];
                if ($walk.display) {
                    this.addWalkMarker($walk);
                }
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
//        this.getWalkMapHref = function ($walk, $desc) {
//            var $out = "<a href=";
//            $out += "'javascript:ra.walk.displayWalkID(event," + $walk.id + ");' >";
//            $out += $desc + "</a>";
//            return $out;
//        };

        this.addPagination = function (no) {
            if (!ra.isES6()) {
                return "<h3 class='oldBrowser'>You are using an old Web Browser!</h3><p class='oldBrowser'>We suggest you upgrade to a more modern Web browser, Chrome, Firefox, Safari,...</p>";
            }
            var $class = "";
            if (no < 11) {
                $class = " hidden";
            }

            var $div = "<div data-jplist-control=\"pagination\" \
            data-group=\"" + this.settings.jplistName + "\" \
            data-items-per-page=\"" + this.settings.itemsPerPage + "\" \
            data-current-page=\"0\" \
            data-id=\"no-items\" \
            data-name=\"pagination1\"> \
            <span data-type=\"info\"> \
             <a class='link-button small button-p4485' onclick=\"javascript:ra.html.ra.html.printTag('rawalks')\">Print</a> \
            {startItem} - {endItem} of {itemsNumber} \
            </span> ";
            $div += "<span class='center" + $class + "'> \
            <button type=\"button\" data-type=\"first\">First</button> \
            <button type=\"button\" data-type=\"prev\">Previous</button> \
            <span class=\"jplist-holder\" data-type=\"pages\"> \
            <button type=\"button\" data-type=\"page\">{pageNumber}</button> \
            </span> <button type=\"button\" data-type=\"next\">Next</button> \
            <button type=\"button\" data-type=\"last\">Last</button> \
            </span> \
            <!-- items per page select --> \
    <select data-type=\"items-per-page\" class=\"" + $class + "\"> \
        <option value=\"10\"> 10 per page </option> \
        <option value=\"20\"> 20 per page </option> \
        <option value=\"30\"> 30 per page </option> \
        <option value=\"0\"> view all </option> \
    </select> ";
            $div += " </div>";
            return $div;
        };

        this.addFilter = function (tag, title, items, singleOpen, all = true, dates = false) {
            if (!all) {
                if (Object.keys(items).length === 1) {
                    return;
                }
            }
            var div = document.createElement('div');
            div.setAttribute('class', 'ra-filteritem');
            tag.appendChild(div);
            if (!singleOpen) {
                addOpenClose(div, title);
            } else {
                var h3 = document.createElement('h3');
                h3.textContent = title;
                div.appendChild(h3);
            }

            var intDiv = document.createElement('div');
            intDiv.setAttribute('class', 'ra_filter');
            if (!singleOpen) {
                intDiv.style.display = "none";
            }
            div.appendChild(intDiv);
            if (!dates) {
                var ul = document.createElement('ul');
                this.addAllNone(intDiv, '[All]', ul);
                this.addAllNone(intDiv, '[None]', ul);
                intDiv.appendChild(ul);
                var _this = this;
                Object.keys(items).forEach(function (key) {
                    var item = items[key];
                    if (item.no > 0) {
                        _this.addFilterItem(ul, item);
                    }
                });
            } else {
                var span = document.createElement('div');
                intDiv.appendChild(span);
                var start = items.min;
                var end = items.max;
                this.addFilterItemDate(span, start.name, start.id, start.no, start.no, end.no);
                this.addFilterItemDate(span, end.name, end.id, end.no, start.no, end.no);
        }
        };
        this.addOpenClose = function (div, title) {
            var h3 = document.createElement('h3');
            h3.setAttribute('class', 'ra_openclose');
            h3.textContent = title;
            div.appendChild(h3);
            var span = document.createElement('span');
            span.setAttribute('class', 'ra-closed');
            h3.appendChild(span);
            h3.onclick = function (event) {
                var tag = event.target;
                if (tag.tagName === "SPAN") {
                    var tag = tag.parentNode;
                }
                var next = tag.nextSibling;
                if (next.style.display !== "none") {
                    next.style.display = "none";
                    span.classList.add('ra-closed');
                    span.classList.remove('ra-open');
                } else {
                    next.style.display = "block";
                    span.classList.add('ra-open');
                    span.classList.remove('ra-closed');
                }
            };

        };
        this.addAllNone = function (tag, option, ul) {
            var span = document.createElement('span');
            span.setAttribute('class', 'link');
            span.textContent = option;
            if (option === "[All]") {
                span.style.marginLeft = '25px';
            }
            tag.appendChild(span);
            var ul_list = ul;
            var _this = this;
            span.addEventListener('click', function (event) {
                var all = event.target.innerHTML === "[All]";
                if (ul_list.tagName === "UL") {
                    var children = ul_list.children;
                    Object.keys(children).forEach(function (key) {
                        var node = children[key].childNodes[0];
                        node.checked = all;
                        _this.settings.filter[node.id] = all;
                    });
                }
                var $walks = _this.getWalks();
                _this.displayWalks($walks);
            });

        };
        this.addFilterItem = function (tag,item ) {
            var li = document.createElement('li');
            tag.appendChild(li);
            var input = document.createElement('input');
            input.setAttribute('id', item.id);
            input.setAttribute('type', 'checkbox');
            input.checked = true;
            li.appendChild(input);
            var _this = this;
            input.addEventListener("change", function (event) {
                _this.settings.filter[event.target.id] = event.target.checked;
                var $walks = _this.getWalks();
                _this.displayWalks($walks);
            });

            var label = document.createElement('label');
            label.textContent = item.name+" ["+item.no+"]";
            li.appendChild(label);
        };
        this.addFilterItemDate = function (tag, name, id, value, min, max) {
            var li = document.createElement('div');
            tag.appendChild(li);
            var label = document.createElement('label');
            label.style.marginLeft = '25px';
            label.textContent = name;
            li.appendChild(label);
            var input = document.createElement('input');
            input.setAttribute('id', id);
            input.setAttribute('type', 'date');
            input.setAttribute('value', value);
            input.setAttribute('min', min);
            input.setAttribute('max', max);
            input.style.marginLeft = '25px';
            input.checked = true;
            li.appendChild(input);
            var _this = this;
            input.addEventListener("input", function (event) {
                var input = event.target;
                var value = input.value;
                if (value === '') {
                    if (input.id === 'RA_DateStart') {
                        value = input.min;
                        input.value = min;
                    } else {
                        value = input.max;
                        input.value = max;
                    }
                }
                _this.settings.filter[event.target.id] = value;
                var $walks = _this.getWalks();
                _this.displayWalks($walks);
            });
        };
        this.getWalksStats = function (walks) {
            var result = {groups: {},
                dates: {min: {no: 0, name: 'Start Date', id: 'RA_DateStart'}, max: {no: 0, name: 'End Date', id: 'RA_DateEnd'}},
                dow: {Monday: {no: 0, name: 'Monday', id: 'RA_DayOfWeek_0'},
                    Tuesday: {no: 0, name: 'Tuesday', id: 'RA_DayOfWeek_1'},
                    Wednesday: {no: 0, name: 'Wednesday', id: 'RA_DayOfWeek_2'},
                    Thursday: {no: 0, name: 'Thursday', id: 'RA_DayOfWeek_3'},
                    Friday: {no: 0, name: 'Friday', id: 'RA_DayOfWeek_4'},
                    Saturday: {no: 0, name: 'Saturday', id: 'RA_DayOfWeek_5'},
                    Sunday: {no: 0, name: 'Sunday', id: 'RA_DayOfWeek_6'}},
                distances: {upto3: {no: 0, name: 'Up to 3 miles (5 km)', id: 'RA_Dist_0'},
                    upto5: {no: 0, name: '3+ to 5 miles (5-8 km)', id: 'RA_Dist_1'},
                    upto8: {no: 0, name: '5+ to 8 miles (8-13 km)', id: 'RA_Dist_2'},
                    upto10: {no: 0, name: '8+ to 10 miles (13-16 km)', id: 'RA_Dist_3'},
                    upto13: {no: 0, name: '10+ to 13 miles (16-21 km)', id: 'RA_Dist_4'},
                    upto15: {no: 0, name: '13+ to 15 miles (21-24 km)', id: 'RA_Dist_5'},
                    over15: {no: 0, name: '15+ miles (24 km)', id: 'RA_Dist_6'}},
                grades: {Easy_Access: {no: 0, name: 'Easy Access', id: 'RA_Diff_ea'},
                    Easy: {no: 0, name: 'Easy', id: 'RA_Diff_e'},
                    Leisurely: {no: 0, name: 'Leisurely', id: 'RA_Diff_l'},
                    Moderate: {no: 0, name: 'Moderate', id: 'RA_Diff_m'},
                    Strenuous: {no: 0, name: 'Strenuous', id: 'RA_Diff_s'},
                    Technical: {no: 0, name: 'Technical', id: 'RA_Diff_t'}}};
            var i, len;
            var walk;
            len = walks.length;
            if (len > 0) {
                result.dates.min.no = ra.date.YYYYMMDD(walks[0].walkDate);
                result.dates.max.no = ra.date.YYYYMMDD(walks[walks.length - 1].walkDate);
            }
            for (i = 0, len = walks.length; i < len; ++i) {
                walk = walks[i];
                if (result.groups.hasOwnProperty(walk.groupCode)) {
                    result.groups[walk.groupCode].no += 1;
                } else {
                    result.groups[walk.groupCode] = {name: walk.groupName, no: 1, id: walk.groupCode};
                }
                result.dow[walk.dayofweek].no += 1;
                result.grades[walk.nationalGrade.replace(" ", "_")].no += 1;
                var dist = walk.distanceMiles;
                switch (true) {
                    case (dist <= 3):
                        result.distances.upto3.no += 1;
                        break;
                    case (dist <= 5):
                        result.distances.upto5.no += 1;
                        break;
                    case (dist <= 8):
                        result.distances.upto8.no += 1;
                        break;
                    case (dist <= 10):
                        result.distances.upto10.no += 1;
                        break;
                    case (dist <= 13):
                        result.distances.upto13.no += 1;
                        break;
                    case (dist <= 15):
                        result.distances.upto15.no += 1;
                        break;
                    default:
                        result.distances.over15.no += 1;
                }
            }
            return result;
        };
        this.setFilters = function (walks) {
            if (walks.length === 0) {
                return;
            }
            var result = this.getWalksStats(walks);
            this.setFilterGroup(result.groups);
            var _this = this;
            Object.keys(result.dates).forEach(function (key) {
                var item = result.dates[key];
                _this.settings.filter[item.id] = item.no;
            });
            this.setFilterGroup(result.dow);
            this.setFilterGroup(result.distances);
            this.setFilterGroup(result.grades);

            var tag = document.getElementById(this.settings.filterTag);
            var pos = tag;
            if (tag !== null) {
                tag.innerHTML = '';
                var singleOpen = this.settings.filterTag !== "js-walksFilterPos1";
                if (singleOpen) {
                    this.addOpenClose(tag, "Filter");
                    var div = document.createElement('div');
                    div.setAttribute('class', 'filter-columns');
                    div.style.display = "none";
                    tag.appendChild(div);
                    pos = div;
                }
                this.addFilter(pos, 'Groups', result.groups, singleOpen, false);
                this.addFilter(pos, 'Dates', result.dates, singleOpen, true, true);
                this.addFilter(pos, 'Day of the Week', result.dow, singleOpen);
                this.addFilter(pos, 'Distance', result.distances, singleOpen);
                this.addFilter(pos, 'Grade', result.grades, singleOpen);
            }

        };
        this.setFilterGroup = function (items) {
            var _this = this;
            Object.keys(items).forEach(function (key) {
                var item = items[key];
                _this.settings.filter[item.id] = item.no !== 0;
            });
        };

        this.processOptions = function (options, optionsDiv) {

            var $diag = "<h3>Walks filter diagnostics</h3>";
            switch (options.filterPosition) {
                case "In module":
                case "1":
                    this.settings.filterTag = 'js-walksFilterPos1';
                    $diag += "Position - In Module<br/>";
                    break;
                case "In Article, above tabs":
                case "2":
                    this.settings.filterTag = 'js-walksFilterPos2';
                    $diag += "Position - In Article, above tabs<br/>";
                    break;
                default:
                    $diag += "Position - In Article, below tabs<br/>";
            }
            var table = document.createElement('table');
            optionsDiv.appendChild(table);
            var row = document.createElement('tr');
            table.appendChild(row);
            //  this.settings.defaultOptions = "<table><tr>";
            switch (options.defaultView) {
                case "List":
                    this.settings.displayDefault = 'List';
                    this.addDisplayOption("List", true, row);
                    options.listView = false;
                    break;
                case "Table":
                    this.settings.displayDefault = 'Table';
                    this.addDisplayOption("Table", true, row);
                    options.tableView = false;
                    break;
                case "Map":
                    this.settings.displayDefault = 'Map';
                    this.addDisplayOption("Map", true, row);
                    options.mapView = false;
                    break;
                default:
                    this.settings.displayDefault = 'Details';
                    this.addDisplayOption("Details", true, row);
                    options.detailsView = false;
            }
            if (options.detailsView) {
                this.addDisplayOption("Details", false, row);
            }
            if (options.tableView) {
                this.addDisplayOption("Table", false, row);
            }
            if (options.listView) {
                this.addDisplayOption("List", false, row);
            }
            if (options.mapView) {
                this.addDisplayOption("Map", false, row);
            }
            if (options.contactsView) {
                this.addDisplayOption("Contacts", false, row);
            }

            this.settings.defaultOptions += "</tr></table>";
            if (options.listFormat !== null) {
                $diag += "List Format Specified<br/>";
                var items = this.parseFields(options.listFormat);
                this.settings.listFormat = items;
                $diag += "Items " + items.length + "<ul>";
                items.forEach(function (item, index, items) {
                    $diag += "<li>" + item + "</li>";
                });
                $diag += "</ul>";
            }
            if (options.detailsFormat !== null) {
                var items = this.parseFields(options.detailsFormat);
                this.settings.detailsFormat = items;
                $diag += "Details Format Specified<br/>";
                $diag += "Items " + items.length + "<ul>";
                items.forEach(function (item, index, items) {
                    $diag += "<li>" + item + "</li>";
                });
                $diag += "</ul>";
            }
            if (options.tableFormat !== null) {
                $diag += "<br/>Table Format Specified<br/>";
                var cols = options.tableFormat;
                var format = [];
                cols.forEach(function (col, index, cols) {
                    var fields = {};
                    fields.title = col.title;
                    fields.items = this.parseFields(col.items);
                    format.push(fields);
                });
                this.settings.tableFormat = format;
                $diag += "Columns " + cols.length + "<ol>";
                format.forEach(function (col, index, format) {
                    $diag += "<li>" + col.title + "</li><ul>";
                    items = col.items;
                    items.forEach(function (item, index, items) {
                        $diag += "<li>" + item + "</li>";
                    });
                    $diag += "</ul>";
                });
                $diag += "</ol>";
            }
            if (options.diagnostics) {
                var tag = document.getElementById('js-filterDiagnostics');
                tag.innerHTML = $diag;
            }

        };
        this.addDisplayOption = function (name, active, row) {
            var col = document.createElement('td');
            row.appendChild(col);
            col.setAttribute('class', 'ra-tab');
            col.setAttribute('data-display-option', name);
            col.textContent = name;
            this.optionTag[name] = col;
            if (active) {
                col.classList.add('active');
                //    return "<td class='ra-tab active' id='" + name + "' onclick=\"javascript:ra_format('" + name + "')\">" + name + "</td>";
            } else {
                //    return "<td class='ra-tab ' id='" + name + "' onclick=\"javascript:ra_format('" + name + "')\">" + name + "</td>";
            }
            var _this = this;
            col.addEventListener("click", function () {
                var option = this.getAttribute('data-display-option');
                var oldOption = _this.settings.filter.RA_Display_Format;
                _this.optionTag[oldOption].classList.remove('active');
                //    document.getElementById(_this.settings.filter.RA_Display_Format).classList.remove('active');
                _this.settings.filter.RA_Display_Format = option;
                _this.optionTag[option].classList.add('active');
                //    document.getElementById(_this.settings.filter.RA_Display_Format).classList.add('active');
                var $walks = _this.getWalks();
                _this.displayWalks($walks);
            });
        };
        this.parseFields = function ($value) {
            var $items = [];
            var $item = "";
            var $array = $value.split("");
            var $inBracket = false;
            $array.forEach(function ($char, index, array) {
                switch ($char) {
                    case "{":
                        if ($item !== "") {
                            $items.push($item);
                        }
                        $item += $char;
                        $inBracket = true;
                        break;
                    case "}":
                        if ($inBracket) {
                            $item += $char;
                            $items.push($item);
                            $item = "";
                        } else {
                            $item += $char;
                        }
                        break;
                    default:
                        $item += $char;
                }
            });
        };
    };

    return raDisplay;

})();