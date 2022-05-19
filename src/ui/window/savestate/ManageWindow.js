// frameworks
import Template from "/emcJS/util/html/Template.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import FileSystem from "/emcJS/util/FileSystem.js";
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";

import SavestateManager from "../../../savestate/SavestateManager.js";
import SavestateHandler from "../../../savestate/SavestateHandler.js";
import AbstractSavestateWindow from "./AbstractSavestateWindow.js";

const TPL = new Template(`
<div id="footer">
    <input type="hidden" id="statename" placeholder="Please select a state..." readonly />
    <button id="delete" class="button" title="delete state">
        DELETE
    </button>
    <button id="rename" class="button" title="rename state">
        RENAME
    </button>
    <button id="import" class="button" title="import state">
        IMPORT
    </button>
    <button id="import-string" class="button" title="import state from string">
        IMPORT STRING
    </button>
    <button id="export" class="button" title="export state">
        EXPORT
    </button>
</div>
`);

export default class ManageWindow extends AbstractSavestateWindow {

    constructor() {
        super("Manage States");
        const els = TPL.generate();
        /* --- */
        const window = this.shadowRoot.getElementById("window");
        window.append(els.getElementById("footer"));

        const lst = this.shadowRoot.getElementById("statelist");
        const snm = this.shadowRoot.getElementById("statename");
        lst.addEventListener("change", function(event) {
            snm.value = event.newValue;
        });

        // DELETE
        const dlt = this.shadowRoot.getElementById("delete");
        dlt.onclick = async () => {
            const stateName = snm.value;
            if (!snm.value) {
                await Dialog.alert("No state selected", "Please select a state to delete!");
                return;
            }
            if (!await Dialog.confirm("Warning", `Do you really want to delete "${stateName}"? This can not be undone.`)) {
                return;
            }
            await SavestateManager.delete(stateName);
            Toast.info(`State "${stateName}" deleted.`);
            snm.value = "";
            // refresh
            await this.refreshList();
            lst.value = "";
        };

        // RENAME
        const rnm = this.shadowRoot.getElementById("rename");
        rnm.onclick = async () => {
            const stateName = snm.value;
            if (!snm.value) {
                await Dialog.alert("No state selected", "Please select a state to rename!");
                return;
            }
            let newName = "";
            while (!newName) {
                const name = await Dialog.prompt("New state", `Please enter a new name for "${stateName}"!`, stateName);
                if (name === false || name === stateName) {
                    return;
                }
                if (name == "") {
                    await Dialog.alert("Warning", "The name can not be empty.");
                    continue;
                }
                if (await SavestateManager.exists(name)) {
                    if (!await Dialog.confirm("Warning", `The name "${name}" already exists. Do you want to overwrite it?`)) {
                        continue;
                    }
                }
                newName = name;
            }
            await SavestateManager.rename(stateName, newName);
            Toast.info(`State "${stateName}" renamed to "${newName}".`);
            snm.value = "";
            // refresh
            await this.refreshList();
            lst.value = newName;
        };

        // IMPORT
        const imp = this.shadowRoot.getElementById("import");
        imp.onclick = async () => {
            const res = await FileSystem.load(".json");
            if (res == null || res.data == null || res.data.data == null || res.data.name == null) {
                await Dialog.alert("Warning", "Did not find any data to import.");
                return;
            }
            let name = "";
            while (name === "") {
                name = await Dialog.prompt("Import state", `Please enter a new name for the imported state!`, res.data.name);
                if (name === false) {
                    return;
                }
                if (name === "") {
                    await Dialog.alert("Warning", "The state name can not be empty.");
                }
                if (await SavestateManager.exists(name)) {
                    if (!await Dialog.confirm("Warning", `The name "${name}" already exists. Do you want to overwrite it?`)) {
                        name = "";
                    }
                }
            }
            res.data.name = name;
            await SavestateManager.importSavestate(res.data);
            Toast.info(`State "${name}" imported.`);
            snm.value = "";

            // load
            if (await Dialog.confirm("Load imported state?", "Do you want to load the newly imported state?\nUnsafed changes will be lost!")) {
                await SavestateHandler.load(name);
                Toast.success(`State "${name}" loaded.`);
                this.dispatchEvent(new Event("submit"));
                this.close();
                return;
            }
            // refresh
            await this.refreshList();
            lst.value = name;
        };

        // IMPORT STRING
        const ist = this.shadowRoot.getElementById("import-string");
        ist.onclick = async () => {
            let data = await Dialog.prompt("Import", "Please enter export string!");
            if (data === false) {
                return;
            }
            try {
                data = JSON.parse(atob(data));
            } catch (err) {
                console.error(err);
                await Dialog.alert("Warning", "Did not find any data to import.");
                return;
            }
            if (!data || !data.data || !data.name) {
                await Dialog.alert("Warning", "Did not find any data to import.");
                return;
            }
            let name = "";
            while (name == "") {
                name = await Dialog.prompt("Import state", `Please enter a new name for the imported state!`, data.name);
                if (name === false) {
                    return;
                }
                if (await SavestateManager.exists(name)) {
                    if (!await Dialog.confirm("Warning", `The name "${name}" already exists. Do you want to overwrite it?`)) {
                        name = "";
                    }
                }
            }
            data.name = name;
            await SavestateManager.importSavestate(data);
            Toast.info(`State "${name}" imported.`);
            snm.value = "";
            // refresh
            await this.refreshList();
            lst.value = name;
        };

        // EXPORT
        const exp = this.shadowRoot.getElementById("export");
        exp.onclick = async () => {
            const stateName = snm.value;
            if (!snm.value) {
                await Dialog.alert("No state selected", "Please select a state to export!");
                return;
            }
            const data = await SavestateManager.exportSavestate(stateName);
            const date = DateUtil.convert(new Date(data.timestamp || 0), "YMDhms");
            FileSystem.save(JSON.stringify(data, " ", 4), `track-oot-state.${stateName}.${date}.json`);
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

customElements.define("tootr-state-window-manage", ManageWindow);
