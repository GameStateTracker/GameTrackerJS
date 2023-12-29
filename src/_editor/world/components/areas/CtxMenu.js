import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

export default class CtxMenu_Areas extends ContextMenu {

    initItems() {
        super.setItems([
            {menuAction: "add", content: "Add area"}
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-edt-world-ctxmenu-areas", CtxMenu_Areas);
