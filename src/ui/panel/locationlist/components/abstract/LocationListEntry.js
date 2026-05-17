// frameworks
import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import "@emcjs/fe/ui/i18n/I18nLabel.js";
import {mix} from "@emcjs/core/mixin/Mixin.js";
import ContextMenuManagerMixin from "@emcjs/fe/ui/mixin/ContextMenuManagerMixin.js";

import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import LocationStateManager from "../../../../../statemanager/world/location/LocationStateManager.js";
import TPL from "./LocationListEntry.js.html" assert {type: "html"};
import STYLE from "./LocationListEntry.js.css" assert {type: "css"};

const BaseClass = mix(CustomElement).with(
    StateDataEventManagerMixin,
    ContextMenuManagerMixin
);

export default class LocationListEntry extends BaseClass {

    #textEl;

    #badgeEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#badgeEl = this.shadowRoot.getElementById("badge");
        /* state handler */
        this.registerStateHandler("visibility", (event) => {
            this.hidden = !event.value;
        });
        this.registerStateHandler("access", (event) => {
            const access = event.value;
            const accessValue = access.value;
            this.applyAccess(("" + accessValue).toLowerCase(), access);
        });
        this.registerStateHandler("excluded", (event) => {
            this.#textEl.classList.toggle("striked", event.value);
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
        this.#badgeEl.typeIcon = defaultIcon;
        this.#badgeEl.setFilterData();
        /* text */
        this.#textEl.classList.remove("striked");
    }

    applyStateValues(state, defaultIcon) {
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = access.value;
        this.applyAccess(("" + accessValue).toLowerCase(), access);
        /* visible */
        this.hidden = !state.isVisible();
        /* badge */
        this.#badgeEl.typeIcon = state.props.icon ?? defaultIcon;
        this.#badgeEl.setFilterData(state.props.filter);
        /* text */
        this.#textEl.classList.toggle("striked", state.excluded ?? false);
    }

    getStateAccess(state) {
        return state.access;
    }

    applyAccess(value = "undefined", data = {}) {
        this.access = value;
        /* badge */
        if (this.#badgeEl != null) {
            this.#badgeEl.access = value;
            this.#badgeEl.available = data.reachable ?? 0;
            this.#badgeEl.unopened = data.unopened ?? 0;
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
                    if (this.#textEl != null) {
                        this.#textEl.i18nValue = this.textRef;
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
