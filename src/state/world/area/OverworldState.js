import AreaStateManager from "../../../statemanager/world/area/AreaStateManager.js";
import DataState from "../../DataState.js";
import StateListHandler from "../../../util/handler/StateListHandler.js";
import WorldSummaryHandler, {
    getDefaultAccess
} from "../../../util/handler/WorldSummaryHandler.js";

export default class OverworldState extends DataState {

    #listHandler = null;

    #overworldHandler = null;

    constructor(ref, props) {
        super(ref, props);

        /* LIST HANDLER */
        this.#listHandler = this.generateList();
        this.#listHandler.addEventListener("change", (event) => {
            this.onListEntriesChange(event)
        });

        /* OVERWORLD HANDLER */
        this.#overworldHandler = this.generateOverworldList();
        this.#overworldHandler.addEventListener("access", (event) => {
            this.onAccessChange(event);
        });
    }

    onAccessChange(event) {
        const ev = new Event("access");
        ev.value = event.value;
        this.dispatchEvent(ev);
    }

    onListEntriesChange(event) {
        const ev = new Event("listChange");
        ev.value = event.value;
        this.dispatchEvent(ev);
    }

    get visible() {
        return true;
    }

    get filtered() {
        return false;
    }

    isVisible() {
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
        return getDefaultAccess();
    }

    get access() {
        return this.#overworldHandler?.access ?? this.defaultAccess;
    }

    get hasMap() {
        return this.props.map.active;
    }

    /* list */
    generateList() {
        const ref = this.ref;
        const list = this.props.list;
        const listHandler = new StateListHandler(ref, list);
        return listHandler;
    }

    generateOverworldList() {
        return new WorldSummaryHandler();
    }

    getList() {
        return this.#listHandler.getList();
    }

    setAllEntries(value = true) {
        this.#listHandler.setAllEntries(value);
    }

}

AreaStateManager.register("overworld", OverworldState);
