// frameworks
import {
    mix
} from "/emcJS/util/Mixin.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import Helper from "/emcJS/util/helper/Helper.js";
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

import Savestate from "../../../savestate/Savestate.js";
import OptionsObserver from "../../../util/observer/OptionsObserver.js";
import StateDataEventManager from "../../../util/StateDataEventManager.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";
import Logic from "../../../util/logic/Logic.js";
import {
    getDefaultAccess
} from "../../../util/handler/StateListHandler.js";
import AreaStateManager from "../../../statemanager/world/area/AreaStateManager.js";
import EntranceStateManager from "../../../statemanager/world/entrance/EntranceStateManager.js";
import {
    emptyState
} from "../EmptyState.js";
import DefaultEntranceState from "../entrance/DefaultEntranceState.js";
import DataState from "../../DataState.js";
import StateVisibilityMixin from "../../mixins/StateVisibilityMixin.js";
import StateFilterMixin from "../../mixins/StateFilterMixin.js";

const mixedEntrancePoolObserver = new OptionsObserver("option.mixed_entrance_pool");

const STORAGES = {exitBindings: Savestate.getStorage("exitBindings")};

function getEntranceArea(value) {
    if (value == "") {
        return null;
    }
    if (value == "\u0000") {
        return emptyState;
    }
    const entrance = EntranceStateManager.get(value);
    if (entrance == null) {
        console.error(`exit "${value}" not found`);
        return null;
    }
    const area = AreaStateManager.get(entrance.props.area);
    if (area == null) {
        console.error(`area "${entrance.props.area}" not found for exit "${value}"`);
        return null;
    }
    return area;
}

function getLogicAccess(access) {
    const res = {
        done: 0,
        unopened: 0,
        reachable: 0,
        total: 0,
        value: AccessStateEnum.OPENED,
        entrances: 0
    };
    const reachable = !!Logic.getValue(`${access}{child}`) || !!Logic.getValue(`${access}{adult}`);
    if (reachable) {
        res.entrances = 1;
        res.value = AccessStateEnum.AVAILABLE;
    } else {
        res.value = AccessStateEnum.UNAVAILABLE;
    }
    return res;
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

    constructor(ref, props) {
        super(ref, props);

        /* ENTRANCE */
        this.#entrance = EntranceStateManager.get(ref);
        this.#entrance.addEventListener("active", (event) => {
            const ev = new Event("active");
            ev.value = event.value;
            this.dispatchEvent(ev);
        })

        /* AREA */
        this.#manager.registerStateHandler("access", event => {
            const access = event.value;
            const ev = new Event("access");
            ev.value = access;
            this.dispatchEvent(ev);
            // logic data
            this.setLogicData("$IS_DONE", access.value == AccessStateEnum.OPENED);
        });
        this.#manager.registerStateHandler("hint", event => {
            const ev = new Event("hint");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        this.#manager.registerStateHandler("listChange", event => {
            const ev = new Event("listChange");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        this.#manager.registerStateHandler("listContents", event => {
            const ev = new Event("listContents");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });

        /* VALUES */
        const logicAccess = props.logicAccess;
        this.#access = getLogicAccess(logicAccess);

        const exitBindingsObserver = new DataStorageValueObserver(STORAGES.exitBindings, ref, "");
        this.#value = exitBindingsObserver.value;
        exitBindingsObserver.addEventListener("change", (event) => {
            this.value = event.value;
        });

        setTimeout(() => {
            this.#area = getEntranceArea(this.value);
            this.#manager.switchState(this.#area);
            // external
            const ev = new Event("access");
            ev.value = this.#area?.access ?? this.#access;
            this.dispatchEvent(ev);
        }, 0);

        /* LOGIC */
        Logic.addEventListener("change", () => {
            const access = getLogicAccess(logicAccess);
            if (!Helper.isEqual(access, this.#access)) {
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
        });

        /* EVENT */
        this.addEventListener("visible", () => {
            this.checkVisibility();
        });
        this.addEventListener("filtered", () => {
            this.checkVisibility();
        });
        this.checkVisibility();
    }

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
        if (!Helper.isEqual(access, this.#access)) {
            this.#access = access;
            // external
            if (this.#area == null) {
                const ev = new Event("access");
                ev.value = access;
                this.dispatchEvent(ev);
            }
            // logic data
            this.setLogicData("$IS_DONE", access.value == AccessStateEnum.OPENED);
        }
    }

    get active() {
        return this.#entrance.active;
    }

    set value(value) {
        if (value == this.ref) {
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
        return this.#value;
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

    checkBindable(entrance) {
        if (entrance instanceof DefaultEntranceState) {
            const ignoreBindsTo = mixedEntrancePoolObserver.value;
            const isActive = entrance.active || this.props.includeInactiveEntrances;
            return isActive && (ignoreBindsTo || this.props.bindsTo.indexOf(entrance.props.type) >= 0);
        }
        return false;
    }

    isVisible() {
        return this.#visible;
    }

    /* list */
    getList() {
        if (this.#area != null) {
            return this.#area.getList();
        }
        return [];
    }

    setAllEntries(value = true) {
        if (this.#area != null) {
            this.#area.setAllEntries(value);
        }
    }

}
