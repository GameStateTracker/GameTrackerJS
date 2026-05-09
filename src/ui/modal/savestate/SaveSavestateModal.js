import ModalDialog from "@emcjs/fe/ui/modal/ModalDialog.js";
import Toast from "@emcjs/fe/ui/overlay/message/Toast.js";
import "@emcjs/fe/ui/form/element/input/string/StringInput.js";
import "@emcjs/fe/ui/form/button/Button.js";
import SavestateHandler from "../../../savestate/SavestateHandler.js";
import SavestateManager from "../../../savestate/SavestateManager.js";
import AbstractSavestateModal from "./AbstractSavestateModal.js";
import TPL from "./SaveSavestateModal.js.html" assert {type: "html"};

// TODO on manual statenameEl value change: unselect list entry
export default class SaveSavestateModal extends AbstractSavestateModal {

    #savestateListEl;

    #statenameEl;

    #saveEl;

    #cancelEl;

    constructor() {
        super("Save State");
        // TODO set save icon
        const els = TPL.generate();
        /* --- */
        const footerEl = this.shadowRoot.getElementById("footer");
        footerEl.append(els);
        /* --- */
        this.#savestateListEl = this.shadowRoot.getElementById("savestate-list");
        this.#statenameEl = this.shadowRoot.getElementById("statename");
        this.#saveEl = this.shadowRoot.getElementById("save");
        this.#cancelEl = this.shadowRoot.getElementById("cancel");

        this.#savestateListEl.addEventListener("change", () => {
            this.#statenameEl.value = this.#savestateListEl.value[0];
        });

        this.#saveEl.addEventListener("click", async () => {
            const stateName = this.#statenameEl.value;
            if (!stateName) {
                await ModalDialog.alert("State name is empty", "Please enter a name to save the state or select an existing state to overwrite it!");
                return;
            }

            if (await SavestateManager.exists(stateName)) {
                if (!await ModalDialog.confirm("State already exists", "Do you want to overwrite the selected state?")) {
                    return;
                }
            }
            await this.busyIndicator.promise(await SavestateHandler.save(stateName));
            Toast.success(`Saved "${stateName}" successfully.`);
            this.dispatchEvent(new Event("submit"));
            this.close();
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

customElements.define("gt-modal-savestate-save", SaveSavestateModal);
