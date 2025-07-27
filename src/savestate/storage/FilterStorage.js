// frameworks
import ObservableStorage from "/emcJS/data/storage/observable/ObservableStorage.js";

import FilterResource from "../../data/resource/FilterResource.js";

const DEFAULTS = new Map();
const PERSISTED = new Set();

for (const [key, value] of Object.entries(FilterResource.get())) {
    DEFAULTS.set(key, value.default);
    if (value.persist) {
        PERSISTED.add(key);
    }
}

let INSTANCE = null;

class FilterStorage extends ObservableStorage {

    constructor() {
        if (INSTANCE != null) {
            return INSTANCE;
        }
        super();
        INSTANCE = this;
        // ---
        this.addEventListener("change", (event) => {
            const data = {};
            const changes = {};
            for (const key in event.data) {
                if (PERSISTED.has(key)) {
                    data[key] = event.data[key];
                    changes[key] = event.changes[key];
                }
            }
            if (Object.keys(data).length) {
                const ev = new Event("persistedchange");
                ev.data = data;
                ev.changes = changes;
                this.dispatchEvent(ev);
            }
        });
    }

    clone() {
        return this;
    }

    set(key, value) {
        if (DEFAULTS.has(key)) {
            super.set(key, value);
        }
    }

    setAll(values) {
        const res = {};
        for (const key in values) {
            const value = values[key];
            if (DEFAULTS.has(key)) {
                res[key] = value;
            }
        }
        super.setAll(res);
    }

    get(key) {
        if (DEFAULTS.has(key)) {
            return super.get(key) ?? DEFAULTS.get(key);
        }
    }

    getAll() {
        const res = {};
        for (const [key, value] of DEFAULTS) {
            res[key] = super.get(key) ?? value;
        }
        return res;
    }

    has(key) {
        return DEFAULTS.has(key);
    }

    keys() {
        return DEFAULTS.keys();
    }

    serialize() {
        const res = {};
        for (const key of PERSISTED) {
            res[key] = super.get(key, DEFAULTS.get(key));
        }
        return res;
    }

    deserialize(data = {}) {
        const res = {};
        for (const [key] of DEFAULTS) {
            if (PERSISTED.has(key)) {
                const newValue = data[key];
                if (newValue != null) {
                    res[key] = newValue;
                }
            } else {
                const newValue = super.get(key);
                if (newValue != null) {
                    res[key] = newValue;
                }
            }
        }
        super.deserialize(res);
    }

    overwrite(data = {}) {
        const res = {};
        for (const [key] of DEFAULTS) {
            if (key in data) {
                const newValue = data[key];
                res[key] = newValue;
            }
        }
        super.overwrite(res);
    }

}

export default new FilterStorage();
