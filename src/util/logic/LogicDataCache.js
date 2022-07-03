
export default class LogicDataCache {

    #cache;

    #augments = new Map();

    #changes = new Map();

    constructor(cache) {
        this.#cache = cache;
    }

    setChanges(data) {
        this.#changes.clear();
        this.#augments.clear();
        for (const [key, value] of Object.entries(data)) {
            this.#changes.set(key, value);
        }
    }

    set(key, value) {
        this.#augments.set(key, value);
    }

    get(key) {
        return this.#augments.get(key) ?? this.#changes.get(key) ?? this.#cache.get(key);
    }

    hasChange(key) {
        return this.#changes.has(key);
    }

    getAugments() {
        const res = {};
        for (const [key, value] of this.#augments) {
            res[key] = value;
        }
        return res;
    }

}
