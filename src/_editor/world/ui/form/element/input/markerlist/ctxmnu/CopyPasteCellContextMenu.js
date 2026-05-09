import ContextMenu from "@emcjs/fe/ui/overlay/ctxmenu/ContextMenu.js";

// TODO extract ctxmenus into own folder and use in multimarkerlist and markerlist together
export default class CopyPasteCellContextMenu extends ContextMenu {

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

customElements.define("gt-edt-input-marker-list-ctxmnu-cell-copypaste", CopyPasteCellContextMenu);
