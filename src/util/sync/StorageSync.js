import Path from "@emcjs/core/util/file/Path.js";
import SharedWorkerRegistry from "@emcjs/core/registry/worker/SharedWorkerRegistry.js";

const MODULE_PATH = new Path(import.meta.url);

function getWorker() {
    if (SharedWorkerRegistry.isSupported()) {
        // if (SharedWorkerRegistry.supportsType("module")) {
        //     const workerPath = MODULE_PATH.getAbsolute("./worker/StorageSync.w.js");
        //     return SharedWorkerRegistry.register("StorageSync", workerPath, "module");
        // }
        const workerPath = MODULE_PATH.getAbsolute("./worker/StorageSync.w.leg.js");
        return SharedWorkerRegistry.register("StorageSync", workerPath);
    }
}

class StorageSync extends EventTarget {

    #worker = getWorker();

    constructor() {
        super();
        /* --- */
        if (this.#worker != null) {
            this.#worker.addEventListener("message", (event) => {
                console.log("StorageSync", event);
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

export default new StorageSync();
