import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import DataManager from "../../data/DataManager.js";
import ComponentController from "../../util/ComponentController.js";
// import CollectionEntryModal from "../components/modal/CollectionEntryModal.js";
import "./EditorForm.js";
import "./TreeNode.js";

export default class Controller_Collections_Entry extends ComponentController {

    constructor(containerEl, treeEl, editorEl) {
        super("Collection", containerEl, treeEl, editorEl);
        /* --- */
        treeEl.addEventListener(`deleteEntity[${this.type}]`, async (event) => {
            event.stopPropagation();
            const {ref} = event.data;
            const confirmation = await ModalDialog.confirm("Delete collection?", `Do you really want to delete the collection "${ref}"?`);
            if (confirmation === true) {
                DataManager.deleteEntity("Collection", ref);
            }
        });
    }

    get type() {
        return "collections_entry";
    }

}
