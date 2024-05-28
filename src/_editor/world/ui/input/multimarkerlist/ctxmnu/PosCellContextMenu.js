import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

export default class PosCellContextMenu extends ContextMenu {

    initItems() {
        super.setItems([
            {menuAction: "copyvalue", content: "Copy value"},
            {menuAction: "pastevalue", content: "Paste value"}
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-edt-input-multi-marker-list-ctxmnu-cell-pos", PosCellContextMenu);
