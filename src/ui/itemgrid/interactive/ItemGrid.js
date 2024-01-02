import CustomElement from "/emcJS/ui/element/CustomElement.js";
import ItemsResource from "../../../data/resource/ItemsResource.js";
import UIRegistry from "../../../registry/UIRegistry.js";
import "./components/entries/Item.js";
import "./components/entries/ProgressiveItem.js";
import "./components/entries/Popout.js";
import TPL from "./Popout.js.html" assert {type: "html"};
import STYLE from "./Popout.js.css" assert {type: "css"};

export default class ItemGrid extends CustomElement {

    #contentEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#contentEl = this.shadowRoot.getElementById("content");
    }

    connectedCallback() {
        this.setAttribute("data-fontmod", "items");
    }

    loadGrid(config = [[]]) {
        this.#contentEl.innerHTML = "";
        for (const row of config) {
            const cnt = document.createElement("div");
            cnt.classList.add("item-row");
            const items = ItemsResource.get();
            for (const element of row) {
                if (element.type == "item") {
                    const data = items[element.value];
                    cnt.append(this.#createItem(element.value, data));
                } else if (element.type == "popout") {
                    const data = items[element.value];
                    if (data != null) {
                        cnt.append(this.#createPopout(element, data));
                    } else {
                        cnt.append(this.#createEmpty());
                    }
                } else if (element.type == "text") {
                    cnt.append(this.#createText(element.value));
                } else if (element.type == "icon") {
                    cnt.append(this.#createIcon(element.value));
                } else {
                    cnt.append(this.#createEmpty());
                }
            }
            this.#contentEl.append(cnt);
        }
    }

    #createItem(value, data) {
        const el = UIRegistry.get("itemgrid-item").create(data.type, value);
        el.className = "item";
        return el;
    }

    #createPopout(element, data) {
        const {value, icon/* , counting = true, countBlacklist = [], content = [] */} = element;
        if (data != null) {
            return this.#createItem(value, data);
        } else if (icon != null) {
            return this.#createIcon(icon)
        } else {
            return this.#createEmpty();
        }
    }

    #createText(value) {
        const el = document.createElement("DIV");
        el.className = "text";
        el.innerHTML = value;
        return el;
    }

    #createIcon(value) {
        const el = document.createElement("DIV");
        el.className = "icon";
        el.style.backgroundImage = `url(${value})`;
        return el;
    }

    #createEmpty() {
        const el = document.createElement("DIV");
        el.className = "empty";
        return el;
    }

}

customElements.define("gt-itemgrid-interactive", ItemGrid);
