import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";
import DataManager from "../data/DataManager.js";
import scope from "../data/WorldEditorScope";

export default class ComponentController extends Object {

    static #currentSelection = [];

    #entityType;

    constructor(entityType, containerEl, treeEl, editorEl) {
        super();
        this.#entityType = entityType;
        // load data
        treeEl.addEventListener(`entitySelect[${this.type}]`, async (event) => {
            if (isEqual(ComponentController.#currentSelection, treeEl.getSelectedRefPath())) {
                return;
            }
            if (containerEl.checkCurrentEditorHasChanges()) {
                const result = await ModalDialog.confirm("Unsaved changes", "You have unsaved changes in the current form. Discard changes and continue?");
                if (result !== true) {
                    treeEl.selectItemByRefPath(ComponentController.#currentSelection);
                    return;
                }
            }
            const {ref} = event.data;
            scope.entityType = this.#entityType;
            scope.entityName = ref;
            ComponentController.#currentSelection = treeEl.getSelectedRefPath();
            containerEl.switchDetailEditor(editorEl);
        });
        // save data
        if (editorEl != null) {
            editorEl.addEventListener("save", async (event) => {
                try {
                    await BusyIndicatorManager.busy();
                    const ref = scope.entityName;
                    DataManager.writeEntity(this.#entityType, ref, event.data);
                    editorEl.acceptChanges();
                    await BusyIndicatorManager.unbusy();
                } catch {
                    await BusyIndicatorManager.unbusy();
                    await ModalDialog.alert("Error submitting data", "The submitted data does not match the expected configuration.\nPlease notify the creator of the editor!");
                }
            });
        }
    }

    get type() {
        return "";
    }

    get entityType() {
        return this.#entityType;
    }

}
