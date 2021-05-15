displayCustomValues = function ($option, $walk) {
    $response = {};
    $response.found = true;
    $response.out = "";
    switch ($option) {
        case "{xSymbol}":
            /* Picnic or Pub icon */
            if ($walk.additionalNotes.includes("picnic")) {
                $response.out = '<img src="libraries/ramblers/jsonwalks/sr02/Sandwich-icon.png" title="Picnic Required" width="24" height="24" align="left"/>';
                break;
            }
            if ($walk.additionalNotes.includes("pub")) {
                $response.out = '<img src="libraries/ramblers/jsonwalks/sr02/beer.png" title="Pub Lunch" width="24" height="24" align="left"/>';
            }
            break;
        case "{xNationalGrade}":
            $response.out = $walk.nationalGrade.toUpperCase();
            break;
        case "{xContact}":
            $response.out = "<b>" + $walk.contactName + "</b>";
            break;
        default:
            $response.found = false;
            break;
    }

    return $response;
};

displayTableRowClass = function ($walk) {
    var $class = "leisurely";
    var $day = $walk.dayofweek;
    if ($walk.isLinear && ($day === "Wednesday")) {
        $class = "sr02linear";
    } else {
        switch ($walk.nationalGrade) {
            case "Easy" :
                $class = "sr02easy";
                break;
            case "Leisurely" :
                $class = "sr02leisurely";
                break;
            case "Moderate" :
                $class = "sr02moderate";
                break;
            case "Strenuous" :
                $class = "sr02strenuous";
                break;
        }
    }
    return $class;
};