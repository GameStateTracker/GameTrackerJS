import OptionGroupRegistry from "/emcJS/data/registry/form/OptionGroupRegistry.js";
import LogicOperatorRegistry from "/emcJS/data/registry/LogicOperatorRegistry.js";
import CustomElement from "/emcJS/ui/element/CustomElement.js";
import TypeValidator from "/emcJS/util/type/TypeValidator.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
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

    #busyIndicatorManagerMain = new BusyIndicatorManager("main");

    #busyIndicatorManagerForm = new BusyIndicatorManager("form");

    #activeDetailEditor;

    #formEl_WorldConfig;

    #formEl_LocationsEntry;

    #formEl_CollectionsEntry;

    #formEl_AreasEntry;

    #formEl_ExitsEntry;

    #structureEditorTreeEl;

    #optionGroupRegistry = new OptionGroupRegistry("worldEditor_areaContentHints");

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#formEl_WorldConfig = this.shadowRoot.getElementById("form-world-config");
        this.#formEl_LocationsEntry = this.shadowRoot.getElementById("form-locations-entry");
        this.#formEl_CollectionsEntry = this.shadowRoot.getElementById("form-collections-entry");
        this.#formEl_AreasEntry = this.shadowRoot.getElementById("form-areas-entry");
        this.#formEl_ExitsEntry = this.shadowRoot.getElementById("form-exits-entry");
        /* --- */
        this.#structureEditorTreeEl = this.shadowRoot.getElementById("structure-editor-tree");
        this.#structureEditorTreeEl.addEventListener("entitySelect[]", () => {
            this.switchDetailEditor();
        });
        this.#structureEditorTreeEl.refresh();
        /* --- */
        new Controller_WorldConfig(this, this.#structureEditorTreeEl, this.#formEl_WorldConfig);
        new Controller_Locations(this, this.#structureEditorTreeEl);
        new Controller_Locations_Entry(this, this.#structureEditorTreeEl, this.#formEl_LocationsEntry);
        new Controller_Collections(this, this.#structureEditorTreeEl);
        new Controller_Collections_Entry(this, this.#structureEditorTreeEl, this.#formEl_CollectionsEntry);
        new Controller_Areas(this, this.#structureEditorTreeEl);
        new Controller_Areas_Entry(this, this.#structureEditorTreeEl, this.#formEl_AreasEntry);
        new Controller_Exits(this, this.#structureEditorTreeEl);
        new Controller_Exits_Entry(this, this.#structureEditorTreeEl, this.#formEl_ExitsEntry);
        /* --- */
        DataManager.addEventListener("change", (event) => {
            const {type, changes} = event.data;
            this.#structureEditorTreeEl.refresh(type);
            /* --- */
            if (type === "Location") {
                for (const name in changes) {
                    const {oldValue, newValue} = changes[name];
                    if (oldValue == null) {
                        LogicOperatorRegistry.setOperator("locations done", `location[${name}]`, {
                            type: "value"
                        });
                    } else if (newValue == null) {
                        LogicOperatorRegistry.deleteOperator("locations done", `location[${name}]`);
                    }
                }
            }
        });
        LogicOperatorRegistry.setOperator("special", "$IS_DONE", {
            type: "value"
        });
        /* --- */
        const detailPanelEl = this.shadowRoot.getElementById("detail-panel");
        this.#busyIndicatorManagerForm.setTarget(detailPanelEl);
    }

    async setWorldData(data) {
        await this.#busyIndicatorManagerMain.busy();
        TypeValidator.validate("World", data, {throwErrors: true});
        DataManager.loadData(data);
        this.reloadDetailEditor();
        /* --- */
        const options = Object.keys(data.config.areaContentHints);
        this.#optionGroupRegistry.setAll(options);
        await this.#busyIndicatorManagerMain.unbusy();
    }

    getWorldData() {
        const data = DataManager.getData();
        TypeValidator.validate("World", data, {throwErrors: true});
        return data;
    }

    async reset() {
        await this.#busyIndicatorManagerMain.busy();
        DataManager.reset();
        scope.reset();
        this.switchDetailEditor();
        await this.#busyIndicatorManagerMain.unbusy();
    }

    async switchDetailEditor(detailEditorEl) {
        await this.#busyIndicatorManagerForm.busy();
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
        await this.#busyIndicatorManagerForm.unbusy();
    }

    async reloadDetailEditor() {
        await this.#busyIndicatorManagerForm.busy();
        if (this.#activeDetailEditor != null) {
            const data = DataManager.readEntity(scope.entityType, scope.entityName);
            this.#activeDetailEditor.setData(data);
        }
        await this.#busyIndicatorManagerForm.unbusy();
    }

    async setFilterConfig(data) {
        await this.#busyIndicatorManagerMain.busy();
        scope.filterConfig = data;
        if (this.#activeDetailEditor != null) {
            this.#activeDetailEditor.setFilterConfig(data);
        }
        // TODO add filter to LogicOperatorRegistry
        await this.#busyIndicatorManagerMain.unbusy();
    }

    async setItems(data) {
        await this.#busyIndicatorManagerMain.busy();
        LogicOperatorRegistry.clearGroup("items");
        for (const name in data) {
            LogicOperatorRegistry.setOperator("items", `item[${name}]`, {
                type: "value"
            });
        }
        await this.#busyIndicatorManagerMain.unbusy();
    }

    async setOptions(data) {
        await this.#busyIndicatorManagerMain.busy();
        LogicOperatorRegistry.clearGroup("options");
        for (const name in data) {
            const entry = data[name];
            if (entry.values) {
                LogicOperatorRegistry.setOperator("options", `option[${name}]`, {
                    type: "state",
                    options: entry.values,
                    value: Object.keys(entry.values)[0]
                });
            } else {
                LogicOperatorRegistry.setOperator("options", `option[${name}]`, {
                    type: "value"
                });
            }
        }
        await this.#busyIndicatorManagerMain.unbusy();
    }

    async setSettings(data) {
        await this.#busyIndicatorManagerMain.busy();
        LogicOperatorRegistry.clearGroup("settings");
        for (const name in data) {
            const entry = data[name];
            if (entry.values) {
                LogicOperatorRegistry.setOperator("settings", `setting[${name}]`, {
                    type: "state",
                    options: entry.values,
                    value: Object.keys(entry.values)[0]
                });
            } else {
                LogicOperatorRegistry.setOperator("settings", `setting[${name}]`, {
                    type: "value"
                });
            }
        }
        await this.#busyIndicatorManagerMain.unbusy();
    }

}

customElements.define("gt-edt-world-editor", WorldEditor);
