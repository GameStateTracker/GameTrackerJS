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
        this.#entry = WorldStateManagerRegistry.get(props.ref?.type)?.get(props.ref?.name);
        if (this.#entry == null) {
            throw new Error(`list record could not resolve "${props.ref?.name}" from "${props.ref?.type}"`);
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
        this.addEventListener("visible", () => {
            this.#updateVisibility();
        });
        this.#updateVisibility();
    }

    get x() {
        return this.props.pos?.x;
    }

    get y() {
        return this.props.pos?.y;
    }

    get scale() {
        return this.props.pos?.scale ?? 100;
    }

    get type() {
        return this.props.ref?.type ?? "";
    }

    get entry() {
        return this.#entry;
    }

    get visible() {
        return this.#visible;
    }

    get access() {
        if (this.props.type == "Area" || this.props.type == "Exit") {
            if (this.accessPenetration) {
                return this.#entry.access;
            }
        }
        return this.#entry.access;
    }

    get accessPenetration() {
        return super.accessPenetration ?? this.#entry.accessPenetration;
    }

    get listContents() {
        return !!this.#entry.listContents;
    }

    #updateVisibility() {
        if (this.props.ignoreEntryVisibility) {
            this.#setVisibility(super.visible);
        } else {
            this.#setVisibility(super.visible && this.#entry.isVisible());
        }
    }

    #setVisibility(value) {
        if (this.#visible != value) {
            this.#visible = value;
            // external
            const ev = new Event("visibility");
            ev.value = value;
            this.dispatchEvent(ev);
        }
    }

}
