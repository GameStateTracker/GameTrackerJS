import CustomFormElementDelegating from "/emcJS/ui/element/CustomFormElementDelegating.js";
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";
import "/emcJS/ui/i18n/I18nTooltip.js";
import CoordinatesInputModal from "./components/CoordinatesInputModal.js";
import TPL from "./CoordinatesInput.js.html" assert {type: "html"};
import STYLE from "./CoordinatesInput.js.css" assert {type: "css"};

export default class CoordinatesInput extends CustomFormElementDelegating {

    #value;

    #textEl;

    #buttonEl;

    #coordinatesInputModal = new CoordinatesInputModal();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", () => {
            this.#coordinatesInputModal.value = this.value;
            this.#coordinatesInputModal.show();
        });
        this.#coordinatesInputModal.addEventListener("submit", () => {
            this.value = this.#coordinatesInputModal.value;
        });
    }

    connectedCallback() {
        const value = this.value;
        this.#value = value;
        this.internals.setFormValue(value);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#buttonEl.classList.toggle("disabled", disabled);
    }

    formResetCallback() {
        this.value = super.value || null;
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    set value(value) {
        value = this.#convertValue(value);
        if (!isEqual(this.#value, value)) {
            this.#value = value;
            this.#applyValue(value);
            this.internals.setFormValue(value);
            /* --- */
            this.dispatchEvent(new Event("change"));
        }
    }

    get value() {
        return this.#value ?? super.value;
    }

    set readonly(value) {
        this.setBooleanAttribute("readonly", value);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    set required(value) {
        this.setBooleanAttribute("required", value);
    }

    get required() {
        return this.getBooleanAttribute("required");
    }

    static get observedAttributes() {
        return ["value", "sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    if (this.#value === undefined) {
                        const value = this.#convertValue(value);
                        this.#applyValue(value);
                        this.internals.setFormValue(value);
                        /* --- */
                        this.dispatchEvent(new Event("change"));
                    }
                }
            } break;
        }
    }

    #applyValue(value) {
        const {x, y, scale = 100} = this.#convertValue(value);
        if (x == -1 || y == -1) {
            this.#textEl.innerText = "unset";
        } else {
            this.#textEl.innerText = `[${x}, ${y}] {${scale}}`;
        }
    }

    #convertValue(value) {
        if (typeof value !== "object") {
            return {x: -1, y: -1, scale: 100};
        }
        const {x, y, scale = 100} = value;
        if (x == null || y == null) {
            return {x: -1, y: -1, scale: 100};
        }
        const xValue = parseInt(x) || 0;
        const yValue = parseInt(y) || 0;
        const scaleValue = parseInt(scale) || 0;
        return {
            x: xValue,
            y: yValue,
            scale: scaleValue
        };
    }

    setCurrentMarker(currentType, currentName, currentLabel) {
        this.#coordinatesInputModal.setCurrentMarker(currentType, currentName, currentLabel);
    }

    loadMapData(mapData) {
        this.#coordinatesInputModal.loadMapData(mapData);
    }

    loadConnections(connections) {
        this.#coordinatesInputModal.loadConnections(connections);
    }

    loadEntries(entries) {
        this.#coordinatesInputModal.loadEntries(entries);
    }

}

customElements.define("gt-edt-input-coordinates", CoordinatesInput);
