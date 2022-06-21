// frameworks
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import {
    createMixin
} from "/emcJS/util/Mixin.js";

const STYLE = new GlobalStyle(`
:host([access="opened"]:not(:empty)) {
    box-shadow:
        inset 0 0 0px 2px var(--page-background-color, #ffffff),
        inset 0 0 1px 3px var(--world-entry-status-opened-color, #777777);
}
:host([access="available"]:not(:empty)) {
    box-shadow:
        inset 0 0 0px 2px var(--page-background-color, #ffffff),
        inset 0 0 1px 3px var(--world-entry-status-available-color, #00ff00);
}
:host([access="unavailable"]:not(:empty)) {
    box-shadow:
        inset 0 0 0px 2px var(--page-background-color, #ffffff),
        inset 0 0 1px 3px var(--world-entry-status-unavailable-color, #ff0000);
}
:host([access="possible"]:not(:empty)) {
    box-shadow:
        inset 0 0 0px 2px var(--page-background-color, #ffffff),
        inset 0 0 1px 3px var(--world-entry-status-possible-color, #ffff00);
}
`);

export default createMixin((superclass) => class ListMarkerMixin extends superclass {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
    }

});
