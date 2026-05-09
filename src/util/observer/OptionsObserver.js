import ObservableStorageObserver from "@emcjs/core/util/observer/data/storage/ObservableStorageObserver.js";
import OptionsStorage from "../../savestate/storage/OptionsStorage.js";

export default class OptionsObserver extends ObservableStorageObserver {

    constructor(key) {
        super(OptionsStorage, key);
    }

}
