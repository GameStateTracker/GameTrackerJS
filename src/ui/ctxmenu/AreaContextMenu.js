// frameworks
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

export default class AreaContextMenu extends ContextMenu {

    initItems() {
        super.loadItems([
            {menuAction: "goto", content: "Goto Area"},
            "splitter",
            {menuAction: "check", content: "Check All"},
            {menuAction: "uncheck", content: "Uncheck All"},
            "splitter",
            {menuAction: "setwoth", content: "Set WOTH"},
            {menuAction: "setbarren", content: "Set Barren"},
            {menuAction: "clearhint", content: "Clear Hint"}
        ]);
    }

    loadItems() {
        // nothing
    }

}

customElements.define("gt-ctxmenu-area", AreaContextMenu);
