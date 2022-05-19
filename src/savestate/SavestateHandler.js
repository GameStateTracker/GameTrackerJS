// frameworks
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import LocalStorage from "/emcJS/storage/LocalStorage.js";
import BusyIndicator from "/emcJS/ui/BusyIndicator.js";

import DataSync from "../data/DataSync.js";
import Counter from "../util/Counter.js";
import Savestate from "./Savestate.js";
import SavestateConverter from "./SavestateConverter.js";

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

/* SYNC */ {
    const muted = new Counter();
    DataSync.addEventListener("message", (event) => {
        muted.add();
        if (event.data.type == "load") {
            const {state = {}} = event.data;
            Savestate.deserialize(state);
        } else if (event.data.type == "change") {
            const {category = "", data = {}} = event.data;
            Savestate.set(category, data);
        }
        muted.sub();
    });
    Savestate.addEventListener("change", (event) => {
        if (!muted.value) {
            const {category = "", data = {}} = event;
            DataSync.postMessage({type: "change", category, data});
        }
    });
    Savestate.addEventListener("load", (event) => {
        if (!muted.value) {
            const {data = {}} = event;
            DataSync.postMessage({type: "load", data});
        }
    });
}

class SavestateHandler extends EventTarget {

    constructor() {
        super();
        /* --- */
        const initState = LocalStorage.get(PERSISTANCE_NAME);
        if (initState != null) {
            this.dispatchEvent(new Event("beforeload"));
            const state = SavestateConverter.convert(initState);
            Savestate.deserialize(state);
            updateTitle();
            // trigger event
            this.dispatchEvent(new Event("reset"));
            const ev = new Event("load");
            ev.state = state;
            this.dispatchEvent(ev);
            this.dispatchEvent(new Event("afterload"));
        }
        /* --- */
        Savestate.addEventListener("change", event => {
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
        Savestate.addEventListener("notes", event => {
            const state = Savestate.serialize();
            this.#cacheData(state, true);
            const ev = new Event("notes");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        Savestate.addEventListener("options", event => {
            const state = Savestate.serialize();
            this.#cacheData(state, true);
        });
        Savestate.addEventListener("filter", event => {
            const state = Savestate.serialize();
            this.#cacheData(state, true);
        });
    }

    #cacheData(data, dirty = true) {
        LocalStorage.set(PERSISTANCE_NAME, data);
        LocalStorage.set(STATE_DIRTY, !!dirty);
        const ev = new Event("dirty");
        ev.value = !!dirty;
        this.dispatchEvent(ev);
        updateTitle();
    }

    async save(name = Savestate.name) {
        Savestate.name = name;
        const state = Savestate.serialize();
        state.timestamp = new Date();
        state.autosave = false;
        await STORAGE.set(name, state);
        // write state data
        this.#cacheData(state, false);
    }

    async load(name) {
        await BusyIndicator.busy();
        if (await STORAGE.has(name)) {
            this.dispatchEvent(new Event("beforeload"));
            const state = SavestateConverter.convert(await STORAGE.get(name));
            // write state data
            Savestate.deserialize(state);
            this.#cacheData(state, false);
            // trigger event
            this.dispatchEvent(new Event("reset"));
            const ev = new Event("load");
            ev.state = state;
            this.dispatchEvent(ev);
            this.dispatchEvent(new Event("afterload"));
        }
        await BusyIndicator.unbusy();
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
        await BusyIndicator.busy();
        this.dispatchEvent(new Event("beforeload"));
        this.dispatchEvent(new Event("reset"));
        // write state data
        Savestate.deserialize(data);
        // cache data
        const state = Savestate.serialize();
        this.#cacheData(state, false);
        // trigger event
        const ev = new Event("load");
        ev.state = state;
        this.dispatchEvent(ev);
        this.dispatchEvent(new Event("afterload"));
        await BusyIndicator.unbusy();
    }

    /**
     * Overwrites the savestate, options and filter with the given data, handling it as a stateload
     * @param {Object} stateData an Object containing data for savestate, options and filter
     */
    async overwrite(data = {}) {
        await BusyIndicator.busy();
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
        await BusyIndicator.unbusy();
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
