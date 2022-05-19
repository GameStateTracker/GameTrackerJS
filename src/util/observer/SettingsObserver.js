// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

import SettingsStorage from "../../storage/SettingsStorage.js";

export default class SettingsObserver extends DataStorageValueObserver {

    constructor(key) {
        super(SettingsStorage, key);
    }

}
