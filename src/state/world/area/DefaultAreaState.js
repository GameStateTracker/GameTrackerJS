import {
    mix
} from "/emcJS/util/Mixin.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import ObservableStorageObserver from "/emcJS/util/observer/ObservableStorageObserver.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import Savestate from "../../../savestate/Savestate.js";
// import OptionsStorage from "../../../savestate/storage/OptionsStorage.js";
import StateListHandler, {
    getDefaultAccess
} from "../../../util/handler/StateListHandler.js";
import Logic from "../../../util/logic/Logic.js";
import DataState from "../../DataState.js";
import StateVisibilityMixin from "../../mixins/StateVisibilityMixin.js";
import StateFilterMixin from "../../mixins/StateFilterMixin.js";
import StateAccessPenetrationMixin from "../../mixins/StateAccessPenetrationMixin.js";
import StateListContentsMixin from "../../mixins/StateListContentsMixin.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";
import SettingsStorage from "../../../storage/SettingsStorage.js";

const STORAGES = {
    areaHints: Savestate.getStorage("areaHints"),
    areaActiveLists: Savestate.getStorage("areaActiveLists")
};

function getAccessNeutralAll(accessData) {
    if (accessData.some((access) => access.value === AccessStateEnum.UNAVAILABLE)) {
        return AccessStateEnum.UNAVAILABLE;
    }
    if (accessData.some((access) => access.value === AccessStateEnum.POSSIBLE)) {
        return AccessStateEnum.POSSIBLE;
    }
    if (accessData.some((access) => access.value === AccessStateEnum.AVAILABLE)) {
        return AccessStateEnum.AVAILABLE;
    }
    return AccessStateEnum.OPENED;
}

function getAccessNeutralOne(accessData) {
    if (accessData.some((access) => access.value === AccessStateEnum.AVAILABLE)) {
        return AccessStateEnum.AVAILABLE;
    }
    if (accessData.some((access) => access.value === AccessStateEnum.POSSIBLE)) {
        return AccessStateEnum.POSSIBLE;
    }
    if (accessData.some((access) => access.value === AccessStateEnum.UNAVAILABLE)) {
        return AccessStateEnum.UNAVAILABLE;
    }
    return AccessStateEnum.OPENED;
}

function getAccessNeutral(accessData) {
    if (SettingsStorage.get("unknown_arealist_need_all")) {
        return {
            done: Math.min(...accessData.map((access) => access.done)),
            unopened: Math.min(...accessData.map((access) => access.unopened)),
            reachable: Math.min(...accessData.map((access) => access.reachable)),
            total: Math.min(...accessData.map((access) => access.total)),
            entrances: accessData.all((access) => access.entrances),
            value: getAccessNeutralAll(accessData)
        };
    } else {
        return {
            done: Math.max(...accessData.map((access) => access.done)),
            unopened: Math.max(...accessData.map((access) => access.unopened)),
            reachable: Math.max(...accessData.map((access) => access.reachable)),
            total: Math.max(...accessData.map((access) => access.total)),
            entrances: accessData.some((access) => access.entrances),
            value: getAccessNeutralOne(accessData)
        };
    }
}

const BaseClass = mix(
    DataState
).with(
    StateVisibilityMixin,
    StateFilterMixin,
    StateAccessPenetrationMixin,
    StateListContentsMixin
);

export default class DefaultAreaState extends BaseClass {

    #hint = "";

    #activeList = "";

    #listHandler = new Map();

    #activeListHandler = null;

    #listHandlerEventManager = new EventTargetManager();

    #visible = true;

    #reachable = false;

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        const areaHintsObserver = new ObservableStorageObserver(STORAGES.areaHints, ref);
        this.#hint = areaHintsObserver.value;
        areaHintsObserver.addEventListener("change", (event) => {
            this.hint = event.value;
        });
        const areaActiveListsObserver = new ObservableStorageObserver(STORAGES.areaActiveLists, ref);
        this.#activeList = areaActiveListsObserver.value;
        areaActiveListsObserver.addEventListener("change", (event) => {
            this.activeList = event.value;
        });

        /* LOGIC */
        this.#reachable = !!Logic.getValue(props.logicAccess);
        Logic.addEventListener("change", () => {
            const reachable = !!Logic.getValue(props.logicAccess);
            if (reachable != this.#reachable) {
                this.#reachable = reachable;
                // external
                const ev = new Event("reachable");
                ev.value = reachable;
                this.dispatchEvent(ev);
            }
        });

