function displayWalk()
{
var xmlhttp;
if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
  }
else
  {// code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
xmlhttp.onreadystatechange=function()
  {
  if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
    document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
    }
  }
xmlhttp.open("GET","http://localhost/joomla3/ramblers/jsonwalks/ajax/displayWalk.php",true);
xmlhttp.send();
}



// check number of tiles viewed
function CheckTileCount() {
    var supportService = new OpenSpace.SupportService();
    supportService.getTileCount(tileCountResults); // callback to function

}
function tileCountResults(tilesUsed, maxTiles)
{
    if (maxTiles - tilesUsed < 500) {
        alert("Warning: Near limit of OS Map License, Tiles Used: " + tilesUsed + " of " + maxTiles);
    }
}

// focus map to specific grid location 
function FocusMap($east, $north) {
    osMap.setCenter(new OpenSpace.MapPoint($east, $north), 8);
}

// Set or Add a marker and optional popup window
function SetMarker($east, $north, $content, icon) {
    // Defining a marker
    pos = new OpenSpace.MapPoint($east, $north);
    size = new OpenLayers.Size(33, 45);
    offset = new OpenLayers.Pixel(-16, -36);
    infoWindowAnchor = new OpenLayers.Pixel(16, 16);
    icon = new OpenSpace.Icon(icon, size, offset, null, infoWindowAnchor);
    popUpSize = new OpenLayers.Size(250, 150);
    if ($content === "") {
        osMap.createMarker(pos, icon, null, null);
    }
    if ($content !== "") {
        osMap.createMarker(pos, icon, $content, popUpSize);
    }
}

// one 100km grid ref square
function NatGridSq(square, east, north) {
    this.square = square;
    this.east = east; // SW corner of square in kilometres
    this.north = north;
    this.getEastingKm = getEastingKm;
    this.getNorthingKm = getNorthingKm;
    this.NGSLetterPair = NGSLetterPair;

}
function getEastingKm() {
    return this.east;
}
function getNorthingKm() {
    return this.north;
}
function NGSLetterPair() {
    return this.square;
}


