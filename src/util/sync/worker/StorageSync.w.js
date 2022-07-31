import PortHandler from "/emcJS/worker/modules/PortHandler.js";
import StorageCache from "/emcJS/worker/modules/StorageCache.js";
import SavestateCache from "./modules/SavestateCache.js";

const SETTINGS = new StorageCache();
const PARAMETER = new StorageCache();
const SAVESTATE = new SavestateCache();

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

PortHandler.addEventListener("connect", (event) => {
    const port = event.port;
    PortHandler.sendOne({storage: "settings", type: "init", data: SETTINGS.serialize()}, port);
    PortHandler.sendOne({storage: "parameter", type: "init", data: PARAMETER.serialize()}, port);
    PortHandler.sendOne({storage: "savestate", type: "init", data: SAVESTATE.serialize()}, port);
});

PortHandler.addEventListener("message", (event) => {
    /* echo */
    const port = event.port;
    PortHandler.sendAllButOne(event.data, port);

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
