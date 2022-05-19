// frameworks
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import {
    createMixin
} from "/emcJS/util/Mixin.js";

const STYLE = new GlobalStyle(`
:host([access="opened"]:not(:empty)) {
    box-shadow:
        inset 0 0 0px 2px var(--page-background-color, #ffffff),
        inset 0 0 1px 3px var(--location-status-opened-color, var(--page-text-color, #000000));
}
:host([access="available"]:not(:empty)) {
    box-shadow:
        inset 0 0 0px 2px var(--page-background-color, #ffffff),
        inset 0 0 1px 3px var(--location-status-available-color, var(--page-text-color, #000000));
}
:host([access="unavailable"]:not(:empty)) {
    box-shadow:
        inset 0 0 0px 2px var(--page-background-color, #ffffff),
        inset 0 0 1px 3px var(--location-status-unavailable-color, var(--page-text-color, #000000));
}
:host([access="possible"]:not(:empty)) {
    box-shadow:
        inset 0 0 0px 2px var(--page-background-color, #ffffff),
        inset 0 0 1px 3px var(--location-status-possible-color, var(--page-text-color, #000000));
}
`);

export default createMixin((superclass) => class ListMarkerMixin extends superclass {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
    }

});
