import AbstractFormInput from "/emcJS/ui/form/abstract/AbstractFormInput.js";
import FormElementRegistry from "/emcJS/data/registry/FormElementRegistry.js";
import {
    safeSetAttribute
} from "/emcJS/util/helper/ui/NodeAttributes.js";
import "../input/filter/FilterInput.js";
import TPL from "./FilterInput.js.html" assert {type: "html"};
import STYLE from "./FilterInput.js.css" assert {type: "css"};

export default class FilterInput extends AbstractFormInput {

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

    addOperatorGroup(...groupList) {
        this.#inputEl.addOperatorGroup(...groupList);
    }

    removeOperatorGroup(...groupList) {
        this.#inputEl.removeOperatorGroup(...groupList);
    }

    loadFilterConfig(config) {
        this.#inputEl.loadFilterConfig(config);
    }

    get defaultValue() {
        return this.getJSONAttribute("value") ?? {};
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

}

FormElementRegistry.register("FilterInput", FilterInput);
customElements.define("gt-edt-field-input-filter", FilterInput);
