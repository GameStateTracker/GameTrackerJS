// frameworks
import IDBStorage from "/emcJS/storage/IDBStorage.js";

import VersionData from "../data/VersionData.js";
import SavestateConverter from "./SavestateConverter.js";
import FilterStorage from "./storage/FilterStorage.js";
import SettingsStorage from "../storage/SettingsStorage.js";

const STORAGE = new IDBStorage("savestates");

class SavestateManager {

    async rename(current, target) {
        const save = await STORAGE.get(current);
        save.autosave = false;
        save.name = target;
        await STORAGE.delete(current);
        await STORAGE.set(target, save);
    }

    async delete(name) {
        await STORAGE.delete(name);
    }

    async exists(name) {
        return await STORAGE.has(name);
    }

    async getNames() {
        return await STORAGE.keys();
    }

    async getStates() {
        return await STORAGE.getAll();
    }

    async importSavestate(data) {
        data = SavestateConverter.convert(data);
        data.autosave = false;
        await STORAGE.set(data.name, data);
    }

    async exportSavestate(name) {
        const data = await STORAGE.get(name, {});
        data["_info"] = {
            app: VersionData.versionString,
            browser: VersionData.browserData,
            filter: FilterStorage.getAll(),
            settings: SettingsStorage.getAll()
        };
        return data;
    }

}

export default new SavestateManager();
