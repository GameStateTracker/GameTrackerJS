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
import StateListHandler from "../../../util/handler/StateListHandler.js";
import MultiStateListHandler from "../../../util/handler/MultiStateListHandler.js";
import SettingsObserver from "../../../util/observer/SettingsObserver.js";
import Logic from "../../../util/logic/Logic.js";
import DataState from "../../DataState.js";
import StateVisibilityMixin from "../../mixins/StateVisibilityMixin.js";
import StateFilterMixin from "../../mixins/StateFilterMixin.js";
import StateAccessPenetrationMixin from "../../mixins/StateAccessPenetrationMixin.js";
import StateListContentsMixin from "../../mixins/StateListContentsMixin.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";
import {
    getDefaultAccess, getMultiListAccess
} from "../../../util/helper/ListAccessHelper.js";

const unknownArealistNeedAllObserver = new SettingsObserver("unknown_arealist_need_all");

const STORAGES = {
    areaHints: Savestate.getStorage("areaHints"),
    areaActiveLists: Savestate.getStorage("areaActiveLists")
};

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

    #activeList = null;

    #listHandler = new Map();

    #multiListHandler = new MultiStateListHandler();

    #activeListHandler = null;

    #listHandlerEventManager = new EventTargetManager();

    #visible = true;

    #reachable = false;

    #areaActiveListsObserver;

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        const areaHintsObserver = new ObservableStorageObserver(STORAGES.areaHints, ref);
        this.#hint = areaHintsObserver.value;
        areaHintsObserver.addEventListener("change", (event) => {
            this.hint = event.value;
        });
        this.#areaActiveListsObserver = new ObservableStorageObserver(STORAGES.areaActiveLists, ref);
        this.#activeList = this.#areaActiveListsObserver.value;
        this.#areaActiveListsObserver.addEventListener("change", (event) => {
            this.activeList = event.value;
        });

        /* LOGIC */
        this.setLogicData("$IS_DONE", this.access.value === AccessStateEnum.OPENED);
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

        /* UNKNOWN LIST BEHAVIOR CHANGE */
        unknownArealistNeedAllObserver.addEventListener("change", () => {
            this.onAccessChange();
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
        const value = this.visible && (this.props.visibleIfEmpty || this.listVisible) && !this.filtered;
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
        const access = this.access;
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
        // ---
        if (!this.#listHandler.has(value)) {
            if (this.#listHandler.size === 1) {
                value = this.#listHandler.keys().next().value;
            } else {
                value = null;
            }
        }
        // ---
        if (value != this.#activeList) {
            this.#activeList = value;
            this.#activeListHandler = this.#listHandler.get(this.#activeList);
            this.#listHandlerEventManager.switchTarget(this.#activeListHandler ?? this.#multiListHandler);
            this.#areaActiveListsObserver.value = value;
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

    get listContents() {
        return this.props.listContents ?? false;
    }

    get defaultAccess() {
        return getDefaultAccess();
    }

    get access() {
        if (this.#activeListHandler != null) {
            return this.#activeListHandler.access ?? this.defaultAccess;
        }
        if (this.#listHandler.size === 1) {
            const handler = this.#listHandler.values().next();
            return handler.access ?? this.defaultAccess;
        }
        return this.getMinMaxAccess() ?? this.defaultAccess;
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
            this.#multiListHandler.register(listHandler);
            if (this.#activeList === name) {
                this.#activeListHandler = listHandler;
            }
        }
        if (this.#listHandler.size === 1) {
            const [key, value] = this.#listHandler.entries().next().value;
            this.#activeList = key;
            this.#activeListHandler = value;
        }
        this.#listHandlerEventManager.switchTarget(this.#activeListHandler ?? this.#multiListHandler);
        this.checkVisibility();
        this.onAccessChange();
        this.onListEntriesChange();
    }

    getList() {
        return this.#activeListHandler?.getList() ?? [];
    }

    getListHandler(name) {
        return this.#listHandler.get(name);
    }

    setAllEntries(value = true) {
        this.#activeListHandler?.setAllEntries(value);
    }

    getAccess(name) {
        if (name == null) {
            const accessData = Array.from(this.#listHandler.values()).map((listHandler) => {
                return listHandler.access;
            });
            const needAll = unknownArealistNeedAllObserver.value;
            return getMultiListAccess(accessData, needAll);
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
            const needAll = unknownArealistNeedAllObserver.value;
            return getMultiListAccess(accessData, needAll);
        }
    }

}
