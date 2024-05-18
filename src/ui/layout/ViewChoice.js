import CustomElement from "/emcJS/ui/element/CustomElement.js";
import {
    isString,
    isStringNotEmpty
} from "/emcJS/util/helper/CheckType.js";
import "/emcJS/ui/input/Option.js";
import "./ViewChoicePanel.js";
import TPL from "./ViewChoice.js.html" assert {type: "html"};
import STYLE from "./ViewChoice.js.css" assert {type: "css"};

export default class ViewChoice extends CustomElement {

    #slotEl;

    #categoryEl;

    #panelList = new Map();

    #buttonList = new Map();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#slotEl = this.shadowRoot.getElementById("body");
        this.#slotEl.addEventListener("slotchange", () => {
            this.#prepareTabs();
        });
        /* --- */
        this.#categoryEl = this.shadowRoot.getElementById("categories");
        this.#categoryEl.onclick = (event) => {
            const target = event.target.getAttribute("value");
            if (target != null) {
                this.active = target;
                event.preventDefault();
                return false;
            }
        };
    }

    connectedCallback() {
        this.#prepareTabs();
        if (!this.active) {
            const el = this.#categoryEl.querySelector("[value]");
            if (el != null) {
                this.active = el.getAttribute("value");
            }
        }
    }

    get active() {
        return this.getAttribute("active");
    }

    set active(val) {
        this.setAttribute("active", val);
    }

    static get observedAttributes() {
        return ["active"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "active": {
                    if (oldValue) {
                        const oldPanel = this.#panelList.get(oldValue);
                        if (oldPanel != null) {
                            oldPanel.classList.remove("active");
                            if (typeof oldPanel.unload === "function") {
                                oldPanel.unload();
                            }
                        }
                        const oldButton = this.#buttonList.get(oldValue);
                        if (oldButton != null) {
                            oldButton.classList.remove("active");
                        }
                    }
                    const newPanel = this.#panelList.get(newValue);
                    if (newPanel != null) {
                        newPanel.classList.add("active");
                        if (typeof newPanel.load === "function") {
                            newPanel.load();
                        }
                    }
                    const newButton = this.#buttonList.get(newValue);
                    if (newButton != null) {
                        newButton.classList.add("active");
                        const ev = new Event("change");
                        ev.panel = newValue;
                        this.dispatchEvent(ev);
                    } else {
                        const firstButton = this.#categoryEl.querySelector("[value]");
                        if (firstButton != null) {
                            this.active = firstButton.getAttribute("value");
                        }
                    }
                } break;
            }
        }
    }

    setTab(category, name = category, icon = "") {
        if (!isStringNotEmpty(category)) {
            throw new Error("category must be an unempty string");
        }
        if (!isStringNotEmpty(name)) {
            throw new Error("optional name must be an unempty string");
        }
        if (!isString(icon)) {
            throw new Error("optional icon must be a string");
        }
        const buttonEl = this.#buttonList.get(category);
        if (buttonEl == null) {
            // panel
            const panelEl = this.#panelList.get(category) ?? document.createElement("div");
            panelEl.className = "panel";
            if (category === this.active) {
                panelEl.classList.add("active");
            }
            panelEl.setAttribute("category", category);
            this.#panelList.set(category, panelEl);
            this.append(panelEl);
            // button
            this.#addTabButton(category, name, icon);
            // ---
            return panelEl;
        } else {
            buttonEl.title = name;
            if (isStringNotEmpty(icon)) {
                buttonEl.style.backgroundImage = `url('${icon}')`;
            } else {
                buttonEl.style.backgroundImage = "";
            }
        }
    }

    getTab(category) {
        return this.#panelList.get(category);
    }

    hasTab(category) {
        return this.#panelList.has(category);
    }

    removeTab(category) {
        const panelEl = this.#panelList.get(category);
        if (panelEl != null) {
            panelEl.remove();
        }
        const buttonEl = this.#buttonList.get(category);
        if (buttonEl != null) {
            buttonEl.remove();
        }
        this.#panelList.delete(category);
        this.#buttonList.delete(category);
    }

    #prepareTabs() {
        const panelElList = this.#slotEl.assignedNodes();
        const deletedTabs = new Set(this.#buttonList.keys());
        this.#categoryEl.innerHTML = "";
        for (const panelEl of panelElList) {
            if (panelEl instanceof HTMLElement) {
                const category = panelEl.getAttribute("category");
                if (isStringNotEmpty(category)) {
                    deletedTabs.delete(category);
                    this.#panelList.set(category, panelEl);
                    panelEl.className = "panel";
                    if (category === this.active) {
                        panelEl.classList.add("active");
                        if (typeof panelEl.load === "function") {
                            panelEl.load();
                        }
                    }
                    const buttonEl = this.#buttonList.get(category);
                    if (buttonEl == null) {
                        this.#addTabButton(category, category);
                    } else {
                        this.#categoryEl.append(buttonEl);
                    }
                }
            }
        }
        for (const deleted of deletedTabs) {
            this.#panelList.delete(deleted);
            this.#buttonList.delete(deleted);
            if (deleted === this.active) {
                this.active = null;
            }
        }
    }

    #addTabButton(category, name, icon) {
        const buttonEl = document.createElement("emc-option");
        buttonEl.className = "category";
        if (category === this.active) {
            buttonEl.classList.add("active");
        }
        if (isStringNotEmpty(icon)) {
            buttonEl.style.backgroundImage = `url('${icon}')`;
        }
        buttonEl.value = category;
        buttonEl.title = name;
        this.#buttonList.set(category, buttonEl);
        this.#categoryEl.append(buttonEl);
    }

}

customElements.define("gt-viewchoice", ViewChoice);
