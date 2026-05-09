// frameworks
import ContextMenu from "@emcjs/fe/ui/overlay/ctxmenu/ContextMenu.js";

export default class AreaContextMenu extends ContextMenu {

    initItems() {
        super.setItems([
            {
                menuAction: "goto",
                content: "Goto Area"
            },
            "splitter",
            {
                menuAction: "check",
                content: "Check All"
            },
            {
                menuAction: "check_reachable",
                content: "Check All Reachable"
            },
            {
                menuAction: "uncheck",
                content: "Uncheck All"
            },
            "splitter",
            {
                menuAction: "setwoth",
                content: "Set WOTH"
            },
            {
                menuAction: "setbarren",
                content: "Set Barren"
            },
            {
                menuAction: "clearhint",
                content: "Clear WOTH/Barren"
            }
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-ctxmenu-area", AreaContextMenu);
