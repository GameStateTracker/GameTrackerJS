// frameworks
import Template from "/emcJS/util/html/Template.js";
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";

import SavestateManager from "../../../savestate/SavestateManager.js";
import SavestateHandler from "../../../savestate/SavestateHandler.js";
import AbstractSavestateWindow from "./AbstractSavestateWindow.js";

const TPL = new Template(`
<div id="footer">
    <input type="text" id="statename" placeholder="Please enter a name..." />
    <button id="submit" class="button" title="save state">
        SAVE
    </button>
    <button id="cancel" class="button" title="cancel">
        CANCEL
    </button>
</div>
`);

export default class SaveWindow extends AbstractSavestateWindow {

    constructor() {
        super("Save State as...");
        const els = TPL.generate();
        /* --- */
        const window = this.shadowRoot.getElementById("window");
        window.append(els.getElementById("footer"));

        const lst = this.shadowRoot.getElementById("statelist");
        const snm = this.shadowRoot.getElementById("statename");
        lst.addEventListener("change", function(event) {
            snm.value = event.newValue;
        });
        snm.addEventListener("change", function(event) {
            lst.value = event.target.value;
        });

        const smt = this.shadowRoot.getElementById("submit");
        smt.onclick = async () => {
            const stateName = snm.value;
            if (!snm.value) {
                await Dialog.alert("State name is empty", "Please enter a name to save the state or select an existing state to overwrite it!");
                return;
            }
            if (await SavestateManager.exists(stateName)) {
                if (!await Dialog.confirm("State already exists", "Do you want to overwrite the selected state?")) {
                    return;
                }
            }
            await SavestateHandler.save(stateName);
            Toast.success(`Saved "${stateName}" successfully.`);
            this.dispatchEvent(new Event("submit"));
            this.close();
        };
        const ccl = this.shadowRoot.getElementById("cancel");
        ccl.onclick = () => {
            this.dispatchEvent(new Event("cancel"));
            this.close();
        };
    }

    async show(activeState) {
        const snm = this.shadowRoot.getElementById("statename");
        if (activeState != null) {
            snm.value = activeState;
        }
        super.show(activeState);
    }

}

customElements.define("tootr-state-window-save", SaveWindow);
