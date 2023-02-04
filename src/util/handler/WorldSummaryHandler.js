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

export function getDefaultAccess() {
    return {
        done: 0,
        unopened: 0,
        reachable: 0,
        total: 0,
        value: AccessStateEnum.OPENED
    };
}

let instance = null;

export default class WorldSummaryHandler extends EventTarget {

    #access = getDefaultAccess();

    #entityList = new Set();

    #filteredEntityList = new Set();

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
        let idx = 0;
        for (const [key] of LocationStateManager) {
            const record = {
                "id": key,
                "x": 0,
                "y": 0,
                "category": "location"
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
            done: 0,
            unopened: 0,
            reachable: 0,
            total: 0,
            value: AccessStateEnum.OPENED
        };
        for (const recordState of this.#filteredEntityList) {
            const {done, unopened, reachable, total} = recordState.access;
            access.done += done;
            access.unopened += unopened;
            access.reachable += reachable;
            access.total += total;
        }
        if (access.unopened > 0) {
            if (access.reachable > 0) {
                if (access.unopened == access.reachable) {
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
