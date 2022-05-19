// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

import FilterStorage from "../../savestate/storage/FilterStorage.js";

export default class FilterObserver extends DataStorageValueObserver {

    constructor(key) {
        super(FilterStorage, key);
    }

}
