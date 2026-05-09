import TreeNode from "@emcjs/fe/ui/tree/components/TreeNode.js";
import WorldEditorTreeNode from "../../ui/tree/WorldEditorTreeNode.js";

export default class TreeNode_WorldConfig extends WorldEditorTreeNode {

    get type() {
        return "worldconfig";
    }

}

TreeNode.registerNodeType("gt-edt-world::world-config", TreeNode_WorldConfig);
customElements.define("gt-edt-world-tree-node-config", TreeNode_WorldConfig);
