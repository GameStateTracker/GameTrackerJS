// frameworks
import {
    debounce, debounceCacheData
} from "/emcJS/util/Debouncer.js";
import MapLocker from "/emcJS/data/locker/MapLocker.js";
import ObservableStorage from "/emcJS/data/storage/observable/ObservableStorage.js";

// GameTrackerJS
import Savestate from "../../savestate/Savestate.js";
import SettingsStorage from "../../storage/SettingsStorage.js";
import Logic from "./Logic.js";

const STORAGES = new Map();

const AUGMENT = new Set();
const CACHE = new Map();
const LOCKED_CACHE = new MapLocker(CACHE);

function execAugment(data) {
    for (const augment of AUGMENT) {
        const res = augment(LOCKED_CACHE, data) ?? {};
        data = {...data, ...res};
    }
    return data;
}

function renameKeys(source = {}, prefix = "", postfix = "") {
    const res = {};
    for (const [key, value] of Object.entries(source)) {
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

class LogicCaller extends EventTarget {

    constructor() {
        super();
        /* EVENTS */
        Logic.addEventListener("change", event => {
            const ev = new Event("change");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        Savestate.addEventListener("load", () => {
            this.#init();
        });
        /* STORAGES */
        this.registerStorage(Savestate.getStorage("items"), "item[", "]", augmentItemValues);
        this.registerStorage(Savestate.getStorage("startItems"), "item[", "]", augmentStartItemValues);
        this.registerStorage(Savestate.getStorage("locations"), "location[", "]");
        this.registerStorage(Savestate.getStorage("options"), "option[", "]");
        this.registerStorage(Savestate.getStorage("filter"), "filter[", "]");
        this.registerStorage(SettingsStorage, "setting[", "]");
        /* --- */
        this.#init();
    }

    #init = debounce(() => {
        const data = {};
        for (const [storage, {prefix, postfix}] of STORAGES) {
            addRenameKeys(data, storage.getAll(), prefix, postfix);
        }
        // ---
        CACHE.clear();
        for (const [key, value] of Object.entries(data)) {
            CACHE.set(key, value);
        }
        Logic.reset();
        const augmentedData = execAugment(data);
        Logic.execute(augmentedData, "region[root]");
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
            Logic.execute(augmentedData, "region[root]");
        }
    });

    registerStorage(storage, prefix = "", postfix = "", precall = null) {
        if (!(storage instanceof ObservableStorage)) {
            throw new TypeError("storage must be ObservableStorage");
        }
        if (!STORAGES.has(storage)) {
            storage.addEventListener("change", (event) => {
                if (typeof precall === "function") {
                    this.#changeData(renameKeys(precall(event.data), prefix, postfix));
                } else {
                    this.#changeData(renameKeys(event.data, prefix, postfix));
                }
            });
        }
        STORAGES.set(storage, {
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

    addReachable(target) {
        Logic.addReachable(target);
    }

    deleteReachable(target) {
        Logic.deleteReachable(target);
    }

    clearReachables() {
        Logic.clearReachables();
    }

}

export default new LogicCaller();
