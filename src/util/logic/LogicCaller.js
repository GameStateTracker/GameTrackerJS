import {
    getRegion
} from "../../data/resource/WorldResource.js";
import TrackerLogicDataCollector from "./TrackerLogicDataCollector.js";
import Logic from "./Logic.js";

class LogicCaller extends EventTarget {

    constructor() {
        super();
        /* EVENTS */
        Logic.addEventListener("change", (event) => {
            const ev = new Event("change");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        TrackerLogicDataCollector.addEventListener("load", (event) => {
            Logic.reset();
            Logic.execute(event.data, getRegion());
        });
        TrackerLogicDataCollector.addEventListener("change", (event) => {
            Logic.execute(event.data, getRegion());
        });
    }

    registerStorage(storage, prefix = "", postfix = "", precall = null) {
        TrackerLogicDataCollector.registerStorage(storage, prefix, postfix, precall);
    }

    registerAugment(augment) {
        TrackerLogicDataCollector.registerAugment(augment);
    }

    addReachable(target) {
        Logic.addReachable(target);
    }

    deleteReachable(target) {
        Logic.deleteReachable(target);
    }

    clearReachables() {
        Logic.clearReachables();
    }

    setCollectible(target, value) {
        Logic.setCollectible(target, value);
    }

    deleteCollectible(target) {
        Logic.deleteCollectible(target);
    }

    clearCollectibles() {
        Logic.clearCollectibles();
    }

}

export default new LogicCaller();
