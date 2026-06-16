import CustomElementDelegating from "@emcjs/fe/ui/element/CustomElementDelegating.js";
import SearchEvery from "@emcjs/core/util/search/SearchEvery.js";
import {getInnerText} from "@emcjs/fe/util/node/ExtractText.js";
import ListSelectionHelper from "@emcjs/fe/util/form/ListSelectionController.js";
import "@emcjs/fe/ui/form/element/input/search/SearchInput.js";
import "./EntranceSelectOption.js";
import TPL from "./EntranceSelectList.js.html" assert {type: "html"};
import STYLE from "./EntranceSelectList.js.css" assert {type: "css"};

// TODO implement tag filter
export default class EntranceSelectList extends CustomElementDelegating {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.addEventListener("slotchange", () => {
            const all = this.querySelectorAll(`[value]`);
            for (const el of all) {
                if (el) {
                    el.onclick = () => {
                        this.value = el.value;
                    };
                    if (el.value === this.value) {
                        el.setAttribute("slot", "selected");
                    }
                }
            }
        });
        /* --- */
        const searchEl = this.shadowRoot.getElementById("search");
        searchEl.addEventListener("change", () => {
            const all = this.querySelectorAll(`[value]`);
            if (searchEl.value) {
                const regEx = new SearchEvery(searchEl.value);
                if (this.style.height == "" || this.style.width == "") {
                    const rect = this.getBoundingClientRect();
                    this.style.width = `${rect.width}px`;
                    this.style.height = `${rect.height}px`;
                }
                for (const el of all) {
                    if (el.value === "" || el.value === this.value || regEx.test(getInnerText(el))) {
                        el.style.display = "";
                    } else {
                        el.style.display = "none";
                    }
                }
            } else {
                for (const el of all) {
                    el.style.display = "";
                }
                this.style.width = "";
                this.style.height = "";
            }
        });
        /* --- */
        const scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        const selectionHelper = new ListSelectionHelper(this, scrollContainerEl, (el) => el.value === this.value);
        selectionHelper.addEventListener("choose", (event) => {
            this.#choose(event.value);
        });
        selectionHelper.addEventListener("cancel", () => {
            this.dispatchEvent(new Event("cancel"));
        });
    }

    connectedCallback() {
        const all = this.querySelectorAll(`[value]`);
        if (!this.value && all.length > 0) {
            this.value = all[0].value;
        }
        for (const el of all) {
            if (el) {
                el.onclick = () => {
                    this.value = el.value;
                };
                if (el.value === this.value) {
                    el.setAttribute("slot", "selected");
                }
            }
        }
    }

    resetSearch() {
        const searchEl = this.shadowRoot.getElementById("search");
        searchEl.value = "";
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    static get observedAttributes() {
        return ["value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    // unselect old
                    const oldSelectedEl = this.querySelector("[slot=\"selected\"]");
                    if (oldSelectedEl != null) {
                        oldSelectedEl.removeAttribute("slot");
                    }
                    // select new
                    const newSelectedEl = this.querySelector(`[value="${newValue}"]`);
                    if (newSelectedEl != null) {
                        newSelectedEl.setAttribute("slot", "selected");
                    }
                    // event
                    const event = new Event("change");
                    event.oldValue = oldValue;
                    event.newValue = newValue;
                    event.value = newValue;
                    this.dispatchEvent(event);
                }
            } break;
        }
    }

    #choose(value) {
        if (!this.readOnly) {
            if (this.multiple) {
                const arr = this.value;
                const set = new Set(arr);
                if (set.has(value)) {
                    set.delete(value);
                } else {
                    set.add(value);
                }
                this.value = Array.from(set);
            } else {
                this.value = value;
            }
        }
    }

}

customElements.define("gt-entrance-select-list", EntranceSelectList);
