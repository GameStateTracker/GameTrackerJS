import AbstractFormElement from "/emcJS/ui/form/element/AbstractFormElement.js";
import FormElementRegistry from "/emcJS/data/registry/form/FormElementRegistry.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import {
    registerFocusable
} from "/emcJS/util/helper/html/getFocusableElements.js";
import {
    deepClone
} from "/emcJS/util/helper/DeepClone.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import {
    sleep
} from "/emcJS/util/process/Sleep.js";
import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import CharacterSearch from "/emcJS/util/search/CharacterSearch.js";
import LogicElementModal from "/emcJS/ui/form/element/input/logic/components/modal/LogicElementModal.js";
import "/emcJS/ui/dataview/datagrid/DataGrid.js";
import TPL from "./FilterInput.js.html" assert {type: "html"};
import STYLE from "./FilterInput.js.css" assert {type: "css"};

export default class FilterInput extends AbstractFormElement {

    #filterConfig = [];

    #searchEl;

    #gridEl;

    #dataManager;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.#gridEl.addEventListener("edit::value", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowKey} = event.data;
            const currentValue = deepClone(this.value);
            const [category, name] = rowKey.split("/");
            if (this.#hasInConfig(category, name)) {
                if (category in currentValue) {
                    currentValue[category][name] = value;
                } else {
                    currentValue[category] = {
                        [name]: value
                    };
                }
            }
            this.value = currentValue;
        }, 300));
        this.#gridEl.addEventListener("rows-updated", () => {
            const gridId = this.#gridEl.internalId;
            const logicColumnCells = this.#gridEl.getAllCellsForColumn("value");
            for (const [, logicCell] of logicColumnCells) {
                logicCell.name = `${gridId}-logic`;
            }
        });
        /* --- */
        this.#dataManager = new SimpleDataProvider(this.#gridEl);
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#searchEl.addEventListener("change", () => {
            const options = {filterFunction: false};
            if (this.#searchEl.value != "") {
                const searchValue = new CharacterSearch(this.#searchEl.value);
                options.filterFunction = (record) => {
                    return searchValue.test(record.category) || searchValue.test(record.key);
                };
            }
            this.#dataManager.updateConfig(options);
        }, true);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        const valueEls = this.querySelectorAll("gt-edt-world-editor-input-filter-group");
        for (const valueEl of valueEls) {
            valueEl.disabled = disabled;
        }
    }

    formResetCallback() {
        super.formResetCallback();
        const values = deepClone(this.value);
        const valueEls = this.querySelectorAll("gt-edt-world-editor-input-filter-group");
        for (const valueEl of valueEls) {
            const valueName = valueEl.dataset.name;
            const value = values[valueName];
            valueEl.value = value ?? {};
        }
    }

    async loadFilterConfig(config) {
        await BusyIndicatorManager.busy();
        this.#filterConfig = [];
        for (const category in config) {
            for (const name of config[category]) {
                this.#filterConfig.push({
                    category,
                    name
                });
            }
            this.renderValue(this.value);
        }
        await BusyIndicatorManager.unbusy();
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

    async renderValue(value) {
        await BusyIndicatorManager.busy();
        const filterConfig = this.#filterConfig;
        const data = [];
        for (const {category, name} of filterConfig) {
            data.push({
                category,
                key: `${category}/${name}`,
                name,
                value: value?.[category]?.[name] ?? true
            });
        }
        this.#dataManager.setSource(data);
        await sleep(1000);
        await BusyIndicatorManager.unbusy();
    }

    #hasInConfig(category, name) {
        return this.#filterConfig.some((entry) => {
            return entry.category === category && entry.name === name;
        });
    }

    async addOperatorGroup(...groupList) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modal = LogicElementModal.getModalByName(`${gridId}-logic`);
        modal.addOperatorGroup(...groupList);
        await BusyIndicatorManager.unbusy();
    }

    async removeOperatorGroup(...groupList) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modal = LogicElementModal.getModalByName(`${gridId}-logic`);
        modal.removeOperatorGroup(...groupList);
        await BusyIndicatorManager.unbusy();
    }

}

FormElementRegistry.register("FilterInput", FilterInput);
customElements.define("gt-edt-input-filter", FilterInput);
registerFocusable("gt-edt-input-filter");
