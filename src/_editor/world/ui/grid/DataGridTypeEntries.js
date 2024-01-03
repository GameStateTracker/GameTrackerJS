import CustomElementDelegating from "/emcJS/ui/element/CustomElementDelegating.js";
import TypeStorageReferenceProvider from "/emcJS/util/grid/provider/TypeStorageReferenceProvider.js";
import "/emcJS/ui/form/element/input/search/SearchInput.js";
import "/emcJS/ui/grid/DataGrid.js";
import TPL from "./DataGridTypeEntries.js.html" assert {type: "html"};
import STYLE from "./DataGridTypeEntries.js.css" assert {type: "css"};
import TypeStorage from "/emcJS/data/type/TypeStorage.js";

export default class DataGridTypeEntries extends CustomElementDelegating {

    #searchEl;

    #gridEl;

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
        this.#dataManager = new TypeStorageReferenceProvider(this.#gridEl);
        this.#dataManager.setOptions({
            sort: ["entityName"]
        });
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
