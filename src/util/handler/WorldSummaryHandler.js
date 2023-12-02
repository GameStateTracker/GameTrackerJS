// frameworks
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import {
    immute
} from "/emcJS/data/Immutable.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";
import LocationStateManager from "../../statemanager/world/location/LocationStateManager.js";
import AccessStateEnum from "../../enum/AccessStateEnum.js";
import ListRecordState from "../../state/world/ListRecordState.js";
import AreaStateManager from "../../statemanager/world/area/AreaStateManager.js";

export function getDefaultAccess() {
    return {
        done_min: 0,
        done_max: 0,
        unopened_min: 0,
        unopened_max: 0,
        reachable_min: 0,
        reachable_max: 0,
        total_min: 0,
        total_max: 0,
        value: AccessStateEnum.OPENED
    };
}

let instance = null;

export default class WorldSummaryHandler extends EventTarget {

    #access = getDefaultAccess();

    #entityList = new Set();

    #filteredEntityList = new Set();

    #dungeonList = new Set();

    constructor() {
        if (instance != null) {
            return instance;
        }
        super();
        instance = this;
        /* --- */
        this.#generateList();
    }

    #generateList = debounce(() => {
        const usedLocations = new Set();
        for (const [, area] of AreaStateManager) {
            if (area.props.lists.lenth > 1) {
                this.#dungeonList.add(area);
                const eventManager = new EventTargetManager(area);
                eventManager.set("access", () => {
                    this.#refreshAccess();
                });
                /* --- */
                for (const list of area.props.lists) {
                    const usedList = list.filter((r) => r.ref?.type === "Location").map((r) => r.ref?.name);
                    for (const entry of usedList) {
                        usedLocations.add(entry);
                    }
                }
            }
        }

        let idx = 0;
        for (const [key] of LocationStateManager) {
            if (!usedLocations.has(key)) {
                const record = {
                    "ref": {
                        "type": "Location",
                        "name": key
                    },
                    "x": 0,
                    "y": 0,
                    "visible": true
                };
                const recordState = new ListRecordState(`summary-${idx++}`, record);
                this.#entityList.add(recordState);
                if (recordState.visible) {
                    this.#filteredEntityList.add(recordState);
                }
                const eventManager = new EventTargetManager(recordState);
                eventManager.set("access", () => {
                    if (this.#filteredEntityList.has(recordState)) {
                        this.#refreshAccess();
                    }
                });
                eventManager.set("visibility", (event) => {
                    if (event.value) {
                        if (!this.#filteredEntityList.has(recordState)) {
                            this.#filteredEntityList.add(recordState);
                            this.#refreshAccess();
                        }
                    } else if (this.#filteredEntityList.has(recordState)) {
                        this.#filteredEntityList.delete(recordState);
                        this.#refreshAccess();
                    }
                });
            }
        }
        /* --- */
        this.#refreshAccess();
    });

    #setAccess(value) {
        if (value != null) {
            if (!isEqual(this.#access, value)) {
                this.#access = value;
                // external
                const event = new Event("access");
                event.value = value;
                this.dispatchEvent(event);
            }
        }
    }

    #refreshAccess() {
        const access = {
            done_min: 0,
            done_max: 0,
            unopened_min: 0,
            unopened_max: 0,
            reachable_min: 0,
            reachable_max: 0,
            total_min: 0,
            total_max: 0,
            value: AccessStateEnum.OPENED
        };
        for (const recordState of this.#filteredEntityList) {
            const {done, unopened, reachable, total} = recordState.access;
            access.done_min += done;
            access.done_max += done;
            access.unopened_min += unopened;
            access.unopened_max += unopened;
            access.reachable_min += reachable;
            access.reachable_max += reachable;
            access.total_min += total;
            access.total_max += total;
        }

        for (const area of this.#dungeonList) {
            const {
                done_min,
                done_max,
                unopened_min,
                unopened_max,
                reachable_min,
                reachable_max,
                total_min,
                total_max
            } = area.getMinMaxAccess();
            access.done_min += done_min;
            access.done_max += done_max;
            access.unopened_min += unopened_min;
            access.unopened_max += unopened_max;
            access.reachable_min += reachable_min;
            access.reachable_max += reachable_max;
            access.total_min += total_min;
            access.total_max += total_max;
        }

        if (access.unopened_max > 0) {
            if (access.reachable_max > 0) {
                if (access.unopened_max == access.reachable_max) {
                    access.value = AccessStateEnum.AVAILABLE;
                } else {
                    access.value = AccessStateEnum.POSSIBLE;
                }
            } else {
                access.value = AccessStateEnum.UNAVAILABLE;
            }
        }
        this.#setAccess(immute(access));
    }

    get access() {
        return this.#access;
    }

}
