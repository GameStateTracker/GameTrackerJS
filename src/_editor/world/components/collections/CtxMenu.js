import ContextMenu from "@emcjs/fe/ui/overlay/ctxmenu/ContextMenu.js";

export default class CtxMenu_Collections extends ContextMenu {

    initItems() {
        super.setItems([
            {
                menuAction: "add",
                content: "Add collection"
            }
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-edt-world-ctxmenu-collections", CtxMenu_Collections);
