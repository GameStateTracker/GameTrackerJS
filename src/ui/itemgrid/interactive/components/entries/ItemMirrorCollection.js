import {mix} from "/emcJS/util/Mixin.js";
import MultiStateDataEventManagerMixin from "../../../../mixin/MultiStateDataEventManagerMixin.js";
import ItemMirror from "./ItemMirror.js";
import TPL from "./ItemMirrorCollection.js.html" assert {type: "html"};
import STYLE from "./ItemMirrorCollection.js.css" assert {type: "css"};

const BaseClass = mix(ItemMirror).with(MultiStateDataEventManagerMixin);

export default class ItemMirrorCollection extends BaseClass {

    #tooltipEl;

    #valueEl;

    #currentEl;

    #maxEl;

    constructor() {
        super();
        const tpl = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#tooltipEl = this.shadowRoot.getElementById("tooltip");
        this.#tooltipEl.append(tpl);
        /* --- */
        this.#valueEl = this.shadowRoot.getElementById("value");
        this.#currentEl = this.shadowRoot.getElementById("current");
        this.#maxEl = this.shadowRoot.getElementById("max");
        this.#valueEl.append(this.#currentEl);
        this.#valueEl.append(this.#maxEl);
        /* --- */
        this.registerStateHandler("max", () => {
            this.refreshValue();
        });
        this.registerStateHandler("value", () => {
            this.refreshValue();
        });
    }

    set hideMax(value) {
        this.setBooleanAttribute("hidemax", value);
    }

    get hideMax() {
        return this.getBooleanAttribute("hidemax");
    }

    applyDefaultValues() {
        this.#currentEl.innerHTML = 0;
        this.#maxEl.innerHTML = 0;
        this.#valueEl.classList.toggle("mark", false);
    }

    applyStateValues() {
        this.refreshValue();
    }

    refreshValue() {
        const states = this.getStates();
        if (states.length > 0) {
            let value = 0;
            let maxValue = 0;
            for (const state of states) {
                const stateMax = state.max ?? 0;
                const stateValue = Math.min(state.value ?? 0, stateMax);
                value += stateValue;
                maxValue += stateMax;
            }
            this.#maxEl.innerHTML = maxValue;
            this.#currentEl.innerHTML = value;
            this.#valueEl.classList.toggle("mark", value >= maxValue);
        } else {
            this.#maxEl.innerHTML = 0;
            this.#currentEl.innerHTML = 0;
        }
    }

}

customElements.define("gt-itemgrid-itemmirror-collection", ItemMirrorCollection);
