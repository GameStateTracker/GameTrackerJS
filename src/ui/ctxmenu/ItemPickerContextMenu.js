// frameworks
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

import "../itempicker/ItemPicker.js";

export default class ItemPickerContextMenu extends ContextMenu {

    #items = "";

    show(posX, posY, items) {
        super.show(posX, posY);
        this.#items = items ?? "";
    }

    afterRenderCallback() {
        const itemPickerEl = this.querySelector("#item-picker");
        if (itemPickerEl != null) {
            if (typeof this.#items == "string") {
                itemPickerEl.setAttribute("grid", this.#items);
            } else if (Array.isArray(this.#items)) {
                itemPickerEl.setAttribute("items", JSON.stringify(this.#items));
            }
        }
    }

    initItems() {
        const itemPickerEl = document.createElement("gt-itempicker");
        itemPickerEl.id = "item-picker";
        itemPickerEl.addEventListener("pick", (event) => {
            const ev = new Event("pick");
            ev.item = event.value;
            this.dispatchEvent(ev);
            /* --- */
            event.preventDefault();
            return false;
        });
        super.setItems([itemPickerEl]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-worldlist-itempicker-ctxmenu", ItemPickerContextMenu);
