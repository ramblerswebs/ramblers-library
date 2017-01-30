/* 
 * Change visibilty of calandar items for event calendar
 */

function ra_toggle_visibility(id) {
    var e = document.getElementById(id);
    if (e.style.display != 'none' )
        e.style.display = 'none';
    else
        e.style.display = '';
}
function ra_toggle_visibilities(id1, id2) {
    ra_toggle_visibility(id1);
    ra_toggle_visibility(id2);
}