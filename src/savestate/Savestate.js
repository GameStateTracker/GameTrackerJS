// frameworks
import AppState from "/emcJS/data/state/AppState.js";
import ObservableDefaultValueStorage from "/emcJS/data/storage/observable/ObservableDefaultValueStorage.js";

import OptionsStorage from "./storage/OptionsStorage.js";
import FilterStorage from "./storage/FilterStorage.js";
import StartItemsStorage from "./storage/StartItemsStorage.js";
import SavestateConverter from "./SavestateConverter.js";

class Savestate extends AppState {

    #info = {
        name: "",
        version: SavestateConverter.version,
        timestamp: new Date(),
        autosave: false,
        notes: ""
    };

    constructor() {
        super();
        /* --- */
        this.registerStorage("options", OptionsStorage);
        this.registerStorage("filter", FilterStorage, "persistedchange");
        this.registerStorage("startItems", StartItemsStorage);
        this.registerStorage("items", new ObservableDefaultValueStorage(0));
        this.registerStorage("exitBindings", new ObservableDefaultValueStorage(""));
        this.registerStorage("areaHints", new ObservableDefaultValueStorage(""));
        this.registerStorage("areaActiveLists", new ObservableDefaultValueStorage());
        this.registerStorage("locationItems", new ObservableDefaultValueStorage(""));
        this.registerStorage("locations", new ObservableDefaultValueStorage(false));
    }

    clone() {
        return this;
    }

    set name(value) {
        this.#info.name = value.toString();
    }

    get name() {
        return this.#info.name;
    }

    get version() {
        return this.#info.version;
    }

    get timestamp() {
        return this.#info.timestamp;
    }

    get autosave() {
        return this.#info.autosave;
    }

    set notes(value) {
        value = value.toString();
        if (this.#info.notes != value) {
            this.#info.notes = value;
            const ev = new Event("notes");
            ev.value = value;
            this.dispatchEvent(ev);
        }
    }

    get notes() {
        return this.#info.notes;
    }

    purge() {
        this.#info.name = "";
        this.#info.version = SavestateConverter.version;
        this.#info.timestamp = new Date();
        this.#info.autosave = false;
        this.#info.notes = "";
        super.purge();
    }

    /* SERIALIZATION */
    serialize() {
        return {
            name: this.#info.name,
            version: this.#info.version,
            timestamp: new Date(this.#info.timestamp),
            autosave: this.#info.autosave,
            notes: this.#info.notes,
            ...super.serialize()
        };
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
        this.#info.name = name?.toString() ?? "";
        this.#info.version = version ?? SavestateConverter.version;
        this.#info.timestamp = new Date(timestamp) ?? new Date();
        this.#info.autosave = autosave ?? false;
        this.#info.notes = notes?.toString() ?? "";
        /* --- */
        super.deserialize({data, meta});
    }

    createNewJSON(initialData = {}) {
        return {
            notes: "",
            autosave: false,
            timestamp: new Date(),
            version: this.version,
            ...super.createNewJSON(initialData)
        };
    }

}

export default new Savestate();
