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
    this.emailURL = ra.baseDirectory() + "libraries/ramblers/walkseditor/sendemail.php";
    this.data = data;
    this.groups = this.data.groups;
    this.localGrades = this.data.localGrades;
    this.email = {name: '',
        email: '',
        message: ''
    };
    this.programme = new ra.walkseditor.programme();
    this.walk = null; // object rather than just the data

    this.load = function () {
        this.walk = new ra.walkseditor.draftWalk();
        this.walk.init("Draft", "", false);
        this.programme.addWalk(this.walk);
        var tag = document.getElementById(options.divId);
        var topOptions = document.createElement('div');
        topOptions.setAttribute('class', 'ra-edit-options');
        tag.appendChild(topOptions);
        this.addButtons(topOptions);
        var clear = document.createElement('div');
        clear.setAttribute('class', 'clear');
        tag.appendChild(clear);

        this.editorDiv = document.createElement('div');
        tag.appendChild(this.editorDiv);
        var editor = new ra.walkseditor.walkeditor();
        // editor.sortData();
        editor.setGroups(this.groups);
        editor.setLocalGrades(this.localGrades);
        editor.load(this.editorDiv, this.walk.data, true);

    };
    this.addButtons = function (tag) {

        var _this = this;
        var helpSpan = document.createElement('div');
        helpSpan.style.cssFloat = "right";
        tag.appendChild(helpSpan);
        new ra.help(helpSpan, ra.walkseditor.help.formOptions).add();

        var previewButton = document.createElement('button');
        previewButton.textContent = 'Preview walk';
        previewButton.title = 'Preview walk and see outstanding issues';
        previewButton.setAttribute('class', 'ra-button');
        previewButton.addEventListener("click", function () {
            _this.walk.previewWalk();
        });
        tag.appendChild(previewButton);

        var emailButton = document.createElement('button');
        emailButton.setAttribute('type', 'button');
        emailButton.setAttribute('class', 'ra-button');
        emailButton.textContent = "Email walk to group";
        emailButton.title = "Email walk to the Groups' Programme Sec/Walks co-ordinators";
        emailButton.addEventListener("click", function () {
            _this.emailModal();
        });
        tag.appendChild(emailButton);

        var saveButton = document.createElement('button');
        saveButton.setAttribute('type', 'button');
        saveButton.setAttribute('class', 'ra-button');
        saveButton.textContent = "Save walk";
        saveButton.title = "Save walk to PC to update later";
        saveButton.addEventListener("click", function (e) {
            _this._saveWalk();
        });
        tag.appendChild(saveButton);

        var uploadButton = document.createElement('button');
        // uploadButton.setAttribute('type', 'button');
        uploadButton.setAttribute('class', 'ra-button');
        uploadButton.textContent = "Read walk";
        uploadButton.title = "Read/Upload previously saved walk";
        tag.appendChild(uploadButton);

        var upload = new ra.uploadFile();
        upload.addField(uploadButton, ".walks,.json");
        uploadButton.addEventListener("upload-file-read", function (e) {
            var walks = JSON.parse(e.ra.result);
            if (walks.length > 1) {
                alert("More than one walk in upload file, only the first walk has been read");
            }
            walks.every(function (walk, index) {
                if (index > 0) {
                    return false;
                }
                var newWalk = new ra.walkseditor.draftWalk();
                newWalk.createFromObject(walk);
                _this.programme.clearItems();
                _this.programme.addWalk(newWalk);
                _this.walk = newWalk;
                _this.editorDiv.innerHTML = '';
                var editor = new ra.walkseditor.walkeditor();
                //   editor.sortData();
                editor.setGroups(_this.groups);
                editor.setLocalGrades(_this.localGrades);
                editor.load(_this.editorDiv, newWalk.data, true);
            });

        });

        return tag;
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
        var fromSite = window.location.href;
        var data = {
            fromSite: fromSite,
            walk: [this.walk.data],
            walkbody: this.walk.walkDetails(),
            coords: this.data.coords,
            email: this.email,
            subject:'[Submit walk] from - '+this.email.name
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
        var walks = [];
        walks.push(this.walk.data);
        var data = JSON.stringify(walks, null, "    ");
        try {
            var blob = new Blob([data], {type: "application/json"});
            // add date to file name??
            name = "groupwalk.walks";
            saveAs(blob, name);
        } catch (e) {
            blurt('Your web browser does not support his option!');
        }
    };
};