// the set of all the national grid squares 
function NatGridSquares() {
    this.squares = new Array();
    this.squares[0] = new NatGridSq("SV", 0, 0);
    this.squares[1] = new NatGridSq("SW", 100, 0);
    this.squares[2] = new NatGridSq("SX", 200, 0);
    this.squares[3] = new NatGridSq("SY", 300, 0);
    this.squares[4] = new NatGridSq("SZ", 400, 0);
    this.squares[5] = new NatGridSq("TV", 500, 0);
    this.squares[6] = new NatGridSq("TW", 600, 0);
    this.squares[7] = new NatGridSq("SQ", 0, 100);
    this.squares[8] = new NatGridSq("SR", 100, 100);
    this.squares[9] = new NatGridSq("SS", 200, 100);
    this.squares[10] = new NatGridSq("ST", 300, 100);
    this.squares[11] = new NatGridSq("SU", 400, 100);
    this.squares[12] = new NatGridSq("TQ", 500, 100);
    this.squares[13] = new NatGridSq("TR", 600, 100);
    this.squares[14] = new NatGridSq("SL", 0, 200);
    this.squares[15] = new NatGridSq("SM", 100, 200);
    this.squares[16] = new NatGridSq("SN", 200, 200);
    this.squares[17] = new NatGridSq("SO", 300, 200);
    this.squares[18] = new NatGridSq("SP", 400, 200);
    this.squares[19] = new NatGridSq("TL", 500, 200);
    this.squares[20] = new NatGridSq("TM", 600, 200);
    this.squares[21] = new NatGridSq("SF", 0, 300);
    this.squares[22] = new NatGridSq("SG", 100, 300);
    this.squares[23] = new NatGridSq("SH", 200, 300);
    this.squares[24] = new NatGridSq("SJ", 300, 300);
    this.squares[25] = new NatGridSq("SK", 400, 300);
    this.squares[26] = new NatGridSq("TF", 500, 300);
    this.squares[27] = new NatGridSq("TG", 600, 300);
    this.squares[28] = new NatGridSq("SA", 0, 400);
    this.squares[29] = new NatGridSq("SB", 100, 400);
    this.squares[30] = new NatGridSq("SC", 200, 400);
    this.squares[31] = new NatGridSq("SD", 300, 400);
    this.squares[32] = new NatGridSq("SE", 400, 400);
    this.squares[33] = new NatGridSq("TA", 500, 400);
    this.squares[34] = new NatGridSq("TB", 600, 400);
    this.squares[35] = new NatGridSq("NV", 0, 500);
    this.squares[36] = new NatGridSq("NW", 100, 500);
    this.squares[37] = new NatGridSq("NX", 200, 500);
    this.squares[38] = new NatGridSq("NY", 300, 500);
    this.squares[39] = new NatGridSq("NZ", 400, 500);
    this.squares[40] = new NatGridSq("OV", 500, 500);
    this.squares[41] = new NatGridSq("OW", 600, 500);
    this.squares[42] = new NatGridSq("NQ", 0, 600);
    this.squares[43] = new NatGridSq("NR", 100, 600);
    this.squares[44] = new NatGridSq("NS", 200, 600);
    this.squares[45] = new NatGridSq("NT", 300, 600);
    this.squares[46] = new NatGridSq("NU", 400, 600);
    this.squares[47] = new NatGridSq("OQ", 500, 600);
    this.squares[48] = new NatGridSq("OR", 600, 600);
    this.squares[49] = new NatGridSq("NL", 0, 700);
    this.squares[50] = new NatGridSq("NM", 100, 700);
    this.squares[51] = new NatGridSq("NN", 200, 700);
    this.squares[52] = new NatGridSq("NO", 300, 700);
    this.squares[53] = new NatGridSq("NP", 400, 700);
    this.squares[54] = new NatGridSq("OL", 500, 700);
    this.squares[55] = new NatGridSq("OM", 600, 700);
    this.squares[56] = new NatGridSq("NF", 0, 800);
    this.squares[57] = new NatGridSq("NG", 100, 800);
    this.squares[58] = new NatGridSq("NH", 200, 800);
    this.squares[59] = new NatGridSq("NJ", 300, 800);
    this.squares[60] = new NatGridSq("NK", 400, 800);
    this.squares[61] = new NatGridSq("OF", 500, 800);
    this.squares[62] = new NatGridSq("OG", 600, 800);
    this.squares[63] = new NatGridSq("NA", 0, 900);
    this.squares[64] = new NatGridSq("NB", 100, 900);
    this.squares[65] = new NatGridSq("NC", 200, 900);
    this.squares[66] = new NatGridSq("ND", 300, 900);
    this.squares[67] = new NatGridSq("NE", 400, 900);
    this.squares[68] = new NatGridSq("OA", 500, 900);
    this.squares[69] = new NatGridSq("OB", 600, 900);
    this.squares[70] = new NatGridSq("HV", 0, 1000);
    this.squares[71] = new NatGridSq("HW", 100, 1000);
    this.squares[72] = new NatGridSq("HX", 200, 1000);
    this.squares[73] = new NatGridSq("HY", 300, 1000);
    this.squares[74] = new NatGridSq("HZ", 400, 1000);
    this.squares[75] = new NatGridSq("JV", 500, 1000);
    this.squares[76] = new NatGridSq("JW", 600, 1000);
    this.squares[77] = new NatGridSq("HQ", 0, 1100);
    this.squares[78] = new NatGridSq("HR", 100, 1100);
    this.squares[79] = new NatGridSq("HS", 200, 1100);
    this.squares[80] = new NatGridSq("HT", 300, 1100);
    this.squares[81] = new NatGridSq("HU", 400, 1100);
    this.squares[82] = new NatGridSq("JQ", 500, 1100);
    this.squares[83] = new NatGridSq("JR", 600, 1100);
    this.squares[84] = new NatGridSq("HL", 0, 1200);
    this.squares[85] = new NatGridSq("HM", 100, 1200);
    this.squares[86] = new NatGridSq("HN", 200, 1200);
    this.squares[87] = new NatGridSq("HO", 300, 1200);
    this.squares[88] = new NatGridSq("HP", 400, 1200);
    this.squares[89] = new NatGridSq("JL", 500, 1200);
    this.squares[90] = new NatGridSq("JM", 600, 1200);
    this.IsValid = IsValid;
    this.getNatSq = getNatSq;
    this.to0FigGridRef = to0FigGridRef;
    this.to2FigGridRef = to2FigGridRef;
    this.to4FigGridRef = to4FigGridRef;
    this.to6FigGridRef = to6FigGridRef;
    this.to8FigGridRef = to8FigGridRef;
    this.to10FigGridRef = to10FigGridRef;
    this.gridsqPt = gridsqPt;
    this.gridsqSize = gridsqSize;
    this.toGridRef = toGridRef;
    this.gridPoint = gridPoint;
    this.getGridSquare = getGridSquare;
}
// get east and north point from grid ref text
function gridPoint(gridRef) {
    gridRef = gridRef.replace(" ", "");
    gridRef = gridRef.replace(" ", "");
    gridRef = gridRef.toUpperCase();
    switch (gridRef.length) {
        case 4:
            break;
        case 6:
            break;
        case 8:
            break;
        case 10:
            break;
        default:
            return null;
    }
    var sq;
    sq = this.getGridSquare(gridRef);
    if (sq === null) {
        return null;
    }
    var l = gridRef.length - 2;
    l = Math.floor(l / 2);
    var east = new Number(gridRef.substr(2, l));
    var north = new Number(gridRef.substr(2 + l, l));
    switch (gridRef.length) {
        case 4:
            east = east * 10000;
            north = north * 10000;
            break;
        case 6:
            east = east * 1000;
            north = north * 1000;
            break;
        case 8:
            east = east * 100;
            north = north * 100;
            break;
        case 10:
            east = east * 10;
            north = north * 10;
            break;
    }
    east = sq.getEastingKm() * 1000 + east;
    north = sq.getNorthingKm() * 1000 + north;
    var value = new OpenSpace.MapPoint(east, north);
    if (east === NaN) {
        return null;
    }
    if (north === NaN) {
        return null;
    }
    return value;
}

