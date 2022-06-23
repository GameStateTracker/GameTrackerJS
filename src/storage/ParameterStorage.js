// frameworks
import ObservableIDBProxyStorage from "/emcJS/data/storage/observable/ObservableIDBProxyStorage.js";

// TODO sync data to other page instances

class ParameterStorage extends ObservableIDBProxyStorage {

    constructor() {
        super("parameter");
    }

}

const storage = new ParameterStorage();

export default await storage.awaitLoaded();
