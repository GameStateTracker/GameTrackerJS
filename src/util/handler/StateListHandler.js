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
import {
    mergeMapsInto
} from "/emcJS/util/helper/collection/MergeMaps.js";

import AccessStateEnum from "../../enum/AccessStateEnum.js";
import OptionsObserver from "../observer/OptionsObserver.js";
import ListRecordState from "../../state/world/ListRecordState.js";
import {
    getDefaultAccess
} from "../helper/ListAccessHelper.js";

const detachedEntrancesObserver = new OptionsObserver("detached_entrances");

const INSTANCES = new Map();

function sortByRef(rec0, rec1) {
    if (rec0.ref < rec1.ref) {
        return -1;
    }
    return 1;
}

export default class StateListHandler extends EventTarget {

    #ref;

    #visible = false;

    #access = getDefaultAccess();

    #entityList = new Set();

    #filteredEntityList = new Set();

    constructor(ref, list) {
        if (typeof ref != "string") {
            throw new TypeError(`ref parameter must be of type "string" but was "${typeof ref}"`);
        }
        if (!ref) {
            throw new Error("ref parameter must not be empty");
        }
        if (INSTANCES.has(ref)) {
            return INSTANCES.get(ref);
        }
        super();
        INSTANCES.set(ref, this);
        /* --- */
        detachedEntrancesObserver.addEventListener("change", () => {
            this.#refreshAccess();
        });
        /* --- */
        this.#ref = ref;
        this.#generateList(list);
    }

    #generateList = debounce((list) => {
        if (list != null) {
            for (const idx in list) {
                const record = list[idx];
                const recordState = new ListRecordState(`${this.#ref}-${`0000${idx}`.slice(-5)}`, record);
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
                            this.#notifyListChange();
                            this.#refreshAccess();
                            this.#setVisibility(!!this.#filteredEntityList.size);
                        }
                    } else if (this.#filteredEntityList.has(recordState)) {
                        this.#filteredEntityList.delete(recordState);
                        this.#notifyListChange();
                        this.#refreshAccess();
                        this.#setVisibility(!!this.#filteredEntityList.size);
                    }
                });
                eventManager.set("listChange", () => {
                    if (this.#filteredEntityList.has(recordState)) {
                        if (recordState.listContents) {
                            // TODO
                        }
                    }
                });
            }
        }
        /* --- */
        this.#setVisibility(!!this.#filteredEntityList.size);
        this.#notifyListChange();
        this.#refreshAccess();
    });

    #notifyListChange = debounce(() => {
        const event = new Event("change");
        event.value = Array.from(this.#filteredEntityList);
        this.dispatchEvent(event);
    });

    #setVisibility = debounce((value) => {
        if (this.#visible != value) {
            this.#visible = value;
            // external
            const ev = new Event("visibility");
            ev.value = value;
            this.dispatchEvent(ev);
        }
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
        const access = getDefaultAccess();
        for (const recordState of this.#filteredEntityList) {
            if (recordState.type == "Area" || recordState.type == "Exit") {
                if (recordState.accessPenetration) {
                    mergeMapsInto(access.locations, recordState.access.locations);
                }
                if (recordState.type == "Exit" && recordState.entry.reachable && recordState.entry.area == null) {
                    access.entrances += 1;
                }
            } else if (recordState.type == "Collection") {
                mergeMapsInto(access.locations, recordState.access.locations);
            } else if (recordState.type == "Location") {
                const ref = recordState.entry.ref;
                if (!access.locations.has(ref)) {
                    access.locations.set(ref, recordState.access);
                }
            }
        }
        for (const [, location] of access.locations) {
            const {done, unopened, reachable, entrances, total} = location;
            access.done += done;
            access.unopened += unopened;
            access.reachable += reachable;
            access.total += total;
            access.entrances += entrances;
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
    });

    setAllEntries(value = true) {
        for (const recordState of this.#filteredEntityList) {
            if (recordState.type == "Area" || recordState.type == "Exit") {
                if (recordState.accessPenetration) {
                    recordState.entry.setAllEntries(value);
                }
            } else if (recordState.type == "Collection") {
                recordState.entry.setAllEntries(value);
            } else if (recordState.type == "Location") {
                recordState.entry.value = value;
            }
        }
    }

    get ref() {
        return this.#ref;
    }

    get visible() {
        return !!this.#visible;
    }

    get access() {
        return this.#access;
    }

    getList() {
        return Array.from(this.#filteredEntityList).sort(sortByRef);
    }

}
