// frameworks
import IDBProxyStorage from "/emcJS/data/storage/observable/ObservableIDBProxyStorage.js";

// TODO sync data to other page instances

class ParameterStorage extends IDBProxyStorage {

    constructor() {
        super("parameter");
    }

}

const storage = new ParameterStorage();

export default await storage.awaitLoaded();
