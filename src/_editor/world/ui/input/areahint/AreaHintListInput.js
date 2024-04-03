import CustomFormElementDelegating from "/emcJS/ui/element/CustomFormElementDelegating.js";
import ImageSelectModal from "/emcJS/ui/form/element/select/image/components/ImageSelectModal.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import "/emcJS/ui/form/element/input/search/SearchInput.js";
import "/emcJS/ui/grid/DataGrid.js";
import TPL from "./AreaHintListInput.js.html" assert {type: "html"};
import STYLE from "./AreaHintListInput.js.css" assert {type: "css"};

export default class AreaHintListInput extends CustomFormElementDelegating {

    #value;

    #searchEl;

    #gridEl;

    #addEl;

    #dataManager;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
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
        this.#gridEl.addEventListener("action::delete", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowKey} = event.data;
            const currentValue = {...this.#value};
            if (rowKey in currentValue) {
                delete currentValue[rowKey];
                this.value = currentValue;
            }
        });
        this.#gridEl.addEventListener("edit::icon", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowKey} = event.data;
            const currentValue = {...this.#value};
            if (rowKey in currentValue) {
                currentValue[rowKey].icon = value;
            }
            this.value = currentValue;
        }));
        this.#gridEl.addEventListener("edit::counting", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowKey} = event.data;
            const currentValue = {...this.#value};
            if (rowKey in currentValue) {
                currentValue[rowKey].counting = value;
            }
            this.value = currentValue;
        }));
        /* --- */
        this.#addEl = this.shadowRoot.getElementById("add");
        this.#addEl.addEventListener("click", async () => {
            let rowKey = null;
            const currentValue = this.value ?? {};
            while (rowKey == null) {
                rowKey = await ModalDialog.prompt("Add item", "Please enter a new key");
                if (typeof rowKey !== "string") {
                    return;
                }
                if (rowKey in this.value) {
                    await ModalDialog.alert("Key already exists", `The key "${rowKey}" does already exist. Please enter another one!`);
                    rowKey = null;
                }
            }
            this.value = {
                ...currentValue,
                [rowKey]: {
                    icon: "",
                    counting: false
                }
            };
        });
        /* --- */
        this.#dataManager = new SimpleDataProvider(this.#gridEl);
        this.#dataManager.setOptions({
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
            this.#dataManager.updateOptions(options);
        }, true);
    }

    connectedCallback() {
        super.connectedCallback();
        const value = this.value;
        this.#value = value;
        this.#applyValue(value ?? {});
        this.internals.setFormValue(value);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#searchEl.disabled = disabled;
        this.#addEl.disabled = disabled;
        // TODO disable grid
    }

    formResetCallback() {
        this.value = super.value || "";
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    set value(value) {
        if (!isEqual(this.#value, value)) {
            this.#value = value;
            this.#applyValue(value ?? {});
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

    static get observedAttributes() {
        return ["value", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    if (this.#value == null) {
                        try {
                            this.#applyValue(JSON.parse(newValue));
                        } catch {
                            this.#applyValue({});
                        }
                    }
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    // TODO make everything readonly
                }
            } break;
        }
    }

    #applyValue(value) {
        const data = Object.entries(value).map((row) => {
            return {
                key: row[0],
                name: row[0],
                icon: row[1].icon,
                counting: row[1].counting
            }
        });
        this.#dataManager.setSource(data);
    }

    async setImageSelctOptionGroup(value) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modal = ImageSelectModal.getModalByName(`${gridId}-icon`);
        modal.optiongroup = value;
        await BusyIndicatorManager.unbusy();
    }

}

customElements.define("gt-edt-input-area-hint-list", AreaHintListInput);
