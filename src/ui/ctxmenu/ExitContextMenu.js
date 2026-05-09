// frameworks
import ContextMenu from "@emcjs/fe/ui/overlay/ctxmenu/ContextMenu.js";

export default class ExitContextMenu extends ContextMenu {

    initItems() {
        super.setItems([
            {
                menuAction: "bind",
                content: "Bind Entrance"
            },
            {
                menuAction: "unbind",
                content: "Unbind Entrance"
            },
            {
                type: "splitter",
                group: "area"
            },
            {
                menuAction: "goto",
                content: "Goto Area",
                group: "area"
            },
            {
                type: "splitter",
                group: "area"
            },
            {
                menuAction: "check",
                content: "Check All",
                group: "area"
            },
            {
                menuAction: "check_reachable",
                content: "Check All Reachable"
            },
            {
                menuAction: "uncheck",
                content: "Uncheck All",
                group: "area"
            },
            {
                type: "splitter",
                group: "area"
            },
            {
                menuAction: "setwoth",
                content: "Set WOTH",
                group: "area"
            },
            {
                menuAction: "setbarren",
                content: "Set Barren",
                group: "area"
            },
            {
                menuAction: "clearhint",
                content: "Clear Hint",
                group: "area"
            }
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-worldlist-exit-ctxmenu", ExitContextMenu);
