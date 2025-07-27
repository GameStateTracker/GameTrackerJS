if (!self.SavestateCache) {
    class SavestateCache {

        #state = {
            data: new Map(),
            meta: new Map(),
            name: "",
            version: "",
            timestamp: "",
            autosave: "",
            notes: ""
        };

        serialize() {
            const res = {
                ...this.#state,
                meta: this.#getStorageData(this.#state.meta),
                data: {}
            };
            for (const [category, storage] of this.#state.data) {
                res.data[category] = this.#getStorageData(storage);
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
            this.#state.name = name?.toString();
            this.#state.version = version;
            this.#state.timestamp = timestamp;
            this.#state.autosave = autosave;
            this.#state.notes = notes?.toString();
            /* META */
            this.#state.meta.clear();
            for (const key in meta) {
                this.#state.meta.set(key, meta[key]);
            }
            /* STORAGES */
            this.#state.data.clear();
            for (const category in data) {
                const storage = this.#getStorage(category);
                for (const key in data[category]) {
                    storage.set(key, data[category][key]);
                }
            }
        }

        /* META */
        setMeta(key, value) {
            this.#state.set(key, value);
        }

        /* STORAGES */
        set(category, data) {
            const storage = this.#getStorage(category);
            for (const key in data) {
                storage.set(key, data[key]);
            }
        }

        #getStorageData(map) {
            const res = {};
            for (const [key, value] of map) {
                res[key] = value;
            }
            return res;
        }

        #getStorage(category) {
            if (!this.#state.data.has(category)) {
                const storage = new Map();
                this.#state.data.set(category, storage);
                return storage;
            } else {
                return this.#state.data.get(category);
            }
        }

    }

    self.SavestateCache = SavestateCache;
}
