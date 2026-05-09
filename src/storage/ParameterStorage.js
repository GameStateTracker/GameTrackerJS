// frameworks
import ObservableIDBProxyStorage from "@emcjs/core/data/storage/observable/ObservableIDBProxyStorage.js";

// TODO sync data to other page instances

class AppParameterStorage extends ObservableIDBProxyStorage {

    constructor() {
        super("parameter");
    }

}

const ParameterStorage = new AppParameterStorage();
await ParameterStorage.awaitLoaded();

export default ParameterStorage;
