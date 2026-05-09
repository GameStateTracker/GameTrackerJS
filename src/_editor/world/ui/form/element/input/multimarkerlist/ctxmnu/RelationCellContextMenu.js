import ContextMenu from "@emcjs/fe/ui/overlay/ctxmenu/ContextMenu.js";

// TODO extract ctxmenus into own folder and use in multimarkerlist and markerlist together
export default class RelationCellContextMenu extends ContextMenu {

    initItems() {
        super.setItems([
            {
                menuAction: "addbefore",
                content: "Add Entry before"
            },
            {
                menuAction: "addafter",
                content: "Add Entry after"
            },
            "splitter",
            {
                menuAction: "remove",
                content: "Remove"
            }
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("gt-edt-input-multi-marker-list-ctxmnu-cell-relation", RelationCellContextMenu);
