import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import SimpleDataProvider from "@emcjs/core/util/dataprovider/SimpleDataProvider.js";
import jsonParse from "@emcjs/core/patches/JSONParser.js";
import {isEqual} from "@emcjs/core/util/helper/Comparator.js";
import "@emcjs/fe/ui/dataview/datalist/DataListSelect.js";
import "@emcjs/fe/ui/form/element/components/searchheader/SearchHeader.js";
import SavestateManager from "../../../../savestate/SavestateManager.js";
import SavestateListEntry from "./components/SavestateListEntry.js";
import TPL from "./SavestateList.js.html" assert {type: "html"};
import STYLE from "./SavestateList.js.css" assert {type: "css"};

export default class SavestateList extends CustomElement {

    #value;

    #searchHeaderEl;

    #listEl;

    #dataManager;

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        TPL.apply(this.shadowRoot);
        /* --- */
        this.#searchHeaderEl = this.shadowRoot.getElementById("search-header");
        this.#listEl = this.shadowRoot.getElementById("list");
        this.#listEl.setListEntryClass(SavestateListEntry);
        this.#dataManager = new SimpleDataProvider(this.#listEl, null, {
            config: {
                filterIgnoreNullValues: true,
                sort: ["!autosave", "name"]
            }
        });
        this.#listEl.addEventListener("selection", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.value = event.data;
        });
        this.#listEl.addEventListener("selection-header", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.#searchHeaderEl.selected = event.value;
        });
        /* --- */
        this.#searchHeaderEl.addEventListener("select", () => {
            const value = this.#searchHeaderEl.selected;
            if (value) {
                this.#listEl.selectAll();
            } else {
                this.#listEl.clearSelected();
            }
        });
        this.#searchHeaderEl.addEventListener("search", () => {
            const options = {filter: {}};
            const searchValue = this.#searchHeaderEl.search;
            if (searchValue != "") {
                options.filter = {name: searchValue};
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
                    const multiple = this.multiple;
                    this.#listEl.multiple = multiple;
                    this.#searchHeaderEl.selectable = multiple;
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
