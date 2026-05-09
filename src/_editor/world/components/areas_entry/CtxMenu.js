import ContextMenu from "@emcjs/fe/ui/overlay/ctxmenu/ContextMenu.js";

export default class CtxMenu_Areas_Entry extends ContextMenu {

    initItems() {
        super.setItems([
            {
                menuAction: "copyName",
                content: "Copy name to clipboard"
            },
            {
                menuAction: "delete",
                content: "Delete"
            }
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-edt-world-ctxmenu-areas-entry", CtxMenu_Areas_Entry);
