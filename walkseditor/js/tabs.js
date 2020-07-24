var document;
raTabs = function () {
    this.tabButtons = null;
    this.tagContainer = null;

    this.createTabs = function (tagContainer, options) {
        this.tagContainer = tagContainer;
        this.tabButtons = document.createElement('div');
        this.tabButtons.setAttribute('class', 'tab');
        tagContainer.appendChild(this.tabButtons);
        var index;
        var first = true;
        for (index = 0; index < options.length; index++) {
            var option = options[index];
            var button = document.createElement('button');
            button.textContent = option.name;
            this.tabButtons.appendChild(button);
            option.tabButton = button; // return button
            // set up containers
            var contentDiv = document.createElement('div');
            contentDiv.setAttribute('class', 'tabcontent');
            //   contentDiv.setAttribute('id', option.contentID);
            //  contentDiv.style.display = "block";
            this.tagContainer.appendChild(contentDiv);
            option.contentDiv = contentDiv; // return content Div
            button.whichTab = contentDiv;
            if (first) {
                contentDiv.style.display = "block";
                button.setAttribute('class', 'tablinks active');
                option.clickfunction(contentDiv);
                first = false;
            } else {
                contentDiv.style.display = "none";
                button.setAttribute('class', 'tablinks');
            }
// set up events
            button.whichTab = contentDiv;
            button.clickfunction=option.clickfunction;
            button.addEventListener("click", function (e) {
                // Declare all variables
                var i, tabcontent, tablinks;
                var contentTag = e.target.whichTab;
                // Get all elements with class="tabcontent" and hide them
                tabcontent = document.getElementsByClassName("tabcontent");
                for (i = 0; i < tabcontent.length; i++) {
                    tabcontent[i].style.display = "none";
                }

                // Get all elements with class="tablinks" and remove the class "active"
                tablinks = document.getElementsByClassName("tablinks");
                for (i = 0; i < tablinks.length; i++) {
                    tablinks[i].className = tablinks[i].className.replace(" active", "");
                }

                // Show the current tab, and add an "active" class to the button that opened the tab
                contentTag.style.display = "block";
                // document.getElementById(tabId).style.display = "block";
                this.className += " active";
            });
            button.addEventListener("click", function (e) {
                e.target.clickfunction(e.target.whichTab);
            });

        }
    };
};