// frameworks
import ObservableIDBProxyStorage from "/emcJS/data/storage/observable/ObservableIDBProxyStorage.js";

import SettingsResource from "../data/resource/SettingsResource.js";
import SettingsAliasRegistry from "../registry/SettingsAliasRegistry.js";

// TODO sync data to other page instances

const SET_TYPES = [
    "list",
    "-list"
];

const DEFAULTS = new Map();

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
    for (const [key, value] of Object.entries(SettingsResource.get())) {
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

class AppSettingsStorage extends ObservableIDBProxyStorage {

    constructor() {
        super("settings");
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
            if (key in data) {
                const newValue = data[key];
                res[key] = newValue;
            }
        }
        super.overwrite(res);
    }

}

const SettingsStorage = new AppSettingsStorage();
await SettingsStorage.awaitLoaded();

export default SettingsStorage;
