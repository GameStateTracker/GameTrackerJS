// frameworks
import Import from "/emcJS/util/import/Import.js";
import Path from "/emcJS/util/file/Path.js";

const path = new Path(import.meta.url);

async function getWorker() {
    if ("SharedWorker" in window) {
        const [SharedWorkerRegistry] = await Import.module("/emcJS/worker/SharedWorkerRegistry.js");
        if (SharedWorkerRegistry.supports("module")) {
            const workerPath = path.getAbsolute("./worker/StorageSync.w.js");
            return SharedWorkerRegistry.register("StorageSync", workerPath, "module");
        }
        const workerPath = path.getAbsolute("./worker/StorageSync.leg_w.js");
        return SharedWorkerRegistry.register("StorageSync", workerPath);
    }
}

class StorageSync extends EventTarget {

    #worker = null;

    async init() {
        if (this.#worker == null) {
            const worker = await getWorker();
            if (worker != null) {
                this.#worker = worker;
                worker.addEventListener("message", (event) => {
                    console.log("worker", event);
                    const ev = new Event("message");
                    ev.data = event.data;
                    this.dispatchEvent(ev);
                });
                return true;
            }
            return false;
        }
        return true;
    }

    postMessage(msg = {}) {
        if (this.#worker != null) {
            this.#worker.postMessage(msg);
        }
    }

}

export default new StorageSync();
