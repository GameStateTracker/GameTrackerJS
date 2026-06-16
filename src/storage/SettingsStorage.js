import ObservableIDBProxyStorage from "@emcjs/core/data/storage/observable/ObservableIDBProxyStorage.js";
import TrackerSettingsConfigHandler from "../util/settings/TrackerSettingsConfigHandler.js";

// TODO sync data to other page instances

const defaultValues = TrackerSettingsConfigHandler.defaultValues;

const HOTKEY_NAMES = TrackerSettingsConfigHandler.getTypeMembers("hotkey");
const HOTKEY_PARSE_OLD = /(ctrl\+)?(shift\+)?(alt\+)?(meta\+)?(.+)?/i;

function convertOldHotkeys(string) {
    const params = HOTKEY_PARSE_OLD.exec(string ?? "");
    let res = "";
    if (params[1] != null) {
        res += "ctrl ";
    }
    if (params[2] != null) {
        res += "shift ";
    }
    if (params[3] != null) {
        res += "alt ";
    }
    if (params[4] != null) {
        res += "meta ";
    }
    if (params[5] != null) {
        res += params[5] === " " ? "space" : params[5].toLowerCase();
    }
    return res;
}

class AppSettingsStorage extends ObservableIDBProxyStorage {

    constructor() {
        super("settings");
    }

    set(key, value) {
        if (defaultValues.has(key)) {
            super.set(key, value);
        }
    }

    setAll(values) {
        const res = {};
        for (const key in values) {
            const value = values[key];
            if (defaultValues.has(key)) {
                res[key] = value;
            }
        }
        super.setAll(res);
    }

    get(key) {
        if (defaultValues.has(key)) {
            return super.get(key) ?? defaultValues.get(key);
        }
    }

    getAll() {
        const res = {};
        for (const [key, value] of defaultValues) {
            res[key] = super.get(key) ?? value;
        }
        return res;
    }

    has(key) {
        return defaultValues.has(key);
    }

    keys() {
        return defaultValues.keys();
    }

    deserialize(data = {}) {
        const res = {};
        for (const [key] of defaultValues) {
            const newValue = data[key];
            if (newValue != null) {
                if (HOTKEY_NAMES.includes(key)) {
                    res[key] = convertOldHotkeys(newValue);
                } else {
                    res[key] = newValue;
                }
            }
        }
        super.deserialize(res);
    }

    overwrite(data = {}) {
        const res = {};
        for (const [key] of defaultValues) {
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
