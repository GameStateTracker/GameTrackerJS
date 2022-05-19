// frameworks
import {
    mix
} from "/emcJS/util/Mixin.js";

import AccessStateEnum from "../../../../../enum/AccessStateEnum.js";
import WorldStateManagerRegistry from "../../../../../statemanager/WorldStateManagerRegistry.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import WorldListEntry from "./Entry.js";

const BaseClass = mix(
    WorldListEntry
).with(
    StateDataEventManagerMixin
);

export default class WorldListStateEntry extends BaseClass {

    constructor() {
        super();
        /* state handler */
        this.registerStateHandler("visibility", (event) => {
            this.hidden = !event.value;
        });
        this.registerStateHandler("access", (event) => {
            const access = event.value;
            const accessValue = AccessStateEnum.getName(access.value);
            this.applyAccess(accessValue.toLowerCase(), access);
        });
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        /* --- */
        if (this.ref) {
            const state = WorldStateManagerRegistry.get(this.category).get(this.ref);
            this.switchState(state);
            /* text */
            const textEl = this.shadowRoot.getElementById("text");
            if (textEl != null) {
                textEl.i18nValue = this.textRef;
            }
        }
    }

    applyDefaultValues() {
        /* access */
        this.applyAccess();
        /* visible */
        this.hidden = true;
    }

    applyStateValues(state) {
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = AccessStateEnum.getName(access.value);
        this.applyAccess(accessValue.toLowerCase(), access);
        /* visible */
        this.hidden = !state.isVisible();
    }

    getStateAccess(state) {
        return state.access;
    }

    applyAccess(value = "undefined", data = {}) {
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
                    const state = WorldStateManagerRegistry.get(this.category).get(this.ref);
                    this.switchState(state);
                    /* text */
                    const textEl = this.shadowRoot.getElementById("text");
                    if (textEl != null) {
                        textEl.i18nValue = this.textRef;
                    }
                } break;
            }
        }
    }

    get textRef() {
        const ref = this.ref;
        const cat = this.category;
        return cat ? `${cat}[${ref}]` : ref;
    }

}
