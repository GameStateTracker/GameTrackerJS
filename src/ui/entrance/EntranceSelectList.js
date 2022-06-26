import CustomElementDelegating from "/emcJS/ui/element/CustomElementDelegating.js";
import SearchAnd from "/emcJS/util/search/SearchAnd.js";
import "/emcJS/ui/input/SearchField.js";
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
        this.shadowRoot.getElementById("container").addEventListener("slotchange", () => {
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
        searchEl.addEventListener("change", (event) => {
            const all = this.querySelectorAll(`[value]`);
            if (event.value) {
                const regEx = new SearchAnd(event.value);
                if (this.style.height == "" || this.style.width == "") {
                    const rect = this.getBoundingClientRect();
                    this.style.width = `${rect.width}px`;
                    this.style.height = `${rect.height}px`;
                }
                for (const el of all) {
                    if (el.value === this.value || el.innerText.match(regEx)) {
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
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
        /* --- */
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

}

customElements.define("gt-entrance-select-list", EntranceSelectList);
