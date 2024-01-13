import OptionGroupRegistry from "/emcJS/data/registry/form/OptionGroupRegistry.js";
import TokenRegistry from "/emcJS/data/registry/form/TokenRegistry.js";
import LogicOperatorRegistry from "/emcJS/data/registry/LogicOperatorRegistry.js";
import CustomElement from "/emcJS/ui/element/CustomElement.js";
import TypeValidator from "/emcJS/util/type/TypeValidator.js";
import {
    deepClone
} from "/emcJS/util/helper/DeepClone.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import "/emcJS/ui/container/CaptionPanel.js";
import "/emcJS/ui/container/CollapsePanel.js";
import Controller_Areas from "./components/areas/Controller.js";
import Controller_Areas_Entry from "./components/areas_entry/Controller.js";
import Controller_Collections from "./components/collections/Controller.js";
import Controller_Collections_Entry from "./components/collections_entry/Controller.js";
import Controller_Exits from "./components/exits/Controller.js";
import Controller_Exits_Entry from "./components/exits_entry/Controller.js";
import Controller_Locations from "./components/locations/Controller.js";
import Controller_Locations_Entry from "./components/locations_entry/Controller.js";
import Controller_WorldConfig from "./components/worldconfig/Controller.js";
import scope from "./data/WorldEditorScope.js";
import DataManager from "./data/DataManager.js";
import "./util/ExtendedDataGridCellsLoader.js";
import "./util/ExtendedFormFieldsLoader.js";
import "./ui/tree/StructureEditorTree.js";
import TPL from "./WorldEditor.js.html" assert {type: "html"};
import STYLE from "./WorldEditor.js.css" assert {type: "css"};

class WorldEditor extends CustomElement {

    #activeDetailEditor;

    #formEl_WorldConfig;

    #formEl_Locations;

    #formEl_LocationsEntry;

    #formEl_Collections;

    #formEl_CollectionsEntry;

    #formEl_Areas;

    #formEl_AreasEntry;

    #formEl_Exits;

    #formEl_ExitsEntry;

    #structureEditorTreeEl;

    #optionGroupRegistry = new OptionGroupRegistry("worldEditor_areaContentHints");

