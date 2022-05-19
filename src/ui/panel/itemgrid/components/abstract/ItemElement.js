// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import "/emcJS/ui/input/Option.js";
import "/emcJS/ui/i18n/I18nTooltip.js";

import ItemStates from "../../../../../state/item/ItemStateManager.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import "../../../../../state/item/StartSettingsState.js";

const TPL = new Template(`
<emc-i18n-tooltip id="tooltip">
</emc-i18n-tooltip>
`);

const STYLE = new GlobalStyle(`
:host {
    display: inline-flex;
    width: calc(var(--item-size, 40) * 1px);
    height: calc(var(--item-size, 40) * 1px);
    cursor: pointer;
    user-select: none;
}
:host([halign="start"]) #value,
:host([halign="start"]) ::slotted([value]) {
    justify-content: flex-start;
}
:host([halign="end"]) #value,
:host([halign="end"]) ::slotted([value]) {
    justify-content: flex-end;
}
:host([valign="start"]) #value,
:host([valign="start"]) ::slotted([value]) {
    align-items: flex-start;
}
:host([valign="end"]) #value,
:host([valign="end"]) ::slotted([value]) {
    align-items: flex-end;
}
`);

const BaseClass = mix(
    CustomElement
).with(
    StateDataEventManagerMixin
);

export default class ItemElement extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("value", (event) => {
            this.value = event.value;
        });
        this.registerStateHandler("visibility", (event) => {
            if (event.value) {
                this.style.visibility = "";
            } else {
                this.style.visibility = "hidden";
            }
        });
        this.addEventListener("click", (event) => this.next(event));
        this.addEventListener("contextmenu", (event) => this.prev(event));
    }

    applyDefaultValues() {
        // value
        this.value = 0;
        // alignment
        this.halign = "center";
        this.valign = "center";
    }

    applyStateValues(state) {
        // value
        this.value = state.value;
        // alignment
        this.halign = state.props.halign ?? "center";
        this.valign = state.props.valign ?? "center";
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get readonly() {
        return this.getAttribute("readonly");
    }

    set readonly(val) {
        this.setAttribute("readonly", val);
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
        return ["ref", "value"];
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
                case "value": {
                    this.refreshValue();
                } break;
            }
        }
    }

    next(event) {
        if (!this.readonly) {
            const state = this.getState();
            if (state != null) {
                const data = state.props;
                const oldValue = state.value;
                let value = oldValue;
                if (event.shiftKey || event.ctrlKey) {
                    if (data.alternate_counting) {
                        for (let i = 0; i < data.alternate_counting.length; ++i) {
                            let alt = parseInt(data.alternate_counting[i]);
                            if (isNaN(alt)) {
                                alt = 0;
                            }
                            if (alt > oldValue) {
                                value = data.alternate_counting[i];
                                break;
                            }
                        }
                    } else {
                        value = parseInt(data.max);
                    }
                } else {
                    value++;
                }
                if (value != oldValue) {
                    state.value = value;
                }
            }
        }
        if (!event) {
            return;
        }
        event.preventDefault();
        return false;
    }

    prev(event) {
        if (!this.readonly) {
            const state = this.getState();
            if (state != null) {
                const data = state.props;
                const oldValue = state.value;
                let value = oldValue;
                if (event.shiftKey || event.ctrlKey) {
                    if (data.alternate_counting) {
                        for (let i = data.alternate_counting.length - 1; i >= 0; --i) {
                            let alt = parseInt(data.alternate_counting[i]);
                            if (isNaN(alt)) {
                                alt = data.max;
                            }
                            if (alt < parseInt(oldValue)) {
                                value = data.alternate_counting[i];
                                break;
                            }
                        }
                    } else {
                        value = 0;
                    }
                } else {
                    value--;
                }
                if (value != oldValue) {
                    state.value = value;
                }
            }
        }
        if (!event) {
            return;
        }
        event.preventDefault();
        return false;
    }

    refreshValue() {
        // nothing
    }

    get textRef() {
        return `item[${this.ref}]`;
    }

}
