import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import DataManager from "../../data/DataManager.js";
import ComponentController from "../../util/ComponentController.js";
import "./EditorForm.js";
import "./TreeNode.js";

export default class Controller_Areas extends ComponentController {

    constructor(containerEl, treeEl, editorEl) {
        super("", containerEl, treeEl, editorEl);
        /* --- */
        treeEl.addEventListener(`addEntity[${this.type}]`, async (event) => {
            event.stopPropagation();
            let newName = null;
            while (newName == null) {
                newName = await ModalDialog.prompt("Add area", "Please enter a new name!");
                if (typeof newName !== "string") {
                    return;
                }
                if (DataManager.hasEntity("Area", newName)) {
                    await ModalDialog.alert("Area already exists", `The area "${newName}" does already exist. Please enter another name!`);
                    newName = null;
                }
            }
            DataManager.writeEntity("Area", newName, {});
            treeEl.selectItemByPathRef(["areas", newName]);
        });
        /* --- */
        if (editorEl != null) {
            editorEl.addEventListener("edit", (event) => {
                event.stopPropagation();
                event.preventDefault();
                const {entityName} = event.data;
                treeEl.selectItemByPathRef(["areas", entityName]);
            });
        }
    }

    get type() {
        return "areas";
    }

}
