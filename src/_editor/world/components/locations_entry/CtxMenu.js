import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

export default class CtxMenu_Locations_Entry extends ContextMenu {

    initItems() {
        super.setItems([
            {menuAction: "copyName", content: "Copy name to clipboard"},
            {menuAction: "delete", content: "Delete"}
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-edt-world-ctxmenu-locations-entry", CtxMenu_Locations_Entry);
