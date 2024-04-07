
import LocalStorage from "/emcJS/data/storage/global/LocalStorage.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import "/emcJS/ui/form/button/Button.js";
import TPL from "./ModalDialogAddTypeEntities.js.html" assert {type: "html"};
import STYLE from "./ModalDialogAddTypeEntities.js.css" assert {type: "css"};

const CONTINOUS_PROPERTY_NAME = "GT-WorldEdit-AddRelationEntitiesModal-Continuous";

export default class ModalDialogAddTypeEntities extends ModalDialog {

    #inputEl;

    #addContinuousEl;

    constructor() {
        super({title: "Select entity"});
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const footerEl = this.shadowRoot.getElementById("footer");
        const contentEl = this.shadowRoot.getElementById("content");

        this.#inputEl = els.getElementById("input");
        contentEl.append(this.#inputEl);

        const addContinuousLabelEl = els.getElementById("add-continuous-label");
        this.#addContinuousEl = els.getElementById("add-continuous-button");
        this.#addContinuousEl.addEventListener("change", () => {
            LocalStorage.set(CONTINOUS_PROPERTY_NAME, this.#addContinuousEl.checked);
        });
        contentEl.append(addContinuousLabelEl);

        const cancelEl = els.getElementById("cancel");
        cancelEl.addEventListener("click", () => this.cancel());
        footerEl.append(cancelEl);

        const submitEl = els.getElementById("submit");
        submitEl.addEventListener("click", () => this.submit());
        footerEl.append(submitEl);
    }

    async show(value) {
        this.#inputEl.value = value;
        this.#addContinuousEl.checked = !!LocalStorage.get(CONTINOUS_PROPERTY_NAME);
        const result = await super.show();
        return result && [this.#inputEl.value, this.#addContinuousEl.checked];
    }

    set types(value) {
        this.#inputEl.types = value;
    }

    get types() {
        return this.#inputEl.types;
    }

    set sorted(value) {
        this.#inputEl.sorted = value;
    }

    get sorted() {
        return this.#inputEl.sorted;
    }

}

customElements.define("gt-edt-modal-dialog-add-type-entities", ModalDialogAddTypeEntities);
