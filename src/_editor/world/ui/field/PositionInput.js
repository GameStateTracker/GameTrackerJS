import AbstractFormInput from "/emcJS/ui/form/abstract/AbstractFormInput.js";
import FormElementRegistry from "/emcJS/data/registry/form/FormElementRegistry.js";
import {
    safeSetAttribute
} from "/emcJS/util/helper/ui/NodeAttributes.js";
import "../input/position/MapPosInput.js";
import TPL from "./PositionInput.js.html" assert {type: "html"};
import STYLE from "./PositionInput.js.css" assert {type: "css"};

export default class PositionInput extends AbstractFormInput {

    #inputEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("change", () => {
            this.value = this.#inputEl.value;
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.#inputEl.value = this.value;
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    formResetCallback() {
        super.formResetCallback();
        this.#inputEl.value = this.value;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    set value(value) {
        this.#inputEl.value = value ?? this.defaultValue;
        super.value = value;
    }

    get value() {
        return super.value;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "value", newValue);
                    if (!this.isChanged) {
                        const value = this.value;
                        this.#inputEl.value = value;
                    }
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, name, newValue);
                }
            } break;
        }
    }

    loadData(map, connections, entries, currentType, currentIndex, currentLabel) {
        this.#inputEl.loadData(map, connections, entries, currentType, currentIndex, currentLabel);
    }

}

FormElementRegistry.register("PositionInput", PositionInput);
customElements.define("gt-edt-field-input-position", PositionInput);
