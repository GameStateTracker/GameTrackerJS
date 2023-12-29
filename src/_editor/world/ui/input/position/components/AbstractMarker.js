import CustomElement from "/emcJS/ui/element/CustomElement.js";
import TPL from "./AbstractMarker.js.html" assert {type: "html"};
import STYLE from "./AbstractMarker.js.css" assert {type: "css"};

export default class AbstractMarker extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    set x(val) {
        this.setAttribute("x", val);
    }

    get x() {
        return this.getAttribute("x");
    }

    set y(val) {
        this.setAttribute("y", val);
    }

    get y() {
        return this.getAttribute("y");
    }

    set label(val) {
        this.setAttribute("label", val);
    }

    get label() {
        return this.getAttribute("label");
    }

    static get observedAttributes() {
        return ["x", "y", "label"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "x": {
                if (oldValue != newValue) {
                    this.style.left = `${newValue}px`;
                }
            } break;
            case "y": {
                if (oldValue != newValue) {
                    this.style.top = `${newValue}px`;
                }
            } break;
            case "label": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("label").innerHTML = newValue;
                }
            } break;
        }
    }

}
