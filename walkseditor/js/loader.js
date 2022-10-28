/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var document;
var L, ra;
if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.walkseditor) === "undefined") {
    ra.walkseditor = {};
}

ra.walkseditor.editplace = function (options, data) {

    this.data = data;
    this.options = options;

    this.load = function () {

        var data = this.data;
        data.editMode = true;
        data.record = {};
        var fields = data.fields;
        var property;
        for (property in fields) {
            if (fields.hasOwnProperty(property)) {
                var buttonID = fields[property];
                data.record[property] = document.getElementById(buttonID).value;
            }
        }
        if (data.record.latitude === "") {
            data.record.latitude = 0;
        } else {
            data.record.latitude = parseFloat(data.record.latitude);
        }
        if (data.record.longitude === "") {
            data.record.longitude = 0;
        } else {
            data.record.longitude = parseFloat(data.record.longitude);
        }

        if (data.record.latitude === 0 && data.record.longitude === 0) {
            data.record.isLatLongSet = false;
        } else {
            data.record.isLatLongSet = true;
        }

        var tag = document.getElementById(this.options.divId);
        this.controller = new placecontroller(tag, data);
        this.controller.placeEditor();
        this.controller.setSubmitButton();

    };


};

ra.walkseditor.editwalk = function (options, data) {

    this.data = data;

    this.load = function () {
        var data = this.data;
        data.walk = new ra.walkseditor.draftWalk();
        var date = null;
        if (this.data.walkdate !== null) {
            date = this.data.walkdate.replaceAll(' ', '-');
        }
        this.setupWalksRecord(date);

        var tag = document.getElementById(options.divId);
        var topOptions = document.createElement('div');
        topOptions.setAttribute('class', 'ra-edit-options');
        tag.appendChild(topOptions);
        var topHelp = document.createElement('div');
        topOptions.appendChild(topHelp);

        var clear = document.createElement('div');
        clear.setAttribute('class', 'clear');
        tag.appendChild(clear);
        var _this = this;
        var soptions = this.getElementOptions(this.data.fields.status);
        var coptions = this.getElementOptions(this.data.fields.category);
        this.statusSelect = this.setElementOptions(topOptions, 'Status', soptions, ra.walkseditor.help.editButtons);
         this.categorySelect = this.setElementOptions(topOptions, 'Category', coptions);
        if (coptions.items.length < 2) {
            this.categorySelect.style.display = 'none';
        }
        this.addButtons(topOptions);

        var draftwalk = this.data.walk;
        var errors = draftwalk.getNoWalkIssues();
        this.resetStatusButton(errors);
        this.statusSelect.addEventListener("mouseover", function (e) {
            var draftwalk = _this.data.walk;
            var errors = draftwalk.getNoWalkIssues();
            _this.resetStatusButton(errors);
        });
        this.statusSelect.addEventListener("change", function (e) {
            var draftwalk = _this.data.walk;
            var reason = '';
            var ele = e.target;
            var option = ele.options[ele.selectedIndex].text;
            if (option === "Cancelled") {
                reason = prompt("Please say why the walk is being cancelled");
            }
            draftwalk.setWalkStatus(option, reason);
        });

        var editorDiv = document.createElement('div');
        tag.appendChild(editorDiv);
        var editor = new ra.walkseditor.walkeditor(this.data.walk.data);
        editor.sortData();
        editor.addEditForm(editorDiv);

    };
    this.getElementOptions = function (id) {
        var element = document.getElementById(id);
        var children = element.children;
        var options = {};
        options.items = [];
        options.id = id;
        var i;
        for (i = 0; i < children.length; i++) {
            var text = children[i].textContent;
            var value = children[i].value;
            var selected = children[i].getAttribute('selected');
            var item = {text: text, value: value, selected: selected};
            options.items.push(item);
        }
        return options;
    };

    this.setElementOptions = function (tag, name, options, helpPage = null) {
        var container = document.createElement('div');
        tag.appendChild(container);
        var label = document.createElement('label');
        label.textContent = name;
        container.appendChild(label);
     
        var select = document.createElement('select');
        select.setAttribute('class', 'gwem');
        container.appendChild(select);

        var i;
        for (i = 0; i < options.items.length; i++) {
            var option = options.items[i];
            var optionTag = document.createElement('option');

            select.appendChild(optionTag);
            optionTag.textContent = option.text;
            optionTag.value = option.value;
            if (option.selected !== null) {
                optionTag.setAttribute('selected', true);
            }
        }
           if (helpPage !== null) {
            var help = new ra.help(container, helpPage);
            help.add();
        }
        return select;
    };
    this.addButtons = function (tag) {
        var _this = this;
        var submitButton = document.createElement('button');
        submitButton.setAttribute('type', 'button');
        submitButton.setAttribute('class', 'ra-button');
        submitButton.textContent = "Save";
        submitButton.addEventListener("click", function (e) {

            var element = _this.statusSelect;
            var disabled = element.selectedOptions[0].disabled;
            if (disabled) {
                alert('Cannot save: Walk has errors and must be Draft status');
            } else {
                var status = document.getElementById(_this.data.fields.status);
                status.value = _this.statusSelect.value;
                var category = document.getElementById(_this.data.fields.category);
                category.value = _this.categorySelect.value;
                var submit = document.getElementById(_this.data.fields.submit);
                submit.click();
            }

        });
        submitButton.addEventListener("mouseover", function () {
            var draftwalk = _this.data.walk;
            var walk = draftwalk.data;
            walk.admin.updated = new Date();
            var errors = draftwalk.getNoWalkIssues();
            _this.resetStatusButton(errors);
            var editor = new ra.walkseditor.walkeditor(walk);
            editor.sortData();
            var content = document.getElementById(_this.data.fields.content);
            content.value = JSON.stringify(walk);
            var date = document.getElementById(_this.data.fields.date);
            date.value = walk.basics.date;
            date.defaultValue = walk.basics.date;
            date.setAttribute("data-local-value", walk.basics.date);
            date.setAttribute("data-alt-value", walk.basics.date);
        });
        tag.appendChild(submitButton);
        var cancelButton = document.createElement('button');
        cancelButton.setAttribute('type', 'button');
        cancelButton.setAttribute('class', 'ra-button');
        cancelButton.textContent = "Cancel";
        cancelButton.addEventListener("click", function (e) {
            var cancelURL = _this.data.fields.cancel;
            window.location.replace(cancelURL);
        });
        tag.appendChild(cancelButton);

        var previewButton = document.createElement('button');
        previewButton.innerHTML = 'Preview';
        previewButton.setAttribute('class', 'ra-button');
        previewButton.addEventListener("click", function () {
            _this.data.walk.displayDetails();
        });
        tag.appendChild(previewButton);
    };

    this.resetStatusButton = function (errors) {
        var element = this.statusSelect;
        var children = element.children;
        var i;
        for (i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.value !== 'Draft') {
                if (errors > 0) {
                    child.disabled = true;
                } else {
                    child.disabled = false;
                }
            }
        }
    };
    this.setupWalksRecord = function (date) {
        var tag = document.getElementById(this.data.fields.content);

        if (tag !== null) {
            var json = tag.value;
            if (json === "") {
                json = "{}";

            }
        }
        var walk = this.data.walk;
        walk.createFromJson(json);
        if (date !== null) {
            walk.data.basics.date = date;
        }

    };


};

