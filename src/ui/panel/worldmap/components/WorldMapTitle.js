// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import "/emcJS/ui/i18n/I18nLabel.js";

import AccessStateEnum from "../../../../enum/AccessStateEnum.js";
import AreaStateManager from "../../../../statemanager/world/area/AreaStateManager.js";
import StateDataEventManagerMixin from "../../../mixin/StateDataEventManagerMixin.js";

const TPL = new Template(`
<emc-i18n-label id="text"></emc-i18n-label>
<slot></slot>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 360px;
    padding: 10px;
    font-size: 1.5em;
    line-height: 1em;
    background-color: var(--page-background-color, #000000);
    border-style: solid;
    border-width: 2px;
    border-color: var(--page-border-color, #ffffff);
    user-select: none;
}
#text {
    display: block;
    flex: 1;
    font-size: .8em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
:host([access="opened"]) #text {
    color: var(--location-status-opened-color, var(--page-text-color, #000000));
}
:host([access="available"]) #text {
    color: var(--location-status-available-color, var(--page-text-color, #000000));
}
:host([access="unavailable"]) #text {
    color: var(--location-status-unavailable-color, var(--page-text-color, #000000));
}
:host([access="possible"]) #text {
    color: var(--location-status-possible-color, var(--page-text-color, #000000));
}
`);

const BaseClass = mix(
    CustomElement
).with(
    StateDataEventManagerMixin
);

export default class WorldMapTitle extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);

        /* state handler */
        this.registerStateHandler("access", event => {
            const access = event.value;
            const accessValue = AccessStateEnum.getName(access.value);
            this.applyAccess(accessValue.toLowerCase(), access);
        });
    }

    applyDefaultValues() {
        /* access */
        this.applyAccess("unavailable", {});
        /* text */
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.i18nValue = "";
        }
    }

    applyStateValues(state) {
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = AccessStateEnum.getName(access.value);
        this.applyAccess(accessValue.toLowerCase(), access);
        /* text */
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.i18nValue = `area[${state.ref}]`;
        }
    }

    getStateAccess(state) {
        return state.access;
    }

    applyAccess(value = "unavailable", data = {}) {
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
                    const state = AreaStateManager.get(this.ref);
                    this.switchState(state);
                } break;
            }
        }
    }

}

customElements.define("gt-worldmap-title", WorldMapTitle);
