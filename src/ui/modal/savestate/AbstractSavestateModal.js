import Modal from "/emcJS/ui/modal/Modal.js";
import SavestateManager from "../../../savestate/SavestateManager.js";
import "./list/SavestateList.js";
import TPL from "./AbstractSavestateModal.js.html" assert {type: "html"};
import STYLE from "./AbstractSavestateModal.js.css" assert {type: "css"};

export default class AbstractSavestateModal extends Modal {

    #savestateListEl;

    constructor(title, modalClass) {
        super(title, modalClass);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const contentEl = this.shadowRoot.getElementById("content");
        contentEl.append(els);
        this.#savestateListEl = this.shadowRoot.getElementById("savestate-list");
    }

    async show(activeState) {
        await this.#savestateListEl.refreshList();
        const stateExists = await SavestateManager.exists(activeState);
        if (stateExists) {
            this.#savestateListEl.value = [activeState];
        } else {
            this.#savestateListEl.value = [];
        }
        super.show();
    }

}
