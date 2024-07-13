import TypeEntity from "/emcJS/data/type/TypeEntity.js";
import TypeStorage from "/emcJS/data/type/TypeStorage.js";
import "../util/TypeLoader.js";

const DEFAULT_CONFIG = {
    defaultArea: {
        type: "",
        name: ""
    },
    metaArea: {
        active: false
    },
    areaContentHints: {},
    region: {
        root: "",
        prefix: "",
        postfix: ""
    },
    gateways: {
        incomingPrefix: "",
        incomingPostfix: "",
        outgoingPrefix: "",
        outgoingPostfix: "",
        variants: []
    }
};

class DataManager extends EventTarget {

    #config = new TypeEntity("WorldConfig", "config", DEFAULT_CONFIG);

    #locationStorage = new TypeStorage("Location");

    #collectionStorage = new TypeStorage("Collection");

    #areaStorage = new TypeStorage("Area");

    #exitStorage = new TypeStorage("Exit");

    constructor() {
        super();
        /* --- */
        this.#config.addEventListener("change", (event) => {
            const {data, changes} = event;
            const ev = new Event("change", {bubbles: true, cancelable: true, composed: true});
            ev.data = {
                type: "WorldConfig",
                data,
                changes
            };
            this.dispatchEvent(ev);
        });
        /* --- */
        this.#locationStorage.addEventListener("change", (event) => {
            const {data, changes} = event;
            const ev = new Event("change", {bubbles: true, cancelable: true, composed: true});
            ev.data = {
                type: "Location",
                data,
                changes
            };
            this.dispatchEvent(ev);
        });
        this.#locationStorage.addEventListener("clear", (event) => {
            const {data} = event;
            const ev = new Event("change", {bubbles: true, cancelable: true, composed: true});
            ev.data = {
                type: "Location",
                data
            };
            this.dispatchEvent(ev);
        });
        this.#locationStorage.addEventListener("load", (event) => {
            const {data} = event;
            const ev = new Event("change", {bubbles: true, cancelable: true, composed: true});
            ev.data = {
                type: "Location",
                data
            };
            this.dispatchEvent(ev);
        });
        /* --- */
        this.#collectionStorage.addEventListener("change", (event) => {
            const {data, changes} = event;
            const ev = new Event("change", {bubbles: true, cancelable: true, composed: true});
            ev.data = {
                type: "Collection",
                data,
                changes
            };
            this.dispatchEvent(ev);
        });
        this.#collectionStorage.addEventListener("clear", (event) => {
            const {data} = event;
            const ev = new Event("change", {bubbles: true, cancelable: true, composed: true});
            ev.data = {
                type: "Collection",
                data
            };
            this.dispatchEvent(ev);
        });
        this.#collectionStorage.addEventListener("load", (event) => {
            const {data} = event;
            const ev = new Event("change", {bubbles: true, cancelable: true, composed: true});
            ev.data = {
                type: "Collection",
                data
            };
            this.dispatchEvent(ev);
        });
        /* --- */
        this.#areaStorage.addEventListener("change", (event) => {
            const {data, changes} = event;
            const ev = new Event("change", {bubbles: true, cancelable: true, composed: true});
            ev.data = {
                type: "Area",
                data,
                changes
            };
            this.dispatchEvent(ev);
        });
        this.#areaStorage.addEventListener("clear", (event) => {
            const {data} = event;
            const ev = new Event("change", {bubbles: true, cancelable: true, composed: true});
            ev.data = {
                type: "Area",
                data
            };
            this.dispatchEvent(ev);
        });
        this.#areaStorage.addEventListener("load", (event) => {
            const {data} = event;
            const ev = new Event("change", {bubbles: true, cancelable: true, composed: true});
            ev.data = {
                type: "Area",
                data
            };
            this.dispatchEvent(ev);
        });
        /* --- */
        this.#exitStorage.addEventListener("change", (event) => {
            const {data, changes} = event;
            const ev = new Event("change", {bubbles: true, cancelable: true, composed: true});
            ev.data = {
                type: "Exit",
                data,
                changes
            };
            this.dispatchEvent(ev);
        });
        this.#exitStorage.addEventListener("clear", (event) => {
            const {data} = event;
            const ev = new Event("change", {bubbles: true, cancelable: true, composed: true});
            ev.data = {
                type: "Exit",
                data
            };
            this.dispatchEvent(ev);
        });
        this.#exitStorage.addEventListener("load", (event) => {
            const {data} = event;
            const ev = new Event("change", {bubbles: true, cancelable: true, composed: true});
            ev.data = {
                type: "Exit",
                data
            };
            this.dispatchEvent(ev);
        });
    }

    reset() {
        this.#config.set(DEFAULT_CONFIG);
        this.#config.flushChange();
        this.#locationStorage.clear();
        this.#collectionStorage.clear();
        this.#areaStorage.clear();
        this.#exitStorage.clear();
    }

    loadData(value) {
        this.#config.set(value.config);
        this.#config.flushChange();
        this.#locationStorage.deserialize(value.locations);
        this.#collectionStorage.deserialize(value.collections);
        this.#areaStorage.deserialize(value.areas);
        this.#exitStorage.deserialize(value.exits);
    }

    setData(value) {
        this.#config.set(value.config);
        this.#locationStorage.setAll(value.locations);
        this.#collectionStorage.setAll(value.collections);
        this.#areaStorage.setAll(value.areas);
        this.#exitStorage.setAll(value.exits);
    }

    getData() {
        return {
            config: this.#config.get(),
            locations: this.#locationStorage.getAll(),
            collections: this.#collectionStorage.getAll(),
            areas: this.#areaStorage.getAll(),
            exits: this.#exitStorage.getAll()
        };
    }

    writeEntity(type, key, value) {
        switch (type) {
            case "WorldConfig": {
                this.#config.set(value);
            } break;
            case "Location": {
                this.#locationStorage.set(key, value);
            } break;
            case "Collection": {
                this.#collectionStorage.set(key, value);
            } break;
            case "Area": {
                this.#areaStorage.set(key, value);
            } break;
            case "Exit": {
                this.#exitStorage.set(key, value);
            } break;
        }
    }

    readEntity(type, key) {
        switch (type) {
            case "WorldConfig": {
                return this.#config.get();
            }
            case "Location": {
                return this.#locationStorage.get(key);
            }
            case "Collection": {
                return this.#collectionStorage.get(key);
            }
            case "Area": {
                return this.#areaStorage.get(key);
            }
            case "Exit": {
                return this.#exitStorage.get(key);
            }
        }
        return null;
    }

    deleteEntity(type, key) {
        switch (type) {
            case "WorldConfig": {
                this.#config.set(DEFAULT_CONFIG);
            } break;
            case "Location": {
                this.#locationStorage.delete(key);
            } break;
            case "Collection": {
                this.#collectionStorage.delete(key);
            } break;
            case "Area": {
                this.#areaStorage.delete(key);
            } break;
            case "Exit": {
                this.#exitStorage.delete(key);
            } break;
        }
    }

    hasEntity(type, key) {
        switch (type) {
            case "WorldConfig": {
                return true;
            }
            case "Location": {
                return this.#locationStorage.has(key);
            }
            case "Collection": {
                return this.#collectionStorage.has(key);
            }
            case "Area": {
                return this.#areaStorage.has(key);
            }
            case "Exit": {
                return this.#exitStorage.has(key);
            }
        }
        return false;
    }

    getEntities(type) {
        switch (type) {
            case "WorldConfig": {
                return this.#config.get();
            }
            case "Location": {
                return this.#locationStorage.getAll();
            }
            case "Collection": {
                return this.#collectionStorage.getAll();
            }
            case "Area": {
                return this.#areaStorage.getAll();
            }
            case "Exit": {
                return this.#exitStorage.getAll();
            }
        }
        return null;
    }

    hasChanges() {
        return this.#config.hasChange() ||
            this.#locationStorage.hasChanges() ||
            this.#collectionStorage.hasChanges() ||
            this.#areaStorage.hasChanges() ||
            this.#exitStorage.hasChanges();
    }

    flushChanges() {
        this.#config.flushChange();
        this.#locationStorage.flushChanges();
        this.#collectionStorage.flushChanges();
        this.#areaStorage.flushChanges();
        this.#exitStorage.flushChanges();
    }

}

export default new DataManager();
