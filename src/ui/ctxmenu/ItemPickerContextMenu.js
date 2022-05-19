// frameworks
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

import "../itempicker/ItemPicker.js";

const ITEMS = new WeakMap();

export default class ItemPickerContextMenu extends ContextMenu {

    show(posX, posY, items) {
        super.show(posX, posY);
        this.loadItems(items);
    }

    initItems() {
        const itemPickerEl = document.createElement("gt-itempicker");
        itemPickerEl.id = "item-picker";
        if (ITEMS.has(this)) {
            const config = ITEMS.get(this);
            if (typeof config == "string") {
                itemPickerEl.setAttribute("grid", config);
            } else if (Array.isArray(config)) {
                itemPickerEl.setAttribute("items", JSON.stringify(config));
            }
        }
        itemPickerEl.addEventListener("pick", event => {
            const ev = new Event("pick");
            ev.item = event.value;
            this.dispatchEvent(ev);
            /* --- */
            event.preventDefault();
            return false;
        });
        super.loadItems([itemPickerEl]);
    }

    loadItems(config = "") {
        ITEMS.set(this, config);
        const itemPickerEl = this.querySelector("#item-picker");
        if (itemPickerEl != null) {
            if (typeof config == "string") {
                itemPickerEl.setAttribute("grid", config);
            } else if (Array.isArray(config)) {
                itemPickerEl.setAttribute("items", JSON.stringify(config));
            }
        }
    }

}

customElements.define("gt-worldlist-itempicker-ctxmenu", ItemPickerContextMenu);
