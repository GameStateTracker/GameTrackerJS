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
import ModalDialogRelationSelect from "/emcJS/ui/modal/input/ModalDialogRelationSelect.js";
import "/emcJS/ui/form/element/input/search/SearchInput.js";
import "/emcJS/ui/form/button/Button.js";
import "/emcJS/ui/grid/DataGrid.js";
import TPL from "./MarkerListInput.js.html" assert {type: "html"};
import STYLE from "./MarkerListInput.js.css" assert {type: "css"};

const RELATION_TYPES = [
    "Area",
    "Exit",
    "Collection",
    "Location"
];

export default class MarkerListInput extends CustomFormElementDelegating {

    #value;

    #searchEl;

    #gridEl;

    #addEl;

    #dataManager;

    #mapData = {};

    #connections = [];

    #relationSelectModal = new ModalDialogRelationSelect();

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
        this.#relationSelectModal.types = RELATION_TYPES;
        this.#relationSelectModal.sorted = true;
        /* --- */
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.#gridEl.addEventListener("action::delete", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowName} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowName === this.#generateRowName(entry.ref);
            });
            if (index >= 0) {
                const newValue = [
                    ...currentValue.slice(0, index),
                    ...currentValue.slice(index + 1)
                ];
                this.value = newValue;
            }
        });
        this.#gridEl.addEventListener("edit::pos", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowName} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowName === this.#generateRowName(entry.ref);
            });
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].pos = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("edit::visible", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowName} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowName === this.#generateRowName(entry.ref);
            });
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].visible = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("rows-updated", () => {
            this.#updateCoordinateCells();
        });
        /* --- */
        this.#addEl = this.shadowRoot.getElementById("add");
        this.#addEl.addEventListener("click", async () => {
            let entityEntry = null;
            let rowName = null;
            const currentValue = this.value ?? [];
            while (rowName == null) {
                entityEntry = await this.#relationSelectModal.show();
                if (entityEntry == null || entityEntry === false) {
                    return;
                }
                if (entityEntry.type == null || entityEntry.type === "" || entityEntry.name == null || entityEntry.name === "") {
                    await ModalDialog.alert("Empty entry selected", "You selected the empty entry, which can not be added. Please select another one!");
                    continue;
                }
                rowName = this.#generateRowName(entityEntry);
                const index = currentValue.findIndex((entry) => {
                    return rowName === this.#generateRowName(entry.ref);
                });
                if (index >= 0) {
                    await ModalDialog.alert("Entry already exists", `The entry "${rowName}" was already added to this list. Please select another one!`);
                    rowName = null;
                }
            }
            this.value = [
                ...currentValue,
                {
                    ref: entityEntry,
                    pos: {
                        x: 0,
                        y: 0
                    },
                    visible: true
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
                name: this.#generateRowName(row.ref),
                entityType: row.ref.type,
                entityName: row.ref.name,
                relation: row.ref,
                pos: row.pos,
                visible: row.visible
            }
        });
        this.#dataManager.setSource(data);
    }

    #generateRowName(entry) {
        return `${entry.name}\n[${entry.type}]`
    }

    #updateCoordinateCells = debounce(async () => {
        await BusyIndicatorManager.busy();
        const coordinatesColumCells = this.#gridEl.getAllCellsForColumn("pos");
        for (const coordinatesCell of coordinatesColumCells) {
            const rowData = coordinatesCell.rowData;
            const {entityType, entityName} = rowData;
            coordinatesCell.setCurrentMarker(entityType.toLowerCase(), entityName);
            coordinatesCell.loadMapData(this.#mapData);
            coordinatesCell.loadConnections(this.#connections);
            coordinatesCell.loadEntries(this.#value ?? []);
        }
        await BusyIndicatorManager.unbusy();
    });

    loadMapData(mapData) {
        this.#mapData = deepClone(mapData);
        this.#updateCoordinateCells();
    }

    loadConnections(connections) {
        this.#connections = deepClone(connections);
        this.#updateCoordinateCells();
    }

}

customElements.define("gt-edt-input-marker-list", MarkerListInput);