// Get grid square from grid ref string
function getGridSquare(gridRef) {
    if (gridRef.length < 4) {
        return null;
    }
    var letters;
    letters = gridRef.substr(0, 2);
    var x;
    var sq;
    for (x in this.squares)
    {
        sq = this.squares[x];
        if (sq.NGSLetterPair() === letters) {
            return sq;
        }
    }
    return null;

}

// get a grid square revelant to the zoom level	
function gridsqPt(zoom, eastMetres, northMetres) {
    var eastKm;
    var northKm;
    var size = gridsqSize(zoom);
    eastKm = Math.floor(eastMetres / size);
    northKm = Math.floor(northMetres / size);
    eastKm = eastKm * size;
    northKm = northKm * size;
    return new OpenSpace.MapPoint(eastKm, northKm);
}

// get the grid square size relvant to the zoom level
function gridsqSize(zoom) {
    switch (zoom) {
        case 0:
            return 100000;
        case 1:
            return 100000;
        case 2:
            return 10000;
        case 3:
            return 10000;
        case 4:
            return 10000;
        case 5:
            return 1000;
        case 6:
            return 1000;
        case 7:
            return 100;
        case 8:
            return 100;
        case 9:
            return 100;
        case 10:
            return 10;
        default:
            return 1000;
    }

}

