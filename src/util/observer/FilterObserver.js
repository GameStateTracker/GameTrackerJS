import ObservableStorageObserver from "@emcjs/core/util/observer/data/storage/ObservableStorageObserver.js";
import FilterStorage from "../../savestate/storage/FilterStorage.js";

export default class FilterObserver extends ObservableStorageObserver {

    constructor(key) {
        super(FilterStorage, key);
    }

}
