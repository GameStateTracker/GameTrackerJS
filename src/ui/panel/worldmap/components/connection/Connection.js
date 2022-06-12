import CustomElement from "/emcJS/ui/element/CustomElement.js";
import TPL from "./Connection.js.html" assert {type: "html"};
import STYLE from "./Connection.js.css" assert {type: "css"};

export default class Connection extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("gt-connection", Connection);
