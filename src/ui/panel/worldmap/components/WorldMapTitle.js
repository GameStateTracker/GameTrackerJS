import CustomElement from "/emcJS/ui/element/CustomElement.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import AreaStateManager from "../../../../statemanager/world/area/AreaStateManager.js";
import StateDataEventManagerMixin from "../../../mixin/StateDataEventManagerMixin.js";
import WorldListState from "../../../../state/world/WorldListState.js";
import TPL from "./WorldMapTitle.js.html" assert {type: "html"};
import STYLE from "./WorldMapTitle.js.css" assert {type: "css"};

const BaseClass = mix(
    CustomElement
).with(
    StateDataEventManagerMixin
);

export default class WorldMapTitle extends BaseClass {

    #backEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* back button */
        this.#backEl = this.shadowRoot.getElementById("back");
        this.#backEl.addEventListener("click", () => {
            WorldListState.reset();
        });
        /* state handler */
        this.registerStateHandler("access", (event) => {
            const access = event.value;
            const accessValue = access.value;
            this.applyAccess(("" + accessValue).toLowerCase(), access);
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
        const accessValue = access.value;
        this.applyAccess(("" + accessValue).toLowerCase(), access);
        /* text */
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.i18nValue = `area[${state.ref}]`;
        }
    }

    getStateAccess(state) {
        return state.access;
    }

    applyAccess(value = "unavailable"/* , data = {} */) {
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
                    /* back button */
                    if (this.#backEl != null) {
                        this.#backEl.classList.toggle("hidden", WorldListState.isDefault);
                    }
                } break;
            }
        }
    }

}

customElements.define("gt-worldmap-title", WorldMapTitle);
