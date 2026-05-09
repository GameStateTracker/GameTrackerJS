import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import "@emcjs/fe/ui/input/Option.js";
import AreaStateManager from "../../statemanager/world/area/AreaStateManager.js";
import StateDataEventManagerMixin from "../mixin/StateDataEventManagerMixin.js";
import TPL from "./HintButton.js.html" assert {type: "html"};
import STYLE from "./HintButton.js.css" assert {type: "css"};

const DESCRIPTION = "Set the \"Way of the Hero\"/\"Barren\" state of the area, depicting if there is any item counted towards progression";

export default class HintButton extends StateDataEventManagerMixin(CustomElement) {

    #optionEls =  new Map();

    #selectedEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("hint", (event) => {
            this.value = event.value;
        });
        this.addEventListener("click", (event) => this.next(event));
        this.addEventListener("contextmenu", (event) => this.revert(event));

        this.#optionEls.set("", this.shadowRoot.querySelector("[value='']"));
        this.#optionEls.set("woth", this.shadowRoot.querySelector("[value='woth']"));
        this.#optionEls.set("barren", this.shadowRoot.querySelector("[value='barren']"));
    }

    connectedCallback() {
        super.connectedCallback?.();
        // state
        const state = this.getState();
        if (state != null) {
            this.value = state.hint;
        }
    }

    applyDefaultValues() {
        this.value = "";
    }

    applyStateValues(state) {
        if (state != null) {
            this.value = state.hint;
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get readOnly() {
        const val = this.getAttribute("readonly");
        return !!val && val != "false";
    }

    set readOnly(val) {
        this.setAttribute("readonly", val);
    }

    static get observedAttributes() {
        return ["ref", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    // state
                    const state = AreaStateManager.get(newValue);
                    this.switchState(state);
                } break;
                case "value": {
                    if (this.#selectedEl) {
                        this.#selectedEl.classList.remove("active");
                        this.#selectedEl = null;
                    }
                    const ne = this.#optionEls.get(newValue);
                    if (ne) {
                        ne.classList.add("active");
                        this.#selectedEl = ne;
                    }
                    this.#applyTooltip();

                    const ev = new Event("change");
                    ev.oldValue = oldValue;
                    ev.value = newValue;
                    this.dispatchEvent(ev);
                } break;
            }
        }
    }

    next(event) {
        if (!this.readOnly) {
            const state = this.getState();
            if (state != null) {
                if (state.hint == "woth") {
                    state.hint = "barren";
                } else {
                    state.hint = "woth";
                }
            }
        }
        event.preventDefault();
        return false;
    }

    revert(event) {
        if (!this.readOnly) {
            const state = this.getState();
            if (state != null) {
                state.hint = "";
            }
        }
        event.preventDefault();
        return false;
    }

    #applyTooltip() {
        if (this.#selectedEl != null) {
            this.title = `${DESCRIPTION}\n\nActive value: ${this.#selectedEl.dataset.description ?? this.#selectedEl.value}`;
        } else {
            this.title = `${DESCRIPTION}\n\nActive value: [No value selected]`;
        }
    }

}

customElements.define("gt-hintbutton", HintButton);