// is the letter pair valid
function  IsValid(letters) {
    var x;
    var sq;
    for (x in this.squares)
    {
        sq = this.squares[x];
        if (sq.NGSLetterPair() === letters) {
            return true;
        }
    }
    return false;
}

// get letterpair from east and north   
function  getNatSq(eastMetres, northMetres) {

    var eastKm;
    var northKm;
    eastKm = Math.floor(eastMetres / 100000);
    northKm = Math.floor(northMetres / 100000);
    eastKm = eastKm * 100;
    northKm = northKm * 100;
    var x;
    var sq;
    var e, n;
    for (x in this.squares)
    {
        sq = this.squares[x];
        e = sq.getEastingKm();
        n = sq.getNorthingKm();
        if (sq.getEastingKm() === eastKm) {
            if (sq.getNorthingKm() === northKm) {
                return sq.NGSLetterPair();
            }
        }
    }
    return "";
}

// get grid ref text relevant to zoom level
function toGridRef(zoom, east, north) {
    switch (zoom) {
        case 0:
            return this.to0FigGridRef(east, north);
        case 1:
            return this.to0FigGridRef(east, north);
        case 2:
            return this.to2FigGridRef(east, north);
        case 3:
            return this.to2FigGridRef(east, north);
        case 4:
            return this.to2FigGridRef(east, north);
        case 5:
            return this.to4FigGridRef(east, north);
        case 6:
            return this.to4FigGridRef(east, north);
        case 7:
            return this.to6FigGridRef(east, north);
        case 8:
            return this.to6FigGridRef(east, north);
        case 9:
            return this.to6FigGridRef(east, north);
        case 10:
            return this.to8FigGridRef(east, north);
        default:
            return this.to6FigGridRef(east, north);
    }

}
function to0FigGridRef(east, north) {
    var out;
    var ll;
    ll = this.getNatSq(east, north);
    if (ll === "") {
        return "Invalid";
    }
    out = ll;
    return out;
}
function to2FigGridRef(east, north) {
    var out;
    var ll;
    ll = this.getNatSq(east, north);
    if (ll === "") {
        return "Invalid";
    }
    out = ll + " " + (east.toFixed(0)).substring(1, 2) + " " + (north.toFixed(0)).substring(1, 2);
    return out;
}
function to4FigGridRef(east, north) {
    var out;
    var ll;
    ll = this.getNatSq(east, north);
    if (ll === "") {
        return "Invalid";
    }
    out = ll + " " + (east.toFixed(0)).substring(1, 3) + " " + (north.toFixed(0)).substring(1, 3);
    return out;
}
function to6FigGridRef(east, north) {
    var out;
    var ll;
    ll = this.getNatSq(east, north);
    if (ll === "") {
        return "Invalid";
    }
    out = ll + " " + (east.toFixed(0)).substring(1, 4) + " " + (north.toFixed(0)).substring(1, 4);
    return out;
}
function to8FigGridRef(east, north) {
    var out;
    var ll;
    ll = this.getNatSq(east, north);
    if (ll === "") {
        return "Invalid";
    }
    out = ll + (east.toFixed(0)).substring(1, 5) + (north.toFixed(0)).substring(1, 5);
    return out;
}
function to10FigGridRef(east, north) {
    var out;
    var ll;
    ll = this.getNatSq(east, north);
    if (ll === "") {
        return "Invalid";
    }
    out = ll + (east.toFixed(0)).substring(1, 6) + (north.toFixed(0)).substring(1, 6);
    return out;
}

// postcode/gazetteer search code

// Variables for postcode/gazetteer searches
var inputStr, sectorFlag, globalGazArray, locationFound, zoomVal, eastVal, eastValstr, o, da;

// Start of Functions required for postcode/gazetteer searches
//clear search box when clicked on
function clearText() {
    document.getElementById("searchArea").value = "";
}

