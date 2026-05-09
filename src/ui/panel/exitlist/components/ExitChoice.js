
import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import ContextMenuManagerMixin from "@emcjs/fe/ui/mixin/ContextMenuManagerMixin.js";
import ExitStateManager from "../../../../statemanager/world/exit/ExitStateManager.js";
import StateDataEventManagerMixin from "../../../mixin/StateDataEventManagerMixin.js";
import Badge from "../../../Badge.js";
import ExitChoiceContextMenu from "../../../ctxmenu/ExitChoiceContextMenu.js";
import ExitBindingContextMenu from "../../../ctxmenu/ExitBindingContextMenu.js";
import Language from "../../../../util/Language.js";
import DefaultAreaState from "../../../../state/world/area/DefaultAreaState.js";
import WorldListState from "../../../../state/world/WorldListState.js";
import TPL from "./ExitChoice.js.html" assert {type: "html"};
import STYLE from "./ExitChoice.js.css" assert {type: "css"};

// TODO use i18n-label instead of apply label method
export default class ExitChoice extends ContextMenuManagerMixin(StateDataEventManagerMixin(CustomElement)) {

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("visibility", (event) => {
            this.hidden = !event.value;
        });
        this.registerStateHandler("value", (event) => {
            this.value = event.value ?? "";
        });
        this.registerStateHandler("access", (event) => {
            const access = event.value;
            const accessValue = access.value;
            this.applyAccess(("" + accessValue).toLowerCase(), access);
        });

        /* context menu */
        this.setDefaultContextMenu(ExitChoiceContextMenu);
        this.setContextMenu("exitbinding", ExitBindingContextMenu);
        this.addContextMenuHandler("exitbinding", "change", (event) => {
            const state = this.getState();
            if (state != null) {
                state.value = event.value;
            }
        });
        this.addDefaultContextMenuHandler("bind", (event) => {
            const state = this.getState();
            this.showContextMenu("exitbinding", event, this.ref, state.value);
        });
        this.addDefaultContextMenuHandler("unbind", () => {
            const state = this.getState();
            if (state != null) {
                state.value = "";
            }
        });
        this.addDefaultContextMenuHandler("goto", () => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area instanceof DefaultAreaState) {
                    WorldListState.area = area.ref;
                }
            }
        });

        /* mouse events */
        this.addEventListener("click", (event) => {
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
        this.addEventListener("contextmenu", (event) => {
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
            badge.typeIcon = "/images/icons/entrance.svg";
            badge.setFilterData({});
        }
        /* visible */
        this.hidden = true;
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        /* value */
        this.value = state.value ?? "";
        /* badge */
        const badge = this.shadowRoot.getElementById("badge");
        if (badge instanceof Badge) {
            badge.typeIcon = state.props.icon ?? "/images/icons/entrance.svg";
            badge.setFilterData(state.props.filter);
        }
        /* visible */
        this.hidden = !state.isVisible();
    }

    applyAccess(value = "undefined"/* , data = {} */) {
        this.access = value;
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

    set access(val) {
        this.setAttribute("access", val);
    }

    get access() {
        return this.getAttribute("access");
    }

    set hidden(val) {
        this.setAttribute("hidden", !!val);
    }

    get hidden() {
        return this.getAttribute("hidden") != "false";
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
