import ContextMenu from "@emcjs/fe/ui/overlay/ctxmenu/ContextMenu.js";

export default class PosCellContextMenu extends ContextMenu {

    initItems() {
        super.setItems([
            {
                menuAction: "copyvalue",
                content: "Copy value"
            },
            {
                menuAction: "pastevalue",
                content: "Paste value"
            }
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-edt-input-connection-list-ctxmnu-cell-pos", PosCellContextMenu);
