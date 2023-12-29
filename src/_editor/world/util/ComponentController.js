import DataManager from "../data/DataManager.js";
import scope from "../data/WorldEditorScope";

export default class ComponentController extends Object {

    #entityType;

    constructor(entityType, containerEl, treeEl, editorEl) {
        super();
        this.#entityType = entityType;
        // load data
        treeEl.addEventListener(`entitySelect[${this.type}]`, (event) => {
            const {ref} = event.data;
            scope.entityType = this.#entityType;
            scope.entityName = ref;
            containerEl.switchDetailEditor(editorEl);
        });
        // save data
        if (editorEl != null) {
            editorEl.addEventListener("save", (event) => {
                const ref = scope.entityName;
                DataManager.writeEntity(this.#entityType, ref, event.data);
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
