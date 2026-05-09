import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import {mix} from "@emcjs/core/mixin/Mixin.js";
import ItemStates from "../../../../statemanager/item/ItemStateManager.js";
import StateDataEventManagerMixin from "../../../mixin/StateDataEventManagerMixin.js";
import TPL from "./Item.js.html" assert {type: "html"};
import STYLE from "./Item.js.css" assert {type: "css"};

const BaseClass = mix(CustomElement).with(StateDataEventManagerMixin);

function resolveIcon(icon) {
    if (icon == null) {
        return "/images/items/unknown.png";
    }
    if (typeof icon == "object") {
        return icon[0] ?? "/images/items/unknown.png";
    }
    return icon;
}

export default class Item extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("visibility", (event) => {
            if (event.value) {
                this.style.visibility = "";
            } else {
                this.style.visibility = "hidden";
            }
        });
    }

    applyDefaultValues() {
        this.value = 0;
        this.halign = "center";
        this.valign = "center";
        this.style.backgroundImage = "";
    }

    applyStateValues(state) {
        // label
        if (state.props.label && typeof state.props.label == "string") {
            this.value = state.props.label;
        }
        // alignment
        this.halign = state.props.halign ?? "center";
        this.valign = state.props.valign ?? "center";
        // image
        const icon = resolveIcon(state.props.icon);
        this.style.backgroundImage = `url("${icon}")`;
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get halign() {
        return this.getAttribute("halign");
    }

    set halign(val) {
        this.setAttribute("halign", val);
    }

    get valign() {
        return this.getAttribute("halign");
    }

    set valign(val) {
        this.setAttribute("valign", val);
    }

    static get observedAttributes() {
        return ["ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    // state
                    const state = ItemStates.get(this.ref);
                    this.switchState(state);
                    /* text */
                    const tooltipEl = this.shadowRoot.getElementById("tooltip");
                    if (tooltipEl != null) {
                        tooltipEl.i18nTooltip = this.textRef;
                    }
                } break;
            }
        }
    }

    get textRef() {
        return `item[${this.ref}]`;
    }

}

customElements.define("gt-itempicker-item", Item);
