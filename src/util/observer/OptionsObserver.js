// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

import OptionsStorage from "../../savestate/storage/OptionsStorage.js";

export default class OptionsObserver extends DataStorageValueObserver {

    constructor(key) {
        super(OptionsStorage, key);
    }

}
