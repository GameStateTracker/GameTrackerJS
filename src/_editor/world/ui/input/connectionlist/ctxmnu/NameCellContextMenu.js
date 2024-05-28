import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

export default class NameCellContextMenu extends ContextMenu {

    initItems() {
        super.setItems([
            {menuAction: "remove", content: "Remove"}
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-edt-input-connection-list-ctxmnu-cell-name", NameCellContextMenu);
