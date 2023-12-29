import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import DataManager from "../../data/DataManager.js";
import ComponentController from "../../util/ComponentController.js";
// import "./EditorForm.js";
import "./TreeNode.js";

export default class Controller_Collections extends ComponentController {

    constructor(containerEl, treeEl, editorEl) {
        super("", containerEl, treeEl, editorEl);
        /* --- */
        treeEl.addEventListener(`addEntity[${this.type}]`, async (event) => {
            event.stopPropagation();
            let newName = null;
            while (newName == null) {
                newName = await ModalDialog.prompt("Add collection", "Please enter a new name!");
                if (typeof newName !== "string") {
                    return;
                }
                if (DataManager.hasEntity("Collection", newName)) {
                    await ModalDialog.alert("Collection already exists", `The collection "${newName}" does already exist. Please enter another name!`);
                    newName = null;
                }
            }
            DataManager.writeEntity("Collection", newName, {});
            treeEl.selectItemByPathRef(["collections", newName]);
        });
    }

    get type() {
        return "collections";
    }

}
