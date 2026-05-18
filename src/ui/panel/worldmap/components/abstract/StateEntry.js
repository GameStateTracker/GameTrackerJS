import {mix} from "@emcjs/core/mixin/Mixin.js";
import "@emcjs/fe/ui/bubble/Bubble.js";
import WorldStateManagerRegistry from "../../../../../statemanager/WorldStateManagerRegistry.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import Entry from "./Entry.js";
import TPL from "./StateEntry.js.html" assert {type: "html"};
import STYLE from "./StateEntry.js.css" assert {type: "css"};

const BaseClass = mix(Entry).with(StateDataEventManagerMixin);

export default class StateEntry extends BaseClass {

    #markerEl;

    #textEl;

    #bubbleEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#markerEl = this.shadowRoot.getElementById("marker");
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#bubbleEl = this.shadowRoot.getElementById("bubble");
        /* state handler */
        this.registerStateHandler("access", (event) => {
            const access = event.value;
            const accessValue = access.value;
            this.applyAccess(("" + accessValue).toLowerCase(), access);
        });
        this.addEventListener("mouseenter", () => {
            this.#bubbleEl.refreshTooltipPosition();
        });
        this.registerStateHandler("excluded", (event) => {
            this.#textEl.classList.toggle("striked", event.value);
            this.#markerEl.classList.toggle("striked", event.value);
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
        this.applyAccess("unavailable", {});
        /* marker */
        this.#markerEl.classList.remove("striked");
        /* text */
        this.#textEl.classList.remove("striked");
    }

    applyStateValues(state) {
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = access.value;
        this.applyAccess(("" + accessValue).toLowerCase(), access);
        /* marker */
        this.#markerEl.classList.toggle("striked", state.excluded ?? false);
        /* text */
        this.#textEl.classList.toggle("striked", state.excluded ?? false);
    }

    getStateAccess(state) {
        return state.access;
    }

    applyAccess(value = "unavailable"/* , data = {} */) {
        /* marker */
        this.#markerEl.dataset.state = value;
        /* text */
        this.#textEl.dataset.state = value;
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
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
        return this.ref;
    }

    get type() {
        return "0";
    }

}
