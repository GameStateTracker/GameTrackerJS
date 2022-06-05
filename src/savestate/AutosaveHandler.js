// frameworks
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import IDBStorage from "/emcJS/data/storage/IDBStorage.js";
import DateUtil from "/emcJS/util/DateUtil.js";

import VersionData from "../data/VersionData.js";
import Savestate from "./Savestate.js";
import SavestateHandler from "./SavestateHandler.js";
import SettingsObserver from "../util/observer/SettingsObserver.js";

const autosaveTimeObserver = new SettingsObserver("autosave_time");
const autosaveAmountObserver = new SettingsObserver("autosave_amount");

const STORAGE = new IDBStorage("savestates");

let autosaveTimeTrigger = false;
let autosaveDirtyTrigger = false;
let lastAutoSave = new Date();
let autosaveTimeout = null;

function sortStates(a, b) {
    if (a < b) {
        return 1;
    } else if (a > b) {
        return -1;
    } else {
        return 0;
    }
}

const registerAutosaveTimer = debounce(() => {
    autosaveTimeTrigger = false;
    if (autosaveTimeout != null) {
        clearTimeout(autosaveTimeout);
        autosaveTimeout = null;
    }
    if (autosaveTimeObserver.value > 0 && autosaveAmountObserver.value > 0) {
        const autosaveTime = autosaveTimeObserver.value * 60000;
        const remainingTime =  autosaveTime - (new Date() - lastAutoSave);
        autosaveTimeout = setTimeout(() => {
            autosaveTimeout = null;
            autosaveTimeTrigger = true;
            autosave();
        }, remainingTime);
    }
});

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
    while (stateKeys.length > 0 && stateKeys.length >= autosaveAmountObserver.value) {
        const key = stateKeys.pop();
        if (saves[key].autosave) {
            await STORAGE.delete(key);
        }
    }
}

async function autosave() {
    if (autosaveTimeTrigger && autosaveDirtyTrigger) {
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
}

autosaveTimeObserver.addEventListener("change", (event) => {
    registerAutosaveTimer();
});
autosaveAmountObserver.addEventListener("change", (event) => {
    registerAutosaveTimer();
});
SavestateHandler.addEventListener("load", (event) => {
    lastAutoSave = new Date();
    autosaveDirtyTrigger = false;
    registerAutosaveTimer();
});
SavestateHandler.addEventListener("dirty", (event) => {
    autosaveDirtyTrigger = event.value;
    autosave();
});

registerAutosaveTimer();
