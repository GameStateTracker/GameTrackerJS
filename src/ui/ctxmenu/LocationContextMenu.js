// frameworks
import ContextMenu from "@emcjs/fe/ui/overlay/ctxmenu/ContextMenu.js";

export default class LocationContextMenu extends ContextMenu {

    initItems() {
        super.setItems([
            {
                menuAction: "check",
                content: "Check"
            },
            {
                menuAction: "uncheck",
                content: "Uncheck"
            },
            "splitter",
            {
                menuAction: "associate",
                content: "Set Item"
            },
            {
                menuAction: "disassociate",
                content: "Clear Item"
            }
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-worldlist-location-ctxmenu", LocationContextMenu);