function searchPostcode()
{

//hide and clear list box
    document.getElementById('selectGaz').style.display = 'none';
    da = document.getElementById("selectGaz");
    da.options.length = 0;
    locationFound = 0;
    eastValstr = "";

//clear menu if already populated
    da.options.length = 0;
    sectorFlag = 0;

    var query = document.getElementById("searchArea");
    inputStr = query.value;
//document.getElementById("markersCheckBox").checked = false;
    document.getElementById("searchArea").value = "Enter a grid ref/place/postcode";

//ascertain if postcode sector or full postcode
    if (inputStr.length < 5)
    {
        sectorFlag = 1;
    }

//search postcode service
    postcodeService.getLonLat(inputStr, onResult);
    return;
}

//result of search postcode is passed here
function onResult(mapPoint)
{
//set zoom level depending on sector or full postcode or grid ref
    switch (sectorFlag) {
        case 0:
            zoomVal = 9;
            break;
        case 1:
            zoomVal = 5;
            break;
    }

//if not a valid PostCode, pass to gazetteer search
//an eastValStr of length three indicates no match found for postcode
    if (mapPoint !== null)
    {
        eastVal = mapPoint.getEasting();
        eastValstr = eastVal.toString();
    }

//no postcode match, so search grid ref
    if (eastValstr.length === 3 || mapPoint === null)
    {
        var mapPoint = NGSs.gridPoint(inputStr);
        if (mapPoint !== null) {
            zoomVal = 8;
            sectorFlag = 1;
            eastVal = mapPoint.getEasting();
            eastValstr = eastVal.toString();
        }
    }

//no postcode match, so search gazetteer
    if (eastValstr.length === 3 || mapPoint === null)
    {
        var osGaz = new OpenSpace.Gazetteer;
        var gazArray = osGaz.getLocations(inputStr, gazOptions);
    }

//zoom to postcode
    if (mapPoint !== null && eastValstr.length > 3)
    {
        osMap.setCenter(mapPoint, 8);
//SetMarker (mapPoint.lon,mapPoint.lat,"",'http://openspace.ordnancesurvey.co.uk/osmapapi/img_versions/img_1.0.1/OS/images/markers/round-marker-lrg-red.png');

        locationFound = 1;
        document.getElementById("postcode").value = "";
    }
    return false;
}

function gazOptions(searchVal)
{
//if one match found
    if (searchVal.length === 1)
    {
        osMap.setCenter(searchVal[0].location, 8);
//SetMarker (searchVal[0].location.long,searchVal[0].location.lat,"",'http://openspace.ordnancesurvey.co.uk/osmapapi/img_versions/img_1.0.1/OS/images/markers/round-marker-lrg-red.png');
        locationFound = 1;
    }

//if several choices, create a list box
    if (searchVal !== null && searchVal.length > 1)
    {
        locationFound = 1;
        globalGazArray = searchVal;
        o = document.createElement("OPTION");
        o.text = "Select a place";
        da.options.add(o);

//build list box
        for (var i = 0; i < searchVal.length; i++)
        {
            o = document.createElement("OPTION");
            o.text = searchVal[i].name + ", " + searchVal[i].county;
            da.options.add(o);
        }

//make list box visible
        document.getElementById('selectGaz').style.display = 'block';
    }

    if (locationFound === 0)
    {
        alert("No place, grid ref or postcode found");
    }
}

//zoom to item selected from list box
function zoomGazSel(selObj)
{
    osMap.setCenter(globalGazArray[selObj.selectedIndex - 1].location, 8);
//SetMarker (globalGazArray[selObj.selectedIndex-1].location.lon,globalGazArray[selObj.selectedIndex-1].location.lat,"",'http://openspace.ordnancesurvey.co.uk/osmapapi/img_versions/img_1.0.1/OS/images/markers/round-marker-lrg-red.png');

//hide list box
    document.getElementById('selectGaz').style.display = 'none';

//clear text field
    document.getElementById("searchArea").value = "Enter a grid ref/place/postcode";
}

