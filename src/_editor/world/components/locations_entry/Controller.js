import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import DataManager from "../../data/DataManager.js";
import ComponentController from "../../util/ComponentController.js";
// import LocationEntryModal from "../components/modal/LocationEntryModal.js";
import "./EditorForm.js";
import "./TreeNode.js";

// TODO add contextmenus
export default class Controller_Locations_Entry extends ComponentController {

    constructor(containerEl, treeEl, editorEl) {
        super("Location", containerEl, treeEl, editorEl);
        /* --- */
        treeEl.addEventListener(`deleteEntity[${this.type}]`, async (event) => {
            event.stopPropagation();
            const {ref} = event.data;
            const confirmation = await ModalDialog.confirm("Delete location?", `Do you really want to delete the location "${ref}"?`);
            if (confirmation === true) {
                DataManager.deleteEntity("Location", ref);
            }
        });
    }

    get type() {
        return "locations_entry";
    }

}
