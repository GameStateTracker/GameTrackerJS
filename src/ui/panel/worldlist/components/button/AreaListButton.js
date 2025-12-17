// frameworks
import {mix} from "/emcJS/util/Mixin.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";

import WorldStateManagerRegistry from "../../../../../statemanager/WorldStateManagerRegistry.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import WorldListButton from "./Button.js";

const BaseClass = mix(WorldListButton).with(StateDataEventManagerMixin);

export default class WorldListAreaListButton extends BaseClass {

    #listHandler = null;

    #listHandlerEventManager = new EventTargetManager();

    constructor() {
        super();
        /* state handler */
        this.#listHandlerEventManager.set("access", (event) => {
            const access = event.value;
            this.applyAccess(access);
        });
    }

    applyDefaultValues() {
        /* access */
        this.applyAccess();
    }

    applyStateValues(state) {
        /* access */
        this.#listHandler = state.getListHandler(this.listName);
        this.#listHandlerEventManager.switchTarget(this.#listHandler);
        const access = this.#listHandler?.access;
        this.applyAccess(access);
    }

    applyAccess(access = {}) {
        const accessValue = access.value?.toString();
        if (typeof accessValue === "string") {
            this.access = accessValue.toLowerCase();
        } else {
            this.access = "";
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get listName() {
        return this.getAttribute("listname");
    }

    set listName(val) {
        this.setAttribute("listname", val);
    }

    get access() {
        return this.getAttribute("access");
    }

    set access(val) {
        this.setAttribute("access", val);
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "ref", "listname"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = WorldStateManagerRegistry.get("Area").get(this.ref);
                    this.switchState(state);
                } break;
                case "listname": {
                    this.#listHandler = this.state?.getListHandler(newValue);
                    this.#listHandlerEventManager.switchTarget(this.#listHandler);
                    const access = this.#listHandler?.access;
                    this.applyAccess(access);
                } break;
            }
        }
    }

    get type() {
        return "Area";
    }

}

customElements.define("gt-worldlist-button-arealist", WorldListAreaListButton);
