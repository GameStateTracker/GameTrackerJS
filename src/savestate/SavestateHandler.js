// frameworks
import IDBStorage from "/emcJS/data/storage/IDBStorage.js";
import LocalStorage from "/emcJS/data/storage/global/LocalStorage.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";

import Savestate from "./Savestate.js";
import SavestateConverter from "./SavestateConverter.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";

const PERSISTANCE_NAME = "savestate";
const STATE_DIRTY = "state_dirty";
const TITLE_PREFIX = document.title;

const STORAGE = new IDBStorage("savestates");

function updateTitle() {
    if (!TITLE_PREFIX.startsWith("[D]")) {
        const name = Savestate.name || "new state";
        if (LocalStorage.get(STATE_DIRTY)) {
            document.title = `${TITLE_PREFIX} - ${name} *`;
        } else {
            document.title = `${TITLE_PREFIX} - ${name}`;
        }
    }
}

class SavestateHandler extends EventTarget {

    #busyIndicatorManager = new BusyIndicatorManager("main");

    constructor() {
        super();
        /* --- */
        const initState = LocalStorage.get(PERSISTANCE_NAME);
        if (initState != null) {
            this.dispatchEvent(new Event("beforeload"));
            this.dispatchEvent(new Event("reset"));
            const state = SavestateConverter.convert(initState);
            Savestate.deserialize(state);
            updateTitle();
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
            this.#cacheData(state, true);
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
            this.#cacheData(state, true);
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
            this.#cacheData(state, true);
        });
        Savestate.addEventListener("filter", () => {
            const state = Savestate.serialize();
            this.#cacheData(state, true);
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

    #cacheData(data, setDirtyFlag = false) {
        LocalStorage.set(PERSISTANCE_NAME, data);
        if (setDirtyFlag) {
            this.#updateDirtyFlag(true);
        } else {
            updateTitle();
        }
    }

    #updateDirtyFlag(value = true) {
        const isDirty = LocalStorage.get(STATE_DIRTY);
        if (isDirty != value) {
            LocalStorage.set(STATE_DIRTY, value);
            const ev = new Event("dirty");
            ev.value = value;
            this.dispatchEvent(ev);
        }
        updateTitle();
    }

    async save(name = Savestate.name) {
        const updateCache = Savestate.name != name;
        Savestate.name = name;
        const state = Savestate.serialize();
        state.timestamp = new Date();
        state.autosave = false;
        await STORAGE.set(name, state);
        // undirty
        if (updateCache) {
            this.#cacheData(state, false);
        } else {
            this.#updateDirtyFlag(false);
        }
    }

    async load(name) {
        await this.#busyIndicatorManager.busy();
        if (await STORAGE.has(name)) {
            this.dispatchEvent(new Event("beforeload"));
            this.dispatchEvent(new Event("reset"));
            const state = SavestateConverter.convert(await STORAGE.get(name));
            // write state data
            Savestate.deserialize(state);
            this.#cacheData(state, false);
            // undirty
            this.#updateDirtyFlag(false);
            // trigger event
            const ev = new Event("load");
            ev.state = state;
            this.dispatchEvent(ev);
            this.dispatchEvent(new Event("afterload"));
        }
        await this.#busyIndicatorManager.unbusy();
    }

    getName() {
        return Savestate.name;
    }

    isDirty() {
        return LocalStorage.get(STATE_DIRTY);
    }

    /**
     * Resets the state and initializes the savestate, options and filter with the given data, handling it as a stateload
     * @param {Object} stateData an Object containing data for savestate, options and filter
     */
    async reset(data = {}) {
        const newState = SavestateConverter.createEmptyState(data);
        await this.#busyIndicatorManager.busy();
        this.dispatchEvent(new Event("beforeload"));
        this.dispatchEvent(new Event("reset"));
        // write state data
        Savestate.deserialize(newState);
        // cache data
        this.#cacheData(newState, false);
        // trigger event
        const ev = new Event("load");
        ev.state = newState;
        this.dispatchEvent(ev);
        this.dispatchEvent(new Event("afterload"));
        await this.#busyIndicatorManager.unbusy();
    }

    /**
     * Overwrites the savestate, options and filter with the given data, handling it as a stateload
     * @param {Object} stateData an Object containing data for savestate, options and filter
     */
    async overwrite(data = {}) {
        await this.#busyIndicatorManager.busy();
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
        await this.#busyIndicatorManager.unbusy();
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

}

const savestate = Object.freeze(new SavestateHandler());
window.savestate = savestate;

export default savestate;
