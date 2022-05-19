
import WorldListEntry from "../abstract/Entry.js";

export default class WorldListButton extends WorldListEntry {

    clickHandler(event) {
        this.dispatchEvent(new Event("trigger"));
    }

    get text() {
        return this.getAttribute("text");
    }

    set text(val) {
        this.setAttribute("text", val);
    }

    static get observedAttributes() {
        return ["text"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "text": {
                    const textEl = this.shadowRoot.getElementById("text");
                    if (textEl != null) {
                        textEl.i18nValue = newValue;
                    }
                } break;
            }
        }
    }

}

customElements.define("gt-worldlist-button", WorldListButton);
