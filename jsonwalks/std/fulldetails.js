/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ramblerswalksDetails, ramblerswalks, ramblersMap, jplist;
function RamblersWalksDetails() {
    this.walkClass = "walk";
    this.printOn = false;
    this.displayGroup = false;
    this.hasMeetPlace = true;
    this.displayGradesIcon = true;
    this.emailDisplayFormat = 2;
    this.displayClass = "pantone1815";
    this.options = "";
    this.modal = null;
    this.filter = {};

}
function FullDetailsLoad() {
    // executes when complete page is fully loaded, including all frames, objects and images
    getOptions();
    addContent();
    initFilters();
    var $walks = getAllWalks();
    setGroups($walks);
    setLimits();
    addFilterEvents();
    raLoadLeaflet();
    displayWalks($walks);
}
function getOptions() {
    var $tag = document.getElementById("raDisplayOptions");
    ramblerswalksDetails.filter.RA_Display_Format = "OptionFull";
    if ($tag) {
        var $text = $tag.innerHTML;
        ramblerswalksDetails.options = "<div id='RADisplayOptions'>" + $text + "</div>";
        document.getElementById("raDisplayOptions").innerHTML = "";
        document.getElementById("raoptions").innerHTML = ramblerswalksDetails.options;
        document.getElementById(ramblerswalksDetails.filter.RA_Display_Format).style.backgroundColor = '#AAAAAA';
    }

}
function setLimits() {
    var $walks = JSON.parse(ramblerswalks);
    var index, len, $walk;
    var minDate = "";
    var maxDate = "";
    ramblerswalksDetails.hasMeetPlace = false;
    for (index = 0, len = $walks.length; index < len; ++index) {
        $walk = $walks[index];
        if ($walk.hasMeetPlace) {
            ramblerswalksDetails.hasMeetPlace = true;
        }
    }
    minDate = $walks[0].walkDate.date.substr(0, 10);
    maxDate = $walks[len - 1].walkDate.date.substr(0, 10);
    var tag = document.getElementById('RA_DateStart');
    if (tag) {
        tag.min = minDate;
        tag.max = maxDate;
        tag.value = minDate;
    }
    tag = document.getElementById('RA_DateEnd');
    if (tag) {
        tag.min = minDate;
        tag.max = maxDate;
        tag.value = maxDate;
    }
    ramblerswalksDetails.filter["RA_DateStart"] = "";
    ramblerswalksDetails.filter["RA_DateEnd"] = "";
}
function getAllWalks() {
    var $walks = JSON.parse(ramblerswalks);
    var index, len, $walk;

    for (index = 0, len = $walks.length; index < len; ++index) {
        $walk = $walks[index];
        $walk.display = displayWalk($walk);
        $walk.display = true;
    }
    return $walks;
}
function getWalks() {
    var $walks = JSON.parse(ramblerswalks);
    var index, len, $walk;

    for (index = 0, len = $walks.length; index < len; ++index) {
        $walk = $walks[index];
        $walk.display = displayWalk($walk);
    }
    return $walks;
}
function getWalk(id) {
    var $walks = JSON.parse(ramblerswalks);
    var index, len, $walk;
    for (index = 0, len = $walks.length; index < len; ++index) {
        $walk = $walks[index];
        $walk.display = true;
        if (id === $walk.id) {
            return $walk;
        }
    }
    return null;
}

