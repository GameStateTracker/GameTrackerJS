// frameworks
import DataStorage from "/emcJS/datastorage/DataStorage.js";

import OptionsResource from "../../resource/OptionsResource.js";

const SET_TYPES = [
    "list",
    "-list"
];

const DEFAULTS = new Map();

for (const [key, value] of Object.entries(OptionsResource.get())) {
    if (SET_TYPES.indexOf(value.type) >= 0) {
        const def = new Set(value.default);
        for (const el of value.values) {
            DEFAULTS.set(el, def.has(el));
        }
    } else {
        DEFAULTS.set(key, value.default);
    }
}

class OptionsStorage extends DataStorage {

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
            return super.get(key, DEFAULTS.get(key));
        }
    }

    getAll() {
        const res = {};
        for (const [key, value] of DEFAULTS) {
            res[key] = super.get(key, value);
        }
        return res;
    }

    has(key) {
        return DEFAULTS.has(key);
    }

    keys() {
        return DEFAULTS.keys();
    }

    deserialize(data = {}) {
        const res = {};
        for (const [key] of DEFAULTS) {
            const newValue = data[key];
            if (newValue != null) {
                res[key] = newValue;
            }
        }
        super.deserialize(res);
    }

    overwrite(data = {}) {
        const res = {};
        for (const [key] of DEFAULTS) {
            const newValue = data[key];
            res[key] = newValue;
        }
        super.overwrite(res);
    }

}

const storage = new OptionsStorage();

export default storage;
