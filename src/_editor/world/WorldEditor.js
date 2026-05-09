import OptionGroupRegistry from "@emcjs/fe/registry/form/OptionGroupRegistry.js";
import TokenRegistry from "@emcjs/fe/registry/form/TokenRegistry.js";
import LogicOperatorRegistry from "@emcjs/core/registry/LogicOperatorRegistry.js";
import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import EventTargetManager from "@emcjs/core/util/event/EventTargetManager.js";
import TypeValidator from "@emcjs/core/util/type/TypeValidator.js";
import {deepClone} from "@emcjs/core/util/helper/DeepClone.js";
import BusyIndicatorManager from "@emcjs/fe/util/busy/BusyIndicatorManager.js";
import ModalDialog from "@emcjs/fe/ui/modal/ModalDialog.js";
import "@emcjs/fe/ui/container/CaptionPanel.js";
import "@emcjs/fe/ui/container/CollapsePanel.js";
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
import ComponentController from "./util/ComponentController.js";
import LogicOperatorListManager from "../../util/logic/LogicOperatorListManager.js";
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

    #detailEditorEventManager = new EventTargetManager();

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
        this.#detailEditorEventManager.set("change", () => {
            this.dispatchEvent(new Event("statechange", {
                bubbles: true,
                cancelable: true,
                composed: true
            }));
        });
        this.#detailEditorEventManager.set("clear", () => {
            this.dispatchEvent(new Event("statechange", {
                bubbles: true,
                cancelable: true,
                composed: true
            }));
        });
        this.#detailEditorEventManager.set("load", () => {
            this.dispatchEvent(new Event("statechange", {
                bubbles: true,
                cancelable: true,
                composed: true
            }));
        });
        /* --- */
        DataManager.addEventListener("change", (event) => {
            const {
                type, data
            } = event.data;
            this.#structureEditorTreeEl.refresh(type);
            /* --- */
            if (type === "Area") {
                for (const name in data) {
                    const entry = data[name];
                    if (entry.lists != null) {
                        const listNames = Object.keys(entry.lists);
                        if (listNames.length > 1) {
                            LogicOperatorRegistry.setAndLinkOperator(`arealist[${name}]`, {
                                type: "state",
                                options: deepClone(listNames),
                                value: listNames[0]
                            }, "active area list");
                            continue;
                        }
                    }
                    LogicOperatorRegistry.deleteOperator(`arealist[${name}]`);
                }
            }
            /* --- */
            this.dispatchEvent(new Event("change", {
                bubbles: true,
                cancelable: true,
                composed: true
            }));
            this.dispatchEvent(new Event("statechange", {
                bubbles: true,
                cancelable: true,
                composed: true
            }));
        });
        DataManager.addEventListener("flush", () => {
            this.dispatchEvent(new Event("flush", {
                bubbles: true,
                cancelable: true,
                composed: true
            }));
            this.dispatchEvent(new Event("statechange", {
                bubbles: true,
                cancelable: true,
                composed: true
            }));
        });
        DataManager.addEventListener("load", () => {
            this.dispatchEvent(new Event("load", {
                bubbles: true,
                cancelable: true,
                composed: true
            }));
            this.dispatchEvent(new Event("statechange", {
                bubbles: true,
                cancelable: true,
                composed: true
            }));
        });
        DataManager.addEventListener("reset", () => {
            this.dispatchEvent(new Event("reset", {
                bubbles: true,
                cancelable: true,
                composed: true
            }));
            this.dispatchEvent(new Event("statechange", {
                bubbles: true,
                cancelable: true,
                composed: true
            }));
        });
        LogicOperatorRegistry.setAndLinkOperator("$IS_DONE", {type: "value"}, "special");
        LogicOperatorRegistry.setAndLinkOperator("$IS_AVAILABLE", {type: "value"}, "special");
        LogicOperatorRegistry.setAndLinkOperator("$IS_POSSIBLE", {type: "value"}, "special");
        LogicOperatorRegistry.setAndLinkOperator("$IS_UNAVAILABLE", {type: "value"}, "special");
    }

    async setWorldData(data) {
        try {
            await BusyIndicatorManager.busy();
            /* --- */
            // scope.reset();
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
            const currentEditorPath = ComponentController.getSelection();
            if (currentEditorPath.length > 1) {
                this.switchDetailEditor();
                this.#structureEditorTreeEl.selectItemByRefPath([currentEditorPath[0]]);
                ComponentController.setSelection([currentEditorPath[0]]);
            } else {
                await this.reloadDetailEditor();
            }
            /* --- */
            await BusyIndicatorManager.unbusy();
        } catch (err) {
            DataManager.reset();
            await BusyIndicatorManager.reset();
            await ModalDialog.error("Error loading data", "The provided data does not match the expected configuration.", err);
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
            this.#detailEditorEventManager.disconnect();
            this.#activeDetailEditor.resetScroll();
            this.#activeDetailEditor.classList.remove("active");
        }
        if (detailEditorEl != null) {
            this.#detailEditorEventManager.switchTarget(detailEditorEl);
            const data = DataManager.readEntity(scope.entityType, scope.entityName);
            detailEditorEl.setName(scope.entityName);
            detailEditorEl.setFilterConfig(scope.filterConfig);
            detailEditorEl.classList.add("active");
            this.#activeDetailEditor = detailEditorEl;
            detailEditorEl.setData(data);
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
        LogicOperatorListManager.set(data, "settings", {
            prefix: "setting[",
            postfix: "]"
        });
        // ---
        await BusyIndicatorManager.unbusy();
    }

    async setOptions(data) {
        await BusyIndicatorManager.busy();
        // ---
        LogicOperatorListManager.set(data, "options", {
            prefix: "option[",
            postfix: "]"
        });
        // ---
        await BusyIndicatorManager.unbusy();
    }

    async setItems(data) {
        await BusyIndicatorManager.busy();
        // ---
        LogicOperatorListManager.setValues(data, "items", {
            prefix: "item[",
            postfix: "]"
        });
        // ---
        await BusyIndicatorManager.unbusy();
    }

    async setFilterConfig(data) {
        await BusyIndicatorManager.busy();
        // ---
        LogicOperatorListManager.setStates(data, "filter", {
            prefix: "filter[",
            postfix: "]"
        });
        // ---
        const filterConfig = {};
        for (const name in data) {
            const entry = data[name];
            const values = entry.values;
            filterConfig[name] = values;
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
