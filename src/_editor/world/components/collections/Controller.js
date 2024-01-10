import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import DataManager from "../../data/DataManager.js";
import ComponentController from "../../util/ComponentController.js";
import "./EditorForm.js";
import "./TreeNode.js";

export default class Controller_Collections extends ComponentController {

    constructor(containerEl, treeEl, editorEl) {
        super("", containerEl, treeEl, editorEl);
        /* --- */
        treeEl.addEventListener(`addEntity[${this.type}]`, async (event) => {
            event.stopPropagation();
            if (containerEl.checkCurrentEditorHasChanges()) {
                const result = await ModalDialog.confirm("Unsaved changes", "You have unsaved changes in the current form. Discard changes and continue?");
                if (result !== true) {
                    return;
                }
            }
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
            treeEl.selectItemByRefPath(["collections", newName]);
        });
        /* --- */
        if (editorEl != null) {
            editorEl.addEventListener("edit", (event) => {
                event.stopPropagation();
                event.preventDefault();
                const {entityName} = event.data;
                treeEl.selectItemByRefPath(["collections", entityName]);
            });
        }
    }

    get type() {
        return "collections";
    }

}
