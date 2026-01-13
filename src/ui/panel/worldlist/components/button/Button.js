
import WorldListEntry from "../abstract/Entry.js";
// import TPL from "./Button.js.html" assert {type: "html"};
import STYLE from "./Button.js.css" assert {type: "css"};

export default class WorldListButton extends WorldListEntry {

    #textEl;

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#textEl = this.shadowRoot.getElementById("text");
    }

    clickHandler(/* event */) {
        this.dispatchEvent(new Event("click"));
    }

    get text() {
        return this.getAttribute("text");
    }

    set text(val) {
        this.setAttribute("text", val);
    }

    set icon(value) {
        this.setAttribute("icon", value);
    }

    get icon() {
        return this.getAttribute("icon");
    }

    static get observedAttributes() {
        return ["text", "icon"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "text": {
                if (oldValue != newValue) {
                    this.#textEl.i18nValue = newValue;
                }
            } break;
            case "icon": {
                if (oldValue != newValue) {
                    this.#textEl.setAttribute("icon", newValue);
                }
            } break;
        }
    }

}

customElements.define("gt-worldlist-button", WorldListButton);