//ra.walkseditor.editplace = function (options, data) {
//
//    this.data = data;
//    //   var masterdiv = document.getElementById(options.divId);
//    //   this.lmap = new ra.leafletmap(masterdiv, options);
//    this.load = function () {
//
//        var data = this.data;
//        ramblers = new Ramblers();
//        ramblers.fields = data.fields;
//        ramblers.editMode = true;
//        ramblers.record = {};
//        var fields = ramblers.fields;
//        var property;
//        for (property in fields) {
//            if (fields.hasOwnProperty(property)) {
//                var buttonID = fields[property];
//                ramblers.record[property] = document.getElementById(buttonID).value;
//            }
//        }
//        if (ramblers.record.latitude === "") {
//            ramblers.record.latitude = 0;
//        } else {
//            ramblers.record.latitude = parseFloat(ramblers.record.latitude);
//        }
//        if (ramblers.record.longitude === "") {
//            ramblers.record.longitude = 0;
//        } else {
//            ramblers.record.longitude = parseFloat(ramblers.record.longitude);
//        }
//
//        if (ramblers.record.latitude === 0 && ramblers.record.longitude === 0) {
//            ramblers.record.isLatLongSet = false;
//        } else {
//            ramblers.record.isLatLongSet = true;
//        }
//
//        var tag = document.getElementById(options.divId);
//        ramblers.controller = new placecontroller(tag);
//        ramblers.controller.placeEditor();
//        ramblers.controller.setSubmitButton();
//
//    };
//
//
//};

