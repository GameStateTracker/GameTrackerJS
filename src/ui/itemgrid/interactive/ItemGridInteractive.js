import CustomElement from "/emcJS/ui/element/CustomElement.js";
import CtxMenuLayer from "/emcJS/ui/overlay/ctxmenu/CtxMenuLayer.js";
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";
import ItemsResource from "../../../data/resource/ItemsResource.js";
import UIRegistry from "../../../registry/UIRegistry.js";
import "./components/entries/Item.js";
import "./components/entries/ProgressiveItem.js";
import "./components/entries/ItemMirror.js";
import "./components/entries/ItemMirrorCollection.js";
import TPL from "./ItemGridInteractive.js.html" assert {type: "html"};
import STYLE from "./ItemGridInteractive.js.css" assert {type: "css"};
import ItemStateManager from "../../../statemanager/item/ItemStateManager.js";

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
                    case "collection": {
                        const mirrorCollectionEl = ItemGridInteractive.createItemMirrorCollection(this, element);
                        if (mirrorCollectionEl != null) {
                            cellEl.append(mirrorCollectionEl);
                        } else {
                            const errorEl = document.createElement("DIV");
                            errorEl.className = "error";
                            cellEl.append(errorEl);
                        }
                    } break;
                    case "mirror": {
                        const mirrorEl = ItemGridInteractive.createItemMirror(element);
                        if (mirrorEl != null) {
                            cellEl.append(mirrorEl);
                        } else {
                            const errorEl = document.createElement("DIV");
                            errorEl.className = "error";
                            cellEl.append(errorEl);
                        }
                    } break;
                    case "item": {
                        const data = items[element.value];
                        const itemEl = ItemGridInteractive.createItem(element.value, data);
                        if (itemEl != null) {
                            cellEl.append(itemEl);
                        } else {
                            const errorEl = document.createElement("DIV");
                            errorEl.className = "error";
                            cellEl.append(errorEl);
                        }
                    } break;
                    case "icon": {
                        const iconEl = ItemGridInteractive.createIcon(element.value);
                        if (iconEl != null) {
                            cellEl.append(iconEl);
                        } else {
                            const errorEl = document.createElement("DIV");
                            errorEl.className = "error";
                            cellEl.append(errorEl);
                        }
                    } break;
                    case "text": {
                        const textEl = ItemGridInteractive.createText(element.value);
                        if (textEl != null) {
                            cellEl.append(textEl);
                        } else {
                            const errorEl = document.createElement("DIV");
                            errorEl.className = "error";
                            cellEl.append(errorEl);
                        }
                    } break;
                    case "empty": {
                        const emptyEl = document.createElement("DIV");
                        emptyEl.className = "empty";
                        cellEl.append(emptyEl);
                    } break;
                }
                rowEl.append(cellEl);
            }
            this.#contentEl.append(rowEl);
        }
    }

    static createItem(value, data) {
        const el = UIRegistry.get("itemgrid-item").create(data.type, value);
        el.className = "item";
        return el;
    }

    static createItemMirror(element) {
        const {value, icon, halign, valign, tooltip} = element;
        const el = document.createElement("gt-itemgrid-itemmirror");
        el.ref = value;
        el.icon = icon;
        el.valign = valign;
        el.halign = halign;
        el.tooltip = tooltip;
        return el;
    }

    static createItemMirrorCollection(target, element) {
        const {value, icon, halign, valign, tooltip, contentGrid = [[]], counting = false, countBlacklist = []} = element;
        const el = document.createElement("gt-itemgrid-itemmirror-collection");
        el.ref = value;
        el.icon = icon;
        el.valign = valign;
        el.halign = halign;
        el.tooltip = tooltip;

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
            // ---
            if (counting) {
                for (const rows of contentGrid) {
                    for (const entry of rows) {
                        if (entry.type != "item" || countBlacklist.includes(entry.value)) {
                            continue;
                        }
                        const state = ItemStateManager.get(entry.value);
                        el.addState(state);
                    }
                }
            }
        }

        return el;
    }

    static createText(value) {
        const el = document.createElement("DIV");
        el.className = "text";
        el.innerText = value;
        return el;
    }

    static createIcon(value) {
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
