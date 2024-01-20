import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import DataManager from "../../data/DataManager.js";
import ComponentController from "../../util/ComponentController.js";
import "./EditorForm.js";
import "./TreeNode.js";

export default class Controller_Locations extends ComponentController {

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
                newName = await ModalDialog.prompt("Add location", "Please enter a new name!");
                if (typeof newName !== "string") {
                    return;
                }
                if (DataManager.hasEntity("Location", newName)) {
                    await ModalDialog.alert("Location already exists", `The location "${newName}" does already exist. Please enter another name!`);
                    newName = null;
                }
            }
            DataManager.writeEntity("Location", newName, {});
            setTimeout(() => {
                treeEl.selectItemByRefPath(["locations", newName]);
                ComponentController.setSelection(["locations", newName]);
            }, 0);
        });
        /* --- */
        if (editorEl != null) {
            editorEl.addEventListener("edit", (event) => {
                event.stopPropagation();
                event.preventDefault();
                const {entityName} = event.data;
                treeEl.selectItemByRefPath(["locations", entityName]);
                ComponentController.setSelection(["locations", entityName]);
            });
        }
    }

    get type() {
        return "locations";
    }

}
