import Path from "@emcjs/core/util/file/Path.js";
import SharedWorkerRegistry from "@emcjs/core/registry/worker/SharedWorkerRegistry.js";

const MODULE_PATH = new Path(import.meta.url);

function getWorker() {
    if (SharedWorkerRegistry.isSupported()) {
        // if (SharedWorkerRegistry.supportsType("module")) {
        //     const workerPath = MODULE_PATH.getAbsolute("./worker/DataSync.w.js");
        //     return SharedWorkerRegistry.register("DataSync", workerPath, "module");
        // }
        const workerPath = MODULE_PATH.getAbsolute("./worker/DataSync.w.leg.js");
        return SharedWorkerRegistry.register("DataSync", workerPath);
    }
}

class DataSync extends EventTarget {

    #worker = getWorker();

    constructor() {
        super();
        /* --- */
        if (this.#worker != null) {
            this.#worker.addEventListener("message", (event) => {
                console.log("DataSync", event);
                const ev = new Event("message");
                ev.data = event.data;
                this.dispatchEvent(ev);
            });
        }
    }

    isActive() {
        return this.#worker != null;
    }

    postMessage(msg = {}) {
        if (this.#worker != null) {
            this.#worker.postMessage(msg);
        }
    }

}

export default new DataSync();
