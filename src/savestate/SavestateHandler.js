import IDBStorage from "/emcJS/data/storage/IDBStorage.js";
import LocalStorage from "/emcJS/data/storage/global/LocalStorage.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import {
    deepClone
} from "/emcJS/util/helper/DeepClone.js";
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";
import Savestate from "./Savestate.js";
import SavestateConverter from "./SavestateConverter.js";

const PERSISTANCE_NAME = "savestate";
const STATE_DIRTY = "state_dirty";
const TITLE_PREFIX = document.title;

const STORAGE = new IDBStorage("savestates");

function updateTitle() {
    if (!TITLE_PREFIX.startsWith("[D]")) {
        const name = Savestate.name;
        if (name) {
            const title = `${TITLE_PREFIX}: ${name}`;
            if (LocalStorage.get(STATE_DIRTY)) {
                document.title = `${title} *`;
            } else {
                document.title = title;
            }
        } else {
            document.title = `${TITLE_PREFIX} [new state] *`;
        }
    }
}

class SavestateHandler extends EventTarget {

    #lastSavedState = {};

    constructor() {
        super();
        /* --- */
        const initState = LocalStorage.get(PERSISTANCE_NAME);
        if (initState != null) {
            this.dispatchEvent(new Event("beforeload"));
            this.dispatchEvent(new Event("reset"));
            const state = SavestateConverter.convert(initState);
            Savestate.deserialize(state);
            if (initState.name) {
                this.#initLastSavedState(initState.name, state);
            } else {
                updateTitle();
            }
            // trigger event
            const ev = new Event("load");
            ev.state = state;
            this.dispatchEvent(ev);
            this.dispatchEvent(new Event("afterload"));
        }
        SavestateConverter.addEventListener("version", (event) => {
            this.updateVersion(event.value);
        });
        /* --- */
        Savestate.addEventListener("change", (event) => {
            const state = Savestate.serialize();
            this.#cacheData(state);
            if (!event.category) {
                const ev = new Event("change");
                ev.data = event.data;
                this.dispatchEvent(ev);
            } else {
                const ev = new Event(`change_${event.category}`);
                ev.data = event.data;
                this.dispatchEvent(ev);
            }
        });
        Savestate.addEventListener("notes", (event) => {
            const state = Savestate.serialize();
            this.#cacheData(state);
            const ev = new Event("notes");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        Savestate.addEventListener("meta", () => {
            const state = Savestate.serialize();
            this.#cacheData(state);
        });
        Savestate.addEventListener("options", () => {
            const state = Savestate.serialize();
            this.#cacheData(state);
        });
        Savestate.addEventListener("filter", () => {
            const state = Savestate.serialize();
            this.#cacheData(state);
        });
    }

    updateVersion = debounce((version) => {
        if (Savestate.version < version) {
            const state = Savestate.serialize();
            this.dispatchEvent(new Event("beforeload"));
            this.dispatchEvent(new Event("reset"));
            const newState = SavestateConverter.convert(state);
            Savestate.deserialize(newState);
            updateTitle();
            // trigger event
            const ev = new Event("load");
            ev.state = newState;
            this.dispatchEvent(ev);
            this.dispatchEvent(new Event("afterload"));
        }
    });

    async #initLastSavedState(name, referenceState) {
        const state = await STORAGE.get(name);
        this.#lastSavedState = state;
        this.#updateDirtyFlag(referenceState);
    }

    forceCache() {
        const state = Savestate.serialize();
        this.#cacheData(state);
    }

    #cacheData(data, forceTidy = false) {
        LocalStorage.set(PERSISTANCE_NAME, data);
        this.#updateDirtyFlag(forceTidy ? null : data);
    }

