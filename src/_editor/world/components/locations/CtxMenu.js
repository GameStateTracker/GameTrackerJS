import ContextMenu from "@emcjs/fe/ui/overlay/ctxmenu/ContextMenu.js";

export default class CtxMenu_Locations extends ContextMenu {

    initItems() {
        super.setItems([
            {
                menuAction: "add",
                content: "Add location"
            }
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-edt-world-ctxmenu-locations", CtxMenu_Locations);