function displayWalks($walks) {
    switch (ramblerswalksDetails.filter.RA_Display_Format) {
        case "OptionFull":
        case "OptionList":
        case "OptionTable":
            displayMap("hidden");
            setTagHtml("rapagination-1", addPagination());
            setTagHtml("rawalks", displayWalksText($walks));
            // jplist.init();
            jplist.init({
                storage: 'sessionStorage', //'localStorage', 'sessionStorage' or 'cookies'
                storageName: 'ra-jplist' //the same storage name can be used to share storage between multiple pages
            });
            break;
        case "OptionMap":
            //    setTagHtml("raprint", "");
            setTagHtml("rapagination-1", "");
            setTagHtml("rapagination-2", "");
            setTagHtml("rawalks", "");
            displayMap("visible");
            displayWalksMap($walks);
            var bounds = getBounds(ramblersMap.markerList);
            ramblersMap.map.fitBounds(bounds);
            break;
    }
}
function displayMap(which) {
    var tag = document.getElementById("ra-map");
    if (tag) {
        tag.style.visibility = which;
        if (which === "hidden") {
            tag.style.height = "10px";
        } else {
            tag.style.height = "500px";
        }
    }
}
function setTagHtml(id, html) {
    var tag = document.getElementById(id);
    if (tag) {
        tag.innerHTML = html;
    }
}
function displayWalksText($walks) {
    var index, len, $walk;
    var $out = "";
    var header = "";
    var footer = "";
    var odd = true;
    var month = "";
    var no = 0;
    header = displayWalksHeader($walks);
    for (index = 0, len = $walks.length; index < len; ++index) {
        $walk = $walks[index];
        if ($walk.display) {
            no += 1;
            switch (ramblerswalksDetails.filter.RA_Display_Format) {
                case "OptionFull":
                    $out += displayWalk_Full($walk, odd);
                    break;
                case "OptionList":
                    if (month !== $walk.month) {
                        month = $walk.month
                        $out += "<h3 data-jplist-item>" + month + "</h3>";
                    }
                    $out += displayWalk_List($walk, odd);
                    break;
                case "OptionTable":
                    $out += displayWalkForProgrammeTable($walk, odd);
                    break;
            }
            odd = !odd;
        }
    }
    footer = displayWalksFooter();
    if (no === 0) {
        $out = "<h3>Sorry, but no walks meet your filter search</h3>";
    } else {
        switch (ramblerswalksDetails.filter.RA_Display_Format) {
            case "OptionFull":
            case "OptionList":
            case "OptionTable":
                setTagHtml("rapagination-2", addPagination());
                break;
            case "OptionMap":
                setTagHtml("rapagination-2", "");
                break;
        }
    }

    return  header + $out + footer;
}
function displayWalksHeader($walks) {
    var $out = "";
    switch (ramblerswalksDetails.filter.RA_Display_Format) {
        case "OptionFull":
            $out += "<div data-jplist-group=\"group1\">";
            break;
        case "OptionList":
            $out += "<div data-jplist-group=\"group1\">";
            break;
        case "OptionTable":
            $out += "<table class='" + ramblerswalksDetails.displayClass + "'>\n";
            if (ramblerswalksDetails.hasMeetPlace) {
                $out += addTableHeader(["Date", "Meet", "Start", "Title", "Difficulty", "Contact"]);
                $out += "<tbody data-jplist-group=\"group1\">";
            } else {
                $out += addTableHeader(["Date", "Start", "Title", "Difficulty", "Contact"]);
                $out += "<tbody data-jplist-group=\"group1\">";
            }
            break;
    }
    return $out;
}
function displayWalksFooter() {
    var $out = "";
    switch (ramblerswalksDetails.filter.RA_Display_Format) {
        case "OptionFull":
            $out += "</div>";
            break;
        case "OptionList":
            $out += "</div>";
            break;
        case "OptionTable":
            $out += "</tbody></table>\n";
            break;
    }
    return $out;
}
function displayModal($html) {
    setTagHtml("modal-data", $html);
    // Get the modal
    RamblersWalksDetails.modal = document.getElementById('raModal');
    RamblersWalksDetails.modal.style.display = "block";

// Get the <span> element that closes the modal
    var span = document.getElementById("btnClose");

// When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        RamblersWalksDetails.modal.style.display = "none";
        setTagHtml("modal-data", "");
    };
    document.getElementById("btnPrint").onclick = function () {
        printElem("modal-data");
    };
}
function dispGradesHelp() {

    var $url = "ramblers/pages/grades2.html";
//   var $html = "Hello";
    //   displayModal($html);
    var marker;
    ajax($url, "", marker, displayGradesModal);
}
function displayGradesModal(marker, $html) {
    displayModal($html);
}
function printElem(divId) {
    var content = document.getElementById(divId).innerHTML;
    var mywindow = window.open('', 'Print', 'height=600,width=800');
    mywindow.document.write('<html><head><title>Print</title>');
    var index, len;
    var sheets = document.styleSheets;

    for (index = 0, len = sheets.length; index < len; ++index) {
        var sheet = sheets[index];
        if (sheet.href !== null) {
            //         if (sheet.href.includes("/ramblers/") || sheet.href.includes("/mod_rafooter/")) {
            var link = '<link rel="stylesheet" href="' + sheet.href + '">';
            mywindow.document.write(link);
            //        }
        }
    }
    mywindow.document.write('</head><body ><div class="div.component-content">');
    mywindow.document.write(content);
    mywindow.document.write('</div></body></html>');

    mywindow.document.close();
    mywindow.focus();
    mywindow.print();
    mywindow.close();
    return true;
}

function walksPrint() {
    var $walks;
    $walks = getWalks();
    var $html = displayWalksText($walks);
    displayModal($html);
}
function displayWalkID(id) {
    var $walk = getWalk(id);
    var $html = displayWalkDetails($walk);
    displayModal($html);
}
function getGradeImage($walk) {
    var $image = "ramblers/images/grades/base.jpg";
    switch ($walk.nationalGrade) {
        case "Easy Access":
            $image = "ramblers/images/grades/grade-ea.jpg";
            break;
        case "Easy":
            $image = "ramblers/images/grades/grade-e.jpg";
            break;
        case "Leisurely":
            $image = "ramblers/images/grades/grade-l.jpg";
            break;
        case "Moderate":
            $image = "ramblers/images/grades/grade-m.jpg";
            break;
        case "Strenuous":
            $image = "ramblers/images/grades/grade-s.jpg";
            break;
        case "Technical":
            $image = "ramblers/images/grades/grade-t.jpg";
            break;
        default:
            break;
    }
    return $image;
}