    #updateDirtyFlag(referenceState) {
        const isDirty = LocalStorage.get(STATE_DIRTY);
        if (referenceState == null) {
            if (isDirty) {
                LocalStorage.set(STATE_DIRTY, false);
                const ev = new Event("dirty");
                ev.value = false;
                this.dispatchEvent(ev);
            }
        } else {
            const cleanedReferenceState = this.#getNeutralSavestate(referenceState);
            const cleanedLastState = this.#getNeutralSavestate(this.#lastSavedState);
            const value = !isEqual(cleanedReferenceState, cleanedLastState);
            const isDirty = LocalStorage.get(STATE_DIRTY);
            if (isDirty != value) {
                LocalStorage.set(STATE_DIRTY, value);
                const ev = new Event("dirty");
                ev.value = value;
                this.dispatchEvent(ev);
            }
        }
        updateTitle();
    }

    async save(name = Savestate.name) {
        const updateCache = Savestate.name != name;
        Savestate.name = name;
        const state = Savestate.serialize();
        this.#lastSavedState = deepClone(state);
        state.timestamp = new Date();
        state.autosave = false;
        await STORAGE.set(name, state);
        // undirty
        if (updateCache) {
            this.#cacheData(state, true);
        } else {
            this.#updateDirtyFlag();
        }
    }

    async load(name) {
        await BusyIndicatorManager.busy();
        if (await STORAGE.has(name)) {
            this.dispatchEvent(new Event("beforeload"));
            this.dispatchEvent(new Event("reset"));
            const state = SavestateConverter.convert(await STORAGE.get(name));
            // write state data
            Savestate.deserialize(state);
            this.#lastSavedState = deepClone(state);
            this.#cacheData(state, true);
            // trigger event
            const ev = new Event("load");
            ev.state = state;
            this.dispatchEvent(ev);
            this.dispatchEvent(new Event("afterload"));
        }
        await BusyIndicatorManager.unbusy();
    }

    getName() {
        return Savestate.name;
    }

    isDirty() {
        return LocalStorage.get(STATE_DIRTY);
    }

    /**
     * Resets the state and initializes the savestate, options and filter with the given data, handling it as a stateload.
     * @param {Object} stateData an Object containing data for savestate, options and filter
     */
    async reset(data = {}) {
        const newState = SavestateConverter.createEmptyState(data);
        await BusyIndicatorManager.busy();
        this.dispatchEvent(new Event("beforeload"));
        this.dispatchEvent(new Event("reset"));
        // write state data
        Savestate.deserialize(newState);
        this.#lastSavedState = deepClone(newState);
        // cache data
        this.#cacheData(newState, true);
        // trigger event
        const ev = new Event("load");
        ev.state = newState;
        this.dispatchEvent(ev);
        this.dispatchEvent(new Event("afterload"));
        await BusyIndicatorManager.unbusy();
    }

    /**
     * Overwrites the savestate, options and filter with the given data, handling it as a stateload.
     * Only overwrites the given keys for each respective Storage.
     * @param {Object} stateData an Object containing data for savestate, options and filter
     */
    async overwrite(data = {}) {
        await BusyIndicatorManager.busy();
        this.dispatchEvent(new Event("beforeload"));
        // write state data
        Savestate.overwrite(data);
        // cache data
        const state = Savestate.serialize();
        this.#cacheData(state, true);
        // trigger event
        const ev = new Event("load");
        ev.state = state;
        this.dispatchEvent(ev);
        this.dispatchEvent(new Event("afterload"));
        await BusyIndicatorManager.unbusy();
    }

    /**
     * Overwrites the savestate, options and filter with the given data, handling it as a stateload.
     * Clears the respective Storage before writing the data.
     * @param {Object} stateData an Object containing data for savestate, options and filter
     */
    async overwriteClean(data = {}) {
        await BusyIndicatorManager.busy();
        this.dispatchEvent(new Event("beforeload"));
        // write state data
        Savestate.overwriteClean(data);
        // cache data
        const state = Savestate.serialize();
        this.#cacheData(state, true);
        // trigger event
        const ev = new Event("load");
        ev.state = state;
        this.dispatchEvent(ev);
        this.dispatchEvent(new Event("afterload"));
        await BusyIndicatorManager.unbusy();
    }

    /* DATA */

    getData(category) {
        return Savestate.getStorage(category);
    }

    set(category, key, value) {
        Savestate.set(category, key, value);
    }

    get(category, key, value) {
        return Savestate.get(category, key, value);
    }

    getAll(category) {
        return Savestate.getAll(category);
    }

    delete(category, key) {
        Savestate.delete(category, key);
    }

    /* debug */
    testConverter() {
        const offset = SavestateConverter.offset;
        const version = SavestateConverter.version;
        console.group("StateConverter - Test");
        try {
            for (let i = offset; i < version; ++i) {
                console.log(`Version[${i}]: `, SavestateConverter.convert({version: i, data: {}}));
            }
        } catch (err) {
            console.error(err);
        } finally {
            console.groupEnd("StateConverter - Test");
        }
    }

    #getNeutralSavestate(sourceState) {
        return {
            data: {
                ...sourceState.data,
                filter: {}
            },
            notes: sourceState.notes
        };
    }

}

const savestateHandler = Object.freeze(new SavestateHandler());
window.savestateHandler = savestateHandler;

export default savestateHandler;
