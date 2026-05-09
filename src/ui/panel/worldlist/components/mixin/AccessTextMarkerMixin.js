// frameworks
import CSSTemplate from "@emcjs/fe/util/template/CSSTemplate.js";
import {createMixin} from "@emcjs/core/mixin/Mixin.js";

const STYLE = new CSSTemplate(`
:host([access="opened"]) #text {
    color: var(--world-entry-status-opened-color, #777777);
}
:host([access="available"]) #text {
    color: var(--world-entry-status-available-color, #00ff00);
}
:host([access="unavailable"]) #text {
    color: var(--world-entry-status-unavailable-color, #ff0000);
}
:host([access="possible"]) #text {
    color: var(--world-entry-status-possible-color, #ffff00);
}
`);

export default createMixin((superclass) => class TextMarkerMixin extends superclass {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
    }

});
