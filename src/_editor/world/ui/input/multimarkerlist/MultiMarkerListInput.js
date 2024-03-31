import CustomFormElementDelegating from "/emcJS/ui/element/CustomFormElementDelegating.js";
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
    deleteAtIndex,
    moveInArray
} from "/emcJS/util/helper/collection/ArrayMutations.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import LogicElementModal from "/emcJS/ui/form/element/input/logic/components/modal/LogicElementModal.js";
import ModalDialogAddTypeEntities from "../../modal/ModalDialogAddTypeEntities.js";
import CoordinatesInputModal from "../coordinates/components/CoordinatesInputModal.js";
import "/emcJS/ui/form/element/input/search/SearchInput.js";
import "/emcJS/ui/form/element/select/search/SearchSelect.js";
import "/emcJS/ui/form/button/Button.js";
import "/emcJS/ui/grid/DataGrid.js";
import TPL from "./MultiMarkerListInput.js.html" assert {type: "html"};
import STYLE from "./MultiMarkerListInput.js.css" assert {type: "css"};

const RELATION_TYPES = [
    "Area",
    "Exit",
    "Collection",
    "Location"
];

export default class MultiMarkerListInput extends CustomFormElementDelegating {

    #value;

    #searchEl;

    #listSelectionEl;

    #gridEl;

    #addEl;

    #addListEl;

    #deleteListEl;

    #dataManager;

    #activeList = "";

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
        this.#listSelectionEl = this.shadowRoot.getElementById("list-selection");
        this.#listSelectionEl.addEventListener("change", () => {
            this.#activeList = this.#listSelectionEl.value;
            this.#applyValue(this.#value);
        }, true);
        /* --- */
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.#gridEl.addEventListener("action::delete", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowName} = event.data;
            const currentValue = this.value ?? [];
            const currentList = currentValue[this.#activeList] ?? [];
            const index = currentList.findIndex((entry) => {
                return rowName === this.#generateRowName(entry.ref);
            });
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                deleteAtIndex(newValue[this.#activeList], index)
                this.value = newValue;
            }
        });
        this.#gridEl.addEventListener("edit::pos", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowName} = event.data;
            const currentValue = this.value ?? [];
            const currentList = currentValue[this.#activeList] ?? [];
            const index = currentList.findIndex((entry) => {
                return rowName === this.#generateRowName(entry.ref);
            });
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[this.#activeList][index].pos = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("edit::visible", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowName} = event.data;
            const currentValue = this.value ?? [];
            const currentList = currentValue[this.#activeList] ?? [];
            const index = currentList.findIndex((entry) => {
                return rowName === this.#generateRowName(entry.ref);
            });
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[this.#activeList][index].visible = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("edit::listHidden", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowName} = event.data;
            const currentValue = this.value ?? [];
            const currentList = currentValue[this.#activeList] ?? [];
            const index = currentList.findIndex((entry) => {
                return rowName === this.#generateRowName(entry.ref);
            });
            if (index >= 0) {
                const newValue = deepClone(currentValue);
                newValue[this.#activeList][index].listHidden = value;
                this.value = newValue;
            }
        }));
        this.#gridEl.addEventListener("move-row-up", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowName} = event.data;
            const currentValue = this.value ?? [];
            const currentList = currentValue[this.#activeList] ?? [];
            const index = currentList.findIndex((entry) => {
                return rowName === this.#generateRowName(entry.ref);
            });
            if (index > 0) {
                const newValue = deepClone(currentValue);
                moveInArray(newValue[this.#activeList], index, index - 1);
                this.value = newValue;
            }
        });
        this.#gridEl.addEventListener("move-row-down", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowName} = event.data;
            const currentValue = this.value ?? [];
            const currentList = currentValue[this.#activeList] ?? [];
            const index = currentList.findIndex((entry) => {
                return rowName === this.#generateRowName(entry.ref);
            });
            if (index + 1 < currentValue[this.#activeList].length) {
                const newValue = deepClone(currentValue);
                moveInArray(newValue[this.#activeList], index, index + 1);
                this.value = newValue;
            }
        });
        /* --- */
        this.#addEl = this.shadowRoot.getElementById("add");
        this.#addEl.addEventListener("click", async () => {
            if (this.#activeList == null || this.#activeList === "") {
                await ModalDialog.alert("No list selected", "You can only create list entries after selecting a list.");
                return;
            }
            let continous = true;
            while (continous) {
                let entityEntry = null;
                let rowName = null;
                const currentValue = this.value ?? {};
                const currentList = currentValue[this.#activeList] ?? [];
                while (rowName == null) {
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
                    rowName = this.#generateRowName(entityEntry);
                    const index = currentList.findIndex((entry) => {
                        return rowName === this.#generateRowName(entry.ref);
                    });
                    if (index >= 0) {
                        await ModalDialog.alert("Entry already exists", `The entry "${rowName}" was already added to this list. Please select another one!`);
                        rowName = null;
                    }
                }
                this.value = {
                    ...currentValue,
                    [this.#activeList]: [
                        ...currentList,
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
                    ]
                };
            }
        });
        /* --- */
        this.#addListEl = this.shadowRoot.getElementById("addList");
        this.#addListEl.addEventListener("click", async () => {
            let newName = null;
            while (newName == null) {
                newName = await ModalDialog.prompt("Add list", "Please enter a new name!");
                if (typeof newName !== "string") {
                    return;
                }
                if (newName in this.#value) {
                    await ModalDialog.alert("List already exists", `The list "${newName}" does already exist. Please enter another name!`);
                    newName = null;
                }
                const currentValue = this.value ?? {};
                const newValue = deepClone(currentValue);
                newValue[newName] = [];
                this.#listSelectionEl.value = newName;
                this.value = newValue;
                this.#reloadListSelection();
            }
        });
        this.#deleteListEl = this.shadowRoot.getElementById("deleteList");
        this.#deleteListEl.addEventListener("click", async () => {
            if (this.#activeList == null || this.#activeList === "") {
                await ModalDialog.alert("No list selected", "You have to select a list to delete.");
                return;
            }
            const currentValue = this.value ?? {};
            const newValue = deepClone(currentValue);
            delete newValue[this.#activeList];
            this.#activeList = "";
            this.value = newValue;
            this.#reloadListSelection();
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
        this.#listSelectionEl.value = Object.keys(this.#value)[0] ?? "";
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
            /* --- */
            this.#reloadListSelection();
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
        const currentList = value[this.#activeList] ?? [];
        this.#loadEntries(currentList);
        const data = currentList.map((row) => {
            return {
                name: this.#generateRowName(row.ref),
                entityType: row.ref.type,
                entityName: row.ref.name,
                entityLabel: "",
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

    async #reloadListSelection() {
        await BusyIndicatorManager.busy();
        this.#listSelectionEl.innerHTML = "";
        for (const key in this.#value) {
            const optionEl = document.createElement("option");
            optionEl.setAttribute("value", key);
            optionEl.innerText = key;
            this.#listSelectionEl.append(optionEl);
        }
        if (!(this.#activeList in this.#value)) {
            this.#listSelectionEl.value = Object.keys(this.#value)[0] ?? "";
        }
        await BusyIndicatorManager.unbusy();
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

customElements.define("gt-edt-input-multi-marker-list", MultiMarkerListInput);
