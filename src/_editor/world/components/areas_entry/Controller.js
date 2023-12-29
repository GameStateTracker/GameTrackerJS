import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import DataManager from "../../data/DataManager.js";
import ComponentController from "../../util/ComponentController.js";
// import AreaEntryModal from "../components/modal/AreaEntryModal.js";
import "./EditorForm.js";
import "./TreeNode.js";

export default class Controller_Areas_Entry extends ComponentController {

    constructor(containerEl, treeEl, editorEl) {
        super("Area", containerEl, treeEl, editorEl);
        /* --- */
        treeEl.addEventListener(`deleteEntity[${this.type}]`, async (event) => {
            event.stopPropagation();
            const {ref} = event.data;
            const confirmation = await ModalDialog.confirm("Delete area?", `Do you really want to delete the area "${ref}"?`);
            if (confirmation === true) {
                DataManager.deleteEntity("Area", ref);
            }
        });
    }

    get type() {
        return "areas_entry";
    }

}
