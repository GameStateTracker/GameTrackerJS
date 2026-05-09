import TreeNode from "@emcjs/fe/ui/tree/components/TreeNode.js";
import WorldEditorTreeNode from "../../ui/tree/WorldEditorTreeNode.js";
import CtxMenu from "./CtxMenu.js";

export default class TreeNode_Areas extends WorldEditorTreeNode {

    constructor() {
        super();
        /* --- */
        this.setDefaultContextMenu(CtxMenu);
        this.addDefaultContextMenuHandler("add", (event) => {
            event.stopPropagation();
            const ev = new Event(`addEntity[${this.type}]`, {
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
    }

    get type() {
        return "areas";
    }

}

TreeNode.registerNodeType("gt-edt-world::areas", TreeNode_Areas);
customElements.define("gt-edt-world-tree-node-areas", TreeNode_Areas);
