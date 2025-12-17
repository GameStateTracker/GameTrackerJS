import AbstractFormElement from "/emcJS/ui/form/element/AbstractFormElement.js";
import FormElementRegistry from "/emcJS/data/registry/form/FormElementRegistry.js";
import ContextMenuManagerMixin from "/emcJS/ui/mixin/ContextMenuManagerMixin.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import {registerFocusable} from "/emcJS/util/helper/html/ElementFocusHelper.js";
import {debounce} from "/emcJS/util/Debouncer.js";
import {deepClone} from "/emcJS/util/helper/DeepClone.js";
import {
    deleteAtIndexImmuted,
    insertAtIndex,
    sortDictListByArrayImmuted
} from "/emcJS/util/helper/collection/ArrayMutations.js";
import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import LogicElementModal from "/emcJS/ui/form/element/input/logic/components/modal/LogicElementModal.js";
import ModalDialogAddTypeEntities from "../../../../modal/ModalDialogAddTypeEntities.js";
import CoordinatesInputModal from "../../../../coordinates/modal/CoordinatesInputModal.js";
import RelationCellContextMenu from "./ctxmnu/RelationCellContextMenu.js";
import PosCellContextMenu from "./ctxmnu/PosCellContextMenu.js";
import "/emcJS/ui/form/element/input/search/SearchInput.js";
import "/emcJS/ui/form/button/Button.js";
import "/emcJS/ui/dataview/datagrid/DataGrid.js";
import TPL from "./MarkerListInput.js.html" assert {type: "html"};
import STYLE from "./MarkerListInput.js.css" assert {type: "css"};

const RELATION_TYPES = [
    "Area",
    "Exit",
    "Collection",
    "Location"
];

export default class MarkerListInput extends ContextMenuManagerMixin(AbstractFormElement) {

    static get changeDebounceTime() {
        return 0;
    }

    #searchEl;

    #gridEl;

    #addEl;

    #dataManager;

