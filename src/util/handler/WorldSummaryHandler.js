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
import ListRecordState from "../../state/world/ListRecordState.js";
import AreaStateManager from "../../statemanager/world/area/AreaStateManager.js";
import {
    getListSummaryAccess, getSummaryDefaultAccess
} from "../helper/ListAccessHelper.js";
import AccessStateEnum from "../../enum/AccessStateEnum.js";

let instance = null;

export default class WorldSummaryHandler extends EventTarget {

    #access = getSummaryDefaultAccess();

    #entityList = new Set();

    #remainingLocationsSet = new Set();

    #multiListAreaSet = new Set();

    #allLocations = new Set();

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
            const lists = Object.values(area.props.lists ?? {});
            if (lists.length > 1) {
                this.#multiListAreaSet.add(area);
                const eventManager = new EventTargetManager(area);
                eventManager.set("access", () => {
                    this.#refreshAccess();
                });
                /* --- */
                for (const list of lists) {
                    const usedList = list.filter((r) => r.ref?.type === "Location").map((r) => r.ref?.name);
                    for (const entry of usedList) {
                        usedLocations.add(entry);
                        this.#allLocations.add(entry);
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
                    "pos": {
                        "x": 0,
                        "y": 0
                    },
                    "visible": true
                };
                const recordState = new ListRecordState(`summary-${idx++}`, record);
                this.#entityList.add(recordState);
                if (recordState.visible) {
                    this.#remainingLocationsSet.add(recordState);
                }
                const eventManager = new EventTargetManager(recordState);
                eventManager.set("access", () => {
                    if (this.#remainingLocationsSet.has(recordState)) {
                        this.#refreshAccess();
                    }
                });
                eventManager.set("visibility", (event) => {
                    if (event.value) {
                        if (!this.#remainingLocationsSet.has(recordState)) {
                            this.#remainingLocationsSet.add(recordState);
                            this.#refreshAccess();
                        }
                    } else if (this.#remainingLocationsSet.has(recordState)) {
                        this.#remainingLocationsSet.delete(recordState);
                        this.#refreshAccess();
                    }
                });
                this.#allLocations.add(key);
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

    #refreshAccess = debounce(() => {
        const remainingLocationsData = Array.from(this.#remainingLocationsSet.values()).map((state) => {
            return state.access;
        });

        const multiListAreaData = Array.from(this.#multiListAreaSet.values()).map((state) => {
            return state.access;
        });

        const access = getListSummaryAccess([
            ...remainingLocationsData,
            ...multiListAreaData
        ], false);

        if (access.unopened_max > 0) {
            if (access.reachable_max > 0) {
                if (access.unopened_max === access.reachable_max) {
                    access.value = AccessStateEnum.AVAILABLE;
                } else {
                    access.value = AccessStateEnum.POSSIBLE;
                }
            } else {
                access.value = AccessStateEnum.UNAVAILABLE;
            }
        } else {
            access.value = AccessStateEnum.OPENED;
        }

        this.#setAccess(immute(access));
    });

    get access() {
        return this.#access;
    }

}
