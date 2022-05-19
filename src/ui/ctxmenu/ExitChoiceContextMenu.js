// frameworks
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

export default class ExitChoiceContextMenu extends ContextMenu {

    initItems() {
        super.loadItems([
            {menuAction: "associate", content: "Bind Entrance"},
            {menuAction: "deassociate", content: "Unbind Entrance"}
        ]);
    }

    loadItems() {
        // nothing
    }

}

customElements.define("gt-ctxmenu-exitchoice", ExitChoiceContextMenu);
