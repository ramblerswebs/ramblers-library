var browser = "default";
if (L.Browser.ie) {
    browser = "ie";
}
if (L.Browser.chrome) {
    browser = "chrome";
}
if (L.Browser.touch) {
    browser = "touch";
}

switch (browser) {
    case "ie":
        background.on("mousemove.focus", this._mousemoveHandler.bind(this)).
                on("mouseout.focus", this._mouseoutHandler.bind(this)).
                on("mousedown.drag", this._dragStartHandler.bind(this)).
                on("mousemove.drag", this._dragHandler.bind(this));
        L.DomEvent.on(this._container, 'mouseup', this._dragEndHandler, this);
        break;
    case "chrome":
        background.on("touchmove.drag", this._dragHandler.bind(this)).
                on("touchstart.drag", this._dragStartHandler.bind(this)).
                on("touchstart.focus", this._mousemoveHandler.bind(this));
        L.DomEvent.on(this._container, 'touchend', this._dragEndHandler, this);
        break;
    case "touch":
        background.on("touchmove.drag", this._dragHandler.bind(this)).
                on("touchstart.drag", this._dragStartHandler.bind(this)).
                on("touchstart.focus", this._mousemoveHandler.bind(this));
        L.DomEvent.on(this._container, 'touchend', this._dragEndHandler, this);
        break;

    default:
        background.on("mousemove.focus", this._mousemoveHandler.bind(this)).
                on("mouseout.focus", this._mouseoutHandler.bind(this)).
                on("mousedown.drag", this._dragStartHandler.bind(this)).
                on("mousemove.drag", this._dragHandler.bind(this));
        L.DomEvent.on(this._container, 'mouseup', this._dragEndHandler, this);
}
