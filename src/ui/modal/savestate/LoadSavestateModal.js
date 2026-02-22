import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import "/emcJS/ui/form/element/input/string/StringInput.js";
import "/emcJS/ui/form/button/Button.js";
import SavestateHandler from "../../../savestate/SavestateHandler.js";
import AbstractSavestateModal from "./AbstractSavestateModal.js";
import TPL from "./LoadSavestateModal.js.html" assert {type: "html"};

export default class LoadSavestateModal extends AbstractSavestateModal {

    #savestateListEl;

    #statenameEl;

    #loadEl;

    #cancelEl;

    constructor() {
        super("Load State");
        // TODO set load icon
        const els = TPL.generate();
        /* --- */
        const footerEl = this.shadowRoot.getElementById("footer");
        footerEl.append(els);
        /* --- */
        this.#savestateListEl = this.shadowRoot.getElementById("savestate-list");
        this.#statenameEl = this.shadowRoot.getElementById("statename");
        this.#loadEl = this.shadowRoot.getElementById("load");
        this.#cancelEl = this.shadowRoot.getElementById("cancel");

        this.#savestateListEl.addEventListener("change", () => {
            this.#statenameEl.value = this.#savestateListEl.value[0];
        });

        this.#loadEl.addEventListener("click", async () => {
            const stateName = this.#statenameEl.value;
            if (!stateName) {
                await ModalDialog.alert("No state selected", "Please select a state to load!");
                return;
            }
            if (SavestateHandler.isDirty()) {
                if (!await ModalDialog.confirm("Warning, you have unsaved changes.", "Do you want to discard your changes and load the selected state?")) {
                    return;
                }
            }
            await this.busyIndicator.promise(SavestateHandler.load(stateName));
            Toast.info(`State "${stateName}" loaded.`);
            this.remove();
            this.dispatchEvent(new Event("submit"));
        });

        this.#cancelEl.addEventListener("click", () => {
            this.remove();
            this.dispatchEvent(new Event("cancel"));
        });
    }

    async show(activeState) {
        if (activeState != null) {
            this.#statenameEl.value = activeState;
        }
        await super.show(activeState);
    }

}

customElements.define("gt-modal-savestate-load", LoadSavestateModal);
