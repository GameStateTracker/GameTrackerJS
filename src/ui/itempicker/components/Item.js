// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import {
    mix
} from "/emcJS/util/Mixin.js";

import ItemStates from "../../../state/item/ItemStateManager.js";
import StateDataEventManagerMixin from "../../mixin/StateDataEventManagerMixin.js";

const TPL = new Template(`
<emc-i18n-tooltip id="tooltip">
    <div id="value">
    </div>
</emc-i18n-tooltip>
`);

const STYLE = new GlobalStyle(`
:host {
    display: inline-flex;
    width: 40px;
    height: 40px;
    cursor: pointer;
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: border-box;
    user-select: none;
}
:host(:hover) {
    background-size: 100%;
}
:host([halign="start"]) #value {
    justify-content: flex-start;
}
:host([halign="end"]) #value {
    justify-content: flex-end;
}
:host([valign="start"]) #value {
    align-items: flex-start;
}
:host([valign="end"]) #value {
    align-items: flex-end;
}
`);

const BaseClass = mix(
    CustomElement
).with(
    StateDataEventManagerMixin
);

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
        this.registerStateHandler("visibility", event => {
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

}

customElements.define("gt-itempicker-item", Item);
