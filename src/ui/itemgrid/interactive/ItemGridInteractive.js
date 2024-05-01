import CustomElement from "/emcJS/ui/element/CustomElement.js";
import CtxMenuLayer from "/emcJS/ui/overlay/ctxmenu/CtxMenuLayer.js";
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";
import ItemsResource from "../../../data/resource/ItemsResource.js";
import UIRegistry from "../../../registry/UIRegistry.js";
import "./components/entries/Item.js";
import "./components/entries/ProgressiveItem.js";
import "./components/entries/ItemMirror.js";
import "./components/entries/ItemMirrorCollection.js";
import "./components/entries/Conditional.js";
import TPL from "./ItemGridInteractive.js.html" assert {type: "html"};
import STYLE from "./ItemGridInteractive.js.css" assert {type: "css"};
import ItemStateManager from "../../../statemanager/item/ItemStateManager.js";

const ITEMS = ItemsResource.get();

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
            for (const element of row) {
                const cellEl = document.createElement("td");

                const el = ItemGridInteractive.createElement(this, element);
                if (el != null) {
                    cellEl.append(el);
                } else {
                    const errorEl = document.createElement("DIV");
                    errorEl.className = "error";
                    cellEl.append(errorEl);
                }

                rowEl.append(cellEl);
            }
            this.#contentEl.append(rowEl);
        }
    }

    static createElement(target, element) {
        switch (element.type) {
            case "conditional": {
                const conditionalEl = this.createConditional(target, element);
                return conditionalEl;
            }
            case "collection": {
                const mirrorCollectionEl = this.createItemMirrorCollection(target, element);
                return mirrorCollectionEl;
            }
            case "mirror": {
                const mirrorEl = this.createItemMirror(element);
                return mirrorEl;
            }
            case "item": {
                const data = ITEMS[element.value];
                const itemEl = this.createItem(element.value, data);
                return itemEl;
            }
            case "icon": {
                const iconEl = this.createIcon(element.value);
                return iconEl;
            }
            case "text": {
                const textEl = this.createText(element);
                return textEl;
            }
            case "empty": {
                const emptyEl = document.createElement("DIV");
                emptyEl.className = "empty";
                return emptyEl;
            }
        }
    }

    static createConditional(target, element) {
        const {condition, onTrue, onFalse} = element;

        const el = document.createElement("gt-itemgrid-conditional");

        el.setCondition(condition);

        const thenEl = this.createElement(target, onTrue);
        if (thenEl != null) {
            el.setThenEl(thenEl);
        } else {
            const errorEl = document.createElement("DIV");
            errorEl.className = "error";
            el.setThenEl(errorEl);
        }

        const elseEl = this.createElement(target, onFalse);
        if (thenEl != null) {
            el.setElseEl(elseEl);
        } else {
            const errorEl = document.createElement("DIV");
            errorEl.className = "error";
            el.setElseEl(errorEl);
        }

        return el;
    }

    static createItemMirror(element) {
        const {value, icon, halign, valign, tooltip} = element;

        const el = document.createElement("gt-itemgrid-itemmirror");

        el.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        el.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            event.stopPropagation();
        });

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

            el.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                const rect = el.getBoundingClientRect();
                ctxMnu.show(rect.x, rect.y);
            });
            el.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                event.stopPropagation();
                const rect = el.getBoundingClientRect();
                ctxMnu.show(rect.x, rect.y);
            });

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

    static createItem(value, data) {
        if (data == null) {
            const errorEl = document.createElement("DIV");
            errorEl.className = "error";
            return errorEl;
        }
        const el = UIRegistry.get("itemgrid-item").create(data.type, value);
        el.className = "item";
        return el;
    }

    static createText(element) {
        const {value, halign, valign, width, height} = element;

        const el = document.createElement("DIV");

        el.className = "text";
        el.innerText = value;

        if (halign === "start") {
            el.style.justifyContent = "flex-start";
        } else if (halign === "end") {
            el.style.justifyContent = "flex-end";
        }
        if (valign === "start") {
            el.style.alignItems = "flex-start";
        } else if (valign === "end") {
            el.style.alignItems = "flex-end";
        }

        if (typeof width === "number" && !isNaN(width)) {
            el.style.width = `${width}px`;
        }
        if (typeof height === "number" && !isNaN(height)) {
            el.style.height = `${height}px`;
        }

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
