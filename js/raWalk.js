var ra, displayCustomValues;
if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.data) === "undefined") {
    ra.data = {};
}
//if (typeof (ra.data.walks) === "undefined") {
//    ra.data.walks = [];
//}
ra.walk = (function () {
    var my = {};
    my.DisplayWalkFunction = "ra.walk.displayWalkID";
    my.mapFormat = ["{dowddmm}", "{;title}", "{,distance}"];
    my.mapLinks = ["{startOSMap}", "{startDirections}"];

    my.walks = {};
    my.registerWalks = function (walks) {
        var i, no, walk;
        for (i = 0, no = walks.length; i < no; ++i) {
            walk = walks[i];
            my.walks[walk.id] = walks[i];
        }
    };
    my.getWalk = function (id) {
        if (my.walks.hasOwnProperty(id)) {
            return my.walks[id];
        }
        return null;
    };

    my.displayWalkID = function (event, id) {
        my._getWalkObject(event, id, my._displayModalWalk);
    };
    my.toggleDisplay = function (event, id) {
        var tag = event.currentTarget;
        if (tag.className.includes('doing')) {
            return;
        }
        if (tag.className.includes('active')) {
            tag.classList.remove("active");
            tag.nextElementSibling.remove();
        } else {
            tag.classList.add("active");
            tag.classList.add("doing");
            var info = {tag: tag,
                ctrlKey: event.ctrlKey,
                altKey: event.altKey
            };
            my._getWalkObject(info, id, my._displayDivWalk);
        }
    };
    my._displayDivWalk = function (event, walk) {
        var tag = event.tag;
        var div = document.createElement("div");
        ra.html.insertAfter(tag, div);
        var html;
        if (event.ctrlKey && event.altKey) {
            html = my.walkDiagnostics(walk);
        } else {
            html = my.walkDetails(walk);
        }
        div.innerHTML = html;
        my._addMaptoWalk(walk);
        tag.classList.remove("doing");
    };
    my._displayModalWalk = function (event, walk) {
        var html;
        if (event.ctrlKey && event.altKey) {
            html = my.walkDiagnostics(walk);
        } else {
            html = my.walkDetails(walk);
        }
        ra.modal.display(html);
        my._addMaptoWalk(walk);
    };
    my._getWalkObject = function (event, id, callback) {
        var walk = my.getWalk(id);
        if (walk !== null) {
            callback(event, walk);
            return;
        }
        // need to add error popup if cannot load walk
        ////////////////////////////////////////
        /////////////////////////////////////////
        //////////////////////////////////
        //     var $url = 'https://getwalk.theramblers.org.uk/index.php?id=' + id;
        var $url = 'https://www.ramblers.org.uk/api/lbs/walks/' + id;
        ra.ajax.getUrl($url, '', null, function (target, result) {
            var gwem1walk = JSON.parse(result);
            var walk = my.convGWEM1toWalk(gwem1walk);
            callback(event, walk);
            return;
        });
    };
    my._addMaptoWalk = function (walk) {
        if (my.isCancelled(walk)) {
            return;
        }
        var tag = document.getElementById("Div" + walk.id);
        var lmap = new leafletMap(tag, ra.defaultMapOptions);
        var map = lmap.map;
        var layer = L.featureGroup().addTo(map);
        if (walk.finishLocation) {
            my._addLocation(layer, walk.finishLocation, map);
        }
        if (walk.startLocation) {
            my._addLocation(layer, walk.startLocation, map);
        }
        if (walk.meetLocation) {
            my._addLocation(layer, walk.meetLocation, map);
        }
        var bounds = layer.getBounds();
        map.fitBounds(bounds, {maxZoom: 15, padding: [20, 20]});

//        // fix contact link does not work if popup is underneath it and it is in coloumn two
//        var elems = document.getElementsByClassName("walkcontact");
//        elems[0].addEventListener('mouseover', function () {
//            map.closePopup();
//        });
    };
    my._addLocation = function (layer, location, map) {
        var icon = ra.map.icon.markerRoute();
        var popup = "", title = '';
        var popupoffset = [0, -30];
        if (location.exact) {
            if (location.postcodeDistance < 10000) {
                var pcpop = "<b>" + location.postcode + "</b>";
                pcpop += "<br/>" + location.type + " location is " + location.postcodeDistance + " metres to the " + location.postcodeDirection;
                var pcIcon = ra.map.icon.postcode();
                var marker = L.marker([location.postcodeLatitude, location.postcodeLongitude], {icon: pcIcon, riseOnHover: true}).addTo(layer);
                marker.bindPopup(pcpop).closePopup();
            }
        }
        if (location.exact) {
            switch (location.type) {
                case "Meeting":
                    popup = "<b>Meeting place</b><br/>" + location.timeHHMMshort + " " + location.description;
                    popup += "<br/>" + location.gridref;
                    icon = ra.map.icon.markerRoute();
                    title = 'Meeting place';
                    popupoffset = [0, -30];
                    break;
                case "Start":
                    popup = "<b>Walk start</b><br/>" + location.timeHHMMshort + " " + location.description;
                    popup += "<br/>" + location.gridref;
                    icon = ra.map.icon.markerStart();
                    title = 'Start of walk';
                    popupoffset = [0, -10];
                    break;
                case "Finishing":
                case "End":
                    popup = "<b>Walk Finish</b><br/>" + location.description;
                    icon = ra.map.icon.markerFinish();
                    title = 'End of walk';
                    popupoffset = [0, -10];
                    break;
            }
        } else {
            switch (location.type) {
                case "Meeting":
                case "Finishing":
                    return;
                    break;
                case "Start":
                    var popup = "<b>General area for walk only</b><br/>" + location.description;
                    popup += "<br/>Contact group if you wish to join the walk at the start";
                    icon = ra.map.icon.markerArea();
                    title = 'General area of walk';
                    popupoffset = [0, -10];
                    break;
            }
        }
        var marker = L.marker([location.latitude, location.longitude], {icon: icon, title: title, riseOnHover: true}).addTo(layer);
        marker.bindPopup(popup, {offset: popupoffset, autoClose: false}).closePopup();
        //  marker.closePopup();
        var openPopups = true;
        // keepInView so popup in not under contact links as link does not work/available
        map.on("mouseover", function (event) {
            if (openPopups) {
                marker.openPopup();
            }
            openPopups = false;
        });
        map.on("mouseout", function (event) {
            marker.closePopup();
            openPopups = true;
        });
    };
    my.displayWalkURL = function (url) {
        window.open(url);
    };
    // display walks 
    my.walkDetails = function ($walk) {
        var PHP_EOL = "\n";
        var $html = "";
        var $link, $out, $text;
        $html += "<div class='walkstdfulldetails stdfulldetails walk" + $walk.status + "' >" + PHP_EOL;
        $html += "<div class='group " + my.gradeCSS($walk.nationalGrade) + "'><b>Group</b>: " + $walk.groupName + "</div>" + PHP_EOL;
        if (my.isCancelled($walk)) {
            $html += "<div class='reason'>WALK CANCELLED: " + $walk.cancellationReason + "</div>" + PHP_EOL;
        }
        $html += "<div class='basics'>" + PHP_EOL;
        $html += "<div class='description'><b><span class='walktitle'>" + $walk.title + "</span><br/>" + my.getWalkValue($walk, '{dowddmm}') + PHP_EOL;
        $html += "</b></div>" + PHP_EOL;
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
            $out = "<div>(Estimated finish time " + ra.time.HHMMshort($walk.finishTime) + ")</div>";
            $html += $out + PHP_EOL;
        }
        $html += "</div>";
        if ($walk.hasMeetPlace) {
            $html += "<div class='meetplace'>";
            $out = _addLocationInfo("Meeting", $walk.meetLocation);
            $html += $out;
            $html += "</div>" + PHP_EOL;
        }
        if ($walk.startLocation.exact) {
            $html += "<div class='startplace'>";
        } else {
            $html += "<div class='nostartplace'><b>No start place - Rough location only</b>: ";
        }
        $html += _addLocationInfo("Start", $walk.startLocation);
        $html += "</div>" + PHP_EOL;
        if ($walk.isLinear) {
            $html += "<div class='finishplace'>";
            if ($walk.finishLocation !== null) {
                $html += _addLocationInfo("Finish", $walk.finishLocation);
            } else {
                $html += "<span class='walkerror' >Linear walk but no finish location supplied</span>";
            }
            $html += "</div>" + PHP_EOL;
        }
        $html += "<div class='difficulty'><b>Difficulty</b>: ";
        if ($walk.distanceMiles > 0) {
            $html += ra.html.addDiv("distance", "<b>Distance</b>: " + $walk.distanceMiles + "mi / " + $walk.distanceKm + "km");
        }
        $html += ra.html.addDiv("nationalgrade", "<b>National Grade</b>: " + $walk.nationalGrade);
        if ($walk.localGrade !== "") {
            $link = $walk.localGrade;
            $html += ra.html.addDiv("localgrade", "<b>Local Grade</b>: " + $link);
        }
        if ($walk.pace !== "") {
            $html += ra.html.addDiv("pace", "<b>Pace</b>: " + $walk.pace);
        }
        if ($walk.ascentFeet !== null) {
            $html += ra.html.addDiv("ascent", "<b>Ascent</b>: " + $walk.ascentMetres + " m/" + $walk.ascentFeet + " ft");
        }
        $html += "</div>" + PHP_EOL;
        if ($walk.isLeader === false) {
            $html += "<div class='walkcontact'><b>Contact: </b>";
        } else {
            $html += "<div class='walkcontact'><b>Contact Leader: </b>";
        }
        $html += ra.html.addDiv("contactname", "<b>Name</b>: " + $walk.contactName);
        if ($walk.email !== "") {
            $html += my.getEmailLink($walk);
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
            $html += ra.html.addDiv("telephone", $text);
        }
        if ($walk.isLeader === false) {
            if ($walk.walkLeader !== "") {
                $html += "<div class='walkleader'><b>Walk Leader</b>: " + $walk.walkLeader + "</div>" + PHP_EOL;
            }
        }
        $html += "</div>" + PHP_EOL;
        $html += my.addItemInfo("strands", "", $walk.strands);
        $html += my.addItemInfo("festivals", "Festivals", $walk.festivals);
        $html += my.addItemInfo("suitability", "Suitability", $walk.suitability);
        $html += my.addItemInfo("surroundings", "Surroundings", $walk.surroundings);
        $html += my.addItemInfo("theme", "Theme", $walk.theme);
        $html += my.addItemInfo("specialStatus", "Special Status", $walk.specialStatus);
        $html += my.addItemInfo("facilities", "Facilities", $walk.facilities);
        if ($walk.media.length > 0) {
            if ($walk.media.length > 0) {
                $html += "<div class='walkmedia'> ";
                var index, len;
                for (index = 0, len = $walk.media.length; index < len; ++index) {
                    var item = $walk.media[index];
                    var caption = "<div>";
                    if (item.caption !== "") {
                        caption += item.caption;
                    } else {
                        caption += "<br/>";
                    }
                    if (item.copyright !== "") {
                        caption += "<br/><i>&copy; " + item.copyright + "</i>";
                    } else {
                        caption += "<br/>";
                    }
                    caption += "</div>";
                    $html += "<div class='walk-image' ><img data-size='1' class='walkmedia' src='" + item.url + "' onclick='ra.walk.mediasize(this)' >" + caption + "</div>";
                }
                $html += "</div>" + PHP_EOL;
            }
        }
        var mapdiv = "Div" + $walk.id;
        $html += "<div id='" + mapdiv + "'></div>" + PHP_EOL;
        $html += "<div class='walkdates'>" + PHP_EOL;
        $html += "<div class='updated'><a href='" + $walk.detailsPageUrl + "' target='_blank' >View walk on National Web Site</a></div>" + PHP_EOL;
        $html += "<div class='updated'>Walk ID " + $walk.id + "</div>" + PHP_EOL;
        $html += "<div class='updated walk" + $walk.status + "'>Last update: " + ra.date.dowShortddmmyyyy($walk.dateUpdated) + "</div>" + PHP_EOL;
        $html += "</div>" + PHP_EOL;
        $html += "</div>" + PHP_EOL;
        return $html;
    };
    my.getWalkValues = function ($walk, $items, link = true) {
        var index, len, $out;
        $out = "";
        for (index = 0, len = $items.length; index < len; ++index) {
            $out += my.getWalkValue($walk, $items[index]);
        }
        if (link) {
            return my.addWalkLink($walk.id, $out);
        } else {
            return  $out;
    }

    };
    my.addItemInfo = function ($class, $title, $value) {
        var $html = "";
        var $any = false;
        var $text;
        if ($value !== null) {
            $html += "<div class='" + $class + "'><b>" + $title + "</b>";
            $html += "<ul>";
            var $items = $value.items;
            var index, len;
            for (index = 0, len = $items.length; index < len; ++index) {
                $text = $items[index].text;
                if ($text !== "") {
                    $html += "<li class='item'>" + $text + "</li>";
                    $any = true;
                }
            }
            $html += "</ul></div>";
        }
        if (!$any) {
            $html = "";
        }
        return $html;
    };
    my.getEmailLink = function ($walk) {
        var $link;
        $link = "http://www.ramblers.org.uk/go-walking/find-a-walk-or-route/contact-walk-organiser.aspx?walkId=";
        return "<span><a href='" + $link + $walk.id + "' target='_blank'>Email contact via ramblers.org.uk</a></span>";
    };
    my.walkDiagnostics = function ($walk) {
        var options = ["{lf}", "{group}", "{dowShortdd}", "{dowShortddmm}", "{dowShortddyyyy}",
            "{dowShortddmmyyyy}", "{dowdd}", "{dowddmm}", "{dowddmmyyyy}", "{meet}",
            "{meetTime}", "{meetPlace}", "{meetGR}", "{meetPC}", "{meetOLC}", "{meetMapCode}",
            "{start}", "{startTime}", "{startPlace}", "{startGR}", "{startPC}", "{startOLC}",
            "{startMapCode}", "{title}", "{description}", "{difficulty}", "{difficulty+}",
            "{distance}", "{distanceMi}", "{distanceKm}", "{gradeimg}", "{gradeimgRight}",
            "{grade}", "{grade+}", "{nationalGrade}", "{nationalGradeAbbr}", "{localGrade}",
            "{additionalNotes}", "{type}", "{contact}", "{contactname}", "{contactperson}", "{telephone}",
            "{telephone1}", "{telephone2}", "{email}", "{emailat}", "{emaillink}", "{mediathumbr}",
            "{mediathumbl}",
            "{meetOSMap}", "{meetDirections}", "{startOSMap}", "{startDirections}"];
        var index, len, option, $value;
        var $html = "<table><tr><th>No</th><th>Name</th><th>Value</th><th>HTML</th></tr>";
        for (index = 0, len = options.length; index < len; ++index) {
            option = options[index];
            $html += "<tr>";
            $value = my.getWalkValue($walk, option);
            $html += "<td>" + index + "</td><td>" + option + "</td><td>" + $value + "</td><td>" + $value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            +"</td>";
            $html += "</tr>";
        }
        return $html;
    };
    my.getWalkValue = function ($walk, $options) {
        var BR = "<br/>";
        var out = "";
        var $prefix;
        var values = getPrefix($options);
        $prefix = values[0];
        var $option = values[1];
        switch ($option) {
            case "{lf}":
                out = "<br/>";
                break;
            case "{group}":
                out = $walk.groupName;
                break;
            case "{dowShortdd}":
                out = "<b>" + ra.date.dowShortdd($walk.walkDate) + "</b>";
                break;
            case "{dowShortddmm}":
                out = "<b>" + ra.date.dowShortddmm($walk.walkDate) + my.addYear($walk) + "</b>";
                break;
            case "{dowShortddyyyy}": // published in error
            case "{dowShortddmmyyyy}":
                out = "<b>" + ra.date.dowShortddmmyyyy($walk.walkDate) + "</b>";
                break;
            case "{dowdd}":
                out = "<b>" + ra.date.dowdd($walk.walkDate) + "</b>";
                break;
            case "{dowddmm}":
                out = "<b>" + ra.date.dowddmm($walk.walkDate) + my.addYear($walk) + "</b>";
                break;
            case "{dowddmmyyyy}":
                out = "<b>" + ra.date.dowddmmyyyy($walk.walkDate) + "</b>";
                break;
            case "{meet}":
                if ($walk.hasMeetPlace) {
                    out = $walk.meetLocation.timeHHMMshort;
                    if ($walk.meetLocation.description) {
                        out += " at " + $walk.meetLocation.description;
                    }
                }
                break;
            case "{meetTime}":
                if ($walk.hasMeetPlace) {
                    out = $walk.meetLocation.timeHHMMshort;
                }
                break;
            case "{meetPlace}":
                if ($walk.hasMeetPlace) {
                    out = $walk.meetLocation.description;
                }
                break;
            case "{meetGR}":
                if ($walk.hasMeetPlace) {
                    out = $walk.meetLocation.gridref;
                }
                break;
            case "{meetPC}":
                if ($walk.hasMeetPlace) {
                    out = $walk.meetLocation.postcode;
                }
                break;
            case "{meetOLC}":
                break;
            case "{meetMapCode}":
                break;
            case "{start}":
                if ($walk.startLocation.exact) {
                    out = $walk.startLocation.timeHHMMshort;
                    if ($walk.startLocation.description) {
                        out += " at " + $walk.startLocation.description;
                    }
                }
                break;
            case "{startTime}":
                if ($walk.startLocation.exact) {
                    out = $walk.startLocation.timeHHMMshort;
                }
                break;
            case "{startPlace}":
                if ($walk.startLocation.exact) {
                    if ($walk.startLocation.description) {
                        out += $walk.startLocation.description;
                    }
                }
                break;
            case "{startGR}":
                if ($walk.startLocation.exact) {
                    out = $walk.startLocation.gridref;
                }
                break;
            case "{startPC}":
                if ($walk.startLocation.exact) {
                    out = $walk.startLocation.postcode;
                }
                break;
            case "{startOLC}":
                break;
            case "{startMapCode}":
                break;
            case "{title}":
                // out = ra.html.addslashes($walk.title);
                out = $walk.title;
                out = "<b>" + out + "</b>";
                break;
            case "{description}":
                out = $walk.description;
                break;
            case "{difficulty}":
                out = my.getWalkValue($walk, "{distance}");
                out += "<br/><span class='pointer' onclick='ra.walk.dGH()'>" + $walk.nationalGrade + "</span>";
                if ($walk.localGrade !== "") {
                    out += "<br/>" + $walk.localGrade;
                }
                break;
            case "{difficulty+}":
                out = my.getWalkValue($walk, "{distance}");
                out += "<br/>" + ra.walk.grade.disp($walk.nationalGrade, "middle") + "<br/>";
                out += "<span class='pointer' onclick='ra.walk.dGH()'>" + $walk.nationalGrade + "</span>";
                if ($walk.localGrade !== "") {
                    out += "<br/>" + $walk.localGrade;
                }
                break;
            case "{distance}":
                if ($walk.distanceMiles > 0) {
                    out = $walk.distanceMiles + "mi / " + $walk.distanceKm + "km";
                }
                break;
            case "{distanceMi}":
                if ($walk.distanceMiles > 0) {
                    out = $walk.distanceMiles + "mi";
                }
                break;
            case "{distanceKm}":
                if ($walk.distanceMiles > 0) {
                    out = $walk.distanceKm + "km";
                }
                break;
            case "{gradeimg}":
                out = ra.walk.grade.disp($walk.nationalGrade, 'details');
                break;
            case "{gradeimgRight}":
                out = ra.walk.grade.disp($walk.nationalGrade, 'right');
                break;
            case "{grade}":
                out = "<span class='pointer " + $walk.nationalGrade.replace("/ /g", "") + "' onclick='ra.walk.dGH()'>" + $walk.nationalGrade + "</span>";
                if ($walk.localGrade !== "") {
                    out += "<br/>" + $walk.localGrade;
                }
                break;
            case "{grade+}":
                out = ""; //<div>" + $walk.getGradeSpan("middle") + "</div>";
                out += "<div>" + ra.walk.grade.disp($walk.nationalGrade, "middle") + "</div>";
                out += "<span class='pointer " + $walk.nationalGrade.replace("/ /g", "") + "' onclick='ra.walk.dGH()'>" + $walk.nationalGrade + "</span>";
                if ($walk.localGrade !== "") {
                    out += "<br/>" + $walk.localGrade;
                }
                break;
            case "{nationalGrade}":
                out = "<span class='pointer' onclick='ra.walk.dGH()'>" + $walk.nationalGrade + "</span>";
                break;
            case "{nationalGradeAbbr}":
                out = "<span class='pointer' onclick='ra.walk.dGH()'>" + ra.walk.grade.abbr($walk.nationalGrade) + "</span>";
                break;
            case "{localGrade}":
                out = $walk.localGrade;
                break;
            case "{additionalNotes}":
                out = $walk.additionalNotes;
                break;
            case "{type}":
                if ($walk.isLinear) {
                    out = "Linear";
                } else {
                    out = "Circular";
                }
                break;
            case "{contact}":
                out = "";
                if ($walk.isLeader) {
                    $prefix += "Leader";
                } else {
                    $prefix += "Contact";
                }
                if ($walk.contactName !== "") {
                    out += " <b>" + $walk.contactName + "</b>";
                }
                if ($walk.email !== "") {
                    out += BR + my.getEmailLink($walk);
                }
                if ($walk.telephone1 !== "") {
                    out += BR + $walk.telephone1;
                }
                if ($walk.telephone2 !== "") {
                    out += BR + $walk.telephone2;
                }
                break;
            case "{contactname}":
                if ($walk.contactName !== '') {
                    if ($walk.isLeader) {
                        out = "Leader ";
                    } else {
                        out = "Contact ";
                    }
                    out += "<b>" + $walk.contactName + "</b>";
                }
                break;
            case "{contactperson}":
                out = $walk.contactName;
                break;
            case "{telephone}":
            case "{telephone1}":
                if ($walk.telephone1 !== "") {
                    out += $walk.telephone1;
                }
                break;
            case "{telephone2}":
                if ($walk.telephone2 !== "") {
                    out += $walk.telephone2;
                }
                break;
            case "{email}":
            case "{emailat}":
                var $contact = "";
                if ($walk.email !== "") {
                    $contact += $walk.email;
                }
                out = $contact;
                break;
            case "{emaillink}":
                if ($walk.email !== "") {
                    out = my.getEmailLink($walk);
                }
                break;
            case "{mediathumbr}":
                out = '';
                if ($walk.media.length > 0) {
                    out = "<img class='mediathumbr' src='" + $walk.media[0].url + "' >";
                }
                break;
            case "{mediathumbl}":
                out = '';
                if ($walk.media.length > 0) {
                    out = "<img class='mediathumbl' src='" + $walk.media[0].url + "' >";
                }
                break;
            case "{meetOSMap}":
                if ($walk.hasMeetPlace) {
                    var $lat = $walk.meetLocation.latitude;
                    var $long = $walk.meetLocation.longitude;
                    //      out = "<span><a href='javascript:ra.link.streetmap(" + $lat + "," + $long + ")' >[OS Map]</a></span>";
                    out = ra.link.getOSMap($lat, $long, "OS Map");
                }
                break;
            case "{meetDirections}":
                if ($walk.hasMeetPlace) {
                    var $lat = $walk.meetLocation.latitude;
                    var $long = $walk.meetLocation.longitude;
                    out = ra.loc.directionsSpan($lat, $long);
                }
                break;
            case "{startOSMap}":
                if ($walk.startLocation.exact) {
                    var $lat = $walk.startLocation.latitude;
                    var $long = $walk.startLocation.longitude;
                    //      out = "<span><a href='javascript:ra.link.streetmap(" + $lat + "," + $long + ")' >[OS Map]</a></span>";
                    out = ra.link.getOSMap($lat, $long, "OS Map");
                }
                break;
            case "{startDirections}":
                if ($walk.startLocation.exact) {
                    var $lat = $walk.startLocation.latitude;
                    var $long = $walk.startLocation.longitude;
                    out = ra.loc.directionsSpan($lat, $long);
                }
                break;
            default:
                var $found = false;
                var $response = "";
                if (typeof displayCustomValues === 'function') {
                    if ($option.startsWith("{x")) {
                        $response = displayCustomValues($option, $walk);
                        $found = $response.found;
                    }
                }
                if ($found) {
                    out += $response.out;
                } else {
                    $option = $option.replace("{", "");
                    out = $option.replace("}", "");
                }
        }
        if (out !== "") {
            return  $prefix + out;
        }
        return "";
    };
    getPrefix = function ($option) {
        var $prefix = "";
        var $loop = true;
        do {
            switch ($option.substr(0, 2)) {
                case "{;":
                    $prefix += "<br/>";
                    $option = $option.replace("{;", "{");
                    break;
                case "{,":
                    $prefix += ", ";
                    $option = $option.replace("{,", "{");
                    break;
                case "{[":
                    var $close = $option.indexOf("]");
                    if ($close > 0) {
                        $prefix += $option.substr(2, close - 2);
                        $option = "{" + $option.substr(close + 1);
                    } else {
                        $prefix += $option;
                        $option = "{}";
                    }
                    break;
                default:
                    $loop = false;
            }
        } while ($loop);
        return [$prefix, $option];
    };
    my._addWalkLink = function (id, $text, $class = "") {
        return  "<span class='pointer " + $class + "' onclick=\"" + my.DisplayWalkFunction + "(event," + id + ")\">" + $text + "</span>";
    };
    my.addWalkLink = function (id, $text, $class = "") {
        // split into text before and after span
        var st, en;
        var start = '';
        st = $text.indexOf("<span");
        en = $text.indexOf("/span>") + 6;
        if (st > -1 && en > st) {
            if (st > 0) {
                //var a = $text;
                // var _start = $text.substring(0, st);
                start = my._addWalkLink(id, $text.substring(0, st), $class);
            }
            var middle = $text.substring(st, en);
            //  var _end = $text.substr(en);
            var end = my.addWalkLink(id, $text.substr(en), $class);
            return start + middle + end;
        } else {
            return   my._addWalkLink(id, $text, $class);
    }

    };
    my.addTooltip = function ($walk, $text) {
        if ($walk.status.toLowerCase() === "cancelled") {
            return "<span data-descr='Walk Cancelled' class=' walkCancelled'>" + $text + "</span>";

        }
        if ($walk.status === "New") {
            return "<span data-descr='Walk updated " + ra.date.dowShortddmmyyyy($walk.dateUpdated) + "' class=' walkNew'>" + $text + "</span>";
        }
        return $text;
    };
    my.mediasize = function (e) {
        var size = parseInt(e.getAttribute("data-size"));
        size += 1;
        if (size === 4) {
            size = 1;
        }
        e.setAttribute("data-size", size);
    };
    my.addYear = function ($walk) {
        var d = new Date();
        var newDate = new Date(d.getTime() + 300 * 24 * 60 * 60000);
        var walkDate = ra.date._setDateTime($walk.walkDate);
        if (walkDate.getTime() < newDate.getTime()) {
            return '';
        } else {
            return ' ' + ra.date.YYYY(walkDate);
        }
    };
    _addLocationInfo = function ($title, $location) {
        var $out, $gr;
        if ($location.exact) {
            $out = "<div class='place'><b>" + $title + " Place</b>: " + $location.description + " ";
            $out += my._addDirectionsMap($location, "Google directions");
            $out += "</div>";
            if ($location.time !== "") {
                $out += ra.html.addDiv("time", "<b>Time</b>: " + $location.timeHHMMshort);
            }
            $gr = "<b>Grid Ref</b>: " + $location.gridref + " ";
            $gr += ra.link.getOSMap($location.latitude, $location.longitude, "OS Map");
            $out += ra.html.addDiv("gridref", $gr);
            $out += ra.html.addDiv("latlong", "<b>Latitude</b>: " + $location.latitude + " , <b>Longitude</b>: " + $location.longitude);
            var tagname = "ra-loc=" + $location.type;
            var tag = document.getElementById(tagname);
            if (tag !== null) {
                tag.remove();
            }
            $out += '<span id="' + tagname + '"></span>';
            // getWhat3Words($location.latitude, $location.longitude, tagname,true);
            setTimeout(function () {
                ra.w3w.get($location.latitude, $location.longitude, tagname, true);
            }, 500);
            if ($location.postcode !== "") {
                $out += _displayPostcode($location);
            }
        } else {
            if ($location.type === "Start") {
                $out = "<div class='place'>";
                $out += "Location shown is an indication of where the walk will be and <b>NOT</b> the start place: ";
                $out += ra.map.getMapLink($location.latitude, $location.longitude, "Map of area");
                $out += "<br/>Contact group if you wish to meet at the start";
                //            if ($location.type === "Start") {
//                // if ($this.displayStartTime) {
//                $out += "<div class='starttime'>Start time: " + $location.timeHHMMshort + "</div>";
//                // }
//                // if ($this.displayStartDescription) {
//                $out += "<div class='startdescription'>" + $location.description + "</div>";
//                // }
//            }
                $out += "</div>";
            }
        }

        return $out;
    };
    _displayPostcode = function ($location) {
        var $pc, $note2, $note, $distclass, $out;
        var $this = $location;
        var $dist = $this.postcodeDistance;
        //var $direction = $this.postcodeDirection;
        if ($dist <= 100) {
            $note = $this.postcode;
            $note2 = "Postcode is within 100m of location";
            $distclass = " distclose";
        } else {
            $note = "Location is " + $location.postcodeDistance.toFixed() + " metres to the " + $location.postcodeDirection + " of " + $this.postcode;
            $note2 = "Check postcode suitablility on map";
            if ($dist < 500) {
                $distclass = " distnear";
            } else {
                $distclass = " distfar";
            }
            if ($dist > 10000) {
                $note = "Postcode " + $this.postcode;
                $note2 = 'Postcode location not known';
            }
        }
        $pc = "<b>Postcode</b>: <abbr title='" + $note2 + "'>" + $note + "</abbr>";
        $out = ra.html.addDiv("postcode " + $distclass, $pc);
        return $out;
    };
    my._addDirectionsMap = function ($location, $text) {
        var $this = $location;
        var $loc, $out;
        if ($this.exact) {
            $loc = "[lat],[long]";
            $loc = $loc.replace("[lat]", $this.latitude);
            $loc = $loc.replace("[long]", $this.longitude);
            $out = "<span class='mappopup' onClick=\"javascript:ra.loc.directions(" + $loc + ")\" >[" + $text + "]</span>";
            return $out;
        } else {
            return "";
        }

    };
    my.isCancelled = function (walk) {
        return walk.status.toLowerCase() === "cancelled";
    };
    my.convertPHPWalks = function ($walks) {
        //    var $walks = JSON.parse(jsonwalks);
        var index, len, $walk;
        for (index = 0, len = $walks.length; index < len; ++index) {
            $walk = $walks[index];
            $walk.description = ra.convert_mails($walk.description);
            $walk.descriptionHtml = ra.convert_mails($walk.descriptionHtml);
            $walk.dateUpdated = $walk.dateUpdated.date;
            $walk.dateCreated = $walk.dateCreated.date;
            $walk.walkDate = $walk.walkDate.date;
            // delete $walk.day;
            // delete $walk.dayofweek;
            if ($walk.hasMeetPlace) {
                my.convertPHPLocation($walk.meetLocation);
            }
            my.convertPHPLocation($walk.startLocation);
            if ($walk.finishTime !== null) {
                $walk.finishTime = $walk.finishTime.date;
            }

        }
        return $walks;
    };
    my.convertPHPLocation = function (location) {
        location.time = new Date(location.time.date);
    };
    my.convGWEM1toWalk = function ($item) {
        var nWalk = {};
        nWalk.id = $item.id;
        nWalk.status = $item.status.value;
        nWalk.groupCode = $item.groupCode;
        nWalk.groupName = $item.groupName;
        nWalk.dateUpdated = $item.dateUpdated;
        nWalk.dateCreated = $item.dateCreated;
        nWalk.cancellationReason = $item.cancellationReason;
        nWalk.walkDate = $item.date;
        nWalk.month = ra.date.Month(nWalk.walkDate);
        nWalk.dayofweek = ra.date.dow(nWalk.walkDate);
        nWalk.detailsPageUrl = $item.url;
        nWalk.title = ra.html.convertToText($item.title);
        $item.description = ra.convert_mails($item.description);
        nWalk.descriptionHtml = $item.description;
        nWalk.description = ra.html.convertToText($item.description);
        nWalk.additionalNotes = $item.additionalNotes;
        nWalk.isLinear = $item.isLinear;
        if ($item.finishTime === null) {
            nWalk.finishTime = null;
        } else {
            nWalk.finishTime = "2000-01-01T" + $item.finishTime;
        }
//        switch ($item.finishTime) {
//            case null:
//                nWalk.finishTime = null;
//                break;
//            case "00:00:00":
//                nWalk.finishTime = null;
//                break;
//            default:
//                //            $day = nWalk.walkDate.format('Ymd ');
//                //       nWalk.finishTime = DateTime::createFromFormat('Ymd H:i:s', $day.$item.finishTime);
//                break;
//        }

        nWalk.nationalGrade = $item.difficulty.text;
        nWalk.localGrade = $item.gradeLocal;
        nWalk.distanceMiles = $item.distanceMiles;
        nWalk.distanceKm = $item.distanceKM;
        nWalk.pace = $item.pace;
        nWalk.ascentFeet = $item.ascentFeet;
        nWalk.ascentMetres = $item.ascentMetres;
        // contact details
        nWalk.email = '';
        if ($item.walkContact !== null) {
            nWalk.isLeader = $item.walkContact.isWalkLeader === "true";
            nWalk.contactName = $item.walkContact.contact.displayName.trim();
            // nWalk.emailAddr = $item.walkContact.contact.email;
            if ($item.walkContact.contact.email.length > 0) {
                nWalk.email = "email available";
            }
            // nWalk.email = str_replace("@", " (at) ", nWalk.emailAddr);
            nWalk.telephone1 = $item.walkContact.contact.telephone1;
            nWalk.telephone2 = $item.walkContact.contact.telephone2;
        }
        nWalk.walkLeader = $item.walkLeader;
// read strands
        nWalk.strands = $item.strands;
        nWalk.festivals = $item.festivals;
        nWalk.suitability = $item.suitability;
        nWalk.surroundings = $item.surroundings;
        nWalk.theme = $item.theme;
        nWalk.specialStatus = $item.specialStatus;
        nWalk.facilities = $item.facilities;

// pocess meeting and starting locations
        nWalk.hasMeetPlace = false;
        nWalk.meetLocation = null;
        nWalk.startLocation = null;
        nWalk.finishLocation = null;
        $item.points.forEach(function ($value) {
            if ($value.typeString === "Meeting") {
                nWalk.hasMeetPlace = true;
                nWalk.meetLocation = my.convertGWEM1location($value);
            }
            if ($value.typeString === "Start") {
                nWalk.startLocation = my.convertGWEM1location($value);
            }
            if ($value.typeString === "End") {
                nWalk.finishLocation = my.convertGWEM1location($value);
            }
        });
//        nWalk.createExtraData();
        nWalk.media = $item.media;

        return nWalk;
    };
    my.convertGWEM1location = function ($value) {
        var location = {};
        location.description = ra.html.convertToText($value.description);
        location.time = new Date('Jan 01 2020 ' + $value.time);
        if (location.time === false) {
            location.time = "";
            location.timeHHMM = "No time";
            location.timeHHMMshort = "No time";
        } else {
            location.timeHHMM = ra.time.HHMM(location.time);
            location.timeHHMMshort = ra.time.HHMMshort(location.time);
            if (location.timeHHMMshort === "12am") {
                location.time = "";
                location.timeHHMM = "No time";
                location.timeHHMMshort = "No time";
            }
        }
        location.gridref = $value.gridRef;
        location.easting = $value.easting;
        location.northing = $value.northing;
        location.latitude = $value.latitude;
        location.longitude = $value.longitude;
        location.postcode = $value.postcode;
        location.postcodeLatitude = $value.postcodeLatitude;
        location.postcodeLongitude = $value.postcodeLongitude;
        location.type = $value.typeString;
        location.exact = $value.showExact === true;
        if (location.postcode !== null) {
            var $lat1 = location.postcodeLatitude;
            var $lon1 = location.postcodeLongitude;
            var $lat2 = location.latitude;
            var $lon2 = location.longitude;
            location.postcodeDistance = 1000 * ra.math.round(ra.geom.distance($lat1, $lon1, $lat2, $lon2, "KM"), 3); // metres
            var direction = ra.geom.direction($lat1, $lon1, $lat2, $lon2);
            location.postcodeDirection = direction.name;
        }
        return location;
    };
    my.addWalkMarker = function (cluster, $walk, walkClass) {
        var $long, $lat, $icon, $class;
        var $popup;
        //  var $this = this.settings;
        $long = $walk.startLocation.longitude;
        $lat = $walk.startLocation.latitude;
        if ($walk.startLocation.exact) {
            $icon = ra.map.icon.markerStart();
        } else {
            $icon = ra.map.icon.markerArea();
        }
        if (ra.walk.isCancelled($walk)) {
            $icon = ra.map.icon.markerCancelled();
        }
        $popup = document.createElement('div');
        var summary = document.createElement('div');
        summary.setAttribute('class', 'pointer');
        summary.innerHTML = ra.walk.getWalkValues($walk, my.mapFormat, false);
        var id = $walk.id;
        summary.addEventListener("click", function (e) {
            ra.walk.displayWalkID(e, id);
        });
        var link = document.createElement('div');
        link.innerHTML = ra.walk.getWalkValues($walk, my.mapLinks, false);
        var grade = document.createElement('div');
        grade.setAttribute('class', 'pointer');
        grade.style.float = "right";
        grade.innerHTML = my.grade.image($walk.nationalGrade) + "<br/>" + $walk.nationalGrade;
        grade.addEventListener("click", function (e) {
            ra.walk.dGH();
        });
        $popup.appendChild(grade);
        $popup.appendChild(summary);
        $popup.appendChild(link);


        var dist = '';
        if ($walk.distanceMiles > 0) {
            dist = $walk.distanceMiles + "mi / " + $walk.distanceKm + "km";
        }
        var title = ra.date.dowShortddmm($walk.walkDate) + ra.walk.addYear($walk) + ", " + dist;
        $class = walkClass + $walk.status;


        cluster.addMarker($popup, $lat, $long, {icon: $icon, title: title, riseOnHover: true});
        return;
    };
    my.gradeCSS = function (nationalGrade) {
        var $class = "";
        switch (nationalGrade) {
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
    };
    my.dGH = function () {
        var $url;
        $url = ra.baseDirectory() + "/libraries/ramblers/pages/grades.html";
        var marker;
        ra.ajax.postUrl($url, "", marker, _displayGradesModal);
    };
    _displayGradesModal = function (marker, $html) {
        ra.modal.display($html);
    };
    my.grade = (function () {
        var grade = {};
        // get abbreviation from National Grade
        grade.abbr = function (nationalGrade) {
            switch (nationalGrade) {
                case "Easy Access":
                    return "EA";
                case "Easy":
                    return "E";
                case "Leisurely":
                    return "L";
                case "Moderate":
                    return "M";
                case "Strenuous":
                    return "S";
                case "Technical":
                    return "T";
                default:
                    return "";
            }
        };
        grade.image = function (nationalGrade) {
            var $folder = ra.baseDirectory();
            var $url = $folder + "libraries/ramblers/images/grades/";
            switch (nationalGrade) {
                case "Easy Access":
                    $url = "<img src='" + $url + "grade-ea30.jpg' alt='Easy Access' height='30' width='30'>";
                    break;
                case "Easy":
                    $url = "<img src='" + $url + "grade-e30.jpg' alt='Easy' height='30' width='30'>";
                    break;
                case "Leisurely":
                    $url = "<img src='" + $url + "grade-l30.jpg' alt='Leisurely' height='30' width='30'>";
                    break;
                case "Moderate":
                    $url = "<img src='" + $url + "grade-m30.jpg' alt='Moderate' height='30' width='30'>";
                    break;
                case "Strenuous":
                    $url = "<img src='" + $url + "grade-s30.jpg' alt='Strenuous' height='30' width='30'>";
                    break;
                case "Technical":
                    $url = "<img src='" + $url + "grade-t30.jpg' alt='Technical' height='30' width='30'>";
                    break;
            }
            return $url;
        };
        grade.disp = function (nationalGrade, $class) {
            var $tag = "";
            var $img = grade.image(nationalGrade);
            switch (nationalGrade) {
                case "Easy Access":
                    $tag = "<span data-descr='Easy Access' class='grade " + $class + "' onclick='ra.walk.dGH()'>" + $img + "</span>";
                    break;
                case "Easy":
                    $tag = "<span data-descr='Easy' class='grade " + $class + "' onclick='ra.walk.dGH()'>" + $img + "</span>";
                    break;
                case "Leisurely":
                    $tag = "<span data-descr='Leisurely' class='grade " + $class + "' onclick='ra.walk.dGH()'>" + $img + "</span>";
                    break;
                case "Moderate":
                    $tag = "<span data-descr='Moderate' class='grade " + $class + "' onclick='ra.walk.dGH()'>" + $img + "</span>";
                    break;
                case "Strenuous":
                    $tag = "<span data-descr='Strenuous' class='grade " + $class + "' onclick='ra.walk.dGH()'>" + $img + "</span>";
                    break;
                case "Technical":
                    $tag = "<span data-descr='Technical' class='grade " + $class + "' onclick='ra.walk.dGH()'>" + $img + "</span>";
                    break;
                default:
                    break;
            }
            return $tag;
        };
        return grade;
    }
    ());
    return my;
}
());