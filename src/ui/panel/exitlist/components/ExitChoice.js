// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import ContextMenuManagerMixin from "/emcJS/ui/overlay/ctxmenu/ContextMenuManagerMixin.js";

import ExitStateManager from "../../../../statemanager/world/exit/ExitStateManager.js";
import StateDataEventManagerMixin from "../../../mixin/StateDataEventManagerMixin.js";
import Badge from "../../../Badge.js";
import ExitChoiceContextMenu from "../../../ctxmenu/ExitChoiceContextMenu.js";
import ExitBindingContextMenu from "../../../ctxmenu/ExitBindingContextMenu.js";
import Language from "../../../../util/Language.js";

// TODO use i18n-label instead of apply label method

const TPL = new Template(`
<div class="textarea">
    <div id="text"></div>
    <gt-badge id="badge"></gt-badge>
</div>
<div class="pointer">→</div>
<div class="textarea">
    <div id="value"></div>
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    cursor: pointer;
    padding: 3px;
    user-select: none;
}
:host([hidden]:not([hidden="false"])) {
    display: none;
}
:host(:hover) {
    background-color: var(--main-hover-color, #ffffff32);
}
.textarea {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    height: 50px;
    margin: 2px;
    word-break: break-word;
}
.textarea:empty {
    display: none;
}
.pointer {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    flex-grow: 0;
    flex-shrink: 0;
}
#value:empty:after {
    display: inline;
    font-style: italic;
    content: "no association";
}
#text {
    display: flex;
    align-items: center;
}
#text,
#value {
    color: var(--page-text-color, #ffffff);
}
@media (max-width: 1000px) {
    :host {
        flex-direction: column;
        align-items: stretch;
    }
    .pointer {
        display: none;
    }
}
:host(.markname) #text,
:host(.markvalue) #value {
    color: var(--page-background-color, #000000);
    background-color: var(--page-text-color, #ffffff);
    outline: 2px solid var(--page-text-color, #ffffff);
}
`);

export default class ExitChoice extends ContextMenuManagerMixin(StateDataEventManagerMixin(CustomElement)) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("visibility", (event) => {
            this.hidden = !event.value;
        });
        this.registerStateHandler("value", event => {
            this.value = event.value;
        });

        /* context menu */
        this.setDefaultContextMenu(ExitChoiceContextMenu);
        this.setContextMenu("exitbinding", ExitBindingContextMenu);
        this.addContextMenuHandler("exitbinding", "change", event => {
            const state = this.getState();
            if (state != null) {
                state.value = event.value;
            }
        });
        this.addDefaultContextMenuHandler("associate", event => {
            const state = this.getState();
            this.showContextMenu("exitbinding", event, this.ref, state.value);
        });
        this.addDefaultContextMenuHandler("deassociate", event => {
            const state = this.getState();
            if (state != null) {
                state.value = "";
            }
        });

        /* mouse events */
        this.addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area == null) {
                    this.showContextMenu("exitbinding", event, this.ref, state.value);
                }
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            this.showDefaultContextMenu(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        /* value */
        this.value = "";
        /* badge */
        const badge = this.shadowRoot.getElementById("badge");
        if (badge instanceof Badge) {
            badge.typeIcon = "images/icons/entrance.svg";
            badge.setFilterData({});
        }
        /* visible */
        this.hidden = true;
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        /* value */
        this.value = state.value;
        /* badge */
        const badge = this.shadowRoot.getElementById("badge");
        if (badge instanceof Badge) {
            badge.typeIcon = state.props.icon ?? "images/icons/entrance.svg";
            badge.setFilterData(state.props.filter);
        }
        /* visible */
        this.hidden = !state.isVisible();
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    get hidden() {
        return this.getAttribute("hidden") != "false";
    }

    set hidden(val) {
        this.setAttribute("hidden", !!val);
    }

    static get observedAttributes() {
        return ["ref", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = ExitStateManager.get(this.ref);
                    const textEl = this.shadowRoot.getElementById("text");
                    if (textEl != null) {
                        Language.applyLabel(textEl, `exit[${this.ref}]`);
                    }
                    this.switchState(state);
                } break;
                case "value": {
                    const state = this.getState();
                    if (state != null) {
                        const valueEl = this.shadowRoot.getElementById("value");
                        if (valueEl != null) {
                            if (newValue) {
                                Language.applyLabel(valueEl, `entrance[${newValue}]`);
                            } else {
                                valueEl.innerHTML = "";
                            }
                        }
                    }
                    const event = new Event("change");
                    event.value = newValue;
                    this.dispatchEvent(event);
                } break;
            }
        }
    }

}

customElements.define("gt-exitchoice", ExitChoice);
