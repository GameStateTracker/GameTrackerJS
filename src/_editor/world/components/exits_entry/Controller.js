import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import DataManager from "../../data/DataManager.js";
import ComponentController from "../../util/ComponentController.js";
// import ExitEntryModal from "../components/modal/ExitEntryModal.js";
import "./EditorForm.js";
import "./TreeNode.js";

export default class Controller_Exits_Entry extends ComponentController {

    constructor(containerEl, treeEl, editorEl) {
        super("Exit", containerEl, treeEl, editorEl);
        /* --- */
        treeEl.addEventListener(`deleteEntity[${this.type}]`, async (event) => {
            event.stopPropagation();
            const {ref} = event.data;
            const confirmation = await ModalDialog.confirm("Delete exit?", `Do you really want to delete the exit "${ref}"?`);
            if (confirmation === true) {
                DataManager.deleteEntity("Exit", ref);
            }
        });
    }

    get type() {
        return "exits_entry";
    }

}
