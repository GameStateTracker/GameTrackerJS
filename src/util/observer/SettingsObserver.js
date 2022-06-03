// frameworks
import ObservableStorageObserver from "/emcJS/util/observer/ObservableStorageObserver.js";

import SettingsStorage from "../../storage/SettingsStorage.js";

export default class SettingsObserver extends ObservableStorageObserver {

    constructor(key) {
        super(SettingsStorage, key);
    }

}
