import CustomFormElementDelegating from "/emcJS/ui/element/CustomFormElementDelegating.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import {
    deepClone
} from "/emcJS/util/helper/DeepClone.js";
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import {
    sleep
} from "/emcJS/util/process/Sleep.js";
import SimpleDataProvider from "/emcJS/util/grid/provider/SimpleDataProvider.js";
import CharacterSearch from "/emcJS/util/search/CharacterSearch.js";
import LogicElementModal from "/emcJS/ui/form/element/input/logic/components/modal/LogicElementModal.js";
import "/emcJS/ui/grid/DataGrid.js";
import TPL from "./FilterInput.js.html" assert {type: "html"};
import STYLE from "./FilterInput.js.css" assert {type: "css"};

export default class FilterInput extends CustomFormElementDelegating {

    #value = {};

    #filterConfig = [];

    #operatorGroups = new Set();

    #searchEl;

    #gridEl;

    #dataManager;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.#gridEl.addEventListener("edit::value", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowName} = event.data;
            const currentValue = deepClone(this.#value);
            const [category, key] = rowName.split("/");
            if (this.#hasInConfig(category, key)) {
                if (category in currentValue) {
                    currentValue[category][key] = value;
                } else {
                    currentValue[category] = {
                        [key]: value
                    };
                }
            }
            this.value = currentValue;
        }, 300));
        this.#gridEl.addEventListener("rows-updated", () => {
            const logicColumnCells = this.#gridEl.getAllCellsForColumn("value");
            for (const [, logicCell] of logicColumnCells) {
                logicCell.addOperatorGroup(...this.#operatorGroups);
            }
        });
        /* --- */
        this.#dataManager = new SimpleDataProvider(this.#gridEl);
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#searchEl.addEventListener("change", () => {
            const options = {filterFunction: false};
            if (this.#searchEl.value != "") {
                const searchValue = new CharacterSearch(this.#searchEl.value)
                options.filterFunction = (record) => {
                    return searchValue.test(record.category) || searchValue.test(record.key);
                };
            }
            this.#dataManager.updateOptions(options);
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
        this.#value = deepClone(this.value);
        const valueEls = this.querySelectorAll("gt-edt-world-editor-input-filter-group");
        for (const valueEl of valueEls) {
            const valueName = valueEl.dataset.name;
            const value = this.#value[valueName];
            valueEl.value = value ?? {};
        }
    }

    async loadFilterConfig(config) {
        await BusyIndicatorManager.busy();
        this.#filterConfig = [];
        for (const category in config) {
            for (const key of config[category]) {
                this.#filterConfig.push({
                    category,
                    key
                });
            }
            this.#applyValue();
        }
        await BusyIndicatorManager.unbusy();
    }

    set value(value) {
        if (!isEqual(this.#value, value)) {
            this.#value = deepClone(value);
            this.#notifyValueChange();
        }
    }

    get value() {
        return this.#value;
    }

    async #applyValue() {
        await BusyIndicatorManager.busy();
        const curValue = this.#value;
        const filterConfig = this.#filterConfig;
        const data = [];
        for (const {category, key} of filterConfig) {
            data.push({
                category,
                key,
                name: `${category}/${key}`,
                value: curValue?.[category]?.[key] ?? true
            });
        }
        this.#dataManager.setSource(data);
        await sleep(1000);
        await BusyIndicatorManager.unbusy();
    }

    #notifyValueChange = debounce(() => {
        this.#applyValue();
        const ev = new Event("change", {bubbles: true, cancelable: true});
        ev.value = this.#value;
        this.dispatchEvent(ev);
    });

    #hasInConfig(category, key) {
        return this.#filterConfig.some((entry) => {
            return entry.category === category && entry.key === key;
        });
    }

    async addOperatorGroup(...groupList) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modal = LogicElementModal.getModalByName(`${gridId}-value`);
        modal.addOperatorGroup(...groupList);
        await BusyIndicatorManager.unbusy();
    }

    async removeOperatorGroup(...groupList) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modal = LogicElementModal.getModalByName(`${gridId}-value`);
        modal.removeOperatorGroup(...groupList);
        await BusyIndicatorManager.unbusy();
    }

}

customElements.define("gt-edt-input-filter", FilterInput);
