import CustomElement from "/emcJS/ui/element/CustomElement.js";
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
        this.setAttribute("top", value);
    }

    get top() {
        return this.getAttribute("top");
    }

    set left(value) {
        this.setAttribute("left", value);
    }

    get left() {
        return this.getAttribute("left");
    }

    static get observedAttributes() {
        return ["label", "top", "left"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "label": {
                if (oldValue != newValue) {
                    const labelEl = this.shadowRoot.getElementById("label");
                    labelEl.innerHTML = newValue;
                }
            } break;
            case "top":
            case "left": {
                if (oldValue != newValue) {
                    this.style.left = `${this.left}px`;
                    this.style.top = `${this.top}px`;
                }
            } break;
        }
    }

}

customElements.define("gt-connection-point", ConnectionPoint);
