import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import DateUtil from "/emcJS/util/date/DateUtil.js";
import {createArchive} from "/emcJS/util/zip/Deflate.js";
import FileSystem from "/emcJS/util/file/FileSystem.js";
import "/emcJS/ui/form/element/input/string/StringInput.js";
import "/emcJS/ui/form/button/Button.js";
import SavestateHandler from "../../../savestate/SavestateHandler.js";
import SavestateManager from "../../../savestate/SavestateManager.js";
import AbstractSavestateModal from "./AbstractSavestateModal.js";
import TPL from "./ManageSavestateModal.js.html" assert {type: "html"};

export default class ManageSavestateModal extends AbstractSavestateModal {

    #savestateListEl;

    #deleteEl;

    #renameEl;

    #importEl;

    #exportEl;

    constructor() {
        super("Manage States");
        // TODO set manage icon
        const els = TPL.generate();
        /* --- */
        const footerEl = this.shadowRoot.getElementById("footer");
        footerEl.append(els);
        /* --- */
        this.#savestateListEl = this.shadowRoot.getElementById("savestate-list");
        this.#savestateListEl.multiple = true;
        this.#deleteEl = this.shadowRoot.getElementById("delete");
        this.#renameEl = this.shadowRoot.getElementById("rename");
        this.#importEl = this.shadowRoot.getElementById("import");
        this.#exportEl = this.shadowRoot.getElementById("export");

        this.registerTargetEventHandler(this.#savestateListEl, "change", () => {
            const hasSelected = this.#savestateListEl.value.length > 0;
            this.#deleteEl.disabled = !hasSelected;
            this.#renameEl.disabled = !hasSelected;
            this.#exportEl.disabled = !hasSelected;
        });

        // DELETE
        this.registerTargetEventHandler(this.#deleteEl, "click", async () => {
            const stateNames = this.#savestateListEl.value;
            if (!stateNames) {
                await ModalDialog.alert("No state(s) selected", "Please select a state to delete!");
                return;
            }
            if (!await ModalDialog.confirm("Warning", `Do you really want to delete "${stateNames.join("\", \"")}"? This can not be undone.`)) {
                return;
            }
            for (const stateName of stateNames) {
                await SavestateManager.delete(stateName);
                Toast.info(`State "${stateName}" deleted.`);
            }
            // refresh
            await this.#savestateListEl.refreshList();
            this.#savestateListEl.value = [];
        });

        // RENAME
        this.registerTargetEventHandler(this.#renameEl, "click", async () => {
            const stateNames = this.#savestateListEl.value;
            if (!stateNames) {
                await ModalDialog.alert("No state selected", "Please select a state to rename!");
                return;
            }
            const newNames = [];
            for (const stateName of stateNames) {
                let newName = "";
                while (!newName) {
                    const name = await ModalDialog.prompt("New state", `Please enter a new name for "${stateName}"!`, stateName);
                    if (name === false || name === stateName) {
                        return;
                    }
                    if (name == "") {
                        await ModalDialog.alert("Warning", "The name can not be empty.");
                        continue;
                    }
                    if (await SavestateManager.exists(name)) {
                        if (!await ModalDialog.confirm("Warning", `The name "${name}" already exists. Do you want to overwrite it?`)) {
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
            await this.#savestateListEl.refreshList();
            this.#savestateListEl.value = newNames;
        });

        // IMPORT
        this.registerTargetEventHandler(this.#importEl, "click", async () => {
            const res = await FileSystem.load(".json");
            if (res == null || res.data == null || res.data.data == null || res.data.name == null) {
                await ModalDialog.alert("Warning", "Did not find any data to import.");
                return;
            }
            let name = "";
            while (name === "") {
                name = await ModalDialog.prompt("Import state", `Please enter a new name for the imported state!`, res.data.name);
                if (name === false) {
                    return;
                }
                if (name === "") {
                    await ModalDialog.alert("Warning", "The state name can not be empty.");
                }
                if (await SavestateManager.exists(name)) {
                    if (!await ModalDialog.confirm("Warning", `The name "${name}" already exists. Do you want to overwrite it?`)) {
                        name = "";
                    }
                }
            }
            res.data.name = name;
            await SavestateManager.importSavestate(res.data);
            Toast.info(`State "${name}" imported.`);

            // load
            if (await ModalDialog.confirm("Load imported state?", "Do you want to load the newly imported state?\nUnsafed changes will be lost!")) {
                await SavestateHandler.load(name);
                Toast.success(`State "${name}" loaded.`);
                this.dispatchEvent(new Event("submit"));
                this.close();
                return;
            }

            // refresh
            await this.#savestateListEl.refreshList();
        });

        // EXPORT
        this.registerTargetEventHandler(this.#exportEl, "click", async () => {
            const stateNames = this.#savestateListEl.value;
            if (!stateNames) {
                await ModalDialog.alert("No state selected", "Please select a state to export!");
                return;
            }
            if (stateNames.length === 1) {
                await this.#exportSavestate(stateNames[0]);
            } else {
                await this.#exportZippedSavestates(stateNames);
            }
        });
    }

    async #exportSavestate(stateName) {
        const data = await SavestateManager.exportSavestate(stateName);
        const date = DateUtil.format(new Date(data.timestamp || 0), "YMDhms");
        const fileName = `track-oot-state.${stateName.replace(/\//g, "_")}.${date}.json`;
        FileSystem.save(JSON.stringify(data, null, 4), fileName);
    }

    async #exportZippedSavestates(stateNames) {
        const files = [];
        for (const stateName of stateNames) {
            const data = await SavestateManager.exportSavestate(stateName);
            const date = DateUtil.format(new Date(data.timestamp || 0), "YMDhms");
            const fileName = `track-oot-state.${stateName.replace(/\//g, "_")}.${date}.json`;
            files.push(new File([JSON.stringify(data, null, 4)], fileName));
        }
        const archive = await createArchive(files);
        const archiveDate = DateUtil.format(new Date(), "YMDhms");
        FileSystem.save(archive, `track-oot-states.${archiveDate}.zip`);
    }

    async show(activeState) {
        const stateExists = await SavestateManager.exists(activeState);
        this.#deleteEl.disabled = !stateExists;
        this.#renameEl.disabled = !stateExists;
        this.#exportEl.disabled = !stateExists;
        await super.show(activeState);
    }

}

customElements.define("gt-modal-savestate-manage", ManageSavestateModal);