    #tagsTokenRegistry = new TokenRegistry("worldEditor_tags");

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#formEl_WorldConfig = this.shadowRoot.getElementById("form-world-config");
        this.#formEl_Locations = this.shadowRoot.getElementById("form-locations");
        this.#formEl_LocationsEntry = this.shadowRoot.getElementById("form-locations-entry");
        this.#formEl_Collections = this.shadowRoot.getElementById("form-collections");
        this.#formEl_CollectionsEntry = this.shadowRoot.getElementById("form-collections-entry");
        this.#formEl_Areas = this.shadowRoot.getElementById("form-areas");
        this.#formEl_AreasEntry = this.shadowRoot.getElementById("form-areas-entry");
        this.#formEl_Exits = this.shadowRoot.getElementById("form-exits");
        this.#formEl_ExitsEntry = this.shadowRoot.getElementById("form-exits-entry");
        /* --- */
        this.#structureEditorTreeEl = this.shadowRoot.getElementById("structure-editor-tree");
        this.#structureEditorTreeEl.addEventListener("entitySelect[]", () => {
            this.switchDetailEditor();
        });
        this.#structureEditorTreeEl.refresh();
        /* --- */
        new Controller_WorldConfig(this, this.#structureEditorTreeEl, this.#formEl_WorldConfig);
        new Controller_Locations(this, this.#structureEditorTreeEl, this.#formEl_Locations);
        new Controller_Locations_Entry(this, this.#structureEditorTreeEl, this.#formEl_LocationsEntry);
        new Controller_Collections(this, this.#structureEditorTreeEl, this.#formEl_Collections);
        new Controller_Collections_Entry(this, this.#structureEditorTreeEl, this.#formEl_CollectionsEntry);
        new Controller_Areas(this, this.#structureEditorTreeEl, this.#formEl_Areas);
        new Controller_Areas_Entry(this, this.#structureEditorTreeEl, this.#formEl_AreasEntry);
        new Controller_Exits(this, this.#structureEditorTreeEl, this.#formEl_Exits);
        new Controller_Exits_Entry(this, this.#structureEditorTreeEl, this.#formEl_ExitsEntry);
        /* --- */
        DataManager.addEventListener("change", (event) => {
            const {type, data} = event.data;
            this.#structureEditorTreeEl.refresh(type);
            /* --- */
            if (type === "Area") {
                for (const name in data) {
                    const entry = data[name];
                    if (entry.lists != null) {
                        const listNames = Object.keys(entry.lists);
                        if (listNames.length > 1) {
                            LogicOperatorRegistry.setOperator("active area list", `arealist[${name}]`, {
                                type: "state",
                                options: deepClone(listNames),
                                value: listNames[0]
                            });
                            continue;
                        }
                    }
                    LogicOperatorRegistry.deleteOperator("active area list", `arealist[${name}]`);
                }
            }
        });
        LogicOperatorRegistry.setOperator("special", "$IS_DONE", {
            type: "value"
        });
    }

    async setWorldData(data) {
        try {
            await BusyIndicatorManager.busy();
            /* --- */
            scope.reset();
            this.switchDetailEditor();
            DataManager.loadData(data);
            /* --- */
            const options = Object.keys(data.config.areaContentHints);
            this.#optionGroupRegistry.setAll(options);
            /* --- */
            this.#tagsTokenRegistry.clear();
            LogicOperatorRegistry.clearGroup("arealist");
            const extractedTags = new Set();
            for (const entry of Object.values(data.locations)) {
                for (const tag of entry.tags) {
                    extractedTags.add(tag);
                }
            }
            for (const entry of Object.values(data.areas)) {
                for (const tag of entry.tags) {
                    extractedTags.add(tag);
                }
            }
            for (const entry of Object.values(data.exits)) {
                for (const tag of entry.tags) {
                    extractedTags.add(tag);
                }
            }
            this.#tagsTokenRegistry.setAll(extractedTags);
            /* --- */
            await BusyIndicatorManager.unbusy();
        } catch {
            DataManager.reset();
            await BusyIndicatorManager.unbusy();
            await ModalDialog.alert("Error loading data", "The provided data does not match the expected configuration.");
        }
    }

    getWorldData() {
        const data = DataManager.getData();
        TypeValidator.validate("World", data, {throwErrors: true});
        return data;
    }

    checkWorldDataHasChanges() {
        return DataManager.hasChanges();
    }

    flushWorldDataChanges() {
        DataManager.flushChanges();
    }

    checkCurrentEditorHasChanges() {
        return this.#activeDetailEditor?.hasChanges?.() ?? false;
    }

    async switchDetailEditor(detailEditorEl) {
        await BusyIndicatorManager.busy();
        if (this.#activeDetailEditor != null) {
            this.#activeDetailEditor.resetScroll();
            this.#activeDetailEditor.classList.remove("active");
        }
        if (detailEditorEl != null) {
            const data = DataManager.readEntity(scope.entityType, scope.entityName);
            detailEditorEl.setName(scope.entityName);
            detailEditorEl.setData(data);
            detailEditorEl.setFilterConfig(scope.filterConfig);
            detailEditorEl.classList.add("active");
            this.#activeDetailEditor = detailEditorEl;
        }
        await BusyIndicatorManager.unbusy();
    }

    async reloadDetailEditor() {
        await BusyIndicatorManager.busy();
        if (this.#activeDetailEditor != null) {
            const data = DataManager.readEntity(scope.entityType, scope.entityName);
            this.#activeDetailEditor.setData(data);
        }
        await BusyIndicatorManager.unbusy();
    }

    async reset() {
        await BusyIndicatorManager.busy();
        // ---
        DataManager.reset();
        scope.reset();
        // ---
        LogicOperatorRegistry.clearGroup("settings");
        LogicOperatorRegistry.clearGroup("options");
        LogicOperatorRegistry.clearGroup("items");
        LogicOperatorRegistry.clearGroup("filter");
        LogicOperatorRegistry.clearGroup("active area list");
        // ---
        this.#tagsTokenRegistry.clear();
        // ---
        this.switchDetailEditor();
        // ---
        await BusyIndicatorManager.unbusy();
    }

    async setSettings(data) {
        await BusyIndicatorManager.busy();
        // ---
        for (const name in data) {
            const entry = data[name];
            if (Array.isArray(entry.values)) {
                LogicOperatorRegistry.setOperator("settings", `setting[${name}]`, {
                    type: "state",
                    options: deepClone(entry.values),
                    value: entry.default ?? entry.values[0]
                });
            } else {
                LogicOperatorRegistry.setOperator("settings", `setting[${name}]`, {
                    type: "value"
                });
            }
        }
        // ---
        await BusyIndicatorManager.unbusy();
    }

    async setOptions(data) {
        await BusyIndicatorManager.busy();
        // ---
        for (const name in data) {
            const entry = data[name];
            if (Array.isArray(entry.values)) {
                LogicOperatorRegistry.setOperator("options", `option[${name}]`, {
                    type: "state",
                    options: deepClone(entry.values),
                    value: entry.default ?? entry.values[0]
                });
            } else {
                LogicOperatorRegistry.setOperator("options", `option[${name}]`, {
                    type: "value"
                });
            }
        }
        // ---
        await BusyIndicatorManager.unbusy();
    }

    async setItems(data) {
        await BusyIndicatorManager.busy();
        // ---
        for (const name in data) {
            LogicOperatorRegistry.setOperator("items", `item[${name}]`, {
                type: "value"
            });
        }
        // ---
        await BusyIndicatorManager.unbusy();
    }

    async setFilterConfig(data) {
        await BusyIndicatorManager.busy();
        // ---
        const filterConfig = {};
        for (const name in data) {
            const entry = data[name];
            const values = entry.values;
            filterConfig[name] = values;
            // ---
            LogicOperatorRegistry.setOperator("filter", `filter[${name}]`, {
                type: "state",
                options: deepClone(entry.values),
                value: entry.default ?? entry.values[0]
            });
        }
        scope.filterConfig = filterConfig;
        if (this.#activeDetailEditor != null) {
            this.#activeDetailEditor.setFilterConfig(filterConfig);
        }
        // ---
        await BusyIndicatorManager.unbusy();
    }

}

customElements.define("gt-edt-world-editor", WorldEditor);
