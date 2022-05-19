// frameworks
import {
    mix
} from "/emcJS/util/Mixin.js";

import AccessStateEnum from "../../../../../enum/AccessStateEnum.js";
import WorldStateManagerRegistry from "../../../../../statemanager/WorldStateManagerRegistry.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import WorldListButton from "./Button.js";

const BaseClass = mix(
    WorldListButton
).with(
    StateDataEventManagerMixin
);

export default class WorldListStateButton extends BaseClass {

    applyDefaultValues() {
        /* access */
        this.applyAccess();
    }

    applyStateValues(state) {
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = AccessStateEnum.getName(access.value);
        this.applyAccess(accessValue.toLowerCase(), access);
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
        return [...super.observedAttributes, "ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = WorldStateManagerRegistry.get(this.category).get(this.ref);
                    this.switchState(state);
                } break;
            }
        }
    }

    get category() {
        return "";
    }

}

customElements.define("gt-worldlist-statebutton", WorldListStateButton);
