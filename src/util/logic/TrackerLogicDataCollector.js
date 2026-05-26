import LogicDataCollector from "@emcjs/logic/util/LogicDataCollector.js";
import Savestate from "../../savestate/Savestate.js";
import SettingsStorage from "../../storage/SettingsStorage.js";

const STORAGES = {
    items: Savestate.getStorage("items"),
    startItems: Savestate.getStorage("startItems"),
    locations: Savestate.getStorage("locations"),
    options: Savestate.getStorage("options"),
    filter: Savestate.getStorage("filter"),
    areaActiveLists: Savestate.getStorage("areaActiveLists"),
    exitBindings: Savestate.getStorage("exitBindings")
};

function augmentItemValues(newData) {
    const res = {};
    for (const [key, value] of Object.entries(newData)) {
        const startValue = STORAGES.startItems.get(key);
        if (startValue != null) {
            res[key] = Math.max(startValue, value);
        } else {
            res[key] = value;
        }
    }
    return res;
}

function augmentStartItemValues(newData) {
    const res = {};
    for (const [key, startValue] of Object.entries(newData)) {
        const value = STORAGES.items.get(key);
        if (startValue != null) {
            res[key] = Math.max(startValue, value);
        } else {
            res[key] = startValue;
        }
    }
    return res;
}

class TrackerLogicDataCollector extends LogicDataCollector {

    constructor() {
        super();
        /* EVENTS */
        Savestate.addEventListener("load", () => {
            this.init();
        });
        /* STORAGES */
        this.registerStorage(STORAGES.items, "item[", "]", augmentItemValues);
        this.registerStorage(STORAGES.startItems, "item[", "]", augmentStartItemValues);
        this.registerStorage(STORAGES.locations, "location[", "]");
        this.registerStorage(STORAGES.options, "option[", "]");
        this.registerStorage(STORAGES.filter, "filter[", "]");
        this.registerStorage(STORAGES.areaActiveLists, "arealist[", "]");
        this.registerStorage(STORAGES.exitBindings, "exitBindings[", "]");
        this.registerStorage(SettingsStorage, "setting[", "]");
    }

}

export default new TrackerLogicDataCollector();
