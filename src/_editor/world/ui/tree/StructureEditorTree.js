import CustomElement from "/emcJS/ui/element/CustomElement.js";
import ContextMenuManagerMixin from "/emcJS/ui/mixin/ContextMenuManagerMixin.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import "/emcJS/ui/tree/Tree.js";
// import StructureTreeContextMenuForm from "./contextmenu/StructureTreeContextMenuForm.js";
// import StructureTreeContextMenuFormElement from "./contextmenu/StructureTreeContextMenuFormElement.js";
// import StructureTreeContextMenuFormElementWithChild from "./contextmenu/StructureTreeContextMenuFormElementWithChild.js";
import TPL from "./StructureEditorTree.js.html" assert {type: "html"};
import STYLE from "./StructureEditorTree.js.css" assert {type: "css"};
import TreeConfigExtractor from "../../util/TreeConfigExtractor.js";

const DEFAULT_TREE_CONFIG_EXTRACTOR = new TreeConfigExtractor()

const BaseClass = mix(
    CustomElement
).with(
    ContextMenuManagerMixin
);

export default class StructureEditorTree extends BaseClass {

    #treeEl;

    #treeConfigExtractor;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("contextmenusclosed", () => {
            this.#treeEl.markItemByPathForMenu();
        });
        /* --- */
        this.#treeEl = this.shadowRoot.getElementById("tree");
        this.#treeEl.addEventListener("select", (event) => {
            if (!event.data.isSelected) {
                event.preventDefault();
            }
        });
        this.#treeEl.addEventListener("menu", (event) => {
            const {path, element} = event.data;
            this.#treeEl.markItemByPathForMenu(path);
            if (path.length === 1) {
                this.showContextMenu("form", event, {path});
            } else if (path.length > 1) {
                if (element.forceCollapsible) {
                    this.showContextMenu("elementWithChild", event, {path});
                } else {
                    this.showContextMenu("element", event, {path});
                }
            }
            event.stopPropagation();
            event.preventDefault();
        });
    }

    set treeConfigExtractor(value) {
        if (value instanceof TreeConfigExtractor) {
            this.#treeConfigExtractor = value;
        } else {
            this.#treeConfigExtractor = null;
        }
    }

    get treeConfigExtractor() {
        return this.#treeConfigExtractor ?? DEFAULT_TREE_CONFIG_EXTRACTOR;
    }

    getSelectedPath() {
        return this.#treeEl.getSelectedPath();
    }

    getSelectedRefPath() {
        return this.#treeEl.getSelectedRefPath();
    }

    selectItemByPath(path) {
        this.#treeEl.forcePathExpanded(path.slice(0, -1));
        this.#treeEl.selectItemByPath(path);
    }

    selectItemByRefPath(path) {
        this.#treeEl.forceRefPathExpanded(path.slice(0, -1));
        this.#treeEl.selectItemByRefPath(path);
    }

    forcePathExpanded(path) {
        this.#treeEl.forcePathExpanded(path);
    }

    forceRefPathExpanded(path) {
        this.#treeEl.forceRefPathExpanded(path);
    }

    refresh(type) {
        if (type == null) {
            const config = this.treeConfigExtractor.extractTreeStructure();
            this.#treeEl.loadConfig(config);
        } else {
            switch (type) {
                case "Location": {
                    const config = this.treeConfigExtractor.extractTreeStructureLocations();
                    this.#treeEl.loadConfigAtRefPath(["locations"], config);
                } break;
                case "Collection": {
                    const config = this.treeConfigExtractor.extractTreeStructureCollections();
                    this.#treeEl.loadConfigAtRefPath(["collections"], config);
                } break;
                case "Area": {
                    const config = this.treeConfigExtractor.extractTreeStructureAreas();
                    this.#treeEl.loadConfigAtRefPath(["areas"], config);
                } break;
                case "Exit": {
                    const config = this.treeConfigExtractor.extractTreeStructureExits();
                    this.#treeEl.loadConfigAtRefPath(["exits"], config);
                } break;
            }
        }
    }

}

customElements.define("gt-edt-world-editor-structure-tree", StructureEditorTree);
