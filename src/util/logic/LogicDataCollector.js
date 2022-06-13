// frameworks
import {
    debounce, debounceCacheData
} from "/emcJS/util/Debouncer.js";
import MapLocker from "/emcJS/data/locker/MapLocker.js";
import ObservableStorage from "/emcJS/data/storage/observable/ObservableStorage.js";

import Savestate from "../../savestate/Savestate.js";
import SettingsStorage from "../../storage/SettingsStorage.js";

const STORAGES = {
    // GameTrackerJS
    items: Savestate.getStorage("items"),
    locations: Savestate.getStorage("locations"),
    startItems: Savestate.getStorage("startItems"),
    options: Savestate.getStorage("options"),
    filter: Savestate.getStorage("filter")
};
const STORAGE_REGISTER = new Map();

const AUGMENT = new Set();
const CACHE = new Map();
const LOCKED_CACHE = new MapLocker(CACHE);
const DATA = new Map();

function execAugment(data) {
    for (const augment of AUGMENT) {
        const res = augment(LOCKED_CACHE, data);
        data = {...data, ...res};
    }
    return data;
}

function renameKeys(src = {}, prefix = "", postfix = "") {
    const res = {};
    for (const [key, value] of Object.entries(src)) {
        res[`${prefix}${key}${postfix}`] = value;
    }
    return res;
}

function addRenameKeys(target = {}, source = {}, prefix = "", postfix = "") {
    for (const [key, value] of Object.entries(source)) {
        target[`${prefix}${key}${postfix}`] = value;
    }
    return target;
}

function augmentItemValues(newData) {
    const res = {};
    for (const [key, value] of Object.entries(newData)) {
        const startValue = STORAGES.startItems.get(key);
        if (startValue != null) {
            res[key] = Math.max(startValue, value);
        } else {
            res[key] = value;
        }
    }
    return res;
}

function augmentStartItemValues(newData) {
    const res = {};
    for (const [key, startValue] of Object.entries(newData)) {
        const value = STORAGES.items.get(key);
        if (startValue != null) {
            res[key] = Math.max(startValue, value);
        } else {
            res[key] = startValue;
        }
    }
    return res;
}

class LogicDataCollector extends EventTarget {

    constructor() {
        super();
        /* EVENTS */
        Savestate.addEventListener("load", () => {
            this.#init();
        });
        /* STORAGES */
        this.registerStorage(STORAGES.items, "item[", "]", augmentItemValues);
        this.registerStorage(STORAGES.startItems, "item[", "]", augmentStartItemValues);
        this.registerStorage(STORAGES.locations, "location[", "]");
        this.registerStorage(STORAGES.options, "option[", "]");
        this.registerStorage(STORAGES.filter, "filter[", "]");
        this.registerStorage(SettingsStorage, "setting[", "]");
    }

    #init = debounce(() => {
        const logicData = {};
        for (const [storage, {prefix, postfix, precall}] of STORAGE_REGISTER) {
            const data = storage.getAll();
            if (typeof precall === "function") {
                addRenameKeys(logicData, precall(data), prefix, postfix);
            } else {
                addRenameKeys(logicData, data, prefix, postfix);
            }
        }
        // ---
        CACHE.clear();
        for (const [key, value] of Object.entries(logicData)) {
            CACHE.set(key, value);
        }
        const augmentedData = execAugment(logicData);
        for (const [key, value] of Object.entries(augmentedData)) {
            DATA.set(key, value);
        }
        const ev = new Event("load");
        this.dispatchEvent(ev);
    });

    #changeData = debounceCacheData((newData) => {
        const changes = {};
        for (const data of newData) {
            for (const [key, value] of Object.entries(data)) {
                const oldValue = CACHE.get(key);
                if (oldValue != value) {
                    changes[key] = value;
                    CACHE.set(key, value);
                }
            }
        }
        if (Object.keys(changes).length > 0) {
            const augmentedData = execAugment(changes);
            for (const [key, value] of Object.entries(augmentedData)) {
                DATA.set(key, value);
            }
            const ev = new Event("change");
            this.dispatchEvent(ev);
        }
    });

    get(key) {
        return DATA.get(key);
    }

    registerStorage(storage, prefix = "", postfix = "", precall = null) {
        if (!(storage instanceof ObservableStorage)) {
            throw new TypeError("storage must be ObservableStorage");
        }
        if (!STORAGE_REGISTER.has(storage)) {
            storage.addEventListener("change", (event) => {
                const data = event.data;
                if (typeof precall === "function") {
                    this.#changeData(renameKeys(precall(data), prefix, postfix));
                } else {
                    this.#changeData(renameKeys(data, prefix, postfix));
                }
            });
        }
        STORAGE_REGISTER.set(storage, {
            prefix,
            postfix,
            precall
        });
        this.#init();
    }

    registerAugment(augment) {
        if (typeof augment != "function") {
            throw new TypeError(`augment parameter must be of type "function" but was "${typeof ref}"`);
        }
        AUGMENT.add(augment);
    }

}

export default new LogicDataCollector();
