/* 
 * Code that is needed by the walks editor and the place editor.
 */

var ramblers;
function Ramblers() {
    this.walk = null;  // object containing the walk being edited
//    this.tabButtons = {};  // edit, map and content buttons
    this.dragLine = null;   // map line that will be dragged
    this.markerLayer = null;   // map line that will be dragged
    this.dragLineLatlng = null;  // node that will be dragged
//    this.content = null;  // id of content field
//    this.submit = null;   // id of submit button
//    this.date = null;
}
//function RamblersDomInfo() {
//    this.dataObject = null; // the part of the ramblers.walk  to be updated
//    this.items = null;  // object containing the options for a select
//    this.selectedItem = null;  // the selected item in a select element
//    this.buttons = {};  // any buttons the element needs to know about
//}
