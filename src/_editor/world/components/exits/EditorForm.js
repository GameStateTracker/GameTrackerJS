import CustomElement from "/emcJS/ui/element/CustomElement.js";
import "/emcJS/ui/form/FormContainer.js";
import "/emcJS/ui/form/element/FormElementsLoader.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import "../../ui/grid/DataGridTypeEntries.js";
import TPL from "./EditorForm.js.html" assert {type: "html"};
import STYLE from "./EditorForm.js.css" assert {type: "css"};

export default class EditorForm_Exits extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const typeGridEl = this.shadowRoot.getElementById("type-grid");
        typeGridEl.addEventListener("edit", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {entityType, entityName} = event.data;
            const ev = new Event("edit", {bubbles: true});
            ev.data = {
                entityType,
                entityName
            };
            this.dispatchEvent(ev);
        });
    }

    acceptChanges() {
        // ignore
    }

    reset() {
        // ignore
    }

    setName() {
        // ignore
    }

    setData() {
        // ignore
    }

    hasChanges() {
        return false;
    }

    setFilterConfig() {
        // ignore
    }

    resetScroll() {
        // ignore
    }

}

customElements.define("gt-edt-world-form-exits", EditorForm_Exits);
