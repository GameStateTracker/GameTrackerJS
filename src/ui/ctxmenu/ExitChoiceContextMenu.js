// frameworks
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

export default class ExitChoiceContextMenu extends ContextMenu {

    initItems() {
        super.setItems([
            {menuAction: "bind", content: "Bind Entrance"},
            {menuAction: "unbind", content: "Unbind Entrance"}
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-ctxmenu-exitchoice", ExitChoiceContextMenu);
