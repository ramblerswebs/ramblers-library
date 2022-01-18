/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ra, jplist, FullCalendar, addFilterFormats, displayGradesRowClass, displayTableRowClass, displayListRowClass;

if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.display) === "undefined") {
    ra.display = {};
}
ra.display.walksTabs = function (mapOptions, data) {
    this._allwalks = null;
    this.map = null;
    this.elements = null;
    this.settings = {
        walkClass: "walk",
        displayClass: "",
        displayStartTime: true,
        displayStartDescription: true,
        displayDetailsPrompt: true,
        tabOrder: ["Grades", "Table", "List", "Calendar", "Map"],
        tableFormat: [{"title": "Date", "items": ["{dowddmm}"]}, {"title": "Meet", "items": ["{meet}", "{,meetGR}", "{,meetPC}"]}, {"title": "Start", "items": ["{start}", "{,startGR}", "{,startPC}"]}, {"title": "Title", "items": ["{mediathumbr}", "{title}"]}, {"title": "Difficulty", "items": ["{difficulty+}"]}, {"title": "Contact", "items": ["{contact}"]}],
        listFormat: ["{dowdd}", "{,meet}", "{,start}", "{,title}", "{,distance}", "{,contactname}", "{,telephone}"],
        gradesFormat: ["{gradeimg}", "{dowddmm}", "{,title}", "{,distance}", "{,contactname}"],
        calendarFormat: ["{gradeimgMiddle}", "{title}", "{,distance}", ",", " ", "{meetTime}", "{< or >startTime}"],
        withMonth: ["{dowShortddmm}", "{dowddmm}", "{dowddmmyyyy}"],
        jplistGroup: ra.uniqueID(),
        jplistName: "name1",
        itemsPerPage: 20,
        currentView: "Grades",
        gradesView: true,
        tableView: true,
        listView: true,
        mapView: true,
        contactsView: false,
        diagnostics: false,
        filter: {updated: 0},
        options: null
    };
    this.myjplist = new ra.jplist(this.settings.jplistGroup);
    this.optionTag = {};
    this.mapOptions = mapOptions;
    this.settings.jplistName = 'jpl' + mapOptions.divId;
    if (data.customTabOrder !== null) {
        this.settings.tabOrder = data.customTabOrder;
    }
    if (data.customGradesFormat !== null) {
        this.settings.gradesFormat = data.customGradesFormat;
    }
    if (data.customListFormat !== null) {
        this.settings.listFormat = data.customListFormat;
    }
    if (data.customTableFormat !== null) {
        this.settings.tableFormat = data.customTableFormat;
    }
    if (data.customCalendarFormat !== null) {
        this.settings.CalendarFormat = data.customCalendarFormat;
    }
    this.legendposition = data.legendposition;
    this.settings.displayClass = data.displayClass;
    this._allwalks = ra.walk.convertPHPWalks(data.walks);
    ra.walk.registerWalks(this._allwalks);
    this.load = function () {

        var tags = [
            {name: 'outer', parent: 'root', tag: 'div'},
            {name: 'filterDiagnostics', parent: 'outer', tag: 'div'},
            {name: 'walksFilter', parent: 'outer', tag: 'div', attrs: {class: 'walksFilter'}},
            {name: 'raoptions', parent: 'outer', tag: 'div'},
            {name: 'inner', parent: 'outer', tag: 'div', attrs: {id: 'rainner'}},
            {name: 'rapagination1', parent: 'inner', tag: 'div'},
            {name: 'rawalks', parent: 'inner', tag: 'div', textContent: 'Processing data - this should be replaced shortly.'},
            {name: 'rapagination2', parent: 'inner', tag: 'div'},
            {name: 'map', parent: 'inner', tag: 'div'}
        ];

        this.masterdiv = document.getElementById(this.mapOptions.divId);

        this.elements = ra.html.generateTags(this.masterdiv, tags);
        if (!this.mapOptions.paginationTop) {
            this.elements.rapagination1.style.diaplay = 'none';
        }
        if (!this.mapOptions.paginationBottom) {
            this.elements.rapagination2.style.diaplay = 'none';
        }
        var b = ra.baseDirectory();
        var sImg = b + "libraries/ramblers/images/marker-start.png";
        var cImg = b + "libraries/ramblers/images/marker-cancelled.png";
        var aImg = b + "libraries/ramblers/images/marker-area.png";
        var $legend1 = '<strong>Zoom</strong> in to see where our walks are going to be. <strong>Click</strong> on a walk to see details.';
        var $legend2 = '<img src="' + sImg + '" alt="Walk start" height="26" width="26">&nbsp; Start locations&nbsp; <img src="' + cImg + '" alt="Cancelled walk" height="26" width="26"> Cancelled walk&nbsp; <img src="' + aImg + '" alt="Walking area" height="26" width="26"> Walk in that area.';
        if (this.legendposition === 'top') {
            var leg = document.createElement('p');
            leg.innerHTML = $legend1;
            this.elements.map.appendChild(leg);
            leg = document.createElement('p');
            leg.innerHTML = $legend2;
            this.elements.map.appendChild(leg);
        }
        this.lmap = new leafletMap(this.elements.map, this.mapOptions);
        this.map = this.lmap.map;
        this.cluster = new cluster(this.map);

        if (typeof addFilterFormats === 'function') {
            this.processWalksFilter();
        }
        this.processOptions(this.elements.raoptions);
        var $walks = this.getAllWalks();
        this.checkColumnNotBlank($walks, this.settings.tableFormat);
        this.setFilters($walks);
        this.displayWalks($walks);
        var _this = this;
        document.addEventListener("reDisplayWalks", function () {
            var $walks = _this.getWalks();
            _this.displayWalks($walks);
        });
        // to support Area walks display
        //  document.cookie = "AreaCode=;expires=Thu, 01 Jan 1970; path=/;samesite=Strict";
    };
    this.processWalksFilter = function () {

        var wfOptions = JSON.parse(addFilterFormats());
        if (wfOptions.defaultView === "Details") {
            wfOptions.defaultView = "Grades";
        }
        this.settings.tabOrder = [wfOptions.defaultView];
        switch (wfOptions.defaultView) {
            case "Grades":
                wfOptions.detailsView = false;
                break;
            case "Table":
                wfOptions.tableView = false;
                break;
            case "List":
                wfOptions.listView = false;
                break;
            case "Map":
                wfOptions.mapView = false;
                break;
            case "Contacts":
                wfOptions.contactsView = false;
                break;
        }

        if (wfOptions.detailsView) {
            this.settings.tabOrder.push("Grades");
        }
        if (wfOptions.tableView) {
            this.settings.tabOrder.push("Table");
        }
        if (wfOptions.listView) {
            this.settings.tabOrder.push("List");
        }
        if (wfOptions.mapView) {
            this.settings.tabOrder.push("Map");
        }
        if (wfOptions.contactsView) {
            this.settings.tabOrder.push("Contacts");
        }


        var $diag = "<h3>Walks filter diagnostics</h3>";
        if (wfOptions.listFormat !== null) {
            $diag += "List Format Specified<br/>";
            var items = this.parseFields(wfOptions.listFormat);
            this.settings.listFormat = items;
            $diag += "Items " + items.length + "<ul>";
            items.forEach(function (item, index, items) {
                $diag += "<li>" + item + "</li>";
            });
            $diag += "</ul>";
        }
        if (wfOptions.detailsFormat !== null) {
            var items = this.parseFields(wfOptions.detailsFormat);
            this.settings.gradesFormat = items;
            $diag += "Grades Format Specified<br/>";
            $diag += "Items " + items.length + "<ul>";
            items.forEach(function (item, index, items) {
                $diag += "<li>" + item + "</li>";
            });
            $diag += "</ul>";
        }
        if (wfOptions.tableFormat !== null) {
            $diag += "<br/>Table Format Specified<br/>";
            var cols = wfOptions.tableFormat;
            var format = [];
            var self = this;
            cols.forEach(function (col, index, cols) {
                var fields = {};
                fields.title = col.title;
                fields.items = self.parseFields(col.items);
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
        if (wfOptions.diagnostics) {
            var tag = this.elements.filterDiagnostics;
            tag.innerHTML = $diag;
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

        switch (this.settings.currentView) {
            case "Grades":
            case "List":
            case "Table":
                this.displayMap("hidden");
                if ($walks.length === 0) {
                    ra.html.setTag(this.elements.rawalks, '<h3>Sorry there are no walks at the moment.</h3>');
                    return;
                }
                this.addPagination(no, this.elements.rapagination1);
                this.addPagination(no, this.elements.rapagination2);
                ra.html.setTag(this.elements.rawalks, this.displayWalksText($walks));

                if (!this.settings.noPagination) {
                    this.myjplist.init('ra-display');
                }

                break;
            case "Calendar":
                this.displayMap("hidden");
                ra.html.setTag(this.elements.rapagination1, "");
                ra.html.setTag(this.elements.rapagination2, "");
             //   this.addToDiaryButton(this.elements.rapagination2);
                ra.html.setTag(this.elements.rawalks, "");
                this.displayWalksCalendar($walks);
                break;
            case "Map":
                ra.html.setTag(this.elements.rapagination1, "");
                ra.html.setTag(this.elements.rapagination2, "");
                ra.html.setTag(this.elements.rawalks, "");
                this.displayMap("visible");
                this.displayWalksMap($walks);
                break;
            case "Contacts":
                this.displayMap("hidden");
                this.addPagination(no, this.elements.rapagination1);
                this.addPagination(no, this.elements.rapagination2);
                ra.html.setTag(this.elements.rawalks, this.displayContacts($walks));
                if (!this.settings.noPagination) {
                    this.myjplist.init('ra-display');
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
                this.setPaginationMargin("on");
            } else {
                tag.style.display = "block";
                this.setPaginationMargin("off");
                this.map.invalidateSize();
            }
        }
    };
    this.setPaginationMargin = function (which) {
        var tag1 = this.elements.rapagination1;
        var tag2 = this.elements.rapagination2;
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
                switch (this.settings.currentView) {
                    case "Grades":
                        $out += this.displayWalk_Grades($walk, $class, displayMonth);
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
            ra.html.setTag(this.elements.rapagination1, "");
            ra.html.setTag(this.elements.rapagination2, "");
            header = "";
            footer = "";
        } else {
            header = this.displayWalksHeader();
            footer = this.displayWalksFooter();
        }
        return  header + $out + footer;
    };
    this.checkColumnNotBlank = function ($walks, tableformat) {
        var $walk, no, first;
        for (i = 0, no = $walks.length; i < no; ++i) {
            first = i === 0;
            $walk = $walks[i];
            // check if any columns are blank
            var index, len, $items, content;
            for (index = 0, len = tableformat.length; index < len; ++index) {
                $items = tableformat[index].items;
                if (first) {
                    tableformat[index].blank = true;
                }
                if (tableformat[index].blank) {
                    content = ra.walk.addTooltip($walk, ra.walk.getWalkValues($walk, $items));
                    if (content !== '') {
                        tableformat[index].blank = false;
                    }
                }
            }
        }
    };
    this.shouldDisplayMonth = function () {
        var index, len, $item;
        switch (this.settings.currentView) {
            case "Grades":
                var $items = this.settings.gradesFormat;
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

    this.displayWalksHeader = function () {
        var $out = "";
        switch (this.settings.currentView) {
            case "Grades":
                if (this.settings.displayDetailsPrompt) {
                    $out += "<p class='noprint'>Click on item to display full details of walk</p>";
                }
                $out += "<div data-jplist-group=\"" + this.settings.jplistGroup + "\">";
                break;
            case "List":
                if (this.settings.displayDetailsPrompt) {
                    $out += "<p class='noprint'>Click on item to display full details of walk</p>";
                }
                $out += "<div data-jplist-group=\"" + this.settings.jplistGroup + "\">";
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
                $out += "<tbody data-jplist-group=\"" + this.settings.jplistGroup + "\">";
                break;
        }
        return $out;
    };

    this.displayWalksFooter = function () {
        var $out = "";
        switch (this.settings.currentView) {
            case "Grades":
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
        if (this.settings.filter.updated > 0) {
            $display = $walk.updatedDays < this.settings.filter.updated;
        }
        if (!$display) {
            return false;
        }

        return $display;
    };
    this.displayWalk_Grades = function ($walk, $class, $displayMonth) {
        var $text, $image;
        var $out = "", $out1 = "";
        var $customClass = $class;
        if (typeof displayGradesRowClass === 'function') {
            $customClass = displayGradesRowClass($walk);
        }
        $out1 += "<div data-jplist-item >";
        if ($displayMonth) {
            $out1 += "<h3>" + $walk.month + ra.walk.addYear($walk) + "</h3>";
        }
        $out1 += "<div  class='" + $customClass + " walk" + $walk.status + "' >";
        $image = '<span class="walkdetail" >';
        $out += ra.walk.getWalkValues($walk, this.settings.gradesFormat);
        $text = $out1 + $image + ra.walk.addTooltip($walk, $out) + "\n</span></div>\n";
        $text += "</div>\n";
        return $text;
    };

    this.displayWalk_List = function ($walk, $class, $displayMonth) {
        var $items = this.settings.listFormat;
        var $out = "";
        var $customClass = $class;
        if (typeof displayListRowClass === 'function') {
            $customClass = displayListRowClass($walk);
        }
        $out += "<div data-jplist-item >";
        if ($displayMonth) {
            $out += "<h3>" + $walk.month + ra.walk.addYear($walk) + "</h3>";
        }
        $out += "<div class='" + $customClass + " walk" + $walk.status + "' >";
        $out += ra.walk.addTooltip($walk, ra.walk.getWalkValues($walk, $items));
        return  $out + "</div>\n";
    };
    this.displayTableHeader = function () {
        var $cols = this.settings.tableFormat;
        var $out = "<tr>";
        var index, len, $heading;
        for (index = 0, len = $cols.length; index < len; ++index) {
            if (!$cols[index].blank) {
                $heading = $cols[index].title;
                $out += "<th>" + $heading + "</th>";
            }

        }
        return $out + "</tr>";
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
            $items = $cols[index].items;
            if (!$cols[index].blank) {
                $out += "<td>";
                $out += ra.walk.addTooltip($walk, ra.walk.getWalkValues($walk, $items));
                $out += "</td>";
            }
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
        out += "</th></tr><tbody data-jplist-group=\"" + this.settings.jplistGroup + "\">";
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

    this.displayWalksCalendar = function ($walks) {
        var index, len, $walk, div;
        if ($walks.length === 0) {
            ra.html.setTag(this.elements.rawalks, '<h3>Sorry there are no walks at the moment.</h3>');
        }
        var events = [];
        var $items = this.settings.calendarFormat;
        for (index = 0, len = $walks.length; index < len; ++index) {
            $walk = $walks[index];
            if ($walk.display) {
                var event = {};

                event.id = $walk.id;
                event.start = $walk.walkDate;
                if ($walk.startLocation.exact) {
                    event.start = $walk.startLocation.time;
                }
                if ($walk.hasMeetPlace) {
                    event.start = $walk.meetLocation.time;
                }
                event.raContent = '<div><span class="ra wrap">' + ra.walk.getWalkValues($walk, $items, false) + '</span></div>';

                event.textColor = '#111111';
                if ($walk.status === 'Cancelled') {
                    event.textColor = 'red';
                    event.backgroundColor = 'white';
                } else {
                    event.backgroundColor = '#EFEFEF';
                    event.borderColor = '#AAAAAA';
                }

                event.classNames = ['pointer'];
                event.display = 'block';
                //    event.eventContent = {html: '<div class="fc-event-main-frame"><span class="ra wrap">' + ra.walk.getWalkValues($walk, $items, false) + '</span></div>'};
                event.eventContent = {html: '<div class="fc-event-main-frame"><span class="ra wrap">xgbdfhngdnhg</span></div>'};
                events.push(event);
            }
        }
        var calendarTab = this.elements.rawalks;

        var _this = this;
        var calendar = new FullCalendar.Calendar(calendarTab, {
            height: 'auto',
            selectable: true,
            displayEventTime: false,
            headerToolbar: {center: 'dayGridMonth,listMonth'}, // buttons for switching between views
            events: events,
            views: {
                dayGrid: {
                    eventTimeFormat: {
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: false
                    }
                },
                timeGrid: {
                    // options apply to timeGridWeek and timeGridDay views
                },
                week: {
                    // options apply to dayGridWeek and timeGridWeek views
                },
                day: {
                    // options apply to dayGridDay and timeGridDay views
                }
            },
            eventClick: function (info) {
                var id = info.event.id;
                ra.walk.displayWalkID(info, id);
            },
            eventContent: function (arg) {
                return {
                    html: arg.event.extendedProps.raContent
                };
            }

        });
        calendar.render();
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
                ra.walk.addWalkMarker(this.cluster, $walk, this.settings.walkClass);
            }
        }
        this.cluster.addClusterMarkers();
        this.cluster.zoomAll();
        return;
    };


    this.addPagination = function (no, tag) {
        var printTag = this.elements.rawalks;
        var printButton = this.myjplist.addPagination(no, tag, this.settings.jplistName, this.settings.itemsPerPage, true);
        if (printButton !== null) {
            printButton.addEventListener('click', function () {
                ra.html.printTag(printTag);
            });
        }
      //  this.addToDiaryButton(tag);
        return;
    };
    this.addToDiaryButton = function (tag) {
        var diary = document.createElement('button');
        diary.setAttribute('class', 'link-button tiny button mintcake right');
        diary.textContent = 'Add to diary';
        tag.appendChild(diary);
        var _this = this;
        diary.addEventListener('click', function () {
            _this.icsfile();
        });
    };

    this.getWalksStats = function (walks) {
        var result = {groups: {},
            dates: {min: {no: 0, name: 'Start', id: 'RA_DateStart'},
                max: {no: 0, name: 'End ', id: 'RA_DateEnd'}},
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
                Technical: {no: 0, name: 'Technical', id: 'RA_Diff_t'}},
            updates: {AllWalks: {no: 0, name: 'All walks', num: 0, id: 'update_0'},
                LessThan7Dats: {no: 0, name: 'In last week', num: 8, id: 'update_8'},
                LessThan14Days: {no: 0, name: 'In last 2 weeks', num: 14, id: 'update_14'},
                LessTheAMonth: {no: 0, name: 'In last month', num: 32, id: 'update_32'},
                LessThen3Months: {no: 0, name: 'In last 3 months', num: 93, id: 'update_93'}
            }
        };
        var i, len;
        var walk;
        var today = new Date();
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
            var diffDays = ra.date.periodInDays(today, walk.dateUpdated);
            walk.updatedDays = diffDays;
            result.updates['AllWalks'].no += 1;
            if (diffDays < 3 * 31) {
                result.updates['LessThen3Months'].no += 1;
            }
            if (diffDays < 32) {
                result.updates['LessTheAMonth'].no += 1;
            }
            if (diffDays < 15) {
                result.updates['LessThan14Days'].no += 1;
            }
            if (diffDays < 8) {
                result.updates['LessThan7Dats'].no += 1;
            }

        }
        return result;
    };
    this.setFilters = function (walks) {
        if (walks.length === 0) {
            return;
        }
        var result = this.getWalksStats(walks);
        var filter = new ra.filter(this.settings.filter)
        filter.setFilterGroup(result.groups);
        filter.setFilterGroup(result.updates);
        filter.setFilterGroup(result.dates, true);
        filter.setFilterGroup(result.dow);
        filter.setFilterGroup(result.distances);
        filter.setFilterGroup(result.grades);

        var tag = this.elements.walksFilter;

        if (tag !== null) {
            tag.innerHTML = '';
            filter.addOpenClose(tag, "Filter");
            var div = document.createElement('div');
            div.setAttribute('class', 'filter-columns');
            div.style.display = "none";
            tag.appendChild(div);

            filter.addFilter(div, 'Groups', result.groups, false);
            filter.addFilter(div, 'Dates', result.dates, true, true);
            filter.addFilterSelect(div, 'Updated', result.updates);
            filter.addFilter(div, 'Day of the Week', result.dow);
            filter.addFilter(div, 'Distance', result.distances);
            filter.addFilter(div, 'Grade', result.grades);

        }

    };

    this.processOptions = function (optionsDiv) {
        // var $diag = "<h3>Walks filter diagnostics</h3>";
        var table = document.createElement('table');
        table.setAttribute('class', 'ra-tab-options');
        optionsDiv.appendChild(table);
        var row = document.createElement('tr');
        table.appendChild(row);
        var first = true;
        var _this = this;
        this.settings.tabOrder.forEach(function (value, index, array) {
            switch (value) {
                case "List":
                case "Table":
                case "Calendar":
                case "Map":
                case "Grades":
                case "Contacts":
                    if (first) {
                        _this.settings.currentView = value;
                    }
                    _this.addDisplayOption(value, first, row);
                    first = false;
                    break;
                default:
                    alert("Invalid tab option " + value);
            }
        });
        this.settings.defaultOptions += "</tr></table>";
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
        }
        var _this = this;
        col.addEventListener("click", function () {
            var option = this.getAttribute('data-display-option');
            var oldOption = _this.settings.currentView;
            _this.optionTag[oldOption].classList.remove('active');
            _this.settings.currentView = option;
            _this.optionTag[option].classList.add('active');
            let e = new Event("reDisplayWalks", {bubbles: true});
            document.dispatchEvent(e);
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
        return $items;
    };
    this.icsfile = function () {
        var $walks = this.getWalks();

        var index, len, $walk;
        var events = new ra.ics.events();

        for (index = 0, len = $walks.length; index < len; ++index) {
            $walk = $walks[index];
            if ($walk.display) {
                this.addWalktoIcs($walk, events);
            }
        }
        events.download();
        var a = 1;

    };
//       this.getTextDescription =function () {
//        $textdescription = "";
//        switch ($this'->'type) {
//            case "Meeting":
//                $textdescription = "Meet: ";
//                break;
//            case "Start":
//                if ($this'->'exact) {
//                    $textdescription = "Start: ";
//                } else {
//                    $textdescription = "Walking area: ";
//                }
//                break;
//            case "End":
//                $textdescription = "Finish: ";
//                break;
//        }
//        if ($this->exact) {
//            if ($this->time != "") {
//                $textdescription .= $this->timeHHMMshort . " @ ";
//            }
//        }
//        // CHANGE REQUIRED , remove postcode and reduce GR to two figures if not exact
//        // CHANGE REQUIRED , remove postcode and reduce GR to two figures if not exact
//        // CHANGE REQUIRED , remove postcode and reduce GR to two figures if not exact
//        $place = $this->gridref;
//        if ($this->postcode <> null) {
//            $place .= ", " . $this->postcode;
//        }
//        if ($this->description != '') {
//            $textdescription .= $this->description . ' (' . $place . ')';
//        } else {
//            $textdescription .= $place;
//        }
//        return $textdescription;
//    };
    this.addWalktoIcs = function (walk, events) {
        var ev = new ra.ics.event();
        var $meetLocation, $startLocation, $before, $after, $summary, $description, $altDescription;
        if (walk.hasMeetPlace) {
            var meet = new ra.gwemLocation(walk.meetLocation);
            $meetLocation = meet.getTextDescription();
            $meetLocation += ";<br/>";
        } else {
            $meetLocation = "";
        }
        var start = new ra.gwemLocation(walk.startLocation);
        $startLocation = start.getTextDescription();
        $before = $meetLocation + $startLocation + "<br/>Description: ";
        $after = "<br/>Contact: " + walk.contactName;
        if (walk.telephone1 !== '') {
            $after += ", " + walk.telephone1;
        }
        if (walk.telephone2 !== '') {
            $after += ", " + walk.telephone2;
        }
        if (walk.localGrade !== "") {
            $after += "<br/>Grade: " + walk.localGrade + "/" + walk.nationalGrade;
        } else {
            $after += "<br/>Grade: " + walk.nationalGrade;
        }
        $after += "<br/>" + walk.detailsPageUrl;
        $after += "<br/>Note: Finish times are very approximate!";
        if (walk.additionalNotes !== '') {
            $after += "<br/>Notes: " + walk.additionalNotes;
        }
        $summary = walk.title;
        if (walk.distanceMiles > 0) {
            $summary += ", " + walk.distanceMiles + "mi/" + walk.distanceKm + "km";
        }


        //    $this->addIcsTimes($icsfile);



        if (walk.status === 'Cancelled') {
            ev.method("CANCEL");
            $summary = " CANCELLED " + $summary;
            $description = "CANCELLED - REASON: " + walk.cancellationReason + " (" + walk.description + ")";
        } else {

            $description = $before + walk.description + $after;
            $altDescription = $before + walk.descriptionHtml + $after;
        }

        var $time = this.getFirstTime(walk);
        var d = new Date(walk.walkDate);
        if ($time !== null) {
            $time.setDate(d.getDate());
            $time.setMonth(d.getMonth());
            $time.setFullYear(d.getFullYear());
            ev.startDate($time);
            $time = this.getFinishTime(walk);
            if ($time !== null) {
                //   $time.setDate(d.getDate());
                //   $time.setMonth(d.getMonth());
                //   $time.setFullYear(d.getFullYear());
                ev.endDate(new Date($time));
            }
        } else {
            ev.startDate(new Date(walk.walkDate));
        }

        ev.createdDate(new Date(walk.dateCreated));
        ev.modifiedDate(new Date(walk.dateUpdated));
        ev.uid('walk' + walk.id + '-isc@ramblers-webs.org.uk');
        ev.organiser(walk.groupName + ":mailto:ignore@ramblers-webs.org.uk");
        ev.summary($summary);
        ev.description($description);
        ev.altDescription($altDescription);
        ev.location($startLocation);
        ev.url(walk.detailsPageUrl);
        ev.categories("Walk," + walk.groupName);
        ev.class('PUBLIC');

        events.addEvent(ev);
    };
    this.getFirstTime = function (walk) {
        var time = null;
        if (walk.hasMeetPlace) {
            time = walk.meetLocation.time;
        }
        if (time !== null) {
            return time;
        }
        time = walk.startLocation.time;
        return time;
    };
    this.getLastTime = function (walk) {
        var time;
        time = walk.startLocation.time;
        if (time !== '') {
            if (walk.hasMeetPlace) {
                time = walk.meetLocation.time;
            }
        }
        return time;
    };
   
    this.getFinishTime = function (walk) {
        if (walk.finishTime !== null) {
            return walk.finishTime;
        }
        // calculate end time
        var $lasttime = this.getLastTime(walk);
        if ($lasttime !== '') {


            var $durationFullMins = Math.ceil(walk.distanceMiles / 2) * 60;
            if (walk.startLocation.exact === false) {
                $durationFullMins += 60;
            }
            $lasttime = ra.time.addMinutes($lasttime, $durationFullMins)
            //    var $intervalFormat = "PT" + $durationFullMins + "M";
            //   var $interval = new DateInterval($intervalFormat);
            //   $lasttime = $lasttime.add($interval);
        }
        return $lasttime;
    }
    ;
};
