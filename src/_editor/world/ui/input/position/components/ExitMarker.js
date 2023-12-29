import AbstractMarker from "./AbstractMarker.js";
import STYLE from "./ExitMarker.js.css" assert {type: "css"};

export default class ExitMarker extends AbstractMarker {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("gt-edt-world-editor-input-position-marker-exit", ExitMarker);
