import Path from "/emcJS/util/file/Path.js";
import SharedWorkerRegistry from "/emcJS/worker/SharedWorkerRegistry.js";

const MODULE_PATH = new Path(import.meta.url);

const WORKER_PATH = MODULE_PATH.getAbsolute("./worker/index.js");

async function getWorker() {
    if (SharedWorkerRegistry.isSupported()) {
        return SharedWorkerRegistry.register("GameTrackerCore", WORKER_PATH);
    }
}

class CoreConnector extends EventTarget {

    #worker = getWorker();

    constructor() {
        super();
        /* --- */
        if (this.#worker != null) {
            this.#worker.addEventListener("message", (event) => {
                const {type, message, data} = event.data;
                switch (type) {
                    case "error": {
                        console.error(message, data);
                    } break;
                    case "dataChange": {
                        // todo handle storage {storage: string, event: string, data: {[key]: value}}
                    } break;
                    case "logicUpdate": {
                        // todo logic result
                    } break;
                }
            });
            this.#worker.postMessage("ready");
        }
    }

    postMessage(msg = {}) {
        if (this.#worker != null) {
            this.#worker.postMessage(msg);
        }
    }

    registerStorage(name, path, eventName, ...params) {
        if (this.#worker != null) {
            this.#worker.postMessage({
                type: "command",
                command: "registerStorage",
                data: {
                    name,
                    path,
                    params,
                    eventName
                }
            });
        }
    }

}

export default new CoreConnector();
