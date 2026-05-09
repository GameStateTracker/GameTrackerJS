import ContextMenu from "@emcjs/fe/ui/overlay/ctxmenu/ContextMenu.js";
import "../itemgrid/picker/ItemPicker.js";

export default class ItemPickerContextMenu extends ContextMenu {

    #itemPickerEl = null;

    show(posX, posY, items) {
        super.show(posX, posY);
        if (this.#itemPickerEl != null) {
            if (typeof items == "string") {
                this.#itemPickerEl.items = "";
                this.#itemPickerEl.grid = items;
            } else if (Array.isArray(items)) {
                this.#itemPickerEl.grid = "";
                this.#itemPickerEl.items = JSON.stringify(items);
            }
        }
    }

    initItems() {
        this.#itemPickerEl = document.createElement("gt-itempicker");
        this.#itemPickerEl.id = "item-picker";
        this.#itemPickerEl.addEventListener("pick", (event) => {
            const ev = new Event("pick");
            ev.item = event.value;
            this.dispatchEvent(ev);
            /* --- */
            event.preventDefault();
            return false;
        });
        super.setItems([this.#itemPickerEl]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-worldlist-itempicker-ctxmenu", ItemPickerContextMenu);
