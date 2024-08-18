import AbstractMarker from "./AbstractMarker.js";
import STYLE from "./LocationMarker.js.css" assert {type: "css"};

export default class LocationMarker extends AbstractMarker {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("gt-edt-world-editor-input-position-marker-location", LocationMarker);
