import AbstractFormElement from "/emcJS/ui/form/element/AbstractFormElement.js";
import FormElementRegistry from "/emcJS/data/registry/form/FormElementRegistry.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import {
    registerFocusable
} from "/emcJS/util/helper/html/getFocusableElements.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import MutationObserverManager from "/emcJS/util/observer/MutationObserverManager.js";
import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import "/emcJS/ui/form/element/input/search/SearchInput.js";
import "/emcJS/ui/dataview/datagrid/DataGrid.js";
import TPL from "./OptionAmountListInput.js.html" assert {type: "html"};
import STYLE from "./OptionAmountListInput.js.css" assert {type: "css"};

const MUTATION_CONFIG = {
    attributes: true,
    attributeFilter: ["value"]
};

export default class OptionAmountListInput extends AbstractFormElement {

    #options = [];

    #searchEl;

    #gridEl;

    #optionsContainerEl;

    #dataManager;

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, () => {
        this.#onSlotChange();
    });

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#optionsContainerEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        /* --- */
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.#gridEl.addEventListener("edit::value", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowKey} = event.data;
            const currentValue = {...this.value};
            if (rowKey in currentValue) {
                currentValue[rowKey] = value;
            }
            this.value = currentValue;
        }, 300));
        /* --- */
        this.#dataManager = new SimpleDataProvider(this.#gridEl);
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#searchEl.addEventListener("change", () => {
            const options = {filter: {}};
            if (this.#searchEl.value != "") {
                options.filter = {
                    name: this.#searchEl.value
                };
            }
            this.#dataManager.updateOptions(options);
        }, true);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#searchEl.disabled = disabled;
        this.#gridEl.disabled = disabled;
    }

    formResetCallback() {
        this.value = super.value;
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    get defaultValue() {
        return this.getJSONAttribute("value") ?? {};
    }

    set value(value) {
        if (typeof value === "string") {
            value = JSON.parse(value);
        }
        super.value = value;
    }

    get value() {
        return super.value;
    }

    getSubmitValue() {
        const res = {};
        const value = this.value;
        for (const option of this.#options) {
            res[option] = value?.[option] ?? 0;
        }
        return res;
    }

    set readonly(value) {
        this.setBooleanAttribute("readonly", value);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    set sorted(value) {
        this.setBooleanAttribute("sorted", value);
    }

    get sorted() {
        return this.getBooleanAttribute("sorted");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "readonly", "sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "readonly": {
                if (oldValue != newValue) {
                    this.#gridEl.readonly = this.readonly;
                }
            } break;
            case "sorted": {
                if (oldValue != newValue) {
                    this.#updateSort(this.sorted);
                }
            } break;
        }
    }

    #updateSort(value) {
        if (value) {
            this.#dataManager.setOptions({
                sort: ["name"]
            });
        } else {
            this.#dataManager.setOptions({
                sort: []
            });
        }
    }

    async #resolveSlottedElements() {
        await BusyIndicatorManager.busy();
        const optionNodeList = this.#optionsContainerEl.assignedElements({flatten: true}).filter((el) => el.matches("[value]"));
        /* --- */
        const oldNodes = new Set(this.#mutationObserver.getObservedNodes());
        const newNodes = new Set();
        const options = [];
        const newValue = {};
        this.#searchEl.value = "";
        const value = this.value;
        const rows = [];
        for (const el of optionNodeList) {
            const option = el.value;
            options.push(option);
            /* --- */
            const amount = value?.[option] ?? 0;
            rows.push({
                key: option,
                name: option,
                value: amount
            });
            newValue[option] = amount;
            /* --- */
            if (oldNodes.has(el)) {
                oldNodes.delete(el);
            } else {
                newNodes.add(el);
            }
        }
        for (const node of oldNodes) {
            this.#mutationObserver.unobserve(node);
        }
        for (const node of newNodes) {
            this.#mutationObserver.observe(node);
        }
        /* --- */
        this.#dataManager.setSource(rows);
        this.#options = options;
        this.value = newValue;
        /* --- */
        this.dispatchEvent(new Event("options"));
        await BusyIndicatorManager.unbusy();
    }

    renderValue(value) {
        const data = this.#options.map((name) => {
            return {
                key: name,
                name,
                value: value[name] ?? 0
            };
        });
        this.#dataManager.setSource(data);
    }

    #onSlotChange = debounce(() => {
        this.#resolveSlottedElements();
    });

}

FormElementRegistry.register("OptionAmountListInput", OptionAmountListInput);
customElements.define("gt-edt-input-option-amount-list", OptionAmountListInput);
registerFocusable("gt-edt-input-option-amount-list");
