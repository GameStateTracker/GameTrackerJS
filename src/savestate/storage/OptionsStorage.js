import ObservableStorage from "@emcjs/core/data/storage/observable/ObservableStorage.js";
import OptionsResource from "../../data/resource/OptionsResource.js";
import StorageDefaultValues from "../../data/StorageDefaultValues.js";

const CUSTOM_DEFAULTS = new Map();

const defaultValues = new StorageDefaultValues(Object.entries(OptionsResource.get()));

let INSTANCE = null;

class OptionsStorage extends ObservableStorage {

    constructor() {
        if (INSTANCE != null) {
            return INSTANCE;
        }
        super();
        INSTANCE = this;
    }

    clone() {
        return this;
    }

    getDefault(key) {
        return CUSTOM_DEFAULTS.get(key) ?? defaultValues.get(key);
    }

    set(key, value) {
        if (CUSTOM_DEFAULTS.has(key) || defaultValues.has(key)) {
            super.set(key, value);
        }
    }

    setAll(values) {
        const res = {};
        for (const key in values) {
            const value = values[key];
            if (CUSTOM_DEFAULTS.has(key) || defaultValues.has(key)) {
                res[key] = value;
            }
        }
        super.setAll(res);
    }

    get(key) {
        if (CUSTOM_DEFAULTS.has(key) || defaultValues.has(key)) {
            return super.get(key) ?? CUSTOM_DEFAULTS.has(key) ?? defaultValues.get(key);
        }
    }

    getAll() {
        const res = {};
        for (const [key, value] of defaultValues) {
            res[key] = super.get(key) ?? value;
        }
        for (const [key, value] of CUSTOM_DEFAULTS) {
            res[key] = super.get(key) ?? value;
        }
        return res;
    }

    has(key) {
        return CUSTOM_DEFAULTS.has(key) || defaultValues.has(key);
    }

    keys() {
        return [
            ...defaultValues.keys(),
            ...CUSTOM_DEFAULTS.keys()
        ];
    }

    deserialize(data = {}) {
        const res = {};
        for (const key in data) {
            const newValue = data[key];
            if (newValue != null) {
                res[key] = newValue;
            }
        }
        super.deserialize(res);
    }

    overwrite(data = {}) {
        const res = {};
        for (const key in data) {
            res[key] = data[key];
        }
        super.overwrite(res);
    }

    registerDefault(key, def) {
        CUSTOM_DEFAULTS.set(key, def);
    }

}

export default new OptionsStorage();
