var document, ramblers;
function placeEditor() {

    this.addPlace = function (tag) {
        var itemsDiv = document.createElement('div');
        itemsDiv.setAttribute('class', 'location-group');
        tag.appendChild(itemsDiv);
        var input = new raInputFields;
        this._place = input.addLocation(itemsDiv, ramblers.record, 'place');
    };
}
;
placecontroller = function (tagContainer) {
    this.tagContainer = tagContainer;

    this.placeEditor = function () {
        var placeDiv = document.createElement('div');
        placeDiv.setAttribute('id', 'js-place-editor');
        this.tagContainer.appendChild(placeDiv);
        var place = new placeEditor();
        var display = new mapdisplay();
        place.addPlace(placeDiv);
        display.add(this.tagContainer);
        display.redisplay();
        display.displayLocationOnMap();
        document.addEventListener("postcodeupdate", function (e) {
            var tag = document.getElementById('js-place-editor');
            tag.innerHTML = "";
            var place = new placeEditor();
            place.addPlace(tag);
        });
    };
    this.clickMapButton = function () {
        var display = new mapdisplay();
        display.redisplay();
        display.displayLocationOnMap();
        var elmnt = document.getElementById("leafletmap");
        elmnt.scrollIntoView();
    };
    this.displayMarkersOnMap = function () {
        var display = new mapdisplay();
        display.displayLocationOnMap();
    };
    this.setSubmitButton = function () {
        var submitButton = document.getElementById(ramblers.fields.submit);
        submitButton.addEventListener("mouseover", function () {
            ramblers.controller.setInputValue('abbr', 'abbr');
            ramblers.controller.setInputValue('name', 'name');
            ramblers.controller.setInputValue('latitude', 'latitude');
            ramblers.controller.setInputValue('longitude', 'longitude');
            ramblers.controller.setInputValue('gridref10', 'gridref10');
            ramblers.controller.setInputValue('postcode', 'satnavpostcode');
            ramblers.controller.setInputValue('what3words', 'what3words_words');
        });
    };
    this.setInputValue = function (field, name) {
        var fieldtag = document.getElementById(ramblers.fields[field]);
        if (fieldtag === null) {
            alert("Program error setting field: " + field);
            return "";
        }
        if (ramblers.record.hasOwnProperty(name)) {  // Initialise value
            fieldtag.value = ramblers.record[name];
        } else {
            fieldtag.value = "";
        }
    };
};