function   initFilters() {
    setChecked("RA_DayOfWeek_0");
    setChecked("RA_DayOfWeek_1");
    setChecked("RA_DayOfWeek_2");
    setChecked("RA_DayOfWeek_3");
    setChecked("RA_DayOfWeek_4");
    setChecked("RA_DayOfWeek_5");
    setChecked("RA_DayOfWeek_6");
    setChecked("RA_Diff_ea");
    setChecked("RA_Diff_e");
    setChecked("RA_Diff_l");
    setChecked("RA_Diff_m");
    setChecked("RA_Diff_s");
    setChecked("RA_Diff_t");
    setChecked("RA_Dist_0");
    setChecked("RA_Dist_1");
    setChecked("RA_Dist_2");
    setChecked("RA_Dist_3");
    setChecked("RA_Dist_4");
    setChecked("RA_Dist_5");
    setChecked("RA_Dist_6");
}
function addFilterEvents() {
    var anchors = document.getElementsByTagName('h3');
    for (var i = 0; i < anchors.length; i++) {
        var anchor = anchors[i];
        if (anchor.className === "ra_openclose") {
            anchor.onclick = function (event) {
                var anchor = event.target;
                var tag = anchor.nextElementSibling;
                if (tag.style.display !== "none") {
                    tag.style.display = "none";
                } else {
                    tag.style.display = "block";
                }
            };
        }
    }
}
function setGroups($walks) {
    var index, len, $walk, i;
    var groups = {};

    for (index = 0, len = $walks.length; index < len; ++index) {
        $walk = $walks[index];
        groups[$walk.groupCode] = $walk.groupName;
    }
    var keysSorted = Object.keys(groups).sort(function (a, b) {
        return groups[a] > groups[b];
    });
    var htmltag = document.getElementById("ra_groups");
    if (htmltag) {
        var $out = "<h3 class='ra_openclose'>Groups</h3><ul class='ra_filter' style='display:none;'>";
        for (i = 0, len = keysSorted.length; i < len; i++) {
            var key = keysSorted[i];
            var group = groups[key];
            var $item = '<li><input id="' + key + '" type="checkbox" onchange="javascript:ra_filter(event)" checked/><label>' + group + '</label></li>';
            $out += $item;
            ramblerswalksDetails.filter[key] = true;
        }
        $out += "</ul>";
        htmltag.innerHTML = $out;
    }
}
function setChecked(tag) {
    ramblerswalksDetails.filter[tag] = true;
    var htmltag = document.getElementById(tag);
    if (htmltag) {
        htmltag.checked = true;
        htmltag.parentElement.style.display = "none";
    }
}
function resetDisplay(tag) {
    var htmltag = document.getElementById(tag);
    if (htmltag) {
        htmltag.parentElement.style.display = "list-item";
    }
}
function ra_filter(event) {
    if (event.target.id === "RA_DateStart" || event.target.id === "RA_DateEnd") {
        ramblerswalksDetails.filter[event.target.id] = event.target.value;
    } else {
        ramblerswalksDetails.filter[event.target.id] = event.target.checked;
    }
    var $walks = getWalks();
    displayWalks($walks);
}
function ra_format(id, option) {
    document.getElementById(ramblerswalksDetails.filter.RA_Display_Format).style.backgroundColor = '#DDDDDD';
    ramblerswalksDetails.filter.RA_Display_Format = option;
    document.getElementById(ramblerswalksDetails.filter.RA_Display_Format).style.backgroundColor = '#AAAAAA';
    var $walks = getWalks();
    displayWalks($walks);
}

function displayWalk($walk) {
    var $display = true;
    switch ($walk.dayofweek) {
        case "Monday":
            $display = ramblerswalksDetails.filter.RA_DayOfWeek_0;
            resetDisplay("RA_DayOfWeek_0");
            break;
        case "Tuesday":
            $display = ramblerswalksDetails.filter.RA_DayOfWeek_1;
            resetDisplay("RA_DayOfWeek_1");
            break;
        case "Wednesday":
            $display = ramblerswalksDetails.filter.RA_DayOfWeek_2;
            resetDisplay("RA_DayOfWeek_2");
            break;
        case "Thursday":
            $display = ramblerswalksDetails.filter.RA_DayOfWeek_3;
            resetDisplay("RA_DayOfWeek_3");
            break;
        case "Friday":
            $display = ramblerswalksDetails.filter.RA_DayOfWeek_4;
            resetDisplay("RA_DayOfWeek_4");
            break;
        case "Saturday":
            $display = ramblerswalksDetails.filter.RA_DayOfWeek_5;
            resetDisplay("RA_DayOfWeek_5");
            break;
        case "Sunday":
            $display = ramblerswalksDetails.filter.RA_DayOfWeek_6;
            resetDisplay("RA_DayOfWeek_6");
            break;
        default:
            break;
    }
    if (!$display) {
        return false;
    }
    switch ($walk.nationalGrade) {
        case "Easy Access":
            $display = ramblerswalksDetails.filter.RA_Diff_ea;
            resetDisplay("RA_Diff_ea");
            break;
        case "Easy":
            $display = ramblerswalksDetails.filter.RA_Diff_e;
            resetDisplay("RA_Diff_e");
            break;
        case "Leisurely":
            $display = ramblerswalksDetails.filter.RA_Diff_l;
            resetDisplay("RA_Diff_l");
            break;
        case "Moderate":
            $display = ramblerswalksDetails.filter.RA_Diff_m;
            resetDisplay("RA_Diff_m");
            break;
        case "Strenuous":
            $display = ramblerswalksDetails.filter.RA_Diff_s;
            resetDisplay("RA_Diff_s");
            break;
        case "Technical":
            $display = ramblerswalksDetails.filter.RA_Diff_t;
            resetDisplay("RA_Diff_t");
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
            $display = ramblerswalksDetails.filter.RA_Dist_0;
            resetDisplay("RA_Dist_0");
            break;
        case 4:
        case 5:
            $display = ramblerswalksDetails.filter.RA_Dist_1;
            resetDisplay("RA_Dist_1");
            break;
        case 6:
        case 7:
        case 8:
            $display = ramblerswalksDetails.filter.RA_Dist_2;
            resetDisplay("RA_Dist_2");
            break;
        case 9:
        case 10:
            $display = ramblerswalksDetails.filter.RA_Dist_3;
            resetDisplay("RA_Dist_3");
            break;
        case 11:
        case 12:
        case 13:
            $display = ramblerswalksDetails.filter.RA_Dist_4;
            resetDisplay("RA_Dist_4");
            break;
        case 14:
        case 15:
            $display = ramblerswalksDetails.filter.RA_Dist_5;
            resetDisplay("RA_Dist_5");
            break;
        default:
            $display = ramblerswalksDetails.filter.RA_Dist_6;
            resetDisplay("RA_Dist_6");
            break;
    }
    if (!$display) {
        return false;
    }
    $display = ramblerswalksDetails.filter[$walk.groupCode];
    if (!$display) {
        return false;
    }
    var d1 = $walk.walkDate.date.substr(0, 10);
    var d = ramblerswalksDetails.filter["RA_DateStart"];
    if (d !== "") {
        $display = d1 >= d;
    }
    if (!$display) {
        return false;
    }
    var d = ramblerswalksDetails.filter["RA_DateEnd"];
    if (d !== "") {
        $display = d1 <= d;
    }
    if (!$display) {
        return false;
    }
    return $display;
}

