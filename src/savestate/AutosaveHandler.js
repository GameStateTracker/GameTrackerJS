// frameworks
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import DateUtil from "/emcJS/util/DateUtil.js";

import VersionData from "../data/VersionData.js";
import Savestate from "./Savestate.js";
import SavestateHandler from "./SavestateHandler.js";

const STORAGE = new IDBStorage("savestates");

let autosaveTimeTrigger = false;
let autosaveDirtyTrigger = false;
let lastAutoSave = new Date();

let autosaveSlots = 0;
let autosaveTime = 0;

let autosaveTimeout = null;
let paramChangeTimeout = null;

function sortStates(a, b) {
    if (a < b) {
        return 1;
    } else if (a > b) {
        return -1;
    } else {
        return 0;
    }
}

function registerAutosaveTimer() {
    if (autosaveTimeout != null) {
        clearTimeout(autosaveTimeout);
        autosaveTimeout = null;
    }
    if (autosaveTime > 0 && autosaveSlots > 0) {
        const remainingTime =  autosaveTime - (new Date() - lastAutoSave);
        autosaveTimeout = setTimeout(() => {
            autosaveTimeout = null;
            autosaveTimeTrigger = true;
            if (autosaveDirtyTrigger && SavestateHandler.isDirty()) {
                autosave();
            }
        }, remainingTime);
    }
}

async function removeOverflowAutosaves() {
    const saves = await STORAGE.getAll();
    const keys = Object.keys(saves);
    const stateKeys = [];
    for (const key of keys) {
        if (saves[key].autosave) {
            stateKeys.push(key);
        }
    }
    stateKeys.sort(sortStates);
    while (stateKeys.length > 0 && stateKeys.length >= autosaveSlots) {
        const key = stateKeys.pop();
        if (saves[key].autosave) {
            await STORAGE.delete(key);
        }
    }
}

async function autosave() {
    lastAutoSave = new Date();
    autosaveDirtyTrigger = false;
    autosaveTimeTrigger = false;
    /* -- */
    const tmp = Object.assign({}, Savestate.serialize());
    tmp.timestamp = lastAutoSave;
    tmp.autosave = true;
    tmp["_meta"] = {
        app: VersionData.versionString,
        browser: VersionData.browserData
    };
    await STORAGE.set(`${DateUtil.convert(lastAutoSave, "YMDhms")}_${tmp.name}`, tmp);
    await removeOverflowAutosaves();
    /* -- */
    registerAutosaveTimer();
}

function onParamsChange() {
    if (paramChangeTimeout != null) {
        clearTimeout(paramChangeTimeout);
    }
    paramChangeTimeout = setTimeout(async () => {
        paramChangeTimeout = null;
        await removeOverflowAutosaves();
        registerAutosaveTimer();
    }, 0);
}

SavestateHandler.addEventListener("load", (event) => {
    lastAutoSave = new Date();
    autosaveDirtyTrigger = false;
    autosaveTimeTrigger = false;
});
SavestateHandler.addEventListener("dirty", (event) => {
    autosaveDirtyTrigger = event.value;
    if (autosaveTimeTrigger) {
        autosave();
    }
});
registerAutosaveTimer();

class AutosaveHandler {

    get time() {
        return autosaveTime / 60000;
    }

    set time(value) {
        value = parseInt(value);
        if (isNaN(value) || value < 0) {
            value = 0;
        }
        value = value * 60000;
        if (autosaveTime != value) {
            if (autosaveTime == 0) {
                lastAutoSave = new Date();
            }
            autosaveTime = value;
            onParamsChange();
        }
    }

    get slots() {
        return autosaveSlots;
    }

    set slots(value) {
        value = parseInt(value);
        if (isNaN(value) || value < 0) {
            value = 0;
        }
        if (autosaveSlots != value) {
            if (autosaveSlots == 0) {
                lastAutoSave = new Date();
            }
            autosaveSlots = value;
            onParamsChange();
        }
    }

}

export default new AutosaveHandler();
