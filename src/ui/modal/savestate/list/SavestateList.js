import CustomElement from "/emcJS/ui/element/CustomElement.js";
import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import jsonParse from "/emcJS/patches/JSONParser.js";
import {isEqual} from "/emcJS/util/helper/Comparator.js";
import "/emcJS/ui/dataview/datalist/DataListSelect.js";
import "/emcJS/ui/form/element/input/search/SearchInput.js";
import SavestateManager from "../../../../savestate/SavestateManager.js";
import SavestateListEntry from "./components/SavestateListEntry.js";
import TPL from "./SavestateList.js.html" assert {type: "html"};
import STYLE from "./SavestateList.js.css" assert {type: "css"};

export default class SavestateList extends CustomElement {

    #value;

    #headerEl;

    #searchEl;

    #headerSelectEl;

    #listEl;

    #dataManager;

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        TPL.apply(this.shadowRoot);
        /* --- */
        this.#headerEl = this.shadowRoot.getElementById("header");
        this.#listEl = this.shadowRoot.getElementById("list");
        this.#listEl.setListEntryClass(SavestateListEntry);
        this.#dataManager = new SimpleDataProvider(this.#listEl, null, {
            config: {
                filterIgnoreNullValues: true,
                sort: ["!autosave", "name"]
            }
        });
        this.registerTargetEventHandler(this.#listEl, "selection", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.value = event.data;
        });
        /* --- */
        this.#headerSelectEl = document.createElement("input");
        this.#headerSelectEl.type = "checkbox";
        this.#headerSelectEl.name = "multiselect";
        this.#headerSelectEl.className = "multi-select";
        this.#headerEl.prepend(this.#headerSelectEl);
        this.registerTargetEventHandler(this.#headerSelectEl, "change", () => {
            const value = this.#headerSelectEl.checked;
            if (value) {
                this.#listEl.selectAll();
            } else {
                this.#listEl.clearSelected();
            }
        });
        this.registerTargetEventHandler(this.#listEl, "selection-header", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.#headerSelectEl.checked = event.checked;
            this.#headerSelectEl.indeterminate = event.indeterminate;
        });
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.registerTargetEventHandler(this.#searchEl, "change", () => {
            const options = {filter: {}};
            if (this.#searchEl.value != "") {
                options.filter = {name: this.#searchEl.value};
            }
            this.#dataManager.updateConfig(options);
        }, true);
    }

    set value(value) {
        if (typeof value === "string") {
            value = jsonParse(value);
        }
        if (!isEqual(this.value, value)) {
            this.#value = value;
            this.#listEl.setSelected(value);
            this.dispatchEvent(new Event("change", {
                bubbles: true,
                cancelable: true
            }));
        }
    }

    get value() {
        return this.#value;
    }

    set multiple(val) {
        this.setBooleanAttribute("multiple", val);
    }

    get multiple() {
        return this.getBooleanAttribute("multiple");
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "multiple"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        switch (name) {
            case "multiple": {
                if (oldValue != newValue) {
                    this.#listEl.multiple = this.multiple;
                }
            } break;
        }
    }

    async refreshList() {
        const states = await SavestateManager.getStates();
        const data = [];
        for (const key in states) {
            data.push({
                key,
                ...states[key]
            });
        }
        this.#dataManager.setSource(data);
    }

}

customElements.define("gt-modal-savestate-list", SavestateList);
