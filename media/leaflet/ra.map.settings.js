/* 
 * copyright: Chris Vaughan
 * email: ruby.tuesday@ramblers-webs.org.uk
 */
var L, ra, document;
if (typeof (ra) === "undefined") {
    ra = {};
}
if (typeof (ra.map) === "undefined") {
    ra.map = {};
}
ra.map.Settings = function () {

    this.saveOptions = {
        saveSettings: false
    };
    this.controlsWithSettings = [];
    this.cookieName = '__settingsSave';
    this.add = function (tag, leafletMap) {
        ra.settings.read(this.cookieName, this.saveOptions);
        var settingsDiv = document.createElement('div');
        settingsDiv.setAttribute('class', 'settings');
        tag.appendChild(settingsDiv);
        var title = document.createElement('h4');
        title.textContent = "Settings";
        settingsDiv.appendChild(title);

        var tabOptions = {
            style: {side: 'left', // left or right
                size: 'medium'}, // normal, medium or small
            tabs: {route: {title: 'Plot Walking Route', staticContainer: false, enabled: true},
                mouse: {title: 'Mouse position', staticContainer: false, enabled: true},
                rightmouse: {title: 'Mouse Right Click', staticContainer: false, enabled: true},
                mylocation: {title: 'My Location', staticContainer: false, enabled: true},
                osinfo: {title: 'Ordnance Survey', staticContainer: false, enabled: true},
                save: {title: 'Save<sup>ON</sup>/Reset Settings', staticContainer: true, enabled: true}}
        };

        tabOptions.tabs.route.enabled = leafletMap.plotControl() !== null;
        tabOptions.tabs.mouse.enabled = leafletMap.mouseControl() !== null;
        tabOptions.tabs.rightmouse.enabled = leafletMap.rightclickControl() !== null;
        tabOptions.tabs.mylocation.enabled = leafletMap.mylocationControl() !== null;
        tabOptions.tabs.osinfo.enabled = leafletMap.osInfoControl() !== null;
        tabOptions.tabs.save.enabled = true;

        settingsDiv.addEventListener("displayTabContents", function (e) {
            var tag = e.tabDisplay.displayInElement;
            var tab = e.tabDisplay.tab;
            switch (tab) {
                case 'route':
                    leafletMap.plotControl().settingsForm(tag);
                    break;
                case 'mouse':
                    leafletMap.mouseControl().settingsForm(tag);
                    break;
                case 'rightmouse':
                    leafletMap.rightclickControl().settingsForm(tag);
                    break;
                case 'mylocation':
                    leafletMap.mylocationControl().settingsForm(tag);
                    break;
                case 'osinfo':
                    leafletMap.osInfoControl().settingsForm(tag);
                    break;
                case 'save':
                    break;
                default:
                    alert('Program error');
            }
        });
        var tabs = new ra.tabs(settingsDiv, tabOptions);
        tabs.display();
        this._addSave(tabs.getStaticContainer('save'));

        document.addEventListener("ra-setting-changed", function (e) {
            this._saveSettings();
        });
    };

    this._addSave = function (tag) {
        var hdg1 = document.createElement('h3');
        hdg1.textContent = 'Save settings between sessions';
        tag.appendChild(hdg1);
        var save = ra.html.input.yesNo(tag, '', "Save settings between sessions/future visits to web site (you accept cookies)", this.saveOptions, 'saveSettings');
        var reset = ra.html.input.action(tag, '', "Reset all settings to default values", 'Reset');
        var _this = this;
        reset.addEventListener("action", function (e) {
            _this.controlsWithSettings.forEach(function (control) {
                control.resetSettings();
            });
            setTimeout(function () {
                ra.html.input.actionReset(reset);
            }, 300);
        });
        save.addEventListener("click", function (e) {
            _this._saveSettings();

        });
    };

    this._saveSettings = function () {
        var saveValues = this.saveOptions.saveSettings;
        if (saveValues) {
            this.saveTab.innerHTML = 'Save<sup>ON</sup>/Reset Settings';
        } else {
            this.saveTab.innerHTML = 'Save<sup>OFF</sup>/Reset Settings';
        }
        ra.settings.save(saveValues, this.cookieName, this.saveOptions);
        this.controlsWithSettings.forEach(function (control) {
            control.saveSettings(saveValues);
        });
    };
};


