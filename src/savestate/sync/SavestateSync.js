// frameworks
import Import from "/emcJS/util/import/Import.js";
import Path from "/emcJS/util/file/Path.js";
import Savestate from "../Savestate.js";
import Counter from "../../util/Counter.js";

const path = new Path(import.meta.url);

async function getWorker() {
    if ("SharedWorker" in window) {
        const [SharedWorkerRegistry] = await Import.module("/emcJS/worker/SharedWorkerRegistry.js");
        if (SharedWorkerRegistry.supports("module")) {
            const workerPath = path.getAbsolute("./SavestateSync.w.js");
            return SharedWorkerRegistry.register("SavestateSync", workerPath, "module");
        }
        const workerPath = path.getAbsolute("./SavestateSync.leg_w.js");
        return SharedWorkerRegistry.register("SavestateSync", workerPath);
    }
}

const SHARED_WORKER = await getWorker();

if (SHARED_WORKER != null) {
    SHARED_WORKER.postMessage({type: "init", data: Savestate.serialize()});
    // listen
    const muted = new Counter();
    SHARED_WORKER.addEventListener("message", (event) => {
        muted.add();
        if (event.data.type == "load") {
            const {data = {}} = event.data;
            Savestate.deserialize(data);
        } else if (event.data.type == "notes") {
            const {value = ""} = event.data;
            Savestate.notes = value;
        } else if (event.data.type == "change") {
            const {category = "", data = {}} = event.data;
            Savestate.set(category, data);
        } else if (event.data.type == "meta") {
            const {key, value} = event.data;
            Savestate.setMeta(key, value);
        }
        muted.sub();
    });
    // send
    Savestate.addEventListener("load", (event) => {
        if (!muted.value) {
            const {data = {}} = event;
            SHARED_WORKER.postMessage({type: "load", data});
        }
    });
    Savestate.addEventListener("notes", (event) => {
        if (!muted.value) {
            const {value = ""} = event;
            SHARED_WORKER.postMessage({type: "notes", value});
        }
    });
    Savestate.addEventListener("change", (event) => {
        if (!muted.value) {
            const {category = "", data = {}} = event;
            SHARED_WORKER.postMessage({type: "change", category, data});
        }
    });
    Savestate.addEventListener("meta", (event) => {
        if (!muted.value) {
            const {key, value} = event;
            SHARED_WORKER.postMessage({type: "change", key, value});
        }
    });
}

class SavestateSync extends EventTarget {

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

export default new SavestateSync();

