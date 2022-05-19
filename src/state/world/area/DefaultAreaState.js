// frameworks
import {
    mix
} from "/emcJS/util/Mixin.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

import Savestate from "../../../savestate/Savestate.js";
// import OptionsStorage from "../../../savestate/storage/OptionsStorage.js";
import StateListHandler, {
    getDefaultAccess
} from "../../../util/handler/StateListHandler.js";
import DataState from "../../DataState.js";
import StateVisibilityMixin from "../../mixins/StateVisibilityMixin.js";
import StateFilterMixin from "../../mixins/StateFilterMixin.js";
import StateAccessPenetrationMixin from "../../mixins/StateAccessPenetrationMixin.js";
import StateListContentsMixin from "../../mixins/StateListContentsMixin.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";

const STORAGES = {areaHints: Savestate.getStorage("areaHints")};

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

    #listHandler = null;

    #visible = true;

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        const areaHintsObserver = new DataStorageValueObserver(STORAGES.areaHints, ref, "");
        this.#hint = areaHintsObserver.value;
        areaHintsObserver.addEventListener("change", (event) => {
            this.hint = event.value;
        });

        /* LIST HANDLER */
        this.#listHandler = this.generateList();
        this.#listHandler.addEventListener("visibility", (event) => {
            this.checkVisibility();
        });
        this.#listHandler.addEventListener("access", (event) => {
            this.onAccessChange(event);
        });
        this.#listHandler.addEventListener("change", (event) => {
            this.onListEntriesChange(event);
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
        const value = this.visible && this.listVisible && !this.filtered;
        if (this.#visible != value) {
            this.#visible = value;
            // external
            const ev = new Event("visibility");
            ev.value = value;
            this.dispatchEvent(ev);
        }
    });

    onAccessChange(event) {
        const access = event.value;
        const ev = new Event("access");
        ev.value = access;
        this.dispatchEvent(ev);
        // logic data
        this.setLogicData("$IS_DONE", access == AccessStateEnum.OPENED);
    }

    onListEntriesChange(event) {
        const ev = new Event("listChange");
        ev.value = event.value;
        this.dispatchEvent(ev);
        this.checkVisibility();
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
    //     return !OptionsStorage.get("option.mixed_entrance_pool") && (this.props.listContents ?? false);
    // }

    get defaultAccess() {
        return getDefaultAccess();
    }

    get access() {
        return this.#listHandler?.access ?? this.defaultAccess;
    }

    get listVisible() {
        return this.#listHandler.visible;
    }

    get hasMap() {
        return this.props.map.active;
    }

    isVisible() {
        return this.#visible;
    }

    /* list */
    generateList() {
        const ref = this.ref;
        const list = this.props.list;
        const listHandler = new StateListHandler(ref, list);
        return listHandler;
    }

    getList() {
        return this.#listHandler.getList();
    }

    setAllEntries(value = true) {
        this.#listHandler.setAllEntries(value);
    }

}
