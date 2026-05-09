import ContextMenu from "@emcjs/fe/ui/overlay/ctxmenu/ContextMenu.js";

export default class CtxMenu_Exits extends ContextMenu {

    initItems() {
        super.setItems([
            {
                menuAction: "add",
                content: "Add exit"
            }
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-edt-world-ctxmenu-exits", CtxMenu_Exits);
