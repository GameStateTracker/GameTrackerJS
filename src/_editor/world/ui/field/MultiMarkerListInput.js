import AbstractFormInput from "/emcJS/ui/form/abstract/AbstractFormInput.js";
import FormElementRegistry from "/emcJS/data/registry/FormElementRegistry.js";
import {
    safeSetAttribute
} from "/emcJS/util/helper/ui/NodeAttributes.js";
import "../input/multimarkerlist/MultiMarkerListInput.js";
import TPL from "./MultiMarkerListInput.js.html" assert {type: "html"};
import STYLE from "./MultiMarkerListInput.js.css" assert {type: "css"};

export default class MultiMarkerListInput extends AbstractFormInput {

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

    loadMapData(mapData) {
        this.#inputEl.loadMapData(mapData);
    }

    loadConnections(connections) {
        this.#inputEl.loadConnections(connections);
    }

    addOperatorGroup(...groupList) {
        this.#inputEl.addOperatorGroup(...groupList);
    }

}

FormElementRegistry.register("MultiMarkerListInput", MultiMarkerListInput);
customElements.define("gt-edt-field-input-multi-marker-list", MultiMarkerListInput);
