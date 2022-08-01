const SavestateCache = (function() {
    const STATE = {
        data: new Map(),
        meta: new Map(),
        name: "",
        version: "",
        timestamp: "",
        autosave: "",
        notes: ""
    };

    class SavestateCache {

        serialize() {
            const res = {
                ...STATE,
                meta: this._getStorageData(STATE.meta),
                data: {}
            };
            for (const [category, storage] of STATE.data) {
                res.data[category] = this._getStorageData(storage);
            }
            return res;
        }

        deserialize(state) {
            const {
                name,
                version,
                timestamp,
                autosave,
                notes,
                meta,
                data
            } = state;
            STATE.name = name?.toString();
            STATE.version = version;
            STATE.timestamp = timestamp;
            STATE.autosave = autosave;
            STATE.notes = notes?.toString();
            /* META */
            STATE.meta.clear();
            for (const key in meta) {
                STATE.meta.set(key, meta[key]);
            }
            /* STORAGES */
            STATE.data.clear();
            for (const category in data) {
                const storage = this._getStorage(category);
                for (const key in data[category]) {
                    storage.set(key, data[category][key]);
                }
            }
        }

        /* META */
        setMeta(key, value) {
            STATE.set(key, value);
        }

        /* STORAGES */
        set(category, data) {
            const storage = this._getStorage(category);
            for (const key in data) {
                storage.set(key, data[key]);
            }
        }

        set notes(value) {
            value = value.toString();
            STATE.notes = value;
        }

        _getStorageData(map) {
            const res = {};
            for (const [key, value] of map) {
                res[key] = value;
            }
            return res;
        }

        _getStorage(category) {
            if (!STATE.data.has(category)) {
                const storage = new Map();
                STATE.data.set(category, storage);
                return storage;
            } else {
                return STATE.data.get(category);
            }
        }

    }

    return SavestateCache;
})();

self.SavestateCache = SavestateCache;
