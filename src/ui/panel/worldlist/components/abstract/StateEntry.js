import {mix} from "@emcjs/core/mixin/Mixin.js";
import WorldStateManagerRegistry from "../../../../../statemanager/WorldStateManagerRegistry.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import WorldListEntry from "./Entry.js";
import STYLE from "./StateEntry.js.css" assert {type: "css"};

const BaseClass = mix(WorldListEntry).with(StateDataEventManagerMixin);

export default class WorldListStateEntry extends BaseClass {

    #textEl;

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#textEl = this.shadowRoot.getElementById("text");
        /* state handler */
        this.registerStateHandler("access", (event) => {
            const access = event.value;
            const accessValue = access.value;
            this.applyAccess(("" + accessValue).toLowerCase(), access);
        });
        this.registerStateHandler("excluded", (event) => {
            this.#textEl.classList.toggle("striked", event.value);
        });
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback?.();
        }
        /* --- */
        if (this.ref) {
            const state = WorldStateManagerRegistry.get(this.type).get(this.ref);
            this.switchState(state);
            /* text */
            this.#textEl.i18nValue = this.textRef;
        }
    }

    applyDefaultValues() {
        /* access */
        this.applyAccess();
        /* text */
        this.#textEl.classList.remove("striked");
    }

    applyStateValues(state) {
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = access.value;
        this.applyAccess(("" + accessValue).toLowerCase(), access);
        /* text */
        this.#textEl.classList.toggle("striked", state.excluded ?? false);
    }

    getStateAccess(state) {
        return state.access;
    }

    applyAccess(value = "undefined"/* , data = {} */) {
        this.access = value;
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get access() {
        return this.getAttribute("access");
    }

    set access(val) {
        this.setAttribute("access", val);
    }

    static get observedAttributes() {
        return ["ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = WorldStateManagerRegistry.get(this.type).get(this.ref);
                    this.switchState(state);
                    /* text */
                    if (this.#textEl != null) {
                        this.#textEl.i18nValue = this.textRef;
                    }
                } break;
            }
        }
    }

    get textRef() {
        const ref = this.ref;
        const cat = this.type.toLowerCase();
        return cat ? `${cat}[${ref}]` : ref;
    }

}
