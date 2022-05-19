// frameworks
import Template from "/emcJS/util/html/Template.js";
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";

import SavestateHandler from "../../../savestate/SavestateHandler.js";
import AbstractSavestateWindow from "./AbstractSavestateWindow.js";

const TPL = new Template(`
<emc-listselect id="statelist"></emc-listselect>
<div id="footer">
    <input type="hidden" id="statename" placeholder="Please select a state..." readonly />
    <button id="submit" class="button" title="load state">
        LOAD
    </button>
    <button id="cancel" class="button" title="cancel">
        CANCEL
    </button>
</div>
`);

export default class LoadWindow extends AbstractSavestateWindow {

    constructor() {
        super("Load State");
        const els = TPL.generate();
        /* --- */
        const window = this.shadowRoot.getElementById("window");
        window.append(els.getElementById("footer"));

        const lst = this.shadowRoot.getElementById("statelist");
        const snm = this.shadowRoot.getElementById("statename");
        lst.addEventListener("change", function(event) {
            snm.value = event.newValue;
        });

        const smt = this.shadowRoot.getElementById("submit");
        smt.onclick = async () => {
            const stateName = snm.value;
            if (!snm.value) {
                await Dialog.alert("No state selected", "Please select a state to load!");
                return;
            }
            if (SavestateHandler.isDirty()) {
                if (!await Dialog.confirm("Warning, you have unsaved changes.", "Do you want to discard your changes and load the selected state?")) {
                    return;
                }
            }
            await SavestateHandler.load(stateName);
            Toast.info(`State "${stateName}" loaded.`);
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

customElements.define("tootr-state-window-load", LoadWindow);
