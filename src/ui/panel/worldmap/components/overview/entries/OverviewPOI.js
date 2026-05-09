import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import {mix} from "@emcjs/core/mixin/Mixin.js";
import WorldStateManagerRegistry from "../../../../../../statemanager/WorldStateManagerRegistry.js";
import StateDataEventManagerMixin from "../../../../../mixin/StateDataEventManagerMixin.js";
import TPL from "./OverviewPOI.js.html" assert {type: "html"};
import STYLE from "./OverviewPOI.js.css" assert {type: "css"};

const BaseClass = mix(CustomElement).with(StateDataEventManagerMixin);

export default class OverviewPOI extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* state handler */
        this.registerStateHandler("access", (event) => {
            const access = event.value;
            const accessValue = access.value;
            this.applyAccess(("" + accessValue).toLowerCase(), access);
        });
    }

    set top(value) {
        this.setIntAttribute("top", value);
    }

    get top() {
        return this.getIntAttribute("top");
    }

    set left(value) {
        this.setIntAttribute("left", value);
    }

    get left() {
        return this.getIntAttribute("left");
    }

    set scale(val) {
        this.setIntAttribute("scale", val);
    }

    get scale() {
        return this.getIntAttribute("scale");
    }

    set type(val) {
        this.setAttribute("type", val);
    }

    get type() {
        return this.getAttribute("type");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get ref() {
        return this.getAttribute("ref");
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "top", "left", "scale", "type", "ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "top": {
                    this.style.top = `${newValue}px`;
                } break;
                case "left": {
                    this.style.left = `${newValue}px`;
                } break;
                case "scale": {
                    this.style.setProperty("--scale", newValue);
                } break;
                case "type":
                case "ref": {
                    const state = WorldStateManagerRegistry.get(this.type).get(this.ref);
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

    applyDefaultValues() {
        /* access */
        this.applyAccess("unavailable", {});
    }

    getStateAccess(state) {
        return state.access;
    }

    applyStateValues(state) {
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = access.value;
        this.applyAccess(("" + accessValue).toLowerCase(), access);
    }

    applyAccess(value = "unavailable"/* , data = {} */) {
        this.dataset.state = value;
    }

}

customElements.define("gt-worldmap-overview-poi", OverviewPOI);
