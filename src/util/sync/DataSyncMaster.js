import SettingsStorage from "../../storage/SettingsStorage.js";
import ParameterStorage from "../../storage/ParameterStorage.js";
import Savestate from "../../savestate/Savestate.js";
import Logic from "../logic/Logic.js";
import DataSync from "./DataSync.js";
import Counter from "../Counter.js";
import WorldListState from "../../state/world/WorldListState.js";

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
            const {
                category = "", data
            } = msg;
            if (data != null) {
                Savestate.set(category, data);
            }
        } break;
        case "notes": {
            const {value = ""} = msg;
            Savestate.notes = value;
        } break;
        case "meta": {
            const {
                key, value
            } = msg;
            Savestate.setMeta(key, value);
        } break;
    }
}

function handleAreaChange(msg) {
    WorldListState.area = msg.data;
}

if (DataSync.isActive()) {
    const muted = new Counter();

    DataSync.postMessage({
        storage: "settings",
        type: "init",
        data: SettingsStorage.serialize()
    });
    DataSync.postMessage({
        storage: "parameter",
        type: "init",
        data: ParameterStorage.serialize()
    });
    DataSync.postMessage({
        storage: "savestate",
        type: "init",
        data: Savestate.serialize()
    });
    DataSync.postMessage({
        storage: "__area_change",
        data: WorldListState.area
    });
    DataSync.postMessage({
        storage: "__logic_results",
        type: "init",
        data: Logic.getAll()
    });

    // listen
    DataSync.addEventListener("message", (event) => {
        muted.add();
        const {
            storage, ...msg
        } = event.data;
        switch (storage) {
            case "settings": {
                handleStorageMessage(SettingsStorage, msg);
            } break;
            case "parameter": {
                handleStorageMessage(ParameterStorage, msg);
            } break;
            case "savestate": {
                handleSavestateMessage(msg);
            } break;
            case "__area_change": {
                handleAreaChange(msg);
            } break;
        }
        muted.sub();
    });

    // send settings
    SettingsStorage.addEventListener("load", (event) => {
        if (!muted.value) {
            const {data = {}} = event;
            DataSync.postMessage({
                storage: "settings",
                type: "load",
                data
            });
        }
    });
    SettingsStorage.addEventListener("change", (event) => {
        if (!muted.value) {
            const {data = {}} = event;
            DataSync.postMessage({
                storage: "settings",
                type: "change",
                data
            });
        }
    });

    // send parameter
    ParameterStorage.addEventListener("load", (event) => {
        if (!muted.value) {
            const {data = {}} = event;
            DataSync.postMessage({
                storage: "parameter",
                type: "load",
                data
            });
        }
    });
    ParameterStorage.addEventListener("change", (event) => {
        if (!muted.value) {
            const {data = {}} = event;
            DataSync.postMessage({
                storage: "parameter",
                type: "change",
                data
            });
        }
    });

    // send savestate
    Savestate.addEventListener("load", (event) => {
        if (!muted.value) {
            const {data = {}} = event;
            DataSync.postMessage({
                storage: "savestate",
                type: "load",
                data
            });
        }
    });
    Savestate.addEventListener("change", (event) => {
        if (!muted.value) {
            const {
                category = "", data = {}
            } = event;
            DataSync.postMessage({
                storage: "savestate",
                type: "change",
                category,
                data
            });
        }
    });
    Savestate.addEventListener("notes", (event) => {
        if (!muted.value) {
            const {value = ""} = event;
            DataSync.postMessage({
                storage: "savestate",
                type: "notes",
                value
            });
        }
    });
    Savestate.addEventListener("meta", (event) => {
        if (!muted.value) {
            const {
                key, value
            } = event;
            DataSync.postMessage({
                storage: "savestate",
                type: "meta",
                key,
                value
            });
        }
    });

    // send world area
    WorldListState.addEventListener("area", (event) => {
        DataSync.postMessage({
            storage: "__area_change",
            data: event.value
        });
    });

    // send logic results
    Logic.addEventListener("change", (event) => {
        DataSync.postMessage({
            storage: "__logic_results",
            type: "change",
            data: event.data
        });
    });
}
