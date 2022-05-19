import {
    mix
} from "/emcJS/util/Mixin.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import DataState from "../DataState.js";
import WorldStateManagerRegistry from "../../statemanager/WorldStateManagerRegistry.js";
import StateVisibilityMixin from "../mixins/StateVisibilityMixin.js";
import StateAccessPenetrationMixin from "../mixins/StateAccessPenetrationMixin.js";

const BaseClass = mix(
    DataState
).with(
    StateVisibilityMixin,
    StateAccessPenetrationMixin
);

export default class ListRecordState extends BaseClass {

    #entry = null;

    #visible = true;

    constructor(ref, props = {}) {
        super(ref, props);
        this.#entry = WorldStateManagerRegistry.get(props.category)?.get(props.id);
        if (this.#entry == null) {
            throw new Error(`list record could not resolve "${props.id}" from "${props.category}"`);
        }

        /* EVENTS */
        const eventManager = new EventTargetManager(this.#entry);
        eventManager.set("access", (event) => {
            const ev = new Event("access");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        eventManager.set("accessPenetration", (event) => {
            const ev = new Event("accessPenetration");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        eventManager.set("listContents", (event) => {
            const ev = new Event("listContents");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        eventManager.set("listChange", (event) => {
            const ev = new Event("listChange");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        eventManager.set("visibility", () => {
            this.#updateVisibility();
        });
        this.#updateVisibility();
    }

    get x() {
        return this.props.x
    }

    get y() {
        return this.props.y
    }

    get category() {
        return this.props.category
    }

    get entry() {
        return this.#entry;
    }

    get visible() {
        return this.#visible;
    }

    get access() {
        if (this.props.category == "area" || this.props.category == "exit") {
            if (this.accessPenetration) {
                return this.#entry.access;
            }
        }
        return this.#entry.access;
    }

    get accessPenetration() {
        return super.accessPenetration && this.#entry.accessPenetration;
    }

    get listContents() {
        return !!this.#entry.listContents;
    }

    #updateVisibility() {
        const value = super.visible && this.#entry.isVisible();
        if (this.#visible != value) {
            this.#visible = value;
            // external
            const ev = new Event("visibility");
            ev.value = value;
            this.dispatchEvent(ev);
        }
    }

}
