// frameworks
import ObservableStorage from "/emcJS/data/storage/observable/ObservableStorage.js";

import OptionsResource from "../../data/resource/OptionsResource.js";
import SettingsAliasRegistry from "../../registry/SettingsAliasRegistry.js";

const SET_TYPES = [
    "list",
    "-list"
];

const DEFAULTS = new Map();

const CUSTOM_DEFAULTS = new Map();

function resolveOptionValues(value) {
    if (typeof values !== "object") {
        value = SettingsAliasRegistry.resolveAlias(value);
    }
    if (value == null) {
        value = [];
    } else if (!Array.isArray(value)) {
        value = Object.keys(value);
    }
    return value;
}

function resolveDefaults() {
    for (const [key, value] of Object.entries(OptionsResource.get())) {
        if (SET_TYPES.indexOf(value.type) >= 0) {
            const values = resolveOptionValues(value.values);
            const defaultValues = resolveOptionValues(value.default);
            const defaultValueSet = new Set(defaultValues);
            for (const el of values) {
                DEFAULTS.set(el, defaultValueSet.has(el));
            }
        } else {
            DEFAULTS.set(key, value.default);
        }
    }
}

resolveDefaults();
SettingsAliasRegistry.addEventListener("change", () => {
    resolveDefaults();
});

let INSTANCE = null;

class AppOptionsStorage extends ObservableStorage {

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
        return CUSTOM_DEFAULTS.get(key) ?? DEFAULTS.get(key);
    }

    set(key, value) {
        if (CUSTOM_DEFAULTS.has(key) || DEFAULTS.has(key)) {
            super.set(key, value);
        }
    }

    setAll(values) {
        const res = {};
        for (const key in values) {
            const value = values[key];
            if (CUSTOM_DEFAULTS.has(key) || DEFAULTS.has(key)) {
                res[key] = value;
            }
        }
        super.setAll(res);
    }

    get(key) {
        if (CUSTOM_DEFAULTS.has(key) || DEFAULTS.has(key)) {
            return super.get(key) ?? CUSTOM_DEFAULTS.has(key) ?? DEFAULTS.get(key);
        }
    }

    getAll() {
        const res = {};
        for (const [key, value] of DEFAULTS) {
            res[key] = super.get(key) ?? value;
        }
        for (const [key, value] of CUSTOM_DEFAULTS) {
            res[key] = super.get(key) ?? value;
        }
        return res;
    }

    has(key) {
        return CUSTOM_DEFAULTS.has(key) || DEFAULTS.has(key);
    }

    keys() {
        return [
            ...DEFAULTS.keys(),
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

const OptionsStorage = new AppOptionsStorage();

export default OptionsStorage;
