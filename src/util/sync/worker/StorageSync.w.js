import MessagePortHandler from "/emcJS/worker/util/MessagePortHandler.js";
import StorageCache from "/emcJS/worker/util/StorageCache.js";
import SavestateCache from "./util/SavestateCache.js";

const SETTINGS = new StorageCache();
const PARAMETER = new StorageCache();
const SAVESTATE = new SavestateCache();

const LOGIC_RESULTS = new Map();

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

function handleLogicResults(msg) {
    const {data} = msg;
    if (data != null) {
        for (const [key, value] of Object.entries(data)) {
            LOGIC_RESULTS.set(key, value);
        }
    }
}

MessagePortHandler.addEventListener("message", (event) => {
    const port = event.port;

    /* init */
    if (event.data === "ready") {
        MessagePortHandler.sendOne({storage: "settings", type: "init", data: SETTINGS.serialize()}, port);
        MessagePortHandler.sendOne({storage: "parameter", type: "init", data: PARAMETER.serialize()}, port);
        MessagePortHandler.sendOne({storage: "savestate", type: "init", data: SAVESTATE.serialize()}, port);
        MessagePortHandler.sendOne({storage: "__logic_results", type: "init", data: Object.fromEntries(LOGIC_RESULTS)}, port);
    } else {
        /* echo */
        MessagePortHandler.sendAllButOne(event.data, port);

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
                handleSavestateMessage(msg);
            } break;
            case "__logic_results": {
                handleLogicResults(msg);
            } break;
        }
    }
});
