import Modal from "/emcJS/ui/modal/Modal.js";
import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import SimpleDataReceiver from "/emcJS/util/datareceiver/SimpleDataReceiver.js";
import "/emcJS/ui/form/element/select/list/ListSelect.js";
import SavestateManager from "../../../savestate/SavestateManager.js";
// import SavestateEntry from "./components/SavestateEntry.js";
import TPL from "./AbstractSavestateModal.js.html" assert {type: "html"};
import STYLE from "./AbstractSavestateModal.js.css" assert {type: "css"};

// TODO create own ListView for savestates
// should handle savestates by its own account
// expect to work similar to ListSelect
export default class AbstractSavestateModal extends Modal {

    #savestateListEl;

    #dataManager;

    constructor(title, modalClass) {
        super(title, modalClass);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const contentEl = this.shadowRoot.getElementById("content");
        contentEl.append(els);
        this.#savestateListEl = this.shadowRoot.getElementById("savestate-list");
        // this.#savestateListEl.setListEntryClass(SavestateEntry);
        const receiver = new SimpleDataReceiver((data) => {
            for (const entry of data) {
                const optionEl = document.createElement("option");
                optionEl.value = entry.name;
                optionEl.label = entry.name;
                // optionEl.dataset.name = entry.name;
                // optionEl.dataset.autosave = entry.autosave;
                // optionEl.dataset.timestamp = entry.timestamp;
                // optionEl.dataset.version = entry.version;
                this.#savestateListEl.append(optionEl);
            }
        });
        this.#dataManager = new SimpleDataProvider(receiver, null, {
            config: {
                searchFields: ["name"],
                filterIgnoreNullValues: true,
                sort: ["auto", "name"]
            }
        });
    }

    async show(activeState) {
        await this.refreshList();
        const stateExists = await SavestateManager.exists(activeState);
        if (stateExists) {
            this.#savestateListEl.value = [activeState];
        } else {
            this.#savestateListEl.value = [];
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
