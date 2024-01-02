import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";
import GridsResource from "../../data/resource/GridsResource.js";
import "../itemgrid/interactive/ItemGridInteractive.js";

export default class ItemPickerContextMenu extends ContextMenu {

    #itemPickerEl = null;

    show(posX, posY, items) {
        super.show(posX, posY);
        if (this.#itemPickerEl != null) {
            if (typeof items == "string") {
                const config = GridsResource.get(items);
                this.#itemPickerEl.loadGrid(config);
            } else if (Array.isArray(items)) {
                this.#itemPickerEl.grid = "";
                this.#itemPickerEl.loadGrid(items);
            }
        }
    }

    initItems() {
        this.#itemPickerEl = document.createElement("gt-itemgrid-interactive");
        this.#itemPickerEl.id = "item-picker";
        this.#itemPickerEl.addEventListener("click", (event) => {
            event.stopPropagation();
        });
        super.setItems([this.#itemPickerEl]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-worldlist-itempicker-ctxmenu", ItemPickerContextMenu);