function displayWalk_List($walk, odd) {
    var $this = ramblerswalksDetails;
    var $text;
    var $class = "";
    if (odd) {
        $class = "odd";
    } else {
        $class = "even";
    }
    $text = "<b>" + $walk.dayofweek + ", " + $walk.day + "</b>";
    if ($walk.hasMeetPlace) {
        $text += ", " + $walk.meetLocation.timeHHMMshort + " at " + $walk.meetLocation.description;
        if ($this.addGridRef === true) {
            $text += " [" + $walk.meetLocation.gridref + "]";
        }
    }
    if ($walk.startLocation.exact) {
        $text += ", " + $walk.startLocation.timeHHMMshort + " at " + $walk.startLocation.description;
        if ($this.addGridRef === true || $this.addStartGridRef) {
            $text += " [" + $walk.startLocation.gridref + "]";
        }
    } else {
        if ($walk.startLocation.description) {
            $text += ", " + $walk.startLocation.description + " area";
        }
    }

    if ($walk.title) {
        $text += ", <b>" + $walk.title + "</b>";
    }
    if ($this.addDescription) {
        if ($walk.description !== $walk.title) {
            if (!empty($walk.description)) {
                $text += ", " + $walk.description;
            }
        }
    }
    $text += ", " + $walk.distanceMiles + "mi/" + $walk.distanceKm + "km";
    if ($walk.isLeader) {
        $text += ", Leader ";
    } else {
        $text += ", Contact ";
    }
    $text += $walk.contactName;
    if ($walk.telephone1 !== "") {
        $text += " " + $walk.telephone1;
    } else {
        if ($walk.telephone2 !== "") {
            $text += " " + $walk.telephone2;
        }
    }
    $text = "<div data-jplist-item class='" + $class + " " + $walk.status + "' >\n" + "<span>" + addWalkLink($walk, $text) + "</span>\n</div>\n";
    return $text;
}
function displayWalk_Full($walk, odd) {
    var $this = ramblerswalksDetails;
    var $text, $image;
    var $class = "";
    if (odd) {
        $class = "odd";
    } else {
        $class = "even";
    }
    $text = "";
    $image = '<span class="walksummary" >';
    $image += ' <img class="ra-grade pointer" src="' + getGradeImage($walk) + '" alt="' + $walk.nationalGrade + '" onclick="javascript:dispGradesHelp()" onmouseover="dispGrade(this)" onmouseout="noGrade(this)">';

// $text = "<b>" + $walk.dayofweek + ", " + $walk.day + " " + $walk.month + " " + $walk.year + "</b>";
    $text += "<b>" + $walk.dayofweek + ", " + $walk.day + " " + $walk.month + "</b>";
    $text += ", " + $walk.title;
    if ($walk.distanceMiles > 0) {
        $text += ", " + $walk.distanceMiles + "mi / " + $walk.distanceKm + "km";
    }
    if ($this.addContacttoHeader) {
        if ($walk.contactName !== "") {
            $text += ", " + $walk.contactName;
        }
        if ($walk.telephone1 !== "") {
            $text += ", " + $walk.telephone1;
        }
    }
    $text = $text + '<img class="ra-right" src="ramblers/jsonwalks/std/accordian/style/style4/close.png" alt="open,close" >';

    $text = "<div data-jplist-item class='" + $class + " " + $walk.status + "' \n>" + $image + addWalkLink($walk, $text) + "\n</div></span>\n";
    return $text;
}

