// frameworks
import MapLocker from "/emcJS/data/locker/MapLocker.js";

// GameTrackerJS
import Savestate from "../../savestate/Savestate.js";
import SettingsStorage from "../../storage/SettingsStorage.js";
import Logic from "./Logic.js";

const STORAGES = {
    // GameTrackerJS
    items: Savestate.getStorage("items"),
    locations: Savestate.getStorage("locations"),
    startItems: Savestate.getStorage("startItems"),
    options: Savestate.getStorage("options"),
    filter: Savestate.getStorage("filter"),
    // Track-OOT
    dungeonTypes: Savestate.getStorage("dungeonTypes")
};

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

function renameKeys(src = {}, prefix = "", postfix = "") {
    const res = {};
    for (const [key, value] of Object.entries(src)) {
        res[`${prefix}${key}${postfix}`] = value;
    }
    return res;
}

function initItemValues() {
    const itemData = STORAGES.items.getAll();
    const startItemData = STORAGES.items.getAll();
    const res = {};
    for (const [key, value] of Object.entries(itemData)) {
        const startValue = startItemData[key];
        if (startValue != null) {
            res[key] = Math.max(startValue, value);
        } else {
            res[key] = value;
        }
    }
    for (const [key, value] of Object.entries(startItemData)) {
        if (res[key] == null) {
            const startValue = itemData[key];
            if (startValue != null) {
                res[key] = Math.max(startValue, value);
            } else {
                res[key] = value;
            }
        }
    }
    return res;
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
        STORAGES.items.addEventListener("change", (event) => {
            this.#changeData(renameKeys(augmentItemValues(event.data), "item[", "]"));
        });
        STORAGES.startItems.addEventListener("change", (event) => {
            this.#changeData(renameKeys(augmentStartItemValues(event.data), "item[", "]"));
        });
        STORAGES.locations.addEventListener("change", (event) => {
            this.#changeData(renameKeys(event.data, "location."));
        });
        STORAGES.dungeonTypes.addEventListener("change", (event) => {
            this.#changeData(renameKeys(event.data, "dungeontype."));
        });
        STORAGES.options.addEventListener("change", (event) => {
            this.#changeData(event.data);
        });
        STORAGES.filter.addEventListener("change", (event) => {
            this.#changeData(event.data);
        });
        SettingsStorage.addEventListener("change", (event) => {
            this.#changeData(event.data);
        });
        /* --- */
        this.#init();
    }

    #init() {
        const data = {
            ...renameKeys(initItemValues(), "item[", "]"),
            ...renameKeys(STORAGES.locations.getAll(), "location."),
            ...STORAGES.options.getAll(),
            ...STORAGES.filter.getAll(),
            ...SettingsStorage.getAll()
        };
        // startitems
        const startItems = STORAGES.startItems.getAll();
        for (const [key, value] of Object.entries(startItems)) {
            if (data[key] == null || data[key] < value) {
                data[key] = value;
            }
        }
        // ---
        CACHE.clear();
        for (const [key, value] of Object.entries(data)) {
            CACHE.set(key, value);
        }
        Logic.reset();
        const augmentedData = execAugment(data);
        Logic.execute(augmentedData, "region.root");
    }

    #changeData(newData) {
        const changes = {};
        for (const [key, value] of Object.entries(newData)) {
            const oldValue = CACHE.get(key);
            if (oldValue != value) {
                changes[key] = value;
                CACHE.set(key, value);
            }
        }
        if (Object.keys(changes).length > 0) {
            const augmentedData = execAugment(changes);
            Logic.execute(augmentedData, "region.root");
        }
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
