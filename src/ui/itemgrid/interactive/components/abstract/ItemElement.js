import CustomElement from "/emcJS/ui/element/CustomElement.js";
import {mix} from "/emcJS/util/Mixin.js";
import ItemStateManager from "../../../../../statemanager/item/ItemStateManager.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import "/emcJS/ui/input/Option.js";
import "/emcJS/ui/i18n/I18nTooltip.js";
import "../../../../../state/item/StartSettingsState.js";
import TPL from "./ItemElement.js.html" assert {type: "html"};
import STYLE from "./ItemElement.js.css" assert {type: "css"};

const BaseClass = mix(CustomElement).with(StateDataEventManagerMixin);

export default class ItemElement extends BaseClass {

    #tooltipEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#tooltipEl = this.shadowRoot.getElementById("tooltip");
        /* --- */
        this.registerStateHandler("value", (event) => {
            this.value = event.value;
        });
        this.registerStateHandler("visible", (event) => {
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
        this.style.visibility = "";
    }

    applyStateValues(state) {
        // value
        this.value = state.value;
        // alignment
        this.halign = state.props.halign ?? "center";
        this.valign = state.props.valign ?? "center";
        // visibility
        if (state.visible) {
            this.style.visibility = "";
        } else {
            this.style.visibility = "hidden";
        }
        /* text */
        if (state.props.tooltip != null) {
            this.#tooltipEl.i18nTooltip = state.props.tooltip;
        } else {
            this.#tooltipEl.i18nTooltip = this.textRef;
        }
    }

    set ref(val) {
        if (val != null) {
            this.setAttribute("ref", val);
        } else {
            this.removeAttribute("ref");
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set value(val) {
        if (val != null) {
            this.setAttribute("value", val);
        } else {
            this.removeAttribute("value");
        }
    }

    get value() {
        return this.getAttribute("value");
    }

    set readOnly(val) {
        this.setAttribute("readonly", val);
    }

    get readOnly() {
        return this.getAttribute("readonly");
    }

    set halign(val) {
        if (val === "center" || val === "start" || val === "end") {
            this.setAttribute("halign", val);
        } else {
            this.removeAttribute("halign");
        }
    }

    get halign() {
        return this.getAttribute("halign");
    }

    set valign(val) {
        if (val === "center" || val === "start" || val === "end") {
            this.setAttribute("valign", val);
        } else {
            this.removeAttribute("valign");
        }
    }

    get valign() {
        return this.getAttribute("halign");
    }

    set noValue(val) {
        this.setBooleanAttribute("novalue", val);
    }

    get noValue() {
        return this.getBooleanAttribute("novalue");
    }

    static get observedAttributes() {
        return ["ref", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    // state
                    const state = ItemStateManager.get(this.ref);
                    this.switchState(state);
                } break;
                case "value": {
                    this.refreshValue();
                } break;
            }
        }
    }

    next(event) {
        if (!this.readOnly) {
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
        if (!this.readOnly) {
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