function displayWalkForProgrammeTable($walk, odd) {
    var BR = "<br/>";
    var $this = ramblerswalksDetails;
    var $class = "";
    if (odd) {
        $class = "odd";
    } else {
        $class = "even";
    }
    var $group, $date, $meet, $start, $text, $title, $dist, $contact, $grade, $difficult;
    $group = "";
    if ($this.addGroupName) {
        $group = BR + $walk.groupName;
    }
    $date = addWalkLink($walk, "<b>" + $walk.dayofweek + ", " + $walk.day + " " + $walk.month + "</b>");

//    $date = "<b>"+$walk.walkDate.format('l, jS F') + "</b>";
    if ($this.printOn) {
        $date = "<div class='" + $this.walkClass + $walk.status + " printon'>" + $date + $group + "</div>";
    } else {
        $date = "<div class='" + $this.walkClass + $walk.status + "'>" + $date + $group + "</div>";
    }
    if ($walk.hasMeetPlace) {
        $meet = $walk.meetLocation.timeHHMMshort + " at " + $walk.meetLocation.description;
        if ($this.addLocation) {
            $meet += $this.addLocation($walk.meetLocation);
        }
    } else {
        $meet = ".";
    }

    if ($walk.startLocation.exact) {
        $start = $walk.startLocation.timeHHMMshort + " at " + $walk.startLocation.description;
        if ($this.addLocation) {
            $start += $this.addLocation($walk.startLocation);
        }
    } else {
        $start = ".";
    }
    if ($this.link) {
        if ($this.printOn) {
            $text = $walk.title;
        } else {
            $text = "<a href='" + $walk.detailsPageUrl + "' target='_blank' >" + $walk.title + "</a>";
        }
    } else {
        $text = addWalkLink($walk, $walk.title);
    }
    $text = "<strong>" + $text + "</strong>";
    $title = "<div class='" + $walk.status + "'>" + $text + " </div>";
    if ($this.addDescription) {
        $title += $walk.description;
    }

    $dist = $walk.distanceMiles + "mi / " + $walk.distanceKm + "km";
    $contact = "";
    if ($walk.isLeader) {
        $contact = "Leader";
    } else {
        $contact = "Contact";
    }
    if ($walk.contactName !== "") {
        $contact += BR + "<strong>" + $walk.contactName + "</strong>";
    }
    if ($walk.email !== "") {
        $contact += BR + getEmail($walk, $this.emailDisplayFormat, false);
    }
    if ($walk.telephone1 !== "") {
        $contact += BR + $walk.telephone1;
    }
    if ($walk.telephone2 !== "") {
        $contact += BR + $walk.telephone2;
    }
    $grade = $walk.nationalGrade + BR + $walk.localGrade;
    if ($this.displayGradesIcon && $this.printOn === false) {
        $grade = "<div class='pointer " + $walk.nationalGrade.replace(/ /g, "") + "' onclick='javascript:dispGradesHelp()'>" + $walk.nationalGrade + BR + $walk.localGrade + "</div>";
    }
    $difficult = $dist + "<br/>" + $grade;
    // $class = $this.tableClass;
    if (ramblerswalksDetails.hasMeetPlace) {
        return  addTableRow([$date, $meet, $start, $title, $difficult, $contact], $class);
    } else {
        return   addTableRow([$date, $start, $title, $difficult, $contact], $class);
    }
}
function addTableHeader($cols) {
    var $out, $value;

    $out = "<tr>";
    var index, len;

    for (index = 0, len = $cols.length; index < len; ++index) {
        $value = $cols[index];
        $out += "<th>" + $value + "</th>";
    }
    $out += "</tr>\n";
    return $out;

}
function addTableRow($cols, $class) {
    var $out, $value;
    if ($class === "") {
        $out = "<tr data-jplist-item>";
    } else {
        $out = "<tr data-jplist-item class='" + $class + "'>";
    }

    var index, len;

    for (index = 0, len = $cols.length; index < len; ++index) {
        $value = $cols[index];
        $out += "<td>" + $value + "</td>";
    }
    $out += "</tr>\n";
    return $out;

}
function isCancelled($walk) {
    return $walk.status.toLowerCase() === "cancelled";
}
function addWalkLink($walk, $text) {
    return  "<span class='pointer' onclick=\"javascript:displayWalkID(" + $walk.id + ")\">" + $text + "</span>";
}
function displayWalkDetails($walk) {
    var PHP_EOL = "\n";
    var $html = "";
    var $this = ramblerswalksDetails;
    var $link, $out, $class, $text;
    $html += "<div class='walkstdfulldetails'>\n";
    // if ($this.displayGroup === true) {
    $html += "<div class='group " + gradeCSS($walk) + "'><b>Group</b>: " + $walk.groupName + "</div>" + PHP_EOL;
    //  }
    if (isCancelled($walk)) {
        $html += "<div class='reason'>WALK CANCELLED: " + $walk.cancellationReason + "</div>" + PHP_EOL;
    }
    $html += "<div class='basics'>" + PHP_EOL;
    if ($this.printOn) {

    } else {
        //   "<b>" + $walk.dayofweek + ", " + $walk.day + " " + $walk.month + "</b>";
        //   $html += "<div class='description'><b>" + $walk.walkDate.format('l, jS F Y') + PHP_EOL;
        $html += "<div class='description'><b>" + $walk.dayofweek + ", " + $walk.day + " " + $walk.month + PHP_EOL;
        $html += "<br/>" + $walk.title + "</b></div>" + PHP_EOL;
    }


    if ($walk.description !== "") {
        $html += "<div class='description'> " + $walk.descriptionHtml + "</div>" + PHP_EOL;
    }
    if ($walk.additionalNotes !== "") {
        $html += "<div class='additionalnotes'><b>Additional Notes</b>: " + $walk.additionalNotes + "</div>" + PHP_EOL;
    }
    if ($walk.isLinear) {
        $html += "<b>Linear Walk</b>";
    } else {
        $html += "<b>Circular walk</b>";
    }
    if ($walk.hasMeetPlace) {
        $out = "<div><b>Meeting time " + $walk.meetLocation.timeHHMMshort + "</b></div>";
        $html += $out + PHP_EOL;
    }
    if ($walk.startLocation.exact) {
        $out = "<div><b>Start time " + $walk.startLocation.timeHHMMshort + "</b></div>";
        $html += $out + PHP_EOL;
    }
    if ($walk.finishTime !== null) {
        $out = "<div>(Estimated finish time " + getShortTime($walk.finishTime) + ")</div>";
        $html += $out + PHP_EOL;
    }
    $html += "</div>";
    if ($walk.hasMeetPlace) {
        $html += "<div class='meetplace'>";
        $out = addLocationInfo("Meeting", $walk.meetLocation, $walk.detailsPageUrl);
        $html += $out;
        $html += "</div>" + PHP_EOL;
    } else {
        //echo "<div class='nomeetplace'><b>No meeting place specified</b>";
        //echo "</div>";
    }
    if ($walk.startLocation.exact) {
        $html += "<div class='startplace'>";
    } else {
        $html += "<div class='nostartplace'><b>No start place - Rough location only</b>: ";
    }
    $html += addLocationInfo("Start", $walk.startLocation, $walk.detailsPageUrl);

    $html += "</div>" + PHP_EOL;

    if ($walk.isLinear) {
        $html += "<div class='finishplace'>";
        if ($walk.finishLocation !== null) {
            $html += addLocationInfo("Finish", $walk.finishLocation, $walk.detailsPageUrl);
        } else {
            $html += "<span class='walkerror' >Linear walk but no finish location supplied</span>";
        }
        $html += "</div>" + PHP_EOL;
    }
    $html += "<div class='difficulty'><b>Difficulty</b>: ";
    if ($walk.distanceMiles > 0) {
        $html += RHtmlwithDiv("distance", "<b>Distance</b>: " + $walk.distanceMiles + "mi / " + $walk.distanceKm + "km", $this.printOn);
    }
    $html += RHtmlwithDiv("nationalgrade", "<b>National Grade</b>: " + $walk.nationalGrade, $this.printOn);

    if ($walk.localGrade !== "") {
        $link = $walk.localGrade;
        if ($this.localGradeHelp !== "") {
            $link = "<a href='" + $this.localGradeHelp + "' target='" + $this.localGradeTarget + "'>" + $link + "</a>";
        }
        $html += RHtmlwithDiv("localgrade", "<b>Local Grade</b>: " + $link, $this.printOn);
    }
    if ($walk.pace !== "") {
        $html += RHtmlwithDiv("pace", "<b>Pace</b>: " + $walk.pace, $this.printOn);
    }
    if ($walk.ascentFeet !== null) {
        $html += RHtmlwithDiv("ascent", "<b>Ascent</b>: " + $walk.ascentFeet + " ft " + $walk.ascentMetres + " ms", $this.printOn);
    }
    $html += "</div>" + PHP_EOL;
    if ($walk.isLeader === false) {
        $html += "<div class='walkcontact'><b>Contact</b>: ";
    } else {
        $html += "<div class='walkcontact'><b>Contact Leader</b>: ";
    }
    $html += RHtmlwithDiv("contactname", "<b>Name</b>: " + $walk.contactName, $this.printOn);

    if ($walk.email !== "" && !$this.printOn) {
        //   $html += $walk.getEmail($this.emailDisplayFormat, true);
    }
    if ($walk.telephone1 + $walk.telephone2 !== "") {
        $text = "<b>Telephone</b>: ";
        if ($walk.telephone1 !== "") {
            $text += $walk.telephone1;
            if ($walk.telephone2 !== "") {
                $text += ", ";
            }
        }
        if ($walk.telephone2 !== "") {
            $text += $walk.telephone2;
        }
        $html += RHtmlwithDiv("telephone", $text, $this.printOn);
    }
    if ($walk.isLeader === false) {
        if ($walk.walkLeader !== "") {
            $html += "<div class='walkleader'><b>Walk Leader</b>: " + $walk.walkLeader + "</div>" + PHP_EOL;
        }
    }
    $html += "</div>" + PHP_EOL;
    $html += addItemInfo("strands", "", $walk.strands);
    $html += addItemInfo("festivals", "Festivals", $walk.festivals);
    $html += addItemInfo("suitability", "Suitability", $walk.suitability);
    $html += addItemInfo("surroundings", "Surroundings", $walk.surroundings);
    $html += addItemInfo("theme", "Theme", $walk.theme);
    $html += addItemInfo("specialStatus", "Special Status", $walk.specialStatus);
    $html += addItemInfo("facilities", "Facilities", $walk.facilities);
    $html += "<div class='walkdates'>" + PHP_EOL;

    if (!$this.printOn) {
        $html += "<div class='updated'><a href='" + $walk.detailsPageUrl + "' target='_blank' >View walk on Walks Finder</a></div>" + PHP_EOL;
    }
    $class = "";
    if ($this.printOn) {
        $class = "printon";
    } else {
        if ($this.displayGroup === null) {
            $html += "<div class='groupfootnote " + $class + "'>Group: " + $walk.groupName + "</div>" + PHP_EOL;
        }
    }
    $html += "<div class='updated " + $class + "'>Last update: " + getDate($walk.dateUpdated.date) + "</div>" + PHP_EOL;
    $html += "</div>" + PHP_EOL;
    $html += "</div>" + PHP_EOL;
    return $html;
}

