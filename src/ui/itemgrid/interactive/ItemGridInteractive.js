import CustomElement from "/emcJS/ui/element/CustomElement.js";
import CtxMenuLayer from "/emcJS/ui/overlay/ctxmenu/CtxMenuLayer.js";
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";
import ItemsResource from "../../../data/resource/ItemsResource.js";
import UIRegistry from "../../../registry/UIRegistry.js";
import "./components/entries/Item.js";
import "./components/entries/ProgressiveItem.js";
import "./components/entries/Popout.js";
import TPL from "./ItemGridInteractive.js.html" assert {type: "html"};
import STYLE from "./ItemGridInteractive.js.css" assert {type: "css"};

export default class ItemGridInteractive extends CustomElement {

    #contentEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#contentEl = this.shadowRoot.getElementById("content");
    }

    loadGrid(config = [[]]) {
        this.#contentEl.innerHTML = "";
        for (const row of config) {
            const rowEl = document.createElement("tr");
            const items = ItemsResource.get();
            for (const element of row) {
                const cellEl = document.createElement("td");
                switch (element.type) {
                    case "popout": {
                        const data = items[element.value];
                        const popoutEl = ItemGridInteractive.#createPopout(this, element, data);
                        if (popoutEl != null) {
                            cellEl.append(popoutEl);
                        } else {
                            cellEl.className = "empty";
                        }
                    } break;
                    case "item": {
                        const data = items[element.value];
                        cellEl.append(ItemGridInteractive.#createItem(element.value, data));
                    } break;
                    case "icon": {
                        cellEl.append(ItemGridInteractive.#createIcon(element.value));
                    } break;
                    case "text": {
                        cellEl.append(ItemGridInteractive.#createText(element.value));
                    } break;
                    case "empty": {
                        cellEl.className = "empty";
                    } break;
                }
                rowEl.append(cellEl);
            }
            this.#contentEl.append(rowEl);
        }
    }

    static #createItem(value, data) {
        const el = UIRegistry.get("itemgrid-item").create(data.type, value);
        el.className = "item";
        return el;
    }

    static #createPopout(target, element, data) {
        const el = ItemGridInteractive.#createPopoutElement(element, data);
        if (el != null) {
            const {contentGrid} = element;
            if (Array.isArray(contentGrid)) {
                const ctxMnu = ItemGridInteractive.createItemGridContextMenu(contentGrid);
                const catcherEl = CtxMenuLayer.findNextLayer(target);
                catcherEl.append(ctxMnu);
                // ---
                el.addEventListener("click", (event) => {
                    event.stopPropagation();
                    const rect = el.getBoundingClientRect();
                    ctxMnu.show(rect.x, rect.y);
                });
                el.addEventListener("contextmenu", (event) => {
                    event.stopPropagation();
                    const rect = el.getBoundingClientRect();
                    ctxMnu.show(rect.x, rect.y);
                });
            }
        }
        return el;
    }

    static #createPopoutElement(element, data) {
        const {value, icon} = element;
        if (data != null) {
            return this.#createItem(value, data);
        } else if (icon != null) {
            return this.#createIcon(icon);
        }
    }

    static #createText(value) {
        const el = document.createElement("DIV");
        el.className = "text";
        el.innerText = value;
        return el;
    }

    static #createIcon(value) {
        const el = document.createElement("DIV");
        el.className = "icon";
        el.style.backgroundImage = `url(${value})`;
        return el;
    }

    static createItemGridContextMenu(content) {
        const ctxMnu = new ContextMenu();
        const itemPickerEl = document.createElement("gt-itemgrid-interactive");
        itemPickerEl.addEventListener("click", (event) => {
            event.stopPropagation();
        });
        itemPickerEl.addEventListener("contextmenu", (event) => {
            event.stopPropagation();
        });
        itemPickerEl.loadGrid(content);
        ctxMnu.setItems([itemPickerEl]);
        return ctxMnu;
    }

}

customElements.define("gt-itemgrid-interactive", ItemGridInteractive);
