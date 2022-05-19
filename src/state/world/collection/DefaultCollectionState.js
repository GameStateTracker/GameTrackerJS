import {
    debounce
} from "/emcJS/util/Debouncer.js";
import DataState from "../../DataState.js";
import StateListHandler, {
    getDefaultAccess
} from "../../../util/handler/StateListHandler.js";

export default class DefaultCollectionState extends DataState {

    #listHandler = null;

    #visible = false;

    constructor(ref, props = {}) {
        super(ref, props);

        /* LIST HANDLER */
        this.#listHandler = this.generateList();
        this.#listHandler.addEventListener("visibility", (event) => {
            this.checkVisibility();
        });
        this.#listHandler.addEventListener("access", (event) => {
            const ev = new Event("access");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        this.#listHandler.addEventListener("change", (event) => {
            const ev = new Event("listChange");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        this.checkVisibility();
    }

    checkVisibility = debounce(() => {
        const value = this.listVisible;
        if (this.#visible != value) {
            this.#visible = value;
            // external
            const ev = new Event("visibility");
            ev.value = value;
            this.dispatchEvent(ev);
        }
    });

    set hint(value) {
        // nothing
    }

    get hint() {
        return "";
    }

    get listContents() {
        return true;
    }

    get defaultAccess() {
        return getDefaultAccess();
    }

    get access() {
        return this.#listHandler?.access ?? this.defaultAccess;
    }

    get visible() {
        return true;
    }

    get listVisible() {
        return this.#listHandler.visible;
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