function addLocationInfo($title, $location, $detailsPageUrl) {
    var $out, $gr, $note;
    var $this = ramblerswalksDetails;
    if ($location.exact) {
        $note = "Click Google Directions to see map and directions from your current location";
        $out = "<div class='place'><b>" + $title + " Place</b>:<abbr title='" + $note + "'> " + $location.description + " ";
        if (!$this.printOn) {
            $out += getDirectionsMap($location, "Google directions");
        }
        if ($this.printOn) {
            if ($location.time !== "") {
                $out += RHtmlwithDiv("time", "<b>Time</b>: " + $location.timeHHMMshort, $this.printOn);
            }
        }
        $out += "</abbr></div>";
        if (!$this.printOn) {
            if ($location.time !== "") {
                $out += RHtmlwithDiv("time", "<b>Time</b>: " + $location.timeHHMMshort, $this.printOn);
            }
        }
        $gr = "<abbr title='Click Map to see Ordnance Survey map of location'><b>Grid Ref</b>: " + $location.gridref + " ";
        if (!$this.printOn) {
            $gr += getOSMap($location, "OS Map");
        }
        $gr += "</abbr>";
        $out += RHtmlwithDiv("gridref", $gr, $this.printOn);
        $out += RHtmlwithDiv("latlong", "<b>Latitude</b>: " + $location.latitude + " , <b>Longitude</b>: " + $location.longitude, $this.printOn);

        if ($location.postcode !== "") {
            $out += displayPostcode($location, $detailsPageUrl);
        }
    } else {
        $out = "<div class='place'>";
        $out += "Location shown is an indication of where the walk will be and <b>NOT</b> the start place: ";
        if (!$this.printOn) {
            $out += getAreaMap($location, "Map of area");
        }
        if ($location.type === "Start") {
            if ($this.displayStartTime) {
                $out += "<div class='starttime'>Start time: " + $location.timeHHMMshort + "</div>";
            }
            if ($this.displayStartDescription) {
                $out += "<div class='startdescription'>" + $location.description + "</div>";
            }
        }
        $out += "</div>";
    }

    return $out;
}

