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
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";
import {
    getStringOrDefault
} from "/emcJS/util/helper/GetType.js";
import {
    isString
} from "/emcJS/util/helper/CheckType.js";
import ObservableStorageObserver from "/emcJS/util/observer/data/storage/ObservableStorageObserver.js";

import Savestate from "../../../savestate/Savestate.js";
import StateDataEventManager from "../../../util/StateDataEventManager.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";
import Logic from "../../../util/logic/Logic.js";
import AreaStateManager from "../../../statemanager/world/area/AreaStateManager.js";
import EntranceStateManager from "../../../statemanager/world/entrance/EntranceStateManager.js";
import {
    emptyState
} from "../EmptyState.js";
import DataState from "../../DataState.js";
import StateVisibilityMixin from "../../mixins/StateVisibilityMixin.js";
import StateFilterMixin from "../../mixins/StateFilterMixin.js";
import WorldResource, {
    getGatewayIn
} from "../../../data/resource/WorldResource.js";
import {
    getDefaultAccess
} from "../../../util/helper/ListAccessHelper.js";

const CONFIG = WorldResource.get("config");
const GATEWAYS_VARIANTS = CONFIG.gateways?.variants;

const STORAGES = {exitBindings: Savestate.getStorage("exitBindings")};

function getEntranceArea(value) {
    if (value == null || value == "") {
        return null;
    }
    if (value == "0") {
        return emptyState;
    }
    const entrance = EntranceStateManager.get(value);
    if (entrance == null) {
        console.error(`exit "${value}" not found`);
        return null;
    }
    const area = AreaStateManager.get(entrance.props.area?.name);
    if (area == null) {
        console.error(`area "${entrance.props.area?.name}" not found for exit "${value}"`);
        return null;
    }
    return area;
}

function getReachable(logicAccess) {
    const accessVal = getGatewayIn(logicAccess);
    if (Array.isArray(GATEWAYS_VARIANTS) && GATEWAYS_VARIANTS.length > 0) {
        for (const variant of GATEWAYS_VARIANTS) {
            if (Logic.getValue(`${accessVal}{${variant}}`)) {
                return true;
            }
        }
        return false;
    }
    return Logic.getValue(accessVal);
}

function getLogicAccess(reachable) {
    const res = {
        done: 0,
        unopened: 0,
        reachable: 0,
        total: 0,
        value: AccessStateEnum.OPENED,
        entrances: 0
    };
    if (reachable) {
        res.value = AccessStateEnum.AVAILABLE;
    } else {
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

export default class DefaultExitState extends BaseClass {

    #entrance = null;

    #manager = new StateDataEventManager();

    #access = getDefaultAccess();

    #value = "";

    #area = null;

    #visible = true;

    #reachable = false;

    constructor(ref, props) {
        super(ref, props);

        /* ENTRANCE */
        this.#entrance = EntranceStateManager.get(ref);
        this.#entrance.addEventListener("active", (event) => {
            const ev = new Event("active");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });

        /* AREA */
        this.#manager.registerStateHandler("access", (event) => {
            const access = event.value;
            const ev = new Event("access");
            ev.value = access;
            this.dispatchEvent(ev);
            // logic data
            this.setLogicData("$IS_DONE", access.value == AccessStateEnum.OPENED);
        });
        this.#manager.registerStateHandler("hint", (event) => {
            const ev = new Event("hint");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        this.#manager.registerStateHandler("listChange", (event) => {
            const ev = new Event("listChange");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        this.#manager.registerStateHandler("listContents", (event) => {
            const ev = new Event("listContents");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });

        /* VALUES */
        const exitBindingsObserver = new ObservableStorageObserver(STORAGES.exitBindings, ref);
        this.#value = getStringOrDefault(exitBindingsObserver.value, "");
        exitBindingsObserver.onChange((event) => {
            this.value = event.value;
        });

        /* LOGIC */
        const logicAccess = props.logicAccess ?? "";
        this.#reachable = getReachable(logicAccess);
        this.#access = getLogicAccess(this.#reachable);
        this.setLogicData("$IS_DONE", this.access.value === AccessStateEnum.OPENED);
        Logic.addEventListener("change", () => {
            const reachable = getReachable(logicAccess);
            if (reachable != this.#reachable) {
                this.#reachable = reachable;
                /* access */
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
        this.#area = getEntranceArea(this.value);
        this.#manager.switchState(this.#area);
        // external
        const ev = new Event("access");
        ev.value = this.#area?.access ?? this.#access;
        this.dispatchEvent(ev);
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
        const access = getLogicAccess(this.reachable);
        if (!isEqual(access, this.#access)) {
            this.#access = access;
            if (this.#area == null) {
                // external
                const ev = new Event("access");
                ev.value = access;
                this.dispatchEvent(ev);
                // logic data
                this.setLogicData("$IS_DONE", access.value == AccessStateEnum.OPENED);
            }
        }
    }

    get reachable() {
        return this.#reachable;
    }

    get active() {
        return this.#entrance.active;
    }

    set value(value) {
        if (!isString(value) || value == this.ref) {
            value = "";
        }
        const old = this.#value;
        if (value != old) {
            this.#value = value;
            STORAGES.exitBindings.set(this.ref, value);
            const area = getEntranceArea(value);
            this.#area = area;
            this.#manager.switchState(area);
            // external
            const valueEvent = new Event("value");
            valueEvent.value = value;
            valueEvent.newValue = value;
            valueEvent.oldValue = old;
            this.dispatchEvent(valueEvent);

            const accessEvent = new Event("access");
            accessEvent.value = this.access;
            this.dispatchEvent(accessEvent);

            // logic data
            this.setLogicData("$IS_DONE", this.access.value == AccessStateEnum.OPENED);
        }
    }

    get value() {
        return this.#value ?? "";
    }

    get area() {
        return this.#area;
    }

    get hint() {
        if (this.#area != null) {
            return this.#area.hint;
        }
        return "";
    }

    get listContents() {
        if (this.#area != null) {
            return this.#area.listContents;
        }
        return false;
    }

    get defaultAccess() {
        return getDefaultAccess();
    }

    get access() {
        if (this.#area != null) {
            return this.#area.access;
        }
        return this.#access ?? this.defaultAccess;
    }

    get accessPenetration() {
        if (this.#area != null) {
            return this.#area.accessPenetration;
        }
        return true;
    }

    isVisible() {
        return this.#visible;
    }

    /* list */
    getList() {
        return this.#area?.getList() ?? [];
    }

    setAllChecked(value = true) {
        this.#area?.setAllChecked(value);
    }

    setAllReachableChecked(value = true) {
        this.#area?.setAllReachableChecked(value);
    }

}
