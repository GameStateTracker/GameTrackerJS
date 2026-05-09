
import LocalStorage from "@emcjs/core/data/storage/global/LocalStorage.js";
import ModalDialog from "@emcjs/fe/ui/modal/ModalDialog.js";
import "@emcjs/fe/ui/form/button/Button.js";
import TPL from "./ModalDialogAddTypeEntities.js.html" assert {type: "html"};
import STYLE from "./ModalDialogAddTypeEntities.js.css" assert {type: "css"};

const CONTINOUS_PROPERTY_NAME = "GT-WorldEdit-AddRelationEntitiesModal-Continuous";

export default class ModalDialogAddTypeEntities extends ModalDialog {

    #contentEl;

    #inputEl;

    #addContinuousEl;

    constructor(caption = "Add entity", options = {}) {
        super(caption, {
            submit: true,
            cancel: true,
            ...options
        });
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#contentEl = this.shadowRoot.getElementById("content");

        this.#inputEl = els.getElementById("input");
        this.#contentEl.append(this.#inputEl);

        const addContinuousLabelEl = els.getElementById("add-continuous-label");
        this.#addContinuousEl = els.getElementById("add-continuous-button");
        this.#addContinuousEl.addEventListener("change", () => {
            LocalStorage.set(CONTINOUS_PROPERTY_NAME, this.#addContinuousEl.checked);
        });
        this.#contentEl.append(addContinuousLabelEl);
    }

    async show(value) {
        this.#inputEl.value = value;
        this.#addContinuousEl.checked = !!LocalStorage.get(CONTINOUS_PROPERTY_NAME);
        return await super.show();
    }

    getSubmitValue() {
        return [this.#inputEl.value, this.#addContinuousEl.checked];
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

    get initialFocusElement() {
        return this.#inputEl;
    }

}

customElements.define("gt-edt-modal-dialog-add-type-entities", ModalDialogAddTypeEntities);
