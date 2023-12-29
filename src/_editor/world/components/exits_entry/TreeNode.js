import TreeNode from "/emcJS/ui/tree/components/TreeNode.js";
import WorldEditorTreeNode from "../../ui/tree/WorldEditorTreeNode.js";
import CtxMenu from "./CtxMenu.js";

export default class TreeNode_Exits_Entry extends WorldEditorTreeNode {

    constructor() {
        super();
        /* --- */
        this.setDefaultContextMenu(CtxMenu);
        this.addDefaultContextMenuHandler("delete", (event) => {
            event.stopPropagation();
            const ev = new Event(`deleteEntity[${this.type}]`, {bubbles: true, cancelable: true, composed: true});
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
        return "exits_entry";
    }

}

TreeNode.registerNodeType("gt-edt-world::exits-entry", TreeNode_Exits_Entry);
customElements.define("gt-edt-world-tree-node-exits-entry", TreeNode_Exits_Entry);