        /* LIST HANDLER */
        this.#listHandlerEventManager.set("visibility", () => {
            this.checkVisibility();
        });
        this.#listHandlerEventManager.set("access", () => {
            this.onAccessChange();
        });
        this.#listHandlerEventManager.set("change", () => {
            this.onListEntriesChange();
        });
        this.generateLists();

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
        const value = this.visible && this.listVisible && !this.filtered;
        if (this.#visible != value) {
            this.#visible = value;
            // external
            const ev = new Event("visibility");
            ev.ref = this.ref;
            ev.value = value;
            this.dispatchEvent(ev);
        }
    });

    onAccessChange() {
        const access = this.#activeListHandler?.access ?? getDefaultAccess();
        const ev = new Event("access");
        ev.ref = this.ref;
        ev.value = access;
        this.dispatchEvent(ev);
        // logic data
        this.setLogicData("$IS_DONE", access == AccessStateEnum.OPENED);
    }

    onListEntriesChange() {
        const ev = new Event("listChange");
        ev.ref = this.ref;
        ev.value = this.#activeListHandler?.getList() ?? [];
        this.dispatchEvent(ev);
        this.checkVisibility();
    }

    set activeList(value) {
        const ref = this.ref;
        if (value != this.#activeList) {
            this.#activeList = value;
            this.#activeListHandler = this.#listHandler.get(this.#activeList);
            this.#listHandlerEventManager.switchTarget(this.#activeListHandler);
            // ---
            this.checkVisibility();
            this.onAccessChange();
            this.onListEntriesChange();
            // external
            const ev = new Event("activeListChange");
            ev.ref = ref;
            ev.value = value;
            this.dispatchEvent(ev);
        }
    }

    get activeList() {
        return this.#activeList;
    }

    get reachable() {
        return this.#reachable;
    }

    set hint(value) {
        const ref = this.ref;
        if (typeof value != "string" || (value != "woth" && value != "barren")) {
            value = "";
        }
        if (value != this.#hint) {
            this.#hint = value;
            STORAGES.areaHints.set(ref, value);
            // external
            const event = new Event("hint");
            event.value = value;
            this.dispatchEvent(event);
        }
    }

    get hint() {
        return this.#hint;
    }

    // TODO add this to world config
    // get listContents() {
    //     return !OptionsStorage.get("mixed_entrance_pool") && (this.props.listContents ?? false);
    // }

    get defaultAccess() {
        return getDefaultAccess();
    }

    get access() {
        return this.#activeListHandler?.access ?? this.defaultAccess;
    }

    get listVisible() {
        return this.#activeListHandler?.visible ?? true;
    }

    get hasMap() {
        return this.props.map.active;
    }

    isVisible() {
        return this.#visible;
    }

    /* list */
    generateLists() {
        const ref = this.ref;
        const lists = this.props.lists;
        this.#listHandler.clear();
        for (const [name, list] of Object.entries(lists)) {
            const listHandler = new StateListHandler(`${ref}/${name}`, list);
            this.#listHandler.set(name, listHandler);
        }
        if (this.#listHandler.size === 1) {
            this.#activeList = this.#listHandler.keys().next().value;
        }
        if (this.#activeList) {
            this.#activeListHandler = this.#listHandler.get(this.#activeList);
            this.#listHandlerEventManager.switchTarget(this.#activeListHandler);
        } else {
            this.#activeListHandler = null;
            this.#listHandlerEventManager.switchTarget();
        }
        this.checkVisibility();
        this.onAccessChange();
        this.onListEntriesChange();
    }

    getList() {
        return this.#activeListHandler?.getList() ?? [];
    }

    setAllEntries(value = true) {
        this.#activeListHandler?.setAllEntries(value);
    }

    getAccess(name) {
        if (!name || name == "") {
            const accessData = Array.from(this.#listHandler.values()).map((listHandler) => {
                return listHandler.access;
            });
            return getAccessNeutral(accessData);
        }
        return this.#listHandler.get(name)?.access ?? getDefaultAccess();
    }

    getMinMaxAccess() {
        if (this.#activeListHandler != null) {
            const {done, unopened, reachable, total} = this.#activeListHandler.access;
            return {
                done_min: done,
                done_max: done,
                unopened_min: unopened,
                unopened_max: unopened,
                reachable_min: reachable,
                reachable_max: reachable,
                total_min: total,
                total_max: total,
                value: AccessStateEnum.OPENED
            };
        } else {
            const accessData = Array.from(this.#listHandler.values()).map((listHandler) => {
                return listHandler.access;
            });
            return {
                done_min: Math.min(...accessData.map((access) => access.done)),
                done_max: Math.max(...accessData.map((access) => access.done)),
                unopened_min: Math.min(...accessData.map((access) => access.unopened)),
                unopened_max: Math.max(...accessData.map((access) => access.unopened)),
                reachable_min: Math.min(...accessData.map((access) => access.reachable)),
                reachable_max: Math.max(...accessData.map((access) => access.reachable)),
                total_min: Math.min(...accessData.map((access) => access.total)),
                total_max: Math.max(...accessData.map((access) => access.total)),
                value: AccessStateEnum.OPENED
            };
        }
    }

}
