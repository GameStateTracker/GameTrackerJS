import AbstractMarker from "./AbstractMarker.js";
import STYLE from "./AreaMarker.js.css" assert {type: "css"};

export default class AreaMarker extends AbstractMarker {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("gt-edt-world-editor-input-position-marker-area", AreaMarker);
