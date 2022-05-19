// frameworks
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import {
    createMixin
} from "/emcJS/util/Mixin.js";

const STYLE = new GlobalStyle(`
:host([access="opened"]) #text {
    color: var(--location-status-opened-color, var(--page-text-color, #000000));
}
:host([access="available"]) #text {
    color: var(--location-status-available-color, var(--page-text-color, #000000));
}
:host([access="unavailable"]) #text {
    color: var(--location-status-unavailable-color, var(--page-text-color, #000000));
}
:host([access="possible"]) #text {
    color: var(--location-status-possible-color, var(--page-text-color, #000000));
}
`);

export default createMixin((superclass) => class TextMarkerMixin extends superclass {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
    }

});