    #relationSelectModal = new ModalDialogAddTypeEntities();

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
        this.#relationSelectModal.types = RELATION_TYPES;
        this.#relationSelectModal.sorted = true;
        /* --- */
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.#gridEl.addEventListener("action::remove", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowKey} = event.data;
            this.#removeElement(rowKey);
        });
        this.#gridEl.addEventListener("edit::pos", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                value, rowKey
            } = event.data;
            const currentValue = this.value ?? [];
            const index = this.#getElementIndex(rowKey);
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].pos = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("edit::visible", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                value, rowKey
            } = event.data;
            const currentValue = this.value ?? [];
            const index = this.#getElementIndex(rowKey);
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].visible = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("edit::ignoreEntryVisibility", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                value, rowKey
            } = event.data;
            const currentValue = this.value ?? [];
            const index = this.#getElementIndex(rowKey);
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].ignoreEntryVisibility = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("edit::accessPenetration", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                value, rowKey
            } = event.data;
            const currentValue = this.value ?? [];
            const index = this.#getElementIndex(rowKey);
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].accessPenetration = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("edit::mapOnly", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                value, rowKey
            } = event.data;
            const currentValue = this.value ?? [];
            const index = this.#getElementIndex(rowKey);
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].mapOnly = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("edit::rootOnly", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                value, rowKey
            } = event.data;
            const currentValue = this.value ?? [];
            const index = this.#getElementIndex(rowKey);
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].rootOnly = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("sort-change", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {newOrder} = event;
            const currentValue = this.value ?? [];
            this.value = sortDictListByArrayImmuted(currentValue, newOrder, (el) => this.#generateRowKey(el.ref));
        });
        /* --- */
        this.setContextMenu("relation-cell", RelationCellContextMenu);
        this.setContextMenu("pos-cell", PosCellContextMenu);
        this.#gridEl.addEventListener("menu", (event) => {
            const columnName = event.data.columnName;
            const rowKey = event.data.rowKey;
            if (columnName === "pos") {
                this.showContextMenu("pos-cell", event, {rowKey});
            } else if (columnName === "relation") {
                this.showContextMenu("relation-cell", event, {rowKey});
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addContextMenuHandler("relation-cell", "addbefore", (event) => {
            const {rowKey} = event.props[0];
            this.#addElement(rowKey, true);
        });
        this.addContextMenuHandler("relation-cell", "addafter", (event) => {
            const {rowKey} = event.props[0];
            this.#addElement(rowKey);
        });
        this.addContextMenuHandler("relation-cell", "remove", (event) => {
            const {rowKey} = event.props[0];
            this.#removeElement(rowKey);
        });
        this.addContextMenuHandler("pos-cell", "copyvalue", async (event) => {
            const {rowKey} = event.props[0];
            const source = this.#getElement(rowKey);
            if (source != null) {
                try {
                    const cbText = JSON.stringify(source.pos);
                    await navigator.clipboard.writeText(cbText);
                } catch {
                    Toast.error("could not write to clipboard");
                }
                Toast.success("value saved to clipboard");
            }
        });
        this.addContextMenuHandler("pos-cell", "pastevalue", async (event) => {
            const {rowKey} = event.props[0];
            const index = this.#getElementIndex(rowKey);
            if (index >= 0) {
                try {
                    const currentValue = this.value ?? [];
                    const cbText = await navigator.clipboard.readText();
                    const value = JSON.parse(cbText);
                    const newValue = deepClone(currentValue);
                    newValue[index].pos = value;
                    this.value = newValue;
                } catch {
                    Toast.error("could not read from clipboard");
                }
                Toast.success("value loaded from clipboard");
            }
        });
        this.#gridEl.addEventListener("rows-updated", () => {
            const gridId = this.#gridEl.internalId;
            const visibleLogicColumnCells = this.#gridEl.getAllCellsForColumn("visible");
            for (const [, logicCell] of visibleLogicColumnCells) {
                logicCell.name = `${gridId}-logic`;
            }
            const accessPenetrationLogicColumnCells = this.#gridEl.getAllCellsForColumn("accessPenetration");
            for (const [, logicCell] of accessPenetrationLogicColumnCells) {
                logicCell.name = `${gridId}-logic`;
            }
        });
        /* --- */
        this.#addEl = this.shadowRoot.getElementById("add");
        this.#addEl.addEventListener("click", async () => {
            this.#addElement();
        });
        /* --- */
        this.#dataManager = new SimpleDataProvider(this.#gridEl);
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#searchEl.addEventListener("change", () => {
            const options = {filter: {}};
            if (this.#searchEl.value != "") {
                options.filter = {entityName: this.#searchEl.value};
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
        return this.getJSONAttribute("value") ?? [];
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

    set readonly(value) {
        this.setBooleanAttribute("readonly", value);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
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
                visible: row.visible ?? true,
                accessPenetration: row.accessPenetration,
                mapOnly: row.mapOnly,
                rootOnly: row.rootOnly
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
        const visibleModal = LogicElementModal.getModalByName(`${gridId}-visible`);
        visibleModal.addOperatorGroup(...groupList);
        const accessPenetrationModal = LogicElementModal.getModalByName(`${gridId}-accessPenetration`);
        accessPenetrationModal.addOperatorGroup(...groupList);
        await BusyIndicatorManager.unbusy();
    }

    async removeOperatorGroup(...groupList) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const visibleModal = LogicElementModal.getModalByName(`${gridId}-visible`);
        visibleModal.removeOperatorGroup(...groupList);
        const accessPenetrationModal = LogicElementModal.getModalByName(`${gridId}-accessPenetration`);
        accessPenetrationModal.removeOperatorGroup(...groupList);
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

    async #addElement(rowKey, before = false) {
        const initialValue = this.value ?? {};
        let currentIndex = initialValue.findIndex((entry) => {
            return rowKey === this.#generateRowKey(entry.ref);
        });

        let continous = true;
        while (continous) {
            let entityEntry = null;
            let newRowKey = null;
            const currentValue = this.value ?? {};
            while (newRowKey == null) {
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
                newRowKey = this.#generateRowKey(entityEntry);
                const index = this.#getElementIndex(newRowKey);
                if (index >= 0) {
                    await ModalDialog.alert("Entry already exists", `The entry "${newRowKey}" was already added to this list. Please select another one!`);
                    newRowKey = null;
                }
            }
            const newEntry = {
                ref: entityEntry,
                pos: {
                    x: 0,
                    y: 0,
                    scale: 100
                },
                visible: true,
                ignoreEntryVisibility: false,
                accessPenetration: null,
                mapOnly: false,
                rootOnly: false
            };
            if (rowKey != null) {
                const newValue = deepClone(currentValue);
                if (!before) {
                    currentIndex++;
                }
                insertAtIndex(newValue, currentIndex, newEntry);
                this.value = newValue;
            } else {
                this.value = [
                    ...currentValue,
                    newEntry
                ];
            }
        }
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

    #getElement(rowKey) {
        const currentValue = this.value ?? [];
        return currentValue.find((entry) => {
            return rowKey === this.#generateRowKey(entry.ref);
        });
    }

    #getElementIndex(rowKey) {
        const currentValue = this.value ?? [];
        return currentValue.findIndex((entry) => {
            return rowKey === this.#generateRowKey(entry.ref);
        });
    }

}

FormElementRegistry.register("MarkerListInput", MarkerListInput);
customElements.define("gt-edt-input-marker-list", MarkerListInput);
registerFocusable("gt-edt-input-marker-list");
