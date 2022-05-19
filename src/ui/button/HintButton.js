// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import "/emcJS/ui/input/Option.js";

import AreaStateManager from "../../statemanager/world/area/AreaStateManager.js";
import StateDataEventManagerMixin from "../mixin/StateDataEventManagerMixin.js";

const TPL = new Template(`
<emc-option value="" style="background-image: url('images/icons/area_nohint.svg')"></emc-option>
<emc-option value="woth" style="background-image: url('images/icons/area_woth.svg')"></emc-option>
<emc-option value="barren" style="background-image: url('images/icons/area_barren.svg')"></emc-option>
`);

const STYLE = new GlobalStyle(`
:host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    cursor: pointer;
}
slot {
    width: 100%;
    height: 100%;
}
:not([value]),
[value]:not(.active) {
    display: none !important;
}
[value] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: white;
    font-size: 1em;
    text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: content-box;
    flex-grow: 0;
    flex-shrink: 0;
    min-height: 0;
    white-space: normal;
    padding: 0;
    line-height: 0.7em;
}
`);

class HintButton extends StateDataEventManagerMixin(CustomElement) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("hint", event => {
            this.value = event.value;
        });
        this.addEventListener("click", event => this.next(event));
        this.addEventListener("contextmenu", event => this.revert(event));
    }

    connectedCallback() {
        super.connectedCallback();
        // state
        const state = this.getState();
        if (state != null) {
            this.value = state.hint;
        }
    }

    applyDefaultValues() {
        this.value = "";
    }

    applyStateValues(state) {
        if (state != null) {
            this.value = state.hint;
        }
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
        const val = this.getAttribute("readonly");
        return !!val && val != "false";
    }

    set readonly(val) {
        this.setAttribute("readonly", val);
    }

    static get observedAttributes() {
        return ["ref", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref":
                    {
                        // state
                        const state = AreaStateManager.get(newValue);
                        this.switchState(state);
                    }
                    break;
                case "value":
                    {
                        const oe = this.shadowRoot.querySelector(`.active`);
                        if (oe) {
                            oe.classList.remove("active");
                        }
                        const ne = this.shadowRoot.querySelector(`[value="${newValue}"]`);
                        if (ne) {
                            ne.classList.add("active");
                        }
                    }
                    break;
            }
        }
    }

    next(event) {
        if (!this.readonly) {
            const state = this.getState();
            if (state != null) {
                if (state.hint == "woth") {
                    state.hint = "barren";
                } else {
                    state.hint = "woth";
                }
            }
        }
        event.preventDefault();
        return false;
    }

    revert(event) {
        if (!this.readonly) {
            const state = this.getState();
            if (state != null) {
                state.hint = "";
            }
        }
        event.preventDefault();
        return false;
    }

}

customElements.define("gt-hintbutton", HintButton);
