import {
    mix
} from "/emcJS/util/Mixin.js";
import MultiStateDataEventManagerMixin from "../../../../mixin/MultiStateDataEventManagerMixin.js";
import ItemMirror from "./ItemMirror.js";
import TPL from "./ItemMirrorCollection.js.html" assert {type: "html"};
import STYLE from "./ItemMirrorCollection.js.css" assert {type: "css"};

const BaseClass = mix(
    ItemMirror
).with(
    MultiStateDataEventManagerMixin
);

export default class ItemMirrorCollection extends BaseClass {

    #valueEl;

    constructor() {
        super();
        const tpl = TPL.generate();
        this.shadowRoot.getElementById("tooltip").append(tpl);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#valueEl = this.shadowRoot.getElementById("value");
        /* --- */
        this.registerStateHandler("max", () => {
            this.refreshValue();
        });
        this.registerStateHandler("value", () => {
            this.refreshValue();
        });
    }

    applyDefaultValues() {
        this.#valueEl.innerHTML = "";
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
                value += state.value ?? 0;
                maxValue += state.max ?? 0;
            }
            this.#valueEl.innerHTML = `${value} / ${maxValue}`;
            this.#valueEl.classList.toggle("mark", value >= maxValue);
        }
    }

}

customElements.define("gt-itemgrid-itemmirror-collection", ItemMirrorCollection);
