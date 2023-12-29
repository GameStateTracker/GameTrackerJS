import ComponentController from "../../util/ComponentController.js";
// import WorldConfigEntryModal from "../components/modal/WorldConfigEntryModal.js";
import "./EditorForm.js";
import "./TreeNode.js";

// TODO add contextmenus
export default class Controller_WorldConfig extends ComponentController {

    constructor(containerEl, treeEl, editorEl) {
        super("WorldConfig", containerEl, treeEl, editorEl);
    }

    get type() {
        return "worldconfig";
    }

}
