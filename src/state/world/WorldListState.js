import WorldResource from "../../data/resource/WorldResource.js";
import Savestate from "../../savestate/Savestate.js";

const CONFIG = WorldResource.get("config");
const AREA_PROPS = WorldResource.get("area");

class WorldListState extends EventTarget {

    #area = CONFIG.defaultArea;

    #props = AREA_PROPS[CONFIG.defaultArea];

    constructor() {
        super();

        /* EVENT */
        Savestate.addEventListener("load", () => {
            this.reset();
        });
    }

    get config() {
        return CONFIG;
    }

    get defaultArea() {
        return CONFIG.defaultArea;
    }

    get area() {
        return this.#area;
    }

    set area(value) {
        if (typeof value != "string" || !value) {
            value = CONFIG.defaultArea;
        }
        if (this.#area != value) {
            this.#area = value;
            this.#props = AREA_PROPS[value];
            // external
            const ev = new Event("area");
            ev.value = value;
            this.dispatchEvent(ev);
        }
    }

    get isDefault() {
        return this.#area == CONFIG.defaultArea;
    }

    get hasMap() {
        return this.#props.map.active;
    }

    reset() {
        if (!this.isDefault) {
            this.#area = CONFIG.defaultArea;
            this.#props = AREA_PROPS[CONFIG.defaultArea];
            // external
            const ev = new Event("area");
            ev.value = CONFIG.defaultArea;
            this.dispatchEvent(ev);
        }
    }

}

export default new WorldListState();
