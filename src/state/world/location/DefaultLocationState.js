// frameworks
import {
    mix
} from "/emcJS/util/Mixin.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import {
    immute
} from "/emcJS/data/Immutable.js";
import ObservableStorageObserver from "/emcJS/util/observer/data/storage/ObservableStorageObserver.js";
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";

import Savestate from "../../../savestate/Savestate.js";
import Logic from "../../../util/logic/Logic.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";
import ItemStateManager from "../../../statemanager/item/ItemStateManager.js";
import DataState from "../../DataState.js";
import StateVisibilityMixin from "../../mixins/StateVisibilityMixin.js";
import StateFilterMixin from "../../mixins/StateFilterMixin.js";
import {
    getDefaultAccess
} from "../../../util/helper/ListAccessHelper.js";

const STORAGES = {
    locations: Savestate.getStorage("locations"),
    locationItems: Savestate.getStorage("locationItems")
};

function getLogicAccess(checked, reachable) {
    const res = {
        done: 0,
        unopened: 0,
        reachable: 0,
        total: 1,
        value: AccessStateEnum.OPENED,
        entrances: 0
    };
    if (checked) {
        res.done = 1;
    } else if (reachable) {
        res.unopened = 1;
        res.reachable = 1;
        res.value = AccessStateEnum.AVAILABLE;
    } else {
        res.unopened = 1;
        res.value = AccessStateEnum.UNAVAILABLE;
    }
    return immute(res);
}

const BaseClass = mix(
    DataState
).with(
    StateVisibilityMixin,
    StateFilterMixin
);

/* TODO add $IN_ROOT
add function to write this.setLogicData("$IN_ROOT", value)
depicting wether the element is in the root of the list or deeper
-> has to be called from the outside, since we dont have parent relations
*/
export default class DefaultLocationState extends BaseClass {

    #value = false;

    #item = "";

    #itemData = null;

    #reachable = false;

    #access = this.defaultAccess;

    #visible = true;

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        const locationsObserver = new ObservableStorageObserver(STORAGES.locations, ref);
        this.#value = locationsObserver.value;
        locationsObserver.onChange((event) => {
            this.value = event.value;
        });

        const locationItemsObserver = new ObservableStorageObserver(STORAGES.locationItems, ref);
        this.#item = locationItemsObserver.value;
        locationItemsObserver.onChange((event) => {
            this.item = event.value;
        });

        if (this.#item) {
            const itemData = ItemStateManager.get(this.#item);
            this.#itemData = itemData?.props;
        }

        /* LOGIC */
        const logicAccess = props.logicAccess ?? "";
        this.#reachable = !!Logic.getValue(logicAccess);
        Logic.addEventListener("change", () => {
            const reachable = !!Logic.getValue(logicAccess);
            if (reachable != this.#reachable) {
                this.#reachable = reachable;
                this.refreshAccess();
                // external
                const ev = new Event("reachable");
                ev.value = reachable;
                this.dispatchEvent(ev);
            }
        });

        this.#init();

        /* EVENT */
        this.addEventListener("visible", () => {
            this.checkVisibility();
        });
        this.addEventListener("filtered", () => {
            this.checkVisibility();
        });
        this.checkVisibility();
    }

    #init = debounce(() => {
        this.#access = getLogicAccess(this.value, this.reachable);
        this.setLogicData("$IS_DONE", this.#access.value === AccessStateEnum.OPENED);
    });

    checkVisibility = debounce(() => {
        const value = this.visible && !this.filtered;
        if (this.#visible != value) {
            this.#visible = value;
            // external
            const ev = new Event("visibility");
            ev.value = value;
            this.dispatchEvent(ev);
        }
    });

    refreshAccess() {
        const access = getLogicAccess(this.value, this.reachable);
        if (!isEqual(access, this.#access)) {
            this.#access = access;
            // external
            const ev = new Event("access");
            ev.value = access;
            this.dispatchEvent(ev);
            // logic data
            this.setLogicData("$IS_DONE", access.value === AccessStateEnum.OPENED);
        }
    }

    get reachable() {
        return this.#reachable;
    }

    get defaultAccess() {
        const access = getDefaultAccess();
        access.total = 1;
        return access;
    }

    get access() {
        return this.#access ?? this.defaultAccess;
    }

    set value(value) {
        if (typeof value != "boolean") {
            value = !!value;
        }
        if (value != this.#value) {
            const ref = this.ref;
            this.#value = value;
            STORAGES.locations.set(ref, value);
            this.refreshAccess();
            // external
            const event = new Event("value");
            event.value = value;
            this.dispatchEvent(event);
        }
    }

    get value() {
        return this.#value;
    }

    set item(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        if (value != this.#item) {
            this.#item = value;
            STORAGES.locationItems.set(ref, value);
            // item data
            if (value) {
                const itemData = ItemStateManager.get(value);
                this.#itemData = itemData?.props;
            } else {
                this.#itemData = null;
            }
            // external
            const event = new Event("item");
            event.value = value;
            this.dispatchEvent(event);
        }
    }

    get item() {
        return this.#item;
    }

    get itemData() {
        return this.#itemData;
    }

    isVisible() {
        return this.#visible;
    }

}
