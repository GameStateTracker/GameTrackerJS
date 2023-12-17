import WorldResource from "../../data/resource/WorldResource.js";
import Savestate from "../../savestate/Savestate.js";

const CONFIG = WorldResource.get("config");
const AREA_PROPS = WorldResource.get("areas");

class WorldListState extends EventTarget {

    #area = this.defaultArea;

    #props = AREA_PROPS[this.#area];

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
        return CONFIG.defaultArea?.name ?? "";
    }

    get area() {
        return this.#area;
    }

    set area(value) {
        if (typeof value != "string" || !value) {
            value = this.defaultArea;
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
        return this.#area == this.defaultArea;
    }

    get hasMap() {
        return this.#props.map.active;
    }

    reset() {
        if (!this.isDefault) {
            this.#area = this.defaultArea;
            this.#props = AREA_PROPS[this.defaultArea];
            // external
            const ev = new Event("area");
            ev.value = this.#area;
            this.dispatchEvent(ev);
        }
    }

}

export default new WorldListState();
