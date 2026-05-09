import ContextMenuManagerMixin from "@emcjs/fe/ui/mixin/ContextMenuManagerMixin.js";
import TreeNode from "@emcjs/fe/ui/tree/components/TreeNode.js";

export default class WorldEditorTreeNode extends ContextMenuManagerMixin(TreeNode) {

    constructor() {
        super();
        /* --- */
        this.addEventListener("contentclick", (event) => {
            event.stopPropagation();
            const ev = new Event(`entitySelect[${this.type}]`, {
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
        this.addEventListener("contentcontextmenu", (event) => {
            event.stopPropagation();
            this.showDefaultContextMenu(event);
            return false;
        });
    }

    get type() {
        return "";
    }

}

customElements.define("gt-edt-world-tree-node", WorldEditorTreeNode);
