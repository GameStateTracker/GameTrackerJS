// frameworks
import CustomElement from "/emcJS/ui/element/CustomElement.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import ContextMenuManagerMixin from "/emcJS/ui/mixin/ContextMenuManagerMixin.js";

import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import LocationStateManager from "../../../../../statemanager/world/location/LocationStateManager.js";
import TPL from "./LocationListEntry.js.html" assert {type: "html"};
import STYLE from "./LocationListEntry.js.css" assert {type: "css"};

const BaseClass = mix(
    CustomElement
).with(
    StateDataEventManagerMixin,
    ContextMenuManagerMixin
);

export default class LocationListEntry extends BaseClass {

    #textEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#textEl = this.shadowRoot.getElementById("text");
        /* state handler */
        this.registerStateHandler("visibility", (event) => {
            this.hidden = !event.value;
        });
        this.registerStateHandler("access", (event) => {
            const access = event.value;
            const accessValue = access.value;
            this.applyAccess(("" + accessValue).toLowerCase(), access);
        });
        /* mouse events */
        const headerEl = this.shadowRoot.getElementById("header");
        headerEl.addEventListener("contextmenu", (event) => {
            this.contextmenuHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        headerEl.addEventListener("click", (event) => {
            this.clickHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    get hidden() {
        return this.getAttribute("hidden") != "false";
    }

    set hidden(val) {
        this.setAttribute("hidden", !!val);
    }

    get textRef() {
        const ref = this.ref;
        const cat = this.type.toLowerCase();
        return cat ? `${cat}[${ref}]` : ref;
    }

    clickHandler(/* event */) {
        // nothing
    }

    applyDefaultValues(defaultIcon) {
        /* access */
        this.applyAccess();
        /* visible */
        this.hidden = true;
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.typeIcon = defaultIcon;
            badgeEl.setFilterData();
        }
    }

    applyStateValues(state, defaultIcon) {
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = access.value;
        this.applyAccess(("" + accessValue).toLowerCase(), access);
        /* visible */
        this.hidden = !state.isVisible();
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.typeIcon = state.props.icon ?? defaultIcon;
            badgeEl.setFilterData(state.props.filter);
        }
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback?.();
        }
        /* --- */
        if (this.ref) {
            const state = LocationStateManager.get(this.ref);
            this.switchState(state);
            /* text */
            this.#textEl.i18nValue = this.textRef;
        }
    }

    getStateAccess(state) {
        return state.access;
    }

    applyAccess(value = "undefined", data = {}) {
        this.access = value;
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.access = value;
            badgeEl.available = data.reachable ?? 0;
            badgeEl.unopened = data.unopened ?? 0;
        }
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
                    const state = LocationStateManager.get(this.ref);
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

    contextmenuHandler(event) {
        this.showDefaultContextMenu(event);
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    get type() {
        return "";
    }

    get comparatorText() {
        return this.#textEl.innerText;
    }

}
