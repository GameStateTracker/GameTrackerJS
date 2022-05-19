// frameworks
import Import from "/emcJS/util/import/Import.js";
import Path from "/emcJS/util/Path.js";

const path = new Path(import.meta.url);

async function getWorker() {
    if ("SharedWorker" in window) {
        const [SharedWorkerRegistry] = await Import.module("/emcJS/worker/SharedWorkerRegistry.js");
        const workerPath = path.getAbsolute("./DataSync.worker.js");
        return SharedWorkerRegistry.register("SavestateHandler", workerPath);
    }
}

const SHARED_WORKER = await getWorker();

class DataSync extends EventTarget {

    constructor() {
        super();
        /* --- */
        if (SHARED_WORKER != null) {
            SHARED_WORKER.addEventListener("message", (event) => {
                const ev = new Event("message");
                ev.data = event.data;
                this.dispatchEvent(ev);
            });
        }
    }

    postMessage(msg = {}) {
        if (SHARED_WORKER != null) {
            SHARED_WORKER.postMessage(msg);
        }
    }

}

export default new DataSync();
