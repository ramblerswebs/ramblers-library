var ramblers;
walkcontroller = function (tagContainer) {
    this.tagContainer = tagContainer;
    this.tabOptions = [];
    this.loading = true;
    this.editor = function () {
        this.tabOptions[0] = {name: 'Edit', "clickfunction": this.EditContent};
        this.tabOptions[1] = {name: 'Preview', "clickfunction": this.PreviewContent};
        this.tabOptions[2] = {name: 'Map', "clickfunction": this.MapContent};
        var tabs = new raTabs();
        tabs.createTabs(this.tagContainer, this.tabOptions);
        var map = new mapdisplay();
        map.add(this.findOption(this.tabOptions, "Map").contentDiv);
        this.loading = false;
    };
    this.viewer = function () {
        this.tabOptions[0] = {name: 'Preview', "clickfunction": this.PreviewContent};
        this.tabOptions[1] = {name: 'Map', "clickfunction": this.MapContent};
        var tabs = new raTabs();
        tabs.createTabs(this.tagContainer, this.tabOptions);
        var map = new mapdisplay();
        map.add(this.findOption(this.tabOptions, "Map").contentDiv);
        this.loading = false;
    };
    this.EditContent = function (tag) {
        // tag.innerHTML = "editor";
        var editor = new walkeditor(ramblers);
        editor.sortData();
        editor.addEditForm(tag);
    };
    this.PreviewContent = function (tag) {
        //  tag.innerHTML = "preview";
        var view = new preview();
        view.display(tag, ramblers);
    };
    this.MapContent = function (tag) {
        var display = new mapdisplay();
        display.redisplay();
        display.displayMarkersOnMap();
    };
    this.displayMarkersOnMap = function () {
        var display = new mapdisplay();
        display.displayMarkersOnMap();
    };
    this.clickMapButton = function () {
        if (this.loading) {
            return; // to allow locations to be set without flipping to map
        }
        var option = this.findOption(this.tabOptions, "Map");
        option.tabButton.dispatchEvent(new Event("click"));
    };
    this.clickEditButton = function () {
        var option = this.findOption(this.tabOptions, "Edit");
        option.tabButton.dispatchEvent(new Event("click"));
    };
    this.findOption = function (options, which) {
        var index;
        for (index = 0; index < options.length; index++) {
            var option = options[index];
            if (option.name === which) {
                return option;
            }
        }
        return null;
    };
    this.setSubmitButton = function () {
        if (ramblers.editMode) {
            var submitButton = document.getElementById(ramblers.fields.submit);
            submitButton.addEventListener("mouseover", function () {
                var editor = new walkeditor(ramblers);
                editor.sortData();
                var content = document.getElementById(ramblers.fields.content);
                content.value = JSON.stringify(ramblers.walk);
                var date = document.getElementById(ramblers.fields.date);
                date.value = ramblers.walk.basics.date;
                date.defaultValue = ramblers.walk.basics.date;
                date.setAttribute("data-local-value", ramblers.walk.basics.date);
                date.setAttribute("data-alt-value", ramblers.walk.basics.date);
            });
        }
    };
};