function addItemInfo($class, $title, $value) {
    var $html = "";

    if ($value !== null) {
        $html += "<div class='" + $class + "'><b>" + $title + "</b>";
        $html += "<ul>";
        var $items = $value.items;
        var index, len, $item;
        for (index = 0, len = $items.length; index < len; ++index) {
            $item = $items[index];
            $html += "<li class='item'>" + $item.name + "</li>";
        }
        $html += "</ul></div>";
    }
    return $html;
}
function RHtmlwithDiv($class, $text, $printOn) {
    var $out = "";
    if ($printOn) {
        $out += "&nbsp;&nbsp;&nbsp;" + $text;
    } else {
        $out += "<div class='" + $class + "'>";
        $out += $text;
        $out += "</div>";
    }
    return $out;
}
function getShortTime($text) {
    var d = new Date($text.date);
    return d.toLocaleTimeString();
}
function getDate($text) {
    var d = new Date($text);
    return d.toDateString();
}
function gradeCSS($walk) {
    var $class = "";
    switch ($walk.nationalGrade) {
        case "Easy Access":
            $class = "grade-ea";
            break;
        case "Easy":
            $class = "grade-e";
            break;
        case "Leisurely":
            $class = "grade-l";
            break;
        case "Moderate":
            $class = "grade-m";
            break;
        case "Strenuous":
            $class = "grade-s";
            break;
        case "Technical":
            $class = "grade-t";
            break;
        default:
            break;
    }
    return $class;
}
function displayWalksMap($walks) {
    removeClusterMarkers();
    var index, len, $walk;
    for (index = 0, len = $walks.length; index < len; ++index) {
        $walk = $walks[index];
        if ($walk.display) {
            addWalkMarker($walk);
        }
    }
    addClusterMarkers();
    return;
}
function addWalkMarker($walk) {
    var $date, $title, $dist, $gr, $long, $lat, $desc, $url, $icon, $class, $grade, $details, $map;
    var $directions, $popup;
    var $this = ramblerswalksDetails;
    // $date = $walk.walkDate.format('l, jS F');
    $date = "<b>" + $walk.dayofweek + ", " + $walk.day + " " + $walk.month + "</b>";
    $title = addslashes($walk.title);
    $dist = $walk.distanceMiles + "mile / " + $walk.distanceKm + "km";
    $gr = $walk.startLocation.gridref;
    $long = $walk.startLocation.longitude;
    $lat = $walk.startLocation.latitude;
    $desc = "<b>" + $date + "<br/>" + $title + "<br/>" + $dist + " " + $walk.nationalGrade + "</b>";
    $url = getWalkMapHref($walk, $desc);
    if ($walk.startLocation.exact) {
        $icon = ramblersMap.markerStart;
    } else {
        $icon = ramblersMap.markerArea;
    }
    if (isCancelled($walk)) {
        $icon = ramblersMap.markerCancelled;
    }
    $class = $this.walkClass + $walk.status;
    $grade = "<span class='pointer' class='pointer' onclick='javascript:dispGradesHelp()'>";
    $grade += "<img src='" + ramblersMap.base + getGradeImage($walk) + "' alt='" + $walk.nationalGrade + "' width='30px'>";
    $grade += "</span>";
    $details = "<div class='" + $class + "'>" + $grade + $url + "</div>";
    $map = "<a href=&quot;javascript:streetmap('" + $gr + "')&quot; >[OS Map]</a>";
    $directions = "<a href=&quot;javascript:directions(" + $lat + "," + $long + ")&quot; >[Directions]</a>";
    //  var $directions = "<a href='https://maps.google.com?saddr=Current+Location&daddr=" + $lat + "," + $long + "' target='_blank'>[Directions]</a>";
    $popup = $details + $map + $directions;
    // $popup = str_replace('"', "&quot;", $popup);
    addMarker($popup, $lat, $long, $icon);
    return;
}
function getWalkMapHref($walk, $desc) {
    var $out = "<a href=";
    $out += "'javascript:displayWalkID(" + $walk.id + ");' >";
    $out += $desc + "</a>";
    return $out;
}
function addslashes(str) {
    //  discuss at: http://locutus.io/php/addslashes/
    // original by: Kevin van Zonneveld (http://kvz.io)
    // improved by: Ates Goral (http://magnetiq.com)
    // improved by: marrtins
    // improved by: Nate
    // improved by: Onno Marsman (https://twitter.com/onnomarsman)
    // improved by: Brett Zamir (http://brett-zamir.me)
    // improved by: Oskar Larsson Högfeldt (http://oskar-lh.name/)
    //    input by: Denny Wardhana
    //   example 1: addslashes("kevin's birthday")
    //   returns 1: "kevin\\'s birthday"

    return (str + '')
            .replace(/[\\"']/g, '\\$&')
            .replace(/\u0000/g, '\\0');
}
function addPagination() {
    var $div = "<div data-jplist-control=\"pagination\" \
            data-group=\"group1\" \
            data-items-per-page=\"20\" \
            data-current-page=\"0\" \
            data-id=\"no-items\" \
            data-name=\"pagination1\"> \
             <span data-type=\"info\"> \
             <a class='link-button button-p4485' onclick=\"javascript:printElem('rawalks')\">Print</a> \
            {startItem} - {endItem} of {itemsNumber} \
            </span> \
            <span class='center'> \
            <button type=\"button\" data-type=\"first\">First</button> \
            <button type=\"button\" data-type=\"prev\">Previous</button> \
            <span class=\"jplist-holder\" data-type=\"pages\"> \
                <button type=\"button\" data-type=\"page\">{pageNumber}</button> \
            </span> \
            <button type=\"button\" data-type=\"next\">Next</button> \
            <button type=\"button\" data-type=\"last\">Last</button> \
            </span> \
            <!-- items per page select --> \
    <select data-type=\"items-per-page\"> \
        <option value=\"10\"> 10 per page </option> \
        <option value=\"20\"> 20 per page </option> \
        <option value=\"30\"> 30 per page </option> \
        <option value=\"0\"> view all </option> \
    </select> \
        </div>";
    return $div;
}
function getDirectionsMap($location, $text) {
    var $this = $location;
    var $code, $out;
    if ($this.exact) {
        $code = "https://www.google.com/maps/dir/Current+Location/[lat],[long]";
        $code = $code.replace("[lat]", $this.latitude);
        $code = $code.replace("[long]", $this.longitude);
        $out = "<span class='mappopup' onClick=\"javascript:window.open('" + $code + "', '_blank','toolbar=yes,scrollbars=yes,left=50,top=50,width=800,height=600');\">[" + $text + "]</span>";
        return $out;
    } else {
        return "";
    }
}
function getOSMap($location, $text) {
    var $this = $location;
    var $code, $out;
    if ($this.exact) {
        $code = "http://streetmap.co.uk/loc/[lat],[long]&amp;Z=115";
        $code = $code.replace("[lat]", $this.latitude);
        $code = $code.replace("[long]", $this.longitude);
        $out = "<span class='mappopup' onClick=\"javascript:window.open('" + $code + "', '_blank','toolbar=yes,scrollbars=yes,left=50,top=50,width=800,height=600');\">[" + $text + "]</span>";
        return $out;
    } else {
        return "";
    }
}
function getAreaMap($location, $text) {
    var $this = $location;
    var $code, $out;
    if (!$this.exact) {
        $code = "http://maps.google.com/maps?z=13&amp;t=h&amp;ll=[lat],[long]";
        $code = $code.replace("[lat]", $this.latitude);
        $code = $code.replace("[long]", $this.longitude);
        $out = "<span class='mappopup' onClick=\"javascript:window.open('" + $code + "', '_blank','toolbar=yes,scrollbars=yes,left=50,top=50,width=800,height=600');\">[" + $text + "]</span>";
        return $out;
    } else {
        return "";
    }
}
function displayPostcode($location, $detailsPageUrl) {
    var $pc, $note2, $note, $link, $distclass, $out;
    var $this = $location;
    var $dist = $this.postcodeDistance;
    var $direction = $this.postcodeDirection;
    if ($dist <= 100) {
        $note = "Postcode is within 100m of location";
        $link = "";
        $distclass = " distclose";
    } else {
        if ($dist < 500) {
            $distclass = " distnear";
        } else {
            $distclass = " distfar";
        }
        $note = $this.type + " place is " + $dist + " metres " + $direction + " of postcode. ";
        $note += "Click to display the locations of the Postcode(P) and " + $this.type + " locations";
        $note2 = $dist + " metres " + $this.postcodeDirectionAbbr;
        $link = getPostcodeMap($location, $note2, $detailsPageUrl);
    }
    $pc = "<abbr title='" + $note + "'><b>Postcode</b>: " + $this.postcode + " ";
    $pc += $link;
    $pc += "</abbr>";
    $out = RHtmlwithDiv("postcode " + $distclass, $pc, ramblerswalksDetails.printOn);
    return $out;
}
function getPostcodeMap($location, $text, $detailsPageUrl) {
    var $this = $location;
    var $out;
    if ($this.exact) {
        $out = "<span class='mappopup' onClick=\"javascript:window.open('" + $detailsPageUrl + "', '_blank','toolbar=yes,scrollbars=yes,left=50,top=50,width=900,height=600');\">[" + $text + "]</span>";
        return $out;
    } else {
        return "";
    }
}
function getEmail($walk, $option, $withtitle) {
    var $this = $walk;
    var $printOn, $link;
    if ($withtitle) {
        switch ($option) {
            case 1:
                return "<b>Email: </b>" + $this.email;
                break;
            case 2:
                $printOn = ramblerswalksDetails.printOn;
                $link = "http://www.ramblers.org.uk/go-walking/find-a-walk-or-route/contact-walk-organiser.aspx?walkId=";
                return RHtmlwithDiv("email", "<b>Email: </b><a href='" + $link + $this.id + "' target='_blank'>Contact via ramblers.org.uk</a>", $printOn);
            case 3:
                return "";
                break;
            case 4:
                return "<b>Email: </b>" + str_replace("@", " (at) ", $this.email);
                break;
            default:
                return "Invalid option specified for \$display->emailDisplayFormat";
                break;
        }
    } else {
        switch ($option) {
            case 1:
                return $this.email;
                break;
            case 2:
                $printOn = ramblerswalksDetails.printOn;
                $link = "http://www.ramblers.org.uk/go-walking/find-a-walk-or-route/contact-walk-organiser.aspx?walkId=";
                return "<a href='" + $link + $this.id + "' target='_blank'>Email contact via ramblers.org.uk</a>";
                break;
            case 3:
                return "";
                break;
            case 4:
                return str_replace("@", " (at) ", $this.email);
                break;
            default:
                return "Invalid option specified for \$display->emailDisplayFormat";
        }
    }
}