import CustomFormElementDelegating from "/emcJS/ui/element/CustomFormElementDelegating.js";
import ContextMenuManagerMixin from "/emcJS/ui/mixin/ContextMenuManagerMixin.js";
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
import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import CoordinatesInputModal from "../coordinates/components/CoordinatesInputModal.js";
import "/emcJS/ui/form/element/input/search/SearchInput.js";
import "/emcJS/ui/form/button/Button.js";
import "/emcJS/ui/dataview/datagrid/DataGrid.js";
import "/emcJS/ui/dataview/datagrid/DataGrid.js";
import TPL from "./ConnectionListInput.js.html" assert {type: "html"};
import STYLE from "./ConnectionListInput.js.css" assert {type: "css"};
import {
    deleteAtIndexImmuted, insertAtIndex
} from "/emcJS/util/helper/collection/ArrayMutations.js";
import CellContextMenu from "./ctxmnu/CellContextMenu.js";

export default class ConnectionListInput extends ContextMenuManagerMixin(CustomFormElementDelegating) {

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
            this.#removeElement(rowKey);
        });
        this.#gridEl.addEventListener("edit::posA", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowKey} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowKey === entry.label;
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
            const {value, rowKey} = event.data;
            const currentValue = this.value ?? [];
            const index = currentValue.findIndex((entry) => {
                return rowKey === entry.label;
            });
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].posB = value;
                this.value = newValue;
            }
        }));
        /* --- */
        this.setContextMenu("cell", CellContextMenu);
        this.#gridEl.addEventListener("menu", (event) => {
            const rowKey = event.data.rowKey;
            this.showContextMenu("cell", event, {rowKey});
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addContextMenuHandler("cell", "addbefore", (event) => {
            const {rowKey} = event.props[0];
            this.#addElement(rowKey, true);
        });
        this.addContextMenuHandler("cell", "addafter", (event) => {
            const {rowKey} = event.props[0];
            this.#addElement(rowKey);
        });
        this.addContextMenuHandler("cell", "remove", (event) => {
            const {rowKey} = event.props[0];
            this.#removeElement(rowKey);
        });
        /* --- */
        this.#addEl = this.shadowRoot.getElementById("add");
        this.#addEl.addEventListener("click", async () => {
            let rowKey = null;
            const currentValue = this.value ?? [];
            while (rowKey == null) {
                rowKey = await ModalDialog.prompt("Add label", "Please enter a label");
                if (rowKey == null || rowKey === false) {
                    return;
                }
                if (rowKey.length > 2 || rowKey === "") {
                    await ModalDialog.alert("The entered label is invalid", "The label can have 1 to 2 letters. Please enter another one!");
                    rowKey = null;
                    continue;
                }
                const index = currentValue.findIndex((entry) => {
                    return rowKey === entry.label;
                });
                if (index >= 0) {
                    await ModalDialog.alert("Label already exists", `The label "${rowKey}" was already added to this list. Please enter another one!`);
                    rowKey = null;
                }
            }
            this.value = [
                ...currentValue,
                {
                    label: rowKey,
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
        const currentList = value ?? [];
        this.#loadConnections(currentList);
        const data = currentList.map((row) => {
            return {
                key: row.label,
                name: row.label,
                entityType: "Connection",
                entityName: row.label,
                entityLabel: row.label,
                posA: row.posA,
                posB: row.posB
            };
        });
        this.#dataManager.setSource(data);
    }

    async loadMapData(mapData) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modalA = CoordinatesInputModal.getModalByName(`${gridId}-posA`);
        modalA.loadMapData(mapData);
        const modalB = CoordinatesInputModal.getModalByName(`${gridId}-posB`);
        modalB.loadMapData(mapData);
        await BusyIndicatorManager.unbusy();
    }

    async loadEntries(entries) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modalA = CoordinatesInputModal.getModalByName(`${gridId}-posA`);
        modalA.loadEntries(entries);
        const modalB = CoordinatesInputModal.getModalByName(`${gridId}-posB`);
        modalB.loadEntries(entries);
        await BusyIndicatorManager.unbusy();
    }

    async #loadConnections(connections) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modalA = CoordinatesInputModal.getModalByName(`${gridId}-posA`);
        modalA.loadConnections(connections);
        const modalB = CoordinatesInputModal.getModalByName(`${gridId}-posB`);
        modalB.loadConnections(connections);
        await BusyIndicatorManager.unbusy();
    }

    async #addElement(rowKey, before = false) {
        const initialValue = this.value ?? {};
        let currentIndex = initialValue.findIndex((entry) => {
            return rowKey === entry.label;
        });

        let newRowKey = null;
        const currentValue = this.value ?? {};
        while (newRowKey == null) {
            newRowKey = await ModalDialog.prompt("Add label", "Please enter a label");
            if (newRowKey == null || newRowKey === false) {
                return;
            }
            if (newRowKey.length > 2 || newRowKey === "") {
                await ModalDialog.alert("The entered label is invalid", "The label can have 1 to 2 letters. Please enter another one!");
                rowKey = null;
                continue;
            }
            const index = currentValue.findIndex((entry) => {
                return newRowKey === entry.label;
            });
            if (index >= 0) {
                await ModalDialog.alert("Label already exists", `The label "${rowKey}" was already added to this list. Please enter another one!`);
                newRowKey = null;
            }
        }

        const newEntry = {
            label: newRowKey,
            posA: {
                x: 0,
                y: 0
            },
            posB: {
                x: 0,
                y: 0
            }
        };
        if (rowKey != null) {
            const newValue = deepClone(currentValue);
            if (!before) {
                currentIndex++;
            }
            insertAtIndex(newValue, currentIndex, newEntry);
            this.value = newValue;
        } else {
            this.value = {
                ...initialValue,
                newEntry
            };
        }
    }

    async #removeElement(rowKey) {
        const result = await ModalDialog.confirm("Remove entry", `Do you really want to remove the entry?\n\n${rowKey}`);
        if (result !== true) {
            return;
        }
        const currentValue = this.value ?? [];
        const index = currentValue.findIndex((entry) => {
            return rowKey === entry.label;
        });
        if (index >= 0) {
            this.value = deleteAtIndexImmuted(currentValue, index);
        }
    }

}

customElements.define("gt-edt-input-connection-list", ConnectionListInput);
