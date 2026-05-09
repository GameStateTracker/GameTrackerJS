import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import TPL from "./ConnectionPoint.js.html" assert {type: "html"};
import STYLE from "./ConnectionPoint.js.css" assert {type: "css"};

export default class ConnectionPoint extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    set label(value) {
        this.setAttribute("label", value);
    }

    get label() {
        return this.getAttribute("label");
    }

    set top(value) {
        this.setIntAttribute("top", value);
    }

    get top() {
        return this.getIntAttribute("top");
    }

    set left(value) {
        this.setIntAttribute("left", value);
    }

    get left() {
        return this.getIntAttribute("left");
    }

    set scale(val) {
        this.setIntAttribute("scale", val);
    }

    get scale() {
        return this.getIntAttribute("scale");
    }

    static get observedAttributes() {
        return ["label", "top", "left", "scale"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "label": {
                if (oldValue != newValue) {
                    const labelEl = this.shadowRoot.getElementById("label");
                    labelEl.innerHTML = newValue;
                }
            } break;
            case "top": {
                this.style.top = `${newValue}px`;
            } break;
            case "left": {
                this.style.left = `${newValue}px`;
            } break;
            case "scale": {
                this.style.setProperty("--scale", newValue);
            } break;
        }
    }

}

customElements.define("gt-connection-point", ConnectionPoint);
