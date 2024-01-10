import DataManager from "../data/DataManager.js";
import scope from "../data/WorldEditorScope";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";

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
            editorEl.addEventListener("save", (event) => {
                const ref = scope.entityName;
                DataManager.writeEntity(this.#entityType, ref, event.data);
                editorEl.acceptChanges();
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
