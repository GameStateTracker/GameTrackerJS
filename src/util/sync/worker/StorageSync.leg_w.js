self.importScripts(`/emcJS/worker/legacy/PortHandler.js`);
self.importScripts(`/emcJS/worker/legacy/StorageCache.js`);
self.importScripts(`/GameTrackerJS/util/sync/worker/legacy/SavestateCache.js`);

const SETTINGS = new self.StorageCache();
const PARAMETER = new self.StorageCache();
const SAVESTATE = new self.SavestateCache();

function handleStorageMessage(storage, msg) {
    const type = msg.type;
    switch (type) {
        case "init":
        case "load": {
            const {data} = msg;
            if (data != null) {
                storage.deserialize(data);
            }
        } break;
        case "change": {
            const {data} = msg;
            if (data != null) {
                storage.set(data);
            }
        } break;
    }
}

function handleSavestateMessage(msg) {
    const type = msg.type;
    switch (type) {
        case "init":
        case "load": {
            const {data} = msg;
            if (data != null) {
                SAVESTATE.deserialize(data);
            }
        } break;
        case "change": {
            const {category = "", data} = msg;
            if (data != null) {
                SAVESTATE.set(category, data);
            }
        } break;
        case "notes": {
            const {value = ""} = msg;
            SAVESTATE.notes = value;
        } break;
        case "meta": {
            const {key, value} = msg;
            SAVESTATE.setMeta(key, value);
        } break;
    }
}

self.PortHandler.addEventListener("connect", (event) => {
    const port = event.port;
    self.PortHandler.sendOne({storage: "settings", type: "init", data: SETTINGS.serialize()}, port);
    self.PortHandler.sendOne({storage: "parameter", type: "init", data: PARAMETER.serialize()}, port);
    self.PortHandler.sendOne({storage: "savestate", type: "init", data: SAVESTATE.serialize()}, port);
});

self.PortHandler.addEventListener("message", (event) => {
    /* echo */
    const port = event.port;
    self.PortHandler.sendAllButOne(event.data, port);

    /* cache */
    const {storage, ...msg} = event.data;
    switch (storage) {
        case "settings": {
            handleStorageMessage(SETTINGS, msg);
        } break;
        case "parameter": {
            handleStorageMessage(PARAMETER, msg);
        } break;
        case "savestate": {
            handleSavestateMessage(msg)
        } break;
    }
});
