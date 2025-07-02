import AbstractFormElement from "/emcJS/ui/form/element/AbstractFormElement.js";
import FormElementRegistry from "/emcJS/data/registry/form/FormElementRegistry.js";
import ImageSelectModal from "/emcJS/ui/form/element/select/image/components/ImageSelectModal.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import {
    deleteAtIndexImmuted
} from "/emcJS/util/helper/collection/ArrayMutations.js";
import {
    registerFocusable
} from "/emcJS/util/helper/html/ElementFocusHelper.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import "/emcJS/ui/form/element/input/search/SearchInput.js";
import "/emcJS/ui/dataview/datagrid/DataGrid.js";
import TPL from "./AreaHintListInput.js.html" assert {type: "html"};
import STYLE from "./AreaHintListInput.js.css" assert {type: "css"};

export default class AreaHintListInput extends AbstractFormElement {

    #searchEl;

    #gridEl;

    #addEl;

    #dataManager;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("keydown", () => {
            // TODO
        });
        this.addEventListener("blur", (event) => {
            // TODO
            event.stopPropagation();
        });
        /* --- */
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.#addEl = this.shadowRoot.getElementById("add");
        /* --- */
        this.#addEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.#addElement();
        });
        /* --- */
        this.#gridEl.addEventListener("action::delete", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowKey} = event.data;
            this.#removeElement(rowKey);
        });
        /* --- */
        this.#gridEl.addEventListener("edit::icon", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowKey} = event.data;
            const currentValue = {...this.value};
            if (rowKey in currentValue) {
                currentValue[rowKey].icon = value;
            }
            this.value = currentValue;
        }));
        this.#gridEl.addEventListener("edit::counting", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowKey} = event.data;
            const currentValue = {...this.value};
            if (rowKey in currentValue) {
                currentValue[rowKey].counting = value;
            }
            this.value = currentValue;
        }));
        /* --- */
        this.#dataManager = new SimpleDataProvider(this.#gridEl);
        this.#dataManager.setConfig({
            sort: ["name"]
        });
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#searchEl.addEventListener("change", () => {
            const options = {filter: {}};
            if (this.#searchEl.value != "") {
                options.filter = {
                    name: this.#searchEl.value
                };
            }
            this.#dataManager.updateConfig(options);
        }, true);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#searchEl.disabled = disabled;
        this.#gridEl.disabled = disabled;
        this.#addEl.disabled = disabled || this.readonly;
    }

    formResetCallback() {
        this.value = super.value || "";
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

    static get observedAttributes() {
        return [...super.observedAttributes, "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "readonly": {
                if (oldValue != newValue) {
                    this.#gridEl.readonly = this.readonly;
                    this.#addEl.disabled = this.disabled || this.readonly;
                }
            } break;
        }
    }

    renderValue(value) {
        const data = Object.entries(value).map((row) => {
            return {
                key: row[0],
                ...row[1]
            };
        });
        this.#dataManager.setSource(data);
    }

    async #addElement() {
        let rowKey = null;
        while (rowKey == null) {
            rowKey = await ModalDialog.prompt("Add item", "Please enter a new key");
            if (typeof rowKey !== "string") {
                return;
            }
            const index = this.#getElementIndex(rowKey);
            if (index >= 0) {
                await ModalDialog.alert("Key already exists", `The key "${rowKey}" does already exist. Please enter another one!`);
                rowKey = null;
            }
        }
        const currentValue = this.value ?? [];
        this.value = [
            ...currentValue,
            {key: rowKey}
        ];
    }

    async #removeElement(rowKey) {
        const result = await ModalDialog.confirm("Remove entry", `Do you really want to remove the entry?\n\n${rowKey}`);
        if (result !== true) {
            return;
        }
        const currentValue = this.value ?? [];
        const index = this.#getElementIndex(rowKey);
        if (index >= 0) {
            this.value = deleteAtIndexImmuted(currentValue, index);
        }
    }

    #getElementIndex(rowKey) {
        const currentValue = this.value ?? [];
        return currentValue.findIndex((entry) => {
            return rowKey === entry.key;
        });
    }

    async setImageSelectOptionGroup(value) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modal = ImageSelectModal.getModalByName(`${gridId}-icon`);
        modal.optiongroup = value;
        await BusyIndicatorManager.unbusy();
    }

}

FormElementRegistry.register("AreaHintListInput", AreaHintListInput);
customElements.define("gt-edt-input-area-hint-list", AreaHintListInput);
registerFocusable("gt-edt-input-area-hint-list");
