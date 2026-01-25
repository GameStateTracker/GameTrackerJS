import Modal from "/emcJS/ui/modal/Modal.js";
import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import "/emcJS/ui/form/element/select/grid/GridSelect.js";
import SavestateManager from "../../../savestate/SavestateManager.js";
import TPL from "./AbstractSavestateModal.js.html" assert {type: "html"};
import STYLE from "./AbstractSavestateModal.js.css" assert {type: "css"};

export default class AbstractSavestateModal extends Modal {

    #savestateGridEl;

    #dataManager;

    constructor(title, modalClass) {
        super(title, modalClass);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const contentEl = this.shadowRoot.getElementById("content");
        contentEl.append(els);
        this.#savestateGridEl = this.shadowRoot.getElementById("savestate-grid");
        this.#dataManager = new SimpleDataProvider(this.#savestateGridEl);
    }

    async show(activeState) {
        await this.refreshList();
        const stateExists = await SavestateManager.exists(activeState);
        if (stateExists) {
            this.#savestateGridEl.value = [activeState];
        } else {
            this.#savestateGridEl.value = [];
        }
        super.show();
    }

    async refreshList() {
        const states = await SavestateManager.getStates();
        const data = [];
        for (const key in states) {
            data.push({
                key,
                ...states[key]
            });
        }
        this.#dataManager.setSource(data);
    }

}
