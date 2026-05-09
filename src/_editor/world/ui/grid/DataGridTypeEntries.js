import CustomElementDelegating from "@emcjs/fe/ui/element/CustomElementDelegating.js";
import TypeStorageDataProvider from "@emcjs/core/util/dataprovider/TypeStorageDataProvider.js";
import TypeStorage from "@emcjs/core/data/type/TypeStorage.js";
import "@emcjs/fe/ui/form/element/input/search/SearchInput.js";
import "@emcjs/fe/ui/dataview/datagrid/DataGrid.js";
import "@emcjs/fe/ui/dataview/toolbar/DataViewControlToolbar.js";
import TPL from "./DataGridTypeEntries.js.html" assert {type: "html"};
import STYLE from "./DataGridTypeEntries.js.css" assert {type: "css"};

export default class DataGridTypeEntries extends CustomElementDelegating {

    #searchEl;

    #gridEl;

    #controlToolbarEl;

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
        this.#gridEl.addEventListener("action::edit", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {source} = event.data;
            const rowData = source.rowData;
            const entityType = rowData.entityType;
            const entityName = rowData.entityName;
            const ev = new Event("edit", {bubbles: true});
            ev.data = {
                entityType,
                entityName
            };
            this.dispatchEvent(ev);
        });
        /* --- */
        this.#controlToolbarEl = this.shadowRoot.getElementById("control-toolbar");
        this.#dataManager = new TypeStorageDataProvider(this.#gridEl, null, {
            config: {
                sort: ["entityName"],
                pageSize: 15
            }
        });
        this.#controlToolbarEl.setDataProvider(this.#dataManager);
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

    set type(value) {
        this.setAttribute("type", value);
    }

    get type() {
        return this.getAttribute("type");
    }

    static get observedAttributes() {
        return ["type"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "type": {
                if (oldValue != newValue) {
                    const storage = TypeStorage.getStorage(newValue);
                    this.#dataManager.setSource(storage);
                }
            } break;
        }
    }

}

customElements.define("gt-edt-grid-type-entries", DataGridTypeEntries);
