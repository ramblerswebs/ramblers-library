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

ra.walkseditor.submitwalkform = function (options, data) {
//  this.emailURL = "http://localhost/librarytest/libraries/ramblers/walkseditor/sendemail.php";
    this.emailURL = "libraries/ramblers/walkseditor/sendemail.php";
    this.data = data;
    this.groups = this.data.groups;
    this.email = {name: '',
        email: '',
        message: ''
    };
    this.walk = null; // object rather than just the data

    this.load = function () {
        this.walk = new ra.walkseditor.draftWalk();
        this.walk.init("", "", true);
        var tag = document.getElementById(options.divId);
        var topOptions = document.createElement('div');
        //  topOptions.setAttribute('class', 'ra-edit-options');
        tag.appendChild(topOptions);
        this.addButtons(topOptions);
        var clear = document.createElement('div');
        clear.setAttribute('class', 'clear');
        tag.appendChild(clear);

        this.editorDiv = document.createElement('div');
        tag.appendChild(this.editorDiv);
        var editor = new ra.walkseditor.walkeditor(this.walk.data, true);
        editor.sortData();
        editor.setGroups(this.groups);
        editor.addEditForm(this.editorDiv);
        var bottomOptions = document.createElement('div');
        tag.appendChild(bottomOptions);
        this.addButtons(bottomOptions);
    };
    this.addButtons = function (tag) {
        var _this = this;
        var saveButton = document.createElement('button');
        saveButton.setAttribute('type', 'button');
        saveButton.setAttribute('class', 'link-button mintcake');
        saveButton.textContent = "Save";
        saveButton.addEventListener("click", function (e) {
            _this._saveWalk();
        });
        tag.appendChild(saveButton);
        var uploadButton = new ra.walkseditor.uploadFile();
        var input = uploadButton.addButton(tag);
        input.addEventListener("upload-walk-read", function (e) {
            var walk = e.ra.walk;
            _this.walk.data = walk;
            _this.editorDiv.innerHTML = '';
            var editor = new ra.walkseditor.walkeditor(_this.walk.data, true);
            editor.sortData();
            editor.setGroups(_this.groups);
            editor.addEditForm(_this.editorDiv);
        });
        var emailButton = document.createElement('button');
        emailButton.setAttribute('type', 'button');
        emailButton.setAttribute('class', 'link-button mintcake');
        emailButton.textContent = "Submit walk by email";
        emailButton.addEventListener("click", function () {
            _this.emailModal();
        });
        tag.appendChild(emailButton);
        var previewButton = document.createElement('button');
        previewButton.innerHTML = 'Preview';
        previewButton.setAttribute('class', 'ra-button');
        previewButton.addEventListener("click", function () {
            _this.walk.displayDetails();
        });
        tag.appendChild(previewButton);
    };
    this.emailModal = function () {
        var input = new ra.walkseditor.inputFields;
        var form = document.createElement('form');
        var _this = this;
        var message = 'Send walk details to the walks co-ordinator';
        input.addHeader(form, 'h2', message);
        input.addComment(form, '', '', 'Provide any message you wish to send the walk coordinator and tell them who you are and your email address so they can contact you about the walk');
        input.addTextArea(form, 'divClass', 'Message', 8, this.email, 'message', 'Your message to the walks coordinator');
        input.addText(form, 'divClass', 'Your name', this.email, 'name', 'Your name');
        input.addEmail(form, 'divClass', 'Your email', this.email, 'email', 'Your email address');
        var messageDiv = document.createElement('div');
        form.appendChild(messageDiv);
        input.addComment(form, '', '', 'The details of the walk will be added to the email, together with an attachment containing the walk stored in JSON format');
        var emailButton = document.createElement('button');
        emailButton.setAttribute('type', 'button');
        emailButton.setAttribute('class', 'link-button mintcake');
        emailButton.textContent = "Submit";
        emailButton.addEventListener("click", function () {
            if (_this.email.message === "" || _this.email.name === "" || _this.email.email === "") {
                messageDiv.innerHTML = "You must specify your name, email address and provide a message";
            } else {
                messageDiv.innerHTML = "";
                _this.modal.setContent("Sending email ...", false, false);
                _this._emailWalk();
            }

        });
        form.appendChild(emailButton);
        this.modal = ra.modals.createModal(form, false);
    };
    this._emailWalk = function () {
        var $url = this.emailURL;
        var self = this;
        var data = {
            walk: this.walk.data,
            walkbody: this.walk.walkDetails(),
            coords: this.data.coords,
            email: this.email
        };

        var formData = new FormData();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json"
        });
        formData.append('walk', blob);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', $url, true);
        xhr.onload = function () {
            var response = JSON.parse(this.responseText);
            if (response === null) {
                self.modal.setContent('Unknown error', false);
            }
            var msg = "";
            if (response.error) {
                msg += "<p style='color:red;font-weight: bold'>ERROR OCCURRED<br/>";
                msg += response.message + "</p>";
            } else {
                msg += "<p style='color:green;font-weight: bold'>EMAIL has been sent<br/><br/>";
                msg += response.message + "</p>";
            }
            self.modal.setContent(msg, false);
        };
        xhr.send(formData);
    };


    this._saveWalk = function () {
        var walk = this.walk.data;
        var data = JSON.stringify(walk, null, "    ");
        try {
            var blob = new Blob([data], {type: "application/json"});
            // add date to file name??
            name = "walk.json";
            saveAs(blob, name);
        } catch (e) {
            blurt('Your web browser does not support his option!');
        }
    };
};
ra.walkseditor.uploadFile = function () {
    this.input = null;
    this.addButton = function (tag) {
        var uploadButton = document.createElement('button');
        // uploadButton.setAttribute('type', 'button');
        uploadButton.setAttribute('class', 'link-button mintcake');
        uploadButton.textContent = "Upload File";
        tag.appendChild(uploadButton);
        this.input = this._createInput(uploadButton);
        var _this = this;
        this.input.addEventListener('input', function (evt) {
            var files = evt.target.files; // FileList object
            var file = files[0];
            var reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    _this._readWalk(reader.result);
                };
            })(file);
            // Read in the image file as a data URL.
            reader.readAsText(file);
            _this.filename = file.name;
            return false;
        });
        uploadButton.addEventListener("click", function (e) {
            _this.input.click();
        });
        return uploadButton;
    };
    this._readWalk = function (result) {
        var walk = JSON.parse(result);
        let event = new Event("upload-walk-read", {bubbles: true}); // 

        event.ra = {};
        event.ra.walk = walk;
        this.input.dispatchEvent(event);
    };
    this._createInput = function (container) {
        var div = L.DomUtil.create('div', 'file-upload', container);
        container.appendChild(div);
        var input = document.createElement('input');
        input.setAttribute('id', "gpx-file-upload");
        input.style.display = 'none';
        input.setAttribute('type', "file");
        input.setAttribute('accept', ".json");
        div.appendChild(input);
        return input;
    };
//var xhr = new XMLHttpRequest();
//xhr.open("POST", "{{ url('bewaarplaatsen/xhrTest/') }}", true);
//xhr.setRequestHeader("Content-type", "application/json");
//xhr.send(JSON.stringify(dataRows));

};