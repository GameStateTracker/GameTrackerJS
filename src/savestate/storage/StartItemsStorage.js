// frameworks
import DataStorage from "/emcJS/datastorage/DataStorage.js";

import {
    parseSafeRange
} from "../../util/helper/ItemHelper.js";
import ItemsResource from "../../resource/ItemsResource.js";

const MAX = new Map();

for (const [key, value] of Object.entries(ItemsResource.get())) {
    MAX.set(key, parseSafeRange(value.max, 0));
}

class StartItemsStorage extends DataStorage {

    set(key, value) {
        const parsedValue = parseSafeRange(value);
        if (parsedValue != null && MAX.has(key)) {
            super.set(key, Math.min(MAX.get(key), Math.max(0, parsedValue)));
        }
    }

    setAll(values) {
        const res = {};
        for (const key in values) {
            const value = parseSafeRange(values[key]);
            if (value != null && MAX.has(key)) {
                res[key] = Math.min(MAX.get(key), Math.max(0, value));
            }
        }
        super.setAll(res);
    }

    get(key) {
        if (MAX.has(key)) {
            return super.get(key, 0);
        }
    }

    getAll() {
        const res = {};
        for (const [key] of MAX) {
            res[key] = super.get(key, 0);
        }
        return res;
    }

    has(key) {
        return MAX.has(key);
    }

    keys() {
        return MAX.keys();
    }

    deserialize(data = {}) {
        const res = {};
        for (const [key] of MAX) {
            const newValue = data[key];
            if (newValue != null) {
                res[key] = newValue;
            }
        }
        super.deserialize(res);
    }

    overwrite(data = {}) {
        const res = {};
        for (const [key] of MAX) {
            const newValue = data[key];
            res[key] = newValue;
        }
        super.overwrite(res);
    }

}

const storage = new StartItemsStorage();

export default storage;
