import TreeNode from "@emcjs/fe/ui/tree/components/TreeNode.js";
import WorldEditorTreeNode from "../../ui/tree/WorldEditorTreeNode.js";
import CtxMenu from "./CtxMenu.js";

export default class TreeNode_Locations_Entry extends WorldEditorTreeNode {

    constructor() {
        super();
        /* --- */
        this.setDefaultContextMenu(CtxMenu);
        this.addDefaultContextMenuHandler("delete", (event) => {
            event.stopPropagation();
            const ev = new Event(`deleteEntity[${this.type}]`, {
                bubbles: true,
                cancelable: true,
                composed: true
            });
            ev.data = {
                element: this,
                ref: this.ref
            };
            this.dispatchEvent(ev);
        });
        this.addDefaultContextMenuHandler("copyName", (event) => {
            event.stopPropagation();
            navigator.clipboard.writeText(this.ref);
        });
    }

    get type() {
        return "locations_entry";
    }

}

TreeNode.registerNodeType("gt-edt-world::locations-entry", TreeNode_Locations_Entry);
customElements.define("gt-edt-world-tree-node-locations-entry", TreeNode_Locations_Entry);
