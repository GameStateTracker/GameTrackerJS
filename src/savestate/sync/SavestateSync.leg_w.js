self.importScripts(`/emcJS/worker/legacy/PortHandler.js`);

let init = false;
const CACHE = {
    data: {},
    meta: {},
    name: "",
    version: "",
    timestamp: "",
    autosave: "",
    notes: ""
};

function load(state) {
    const {
        name,
        version,
        timestamp,
        autosave,
        notes,
        meta,
        data
    } = state;
    CACHE.name = name?.toString();
    CACHE.version = version;
    CACHE.timestamp = timestamp;
    CACHE.autosave = autosave;
    CACHE.notes = notes?.toString();
    CACHE.meta = {};
    for (const key in meta) {
        CACHE.meta[key] = meta[key];
    }
    CACHE.data = {};
    for (const category in data) {
        CACHE.data[category] = {};
        for (const key in data[category]) {
            CACHE.data[category][key] = data[category][key];
        }
    }
}

self.PortHandler.addEventListener("connect", (event) => {
    if (init) {
        self.PortHandler.sendOne({type: "load", data: CACHE}, event.port);
    }
});

self.PortHandler.addEventListener("message", (event) => {
    if (event.data.type == "init") {
        if (!init) {
            const {data = {}} = event.data;
            load(data);
            init = true;
        }
    } else {
        const port = event.port;
        self.PortHandler.sendAllButOne(event.data, port);
        // cache
        if (event.data.type == "load") {
            const {data = {}} = event.data;
            load(data);
        } else if (event.data.type == "notes") {
            const {value} = event.data;
            CACHE.notes = value;
        } else if (event.data.type == "change") {
            const {category = "", data = {}} = event.data;
            for (const key in data) {
                CACHE.data[category][key] = data[key];
            }
        } else if (event.data.type == "meta") {
            const {key, value} = event.data;
            CACHE.meta[key] = value;
        }
    }
});
