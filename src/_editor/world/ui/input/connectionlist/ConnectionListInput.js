import CustomFormElementDelegating from "/emcJS/ui/element/CustomFormElementDelegating.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import {
    deepClone
} from "/emcJS/util/helper/DeepClone.js";
import SimpleDataProvider from "/emcJS/util/grid/provider/SimpleDataProvider.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import "/emcJS/ui/form/element/input/search/SearchInput.js";
import "/emcJS/ui/form/button/Button.js";
import "/emcJS/ui/grid/DataGrid.js";
import "/emcJS/ui/grid/DataGrid.js";
import TPL from "./ConnectionListInput.js.html" assert {type: "html"};
import STYLE from "./ConnectionListInput.js.css" assert {type: "css"};

export default class ConnectionListInput extends CustomFormElementDelegating {

    #value;

    #searchEl;

    #gridEl;

    #addEl;

    #dataManager;

    #mapData = {};

    #entries = [];

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
            const {rowName} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowName === entry.label;
            });
            if (index >= 0) {
                const newValue = [
                    ...currentValue.slice(0, index),
                    ...currentValue.slice(index + 1)
                ];
                this.value = newValue;
            }
        });
        this.#gridEl.addEventListener("edit::posA", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowName} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowName === entry.label;
            });
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].posA = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("edit::posB", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowName} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowName === entry.label;
            });
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].posB = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("rows-updated", () => {
            this.#updateCoordinateCells();
        });
        /* --- */
        this.#addEl = this.shadowRoot.getElementById("add");
        this.#addEl.addEventListener("click", async () => {
            let rowName = null;
            const currentValue = this.value ?? [];
            while (rowName == null) {
                rowName = await ModalDialog.prompt("Add label", "Please enter a label");
                if (rowName == null || rowName === false) {
                    return;
                }
                if (rowName.length > 2 || rowName === "") {
                    await ModalDialog.alert("The entered label is invalid", "The label can have 1 to 2 letters. Please enter another one!");
                    rowName = null;
                    continue;
                }
                const index = currentValue.findIndex((entry) => {
                    return rowName === entry.label;
                });
                if (index >= 0) {
                    await ModalDialog.alert("Label already exists", `The label "${rowName}" was already added to this list. Please enter another one!`);
                    rowName = null;
                }
            }
            this.value = [
                ...currentValue,
                {
                    label: rowName,
                    posA: {
                        x: 0,
                        y: 0
                    },
                    posB: {
                        x: 0,
                        y: 0
                    }
                }
            ];
        });
        /* --- */
        this.#dataManager = new SimpleDataProvider(this.#gridEl);
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#searchEl.addEventListener("change", () => {
            const options = {filter: {}};
            if (this.#searchEl.value != "") {
                options.filter = {
                    entityName: this.#searchEl.value
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
            this.#applyValue(value ?? []);
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
                            this.#applyValue([]);
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
        const data = value.map((row) => {
            return {
                name: row.label,
                posA: row.posA,
                posB: row.posB
            }
        });
        this.#dataManager.setSource(data);
    }

    #updateCoordinateCells = debounce(async () => {
        await BusyIndicatorManager.busy();
        const coordinatesColumCellsA = this.#gridEl.getAllCellsForColumn("posA");
        for (const coordinatesCell of coordinatesColumCellsA) {
            const rowData = coordinatesCell.rowData;
            const {name} = rowData;
            coordinatesCell.setCurrentMarker("connection", `${name}_posA`, name);
            coordinatesCell.loadMapData(this.#mapData);
            coordinatesCell.loadConnections(this.#value ?? []);
            coordinatesCell.loadEntries(this.#entries);
        }
        const coordinatesColumCellsB = this.#gridEl.getAllCellsForColumn("posB");
        for (const coordinatesCell of coordinatesColumCellsB) {
            const rowData = coordinatesCell.rowData;
            const {name} = rowData;
            coordinatesCell.setCurrentMarker("connection", `${name}_posB`, name);
            coordinatesCell.loadMapData(this.#mapData);
            coordinatesCell.loadConnections(this.#value ?? []);
            coordinatesCell.loadEntries(this.#entries);
        }
        await BusyIndicatorManager.unbusy();
    });

    loadMapData(mapData) {
        this.#mapData = deepClone(mapData);
        this.#updateCoordinateCells();
    }

    loadEntries(entries) {
        this.#entries = deepClone(entries);
        this.#updateCoordinateCells();
    }

}

customElements.define("gt-edt-input-connection-list", ConnectionListInput);
