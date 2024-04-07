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
import {
    deleteAtIndexImmuted,
    moveInArrayImmuted
} from "/emcJS/util/helper/collection/ArrayMutations.js";
import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import LogicElementModal from "/emcJS/ui/form/element/input/logic/components/modal/LogicElementModal.js";
import ModalDialogAddTypeEntities from "../../modal/ModalDialogAddTypeEntities.js";
import CoordinatesInputModal from "../coordinates/components/CoordinatesInputModal.js";
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

    #relationSelectModal = new ModalDialogAddTypeEntities();

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
            const {rowKey} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowKey === this.#generateRowKey(entry.ref);
            });
            if (index >= 0) {
                this.value = deleteAtIndexImmuted(currentValue, index);
            }
        });
        this.#gridEl.addEventListener("edit::pos", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowKey} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowKey === this.#generateRowKey(entry.ref);
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
            const {value, rowKey} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowKey === this.#generateRowKey(entry.ref);
            });
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].visible = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("edit::listHidden", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowKey} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowKey === this.#generateRowKey(entry.ref);
            });
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].listHidden = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("move-row-up", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowKey} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowKey === this.#generateRowKey(entry.ref);
            });
            if (index > 0) {
                this.value = moveInArrayImmuted(currentValue, index, index - 1);
            }
        });
        this.#gridEl.addEventListener("move-row-down", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowKey} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowKey === this.#generateRowKey(entry.ref);
            });
            if (index + 1 < currentValue.length) {
                this.value = moveInArrayImmuted(currentValue, index, index + 1);
            }
        });
        /* --- */
        this.#addEl = this.shadowRoot.getElementById("add");
        this.#addEl.addEventListener("click", async () => {
            let continous = true;
            while (continous) {
                let entityEntry = null;
                let rowKey = null;
                const currentValue = this.value ?? [];
                while (rowKey == null) {
                    const result = await this.#relationSelectModal.show();
                    if (result == null || result === false) {
                        return;
                    }
                    entityEntry = result[0];
                    continous = result[1];
                    if (entityEntry.type == null || entityEntry.type === "" || entityEntry.name == null || entityEntry.name === "") {
                        await ModalDialog.alert("Empty entry selected", "You selected the empty entry, which can not be added. Please select another one!");
                        continue;
                    }
                    rowKey = this.#generateRowKey(entityEntry);
                    const index = currentValue.findIndex((entry) => {
                        return rowKey === this.#generateRowKey(entry.ref);
                    });
                    if (index >= 0) {
                        await ModalDialog.alert("Entry already exists", `The entry "${rowKey}" was already added to this list. Please select another one!`);
                        rowKey = null;
                    }
                }
                this.value = [
                    ...currentValue,
                    {
                        ref: entityEntry,
                        pos: {
                            x: 0,
                            y: 0,
                            scale: 100
                        },
                        visible: true,
                        listHidden: false
                    }
                ];
            }
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
        const currentList = value ?? [];
        this.#loadEntries(currentList);
        const data = currentList.map((row) => {
            return {
                key: this.#generateRowKey(row.ref),
                entityType: row.ref.type,
                entityname: row.ref.name,
                entityLabel: "",
                relation: row.ref,
                pos: row.pos,
                visible: row.visible
            };
        });
        this.#dataManager.setSource(data);
    }

    #generateRowKey(entry) {
        return `${entry.name}\n[${entry.type}]`;
    }

    async addOperatorGroup(...groupList) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modal = LogicElementModal.getModalByName(`${gridId}-visible`);
        modal.addOperatorGroup(...groupList);
        await BusyIndicatorManager.unbusy();
    }

    async removeOperatorGroup(...groupList) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modal = LogicElementModal.getModalByName(`${gridId}-visible`);
        modal.removeOperatorGroup(...groupList);
        await BusyIndicatorManager.unbusy();
    }

    async loadMapData(mapData) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modal = CoordinatesInputModal.getModalByName(`${gridId}-pos`);
        modal.loadMapData(mapData);
        await BusyIndicatorManager.unbusy();
    }

    async #loadEntries(entries) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modal = CoordinatesInputModal.getModalByName(`${gridId}-pos`);
        modal.loadEntries(entries);
        await BusyIndicatorManager.unbusy();
    }

    async loadConnections(connections) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modal = CoordinatesInputModal.getModalByName(`${gridId}-pos`);
        modal.loadConnections(connections);
        await BusyIndicatorManager.unbusy();
    }

}

customElements.define("gt-edt-input-marker-list", MarkerListInput);
