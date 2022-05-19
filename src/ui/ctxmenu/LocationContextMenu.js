// frameworks
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

export default class LocationContextMenu extends ContextMenu {

    initItems() {
        super.loadItems([
            {menuAction: "check", content: "Check"},
            {menuAction: "uncheck", content: "Uncheck"},
            "splitter",
            {menuAction: "associate", content: "Set Item"},
            {menuAction: "disassociate", content: "Clear Item"},
            "splitter",
            {menuAction: "show_logic", content: "Show Logic"}
        ]);
    }

    loadItems() {
        // nothing
    }

}

customElements.define("gt-worldlist-location-ctxmenu", LocationContextMenu);
