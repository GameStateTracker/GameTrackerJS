import AbstractFormElement from "/emcJS/ui/form/element/AbstractFormElement.js";
import FormElementRegistry from "/emcJS/data/registry/form/FormElementRegistry.js";
import ContextMenuManagerMixin from "/emcJS/ui/mixin/ContextMenuManagerMixin.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import {debounce} from "/emcJS/util/Debouncer.js";
import {deepClone} from "/emcJS/util/helper/DeepClone.js";
import {
    deleteAtIndexImmuted, insertAtIndex
} from "/emcJS/util/helper/collection/ArrayMutations.js";
import {registerFocusable} from "/emcJS/util/helper/html/ElementFocusHelper.js";
import Axes2D from "/emcJS/enum/Axes2D.js";
import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import CoordinatesInputModal from "../../../../coordinates/modal/CoordinatesInputModal.js";
import PosCellContextMenu from "./ctxmnu/PosCellContextMenu.js";
import NameCellContextMenu from "./ctxmnu/NameCellContextMenu.js";
import "/emcJS/ui/form/element/input/search/SearchInput.js";
import "/emcJS/ui/form/button/Button.js";
import "/emcJS/ui/dataview/datagrid/DataGrid.js";
import "/emcJS/ui/dataview/datagrid/DataGrid.js";
import TPL from "./ConnectionListInput.js.html" assert {type: "html"};
import STYLE from "./ConnectionListInput.js.css" assert {type: "css"};

export default class ConnectionListInput extends ContextMenuManagerMixin(AbstractFormElement) {

    static get changeDebounceTime() {
        return 0;
    }

    static get AXES() {
        return Axes2D;
    }

    #searchEl;

    #gridEl;

    #addEl;

    #dataManager;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
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
        this.#gridEl.addEventListener("action::remove", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowKey} = event.data;
            this.#removeElement(rowKey);
        });
        this.#gridEl.addEventListener("edit::posA", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                value, rowKey
            } = event.data;
            const currentValue = this.value ?? [];
            const index = this.#getElementIndex(rowKey);
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].posA = value;
                this.value = newValue;
                this.dispatchEvent(new Event("input", {
                    bubbles: true,
                    cancelable: true
                }));
            }
        }));
        this.#gridEl.addEventListener("edit::posB", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                value, rowKey
            } = event.data;
            const currentValue = this.value ?? [];
            const index = this.#getElementIndex(rowKey);
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[index].posB = value;
                this.value = newValue;
                this.dispatchEvent(new Event("input", {
                    bubbles: true,
                    cancelable: true
                }));
            }
        }));
        /* --- */
        this.setContextMenu("name-cell", NameCellContextMenu);
        this.setContextMenu("pos-cell", PosCellContextMenu);
        this.#gridEl.addEventListener("menu", (event) => {
            const columnName = event.data.columnName;
            const rowKey = event.data.rowKey;
            if (columnName === "posA" || columnName === "posB") {
                this.showContextMenu("pos-cell", event, {
                    rowKey,
                    columnName
                });
            } else if (columnName === "name") {
                this.showContextMenu("name-cell", event, {rowKey});
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addContextMenuHandler("name-cell", "remove", (event) => {
            const {rowKey} = event.props[0];
            this.#removeElement(rowKey);
        });
        this.addContextMenuHandler("pos-cell", "copyvalue", async (event) => {
            const {
                rowKey, columnName
            } = event.props[0];
            const source = this.#getElement(rowKey);
            if (source != null) {
                try {
                    const cbText = JSON.stringify(source[columnName]);
                    await navigator.clipboard.writeText(cbText);
                } catch {
                    Toast.error("could not write to clipboard");
                }
                Toast.success("value saved to clipboard");
            }
        });
        this.addContextMenuHandler("pos-cell", "pastevalue", async (event) => {
            const {
                rowKey, columnName
            } = event.props[0];
            const index = this.#getElementIndex(rowKey);
            if (index >= 0) {
                try {
                    const currentValue = this.value ?? [];
                    const cbText = await navigator.clipboard.readText();
                    const value = JSON.parse(cbText);
                    const newValue = deepClone(currentValue);
                    newValue[index][columnName] = value;
                    this.value = newValue;
                    this.dispatchEvent(new Event("input", {
                        bubbles: true,
                        cancelable: true
                    }));
                } catch {
                    Toast.error("could not read from clipboard");
                }
                Toast.success("value loaded from clipboard");
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
        this.#addEl.disabled = disabled;
    }

    focus(options) {
        this.#searchEl.focus(options);
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

    set readOnly(value) {
        this.setBooleanAttribute("readonly", value);
    }

    get readOnly() {
        return this.getBooleanAttribute("readonly");
    }

    set resize(value) {
        this.setEnumAttribute("resize", value, Axes2D);
    }

    get resize() {
        return this.getEnumAttribute("resize");
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
                    this.#gridEl.readOnly = this.readOnly;
                    this.#addEl.disabled = this.disabled || this.readOnly;
                }
            } break;
        }
    }

    renderValue(value) {
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
        const initialValue = this.value ?? [];
        let currentIndex = initialValue.findIndex((entry) => {
            return rowKey === entry.label;
        });

        let newRowKey = null;
        const currentValue = this.value ?? [];
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
            const index = this.#getElementIndex(newRowKey);
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
            this.value = [
                ...initialValue,
                newEntry
            ];
        }
        this.dispatchEvent(new Event("input", {
            bubbles: true,
            cancelable: true
        }));
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
            this.dispatchEvent(new Event("input", {
                bubbles: true,
                cancelable: true
            }));
        }
    }

    #getElement(rowKey) {
        const currentValue = this.value ?? [];
        return currentValue.find((entry) => {
            return rowKey === entry.label;
        });
    }

    #getElementIndex(rowKey) {
        const currentValue = this.value ?? [];
        return currentValue.findIndex((entry) => {
            return rowKey === entry.label;
        });
    }

}

FormElementRegistry.register("ConnectionListInput", ConnectionListInput);
customElements.define("gt-edt-input-connection-list", ConnectionListInput);
registerFocusable("gt-edt-input-connection-list");
