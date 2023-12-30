import ObservableStorageObserver from "/emcJS/util/observer/ObservableStorageObserver.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import Savestate from "../../../savestate/Savestate.js";
import AreaStateManager from "../../../statemanager/world/area/AreaStateManager.js";
import WorldSummaryHandler from "../../../util/handler/WorldSummaryHandler.js";
import DataState from "../../DataState.js";
import StateListHandler from "../../../util/handler/StateListHandler.js";
import SettingsObserver from "../../../util/observer/SettingsObserver.js";
import {
    getDefaultAccess,
    getMultiListAccess,
    getSummaryDefaultAccess
} from "../../../util/helper/ListAccessHelper.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";

const unknownArealistNeedAllObserver = new SettingsObserver("unknown_arealist_need_all");

const STORAGES = {
    areaActiveLists: Savestate.getStorage("areaActiveLists")
};

export default class OverworldState extends DataState {

    #activeList = null;

    #listHandler = new Map();

    #activeListHandler = null;

    #listHandlerEventManager = new EventTargetManager();

    #overworldHandler = null;

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        const areaActiveListsObserver = new ObservableStorageObserver(STORAGES.areaActiveLists, ref);
        this.#activeList = areaActiveListsObserver.value;
        areaActiveListsObserver.addEventListener("change", (event) => {
            this.activeList = event.value;
        });

        /* LIST HANDLER */
        this.#listHandlerEventManager.set("change", () => {
            this.onListEntriesChange();
        });
        this.generateLists();

        /* OVERWORLD HANDLER */
        this.#overworldHandler = this.generateOverworldList();
        this.#overworldHandler.addEventListener("access", () => {
            this.onAccessChange();
        });
    }

    onAccessChange() {
        const access = this.access ?? getDefaultAccess();
        const ev = new Event("access");
        ev.ref = this.ref;
        ev.value = access;
        this.dispatchEvent(ev);
    }

    onListEntriesChange() {
        const ev = new Event("listChange");
        ev.ref = this.ref;
        ev.value = this.#activeListHandler?.getList() ?? [];
        this.dispatchEvent(ev);
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
            this.#listHandlerEventManager.switchTarget(this.#activeListHandler);
            // ---
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
        return true;
    }

    set hint(value) {
        // nothing
    }

    get hint() {
        return "woth";
    }

    get listContents() {
        return false;
    }

    get defaultAccess() {
        return getSummaryDefaultAccess();
    }

    get access() {
        return this.#overworldHandler?.access ?? this.defaultAccess;
    }

    get listVisible() {
        return true;
    }

    get hasMap() {
        return this.props.map.active;
    }

    isVisible() {
        return true;
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
        if (this.#activeList != null) {
            this.#activeListHandler = this.#listHandler.get(this.#activeList);
            this.#listHandlerEventManager.switchTarget(this.#activeListHandler);
        } else {
            this.#activeListHandler = null;
            this.#listHandlerEventManager.switchTarget();
        }
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

    generateOverworldList() {
        return new WorldSummaryHandler();
    }

}

AreaStateManager.register("overworld", OverworldState);
