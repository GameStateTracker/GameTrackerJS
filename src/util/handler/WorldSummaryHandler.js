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
import ExitStateManager from "../../statemanager/world/exit/ExitStateManager.js";

let instance = null;

export default class WorldSummaryHandler extends EventTarget {

    #access = getSummaryDefaultAccess();

    #entityList = new Set();

    #remainingLocationsSet = new Set();

    #remainingExitsSet = new Set();

    #multiListAreaSet = new Set();

    #allExits = new Set();

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
        const usedExits = new Set();
        for (const [, area] of AreaStateManager) {
            const lists = Object.values(area.props.lists ?? {});
            if (lists.length > 1) {
                this.#multiListAreaSet.add(area);
                const eventManager = new EventTargetManager(area);
                eventManager.set("access", () => {
                    this.#refreshAccess();
                });
                /* --- */
                for (const usedList of lists) {
                    for (const entry of usedList) {
                        const ref = entry.ref;
                        if (ref != null) {
                            if (ref.type === "Location") {
                                const name = ref.name;
                                usedLocations.add(name);
                                this.#allLocations.add(name);
                            } else if (ref.type === "Exit") {
                                const name = ref.name;
                                usedExits.add(name);
                                this.#allExits.add(name);
                            }
                        }
                    }
                }
            }
        }

        let locationIdx = 0;
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
                const recordState = new ListRecordState(`summary-location-${locationIdx++}`, record);
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

        let exitIdx = 0;
        for (const [key] of ExitStateManager) {
            if (!usedExits.has(key)) {
                const record = {
                    "ref": {
                        "type": "Exit",
                        "name": key
                    },
                    "pos": {
                        "x": 0,
                        "y": 0
                    },
                    "visible": true
                };
                const recordState = new ListRecordState(`summary-exit-${exitIdx++}`, record);
                this.#entityList.add(recordState);
                if (recordState.visible) {
                    this.#remainingExitsSet.add(recordState);
                }
                const eventManager = new EventTargetManager(recordState);
                eventManager.set("access", () => {
                    if (this.#remainingExitsSet.has(recordState)) {
                        this.#refreshAccess();
                    }
                });
                eventManager.set("visibility", (event) => {
                    if (event.value) {
                        if (!this.#remainingExitsSet.has(recordState)) {
                            this.#remainingExitsSet.add(recordState);
                            this.#refreshAccess();
                        }
                    } else if (this.#remainingExitsSet.has(recordState)) {
                        this.#remainingExitsSet.delete(recordState);
                        this.#refreshAccess();
                    }
                });
                this.#allExits.add(key);
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

        const visibleEntrances = [];
        const remainingExitsData = Array.from(this.#remainingExitsSet.values()).map((state) => {
            if (state.entry.reachable && state.entry.area == null) {
                visibleEntrances.push(state.entry.ref);
                return {entrances: 1};
            }
            return {entrances: 0};
        });

        const multiListAreaData = Array.from(this.#multiListAreaSet.values()).map((state) => {
            if (state.activeList == null) {
                return {
                    ...state.access,
                    entrances_min: 0,
                    entrances_max : state.access.entrances_max ?? state.access.entrances ?? 0
                };
            }
            return state.access;
        });

        const access = getListSummaryAccess([
            ...remainingLocationsData,
            ...remainingExitsData,
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

    getAccessData() {
        const accessData = {};

        for (const state of this.#remainingLocationsSet.values()) {
            accessData[state.entry?.ref ?? state.ref] = state.access;
        }

        for (const state of this.#multiListAreaSet.values()) {
            accessData[state.ref] = state.access;
        }

        return accessData;
    }

    getAccessDataMissingEntries() {
        return Object.fromEntries(Object.entries(this.getAccessData()).filter((entry) => entry[1].done !== entry[1].total));
    }

    get access() {
        return this.#access;
    }

}
