// frameworks
import HTMLTemplate from "/emcJS/util/html/template/HTMLTemplate.js";
import DateUtil from "/emcJS/util/date/DateUtil.js";
import FileSystem from "/emcJS/util/file/FileSystem.js";
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import {createArchive} from "/emcJS/util/zip/Deflate.js";

import SavestateManager from "../../../savestate/SavestateManager.js";
import SavestateHandler from "../../../savestate/SavestateHandler.js";
import AbstractSavestateWindow from "./AbstractSavestateWindow.js";

const TPL = new HTMLTemplate(`
<div id="footer">
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
        lst.multiple = true;

        // DELETE
        const dlt = this.shadowRoot.getElementById("delete");
        dlt.onclick = async () => {
            const stateNames = lst.value;
            if (!stateNames) {
                await Dialog.alert("No state(s) selected", "Please select a state to delete!");
                return;
            }
            if (!await Dialog.confirm("Warning", `Do you really want to delete "${stateNames.join("\", \"")}"? This can not be undone.`)) {
                return;
            }
            for (const stateName of stateNames) {
                await SavestateManager.delete(stateName);
                Toast.info(`State "${stateName}" deleted.`);
            }

            // refresh
            await this.refreshList();
            lst.value = [];
        };

        // RENAME
        const rnm = this.shadowRoot.getElementById("rename");
        rnm.onclick = async () => {
            const stateNames = lst.value;
            if (!stateNames) {
                await Dialog.alert("No state selected", "Please select a state to rename!");
                return;
            }
            const newNames = [];
            for (const stateName of stateNames) {
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
                newNames.push(newName);
            }

            // refresh
            await this.refreshList();
            lst.value = newNames;
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

            // refresh
            await this.refreshList();
        };

        // EXPORT
        const exp = this.shadowRoot.getElementById("export");
        exp.onclick = async () => {
            const stateNames = lst.value;
            if (!stateNames) {
                await Dialog.alert("No state selected", "Please select a state to export!");
                return;
            }

            if (stateNames.length === 1) {
                await this.#exportSavestate(stateNames[0]);
            } else {
                await this.#exportZippedSavestates(stateNames);
            }
        };
    }

    async #exportSavestate(stateName) {
        const data = await SavestateManager.exportSavestate(stateName);
        const date = DateUtil.convert(new Date(data.timestamp || 0), "YMDhms");
        const fileName = `track-oot-state.${stateName.replace(/\//g, "_")}.${date}.json`;
        FileSystem.save(JSON.stringify(data, null, 4), fileName);
    }

    async #exportZippedSavestates(stateNames) {
        const files = [];
        for (const stateName of stateNames) {
            const data = await SavestateManager.exportSavestate(stateName);
            const date = DateUtil.convert(new Date(data.timestamp || 0), "YMDhms");
            const fileName = `track-oot-state.${stateName.replace(/\//g, "_")}.${date}.json`;
            files.push(new File([JSON.stringify(data, null, 4)], fileName));
        }
        const archive = await createArchive(files);
        const archiveDate = DateUtil.convert(new Date(), "YMDhms");
        FileSystem.save(archive, `track-oot-states.${archiveDate}.zip`);
    }

}

customElements.define("tootr-state-window-manage", ManageWindow);
