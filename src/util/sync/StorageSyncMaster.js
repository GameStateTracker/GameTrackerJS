import SettingsStorage from "../../storage/SettingsStorage.js";
import ParameterStorage from "../../storage/ParameterStorage.js";
import Savestate from "../../savestate/Savestate.js";
import StorageSync from "./StorageSync.js";
import Counter from "../Counter.js";

function handleStorageMessage(storage, msg) {
    const type = msg.type;
    switch (type) {
        case "load": {
            const {data} = msg;
            if (data != null) {
                storage.deserialize(data);
            }
        } break;
        case "change": {
            const {data} = msg;
            if (data != null) {
                storage.setAll(data);
            }
        } break;
    }
}

function handleSavestateMessage(msg) {
    const type = msg.type;
    switch (type) {
        case "load": {
            const {data} = msg;
            if (data != null) {
                Savestate.deserialize(data);
            }
        } break;
        case "change": {
            const {category = "", data} = msg;
            if (data != null) {
                Savestate.set(category, data);
            }
        } break;
        case "notes": {
            const {value = ""} = msg;
            Savestate.notes = value;
        } break;
        case "meta": {
            const {key, value} = msg;
            Savestate.setMeta(key, value);
        } break;
    }
}

if (await StorageSync.init()) {
    const muted = new Counter();

    StorageSync.postMessage({storage: "settings", type: "init", data: SettingsStorage.serialize()});
    StorageSync.postMessage({storage: "parameter", type: "init", data: ParameterStorage.serialize()});
    StorageSync.postMessage({storage: "savestate", type: "init", data: Savestate.serialize()});

    // listen
    StorageSync.addEventListener("message", (event) => {
        muted.add();
        const {storage, ...msg} = event.data;
        switch (storage) {
            case "settings": {
                handleStorageMessage(SettingsStorage, msg);
            } break;
            case "parameter": {
                handleStorageMessage(ParameterStorage, msg);
            } break;
            case "savestate": {
                handleSavestateMessage(msg)
            } break;
        }
        muted.sub();
    });

    // send settings
    SettingsStorage.addEventListener("load", (event) => {
        if (!muted.value) {
            const {data = {}} = event;
            StorageSync.postMessage({storage: "settings", type: "load", data});
        }
    });
    SettingsStorage.addEventListener("change", (event) => {
        if (!muted.value) {
            const {data = {}} = event;
            StorageSync.postMessage({storage: "settings", type: "change", data});
        }
    });

    // send parameter
    ParameterStorage.addEventListener("load", (event) => {
        if (!muted.value) {
            const {data = {}} = event;
            StorageSync.postMessage({storage: "parameter", type: "load", data});
        }
    });
    ParameterStorage.addEventListener("change", (event) => {
        if (!muted.value) {
            const {data = {}} = event;
            StorageSync.postMessage({storage: "parameter", type: "change", data});
        }
    });

    // send savestate
    Savestate.addEventListener("load", (event) => {
        if (!muted.value) {
            const {data = {}} = event;
            StorageSync.postMessage({storage: "savestate", type: "load", data});
        }
    });
    Savestate.addEventListener("change", (event) => {
        if (!muted.value) {
            const {category = "", data = {}} = event;
            StorageSync.postMessage({storage: "savestate", type: "change", category, data});
        }
    });
    Savestate.addEventListener("notes", (event) => {
        if (!muted.value) {
            const {value = ""} = event;
            StorageSync.postMessage({storage: "savestate", type: "notes", value});
        }
    });
    Savestate.addEventListener("meta", (event) => {
        if (!muted.value) {
            const {key, value} = event;
            StorageSync.postMessage({storage: "savestate", type: "change", key, value});
        }
    });
}
