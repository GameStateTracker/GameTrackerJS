// frameworks
import ObservableStorage from "/emcJS/data/storage/observable/ObservableStorage.js";
import ObservableDefaultValueStorage from "/emcJS/data/storage/observable/ObservableDefaultValueStorage.js";

import OptionsStorage from "./storage/OptionsStorage.js";
import FilterStorage from "./storage/FilterStorage.js";
import StartItemsStorage from "./storage/StartItemsStorage.js";
import SavestateConverter from "./SavestateConverter.js";

const META = new Map();
const ST_DEF = new Map();
const ST_ADD = new Map();
const HANDLER = new Map();
const INFO = {
    name: "",
    version: SavestateConverter.version,
    timestamp: new Date(),
    autosave: false,
    notes: ""
};

class Savestate extends EventTarget {

    constructor() {
        super();
        /* --- */
        this.registerStorage("options", OptionsStorage);
        this.registerStorage("filter", FilterStorage, "persistedchange");
        this.registerStorage("startItems", StartItemsStorage);
        this.registerStorage("items", new ObservableDefaultValueStorage(0));
        this.registerStorage("exitBindings", new ObservableDefaultValueStorage(""));
        this.registerStorage("areaHints", new ObservableDefaultValueStorage(""));
        this.registerStorage("locationItems", new ObservableDefaultValueStorage(""));
        this.registerStorage("locations", new ObservableDefaultValueStorage(false));
    }

    set name(value) {
        INFO.name = value.toString();
    }

    get name() {
        return INFO.name;
    }

    get version() {
        return INFO.version;
    }

    get timestamp() {
        return INFO.timestamp;
    }

    get autosave() {
        return INFO.autosave;
    }

    set notes(value) {
        value = value.toString();
        if (INFO.notes != value) {
            INFO.notes = value;
            const ev = new Event("notes");
            ev.value = value;
            this.dispatchEvent(ev);
        }
    }

    get notes() {
        return INFO.notes;
    }

    purge() {
        INFO.name = "";
        INFO.version = SavestateConverter.version;
        INFO.timestamp = new Date();
        INFO.autosave = false;
        INFO.notes = "";
        META.clear();
        for (const [, dataStorage] of ST_DEF) {
            dataStorage.clear();
        }
        for (const [, dataStorage] of ST_ADD) {
            dataStorage.clear();
        }
    }

    serialize() {
        const res = {
            ...INFO,
            meta: Object.fromEntries(META),
            data: {}
        };
        for (const [category, dataStorage] of ST_DEF) {
            res.data[category] = dataStorage.serialize();
        }
        for (const [category, dataStorage] of ST_ADD) {
            res.data[category] = dataStorage.serialize();
        }
        return res;
    }

    deserialize(props = {}) {
        const {
            data = {},
            meta = {},
            name,
            version,
            timestamp,
            autosave,
            notes
        } = props;
        /* --- */
        this.purge();
        INFO.name = name?.toString() ?? "";
        INFO.version = version ?? SavestateConverter.version;
        INFO.timestamp = timestamp ?? new Date();
        INFO.autosave = autosave ?? false;
        INFO.notes = notes?.toString() ?? "";
        for (const key in meta) {
            META.set(key, meta[key]);
        }
        for (const category in data) {
            const dataStorage = this.getStorage(category);
            dataStorage.deserialize(data[category]);
        }
        /* --- */
        const ev = new Event("load");
        ev.data = this.serialize();
        this.dispatchEvent(ev);
    }

    overwrite(data = {}) {
        for (const category in data) {
            const dataStorage = this.getStorage(category);
            const buffer = data[category];
            if (buffer == null) {
                dataStorage.clear();
            } else {
                dataStorage.overwrite(data[category]);
            }
        }
    }

    /* META */
    getMeta(key) {
        return META.get(key);
    }

    setMeta(key, value) {
        const oldValue = META.get(key);
        if (oldValue != value) {
            META.set(key, value);
            const ev = new Event("meta");
            ev.data = {key, value};
            this.dispatchEvent(ev);
        }
    }

    /* STORAGES */
    registerStorage(category, dataStorage, eventName = "change") {
        const storageCategory = category.toString();
        if (!(dataStorage instanceof ObservableStorage)) {
            throw new TypeError("unknown storage implementation, expected DataStorage");
        }
        if (ST_DEF.has(storageCategory)) {
            throw new Error(`special storage with name "${storageCategory}" already registerred`);
        }
        const handler = this.getChangeHandler(storageCategory);
        if (ST_ADD.has(storageCategory)) {
            const oldStorage = ST_ADD.get(storageCategory);
            oldStorage.removeEventListener("change", handler);
            dataStorage.deserialize(oldStorage.serialize());
            ST_ADD.delete(storageCategory);
        }
        ST_DEF.set(storageCategory, dataStorage);
        dataStorage.addEventListener(eventName, handler);
    }

    getStorage(category) {
        const storageCategory = category.toString();
        if (ST_DEF.has(storageCategory)) {
            return ST_DEF.get(storageCategory);
        }
        if (ST_ADD.has(storageCategory)) {
            return ST_ADD.get(storageCategory);
        }
        const dataStorage = new ObservableStorage();
        dataStorage.addEventListener("change", this.getChangeHandler(storageCategory));
        ST_ADD.set(storageCategory, dataStorage);
        return dataStorage;
    }

    getChangeHandler(category) {
        const storageCategory = category.toString();
        if (HANDLER.has(storageCategory)) {
            return HANDLER.get(storageCategory);
        }
        const handler = (event) => {
            const ev = new Event("change");
            ev.category = storageCategory;
            ev.data = event.data;
            ev.changes = event.changes;
            this.dispatchEvent(ev);
        };
        HANDLER.set(storageCategory, handler);
        return handler;
    }

    set(category, key, value) {
        const dataStorage = this.getStorage(category);
        if (typeof key == "object") {
            dataStorage.setAll(key);
        } else {
            dataStorage.set(key, value);
        }
    }

    get(category, key, def) {
        const dataStorage = this.getStorage(category);
        if (dataStorage.has(key)) {
            return dataStorage.get(key);
        }
        return def;
    }

    getAll(category) {
        if (category == null) {
            const res = {};
            for (const [cat, dataStorage] of ST_DEF) {
                res[cat] = dataStorage.getAll();
            }
            for (const [cat, dataStorage] of ST_ADD) {
                res[cat] = dataStorage.getAll();
            }
            return res;
        } else if (Array.isArray(category)) {
            const res = {};
            for (const cat of category) {
                const dataStorage = this.getStorage(cat);
                res[cat] = dataStorage.getAll();
            }
            return res;
        } else {
            const dataStorage = this.getStorage(category);
            return dataStorage.getAll();
        }
    }

    delete(category, key) {
        const dataStorage = this.getStorage(category);
        if (dataStorage.has(key)) {
            dataStorage.delete(key);
        }
    }

}

export default new Savestate();
