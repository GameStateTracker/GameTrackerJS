// frameworks
import CustomElement from "/emcJS/ui/element/CustomElement.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import ContextMenuManagerMixin from "/emcJS/ui/mixin/ContextMenuManagerMixin.js";
import "/emcJS/ui/LabeledIcon.js";

import StateDataEventManagerMixin from "../../../mixin/StateDataEventManagerMixin.js";
import UIRegistry from "../../../../registry/UIRegistry.js";
import LocationContextMenu from "../../../ctxmenu/LocationContextMenu.js";
import ItemPickerContextMenu from "../../../ctxmenu/ItemPickerContextMenu.js";
import WorldStateManagerRegistry from "../../../../statemanager/WorldStateManagerRegistry.js";
import TPL from "./LocationListLocation.js.html" assert {type: "html"};
import STYLE from "./LocationListLocation.js.css" assert {type: "css"};

function resolveIcon(icon) {
    if (Array.isArray(icon)) {
        return icon[0];
    } else {
        return icon;
    }
}

const BaseClass = mix(
    CustomElement
).with(
    StateDataEventManagerMixin,
    ContextMenuManagerMixin
);

export default class LocationListLocation extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        badgeEl.hideValues = true;
        /* state handler */
        this.registerStateHandler("visibility", (event) => {
            this.hidden = !event.value;
        });
        this.registerStateHandler("access", (event) => {
            const access = event.value;
            const accessValue = access.value;
            this.applyAccess(("" + accessValue).toLowerCase(), access);
        });
        this.registerStateHandler("item", () => {
            const state = this.getState();
            this.applyItem(state?.itemData);
        });
        /* context menu */
        this.setDefaultContextMenu(LocationContextMenu);
        this.addDefaultContextMenuHandler("check", () => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("uncheck", () => {
            const state = this.getState();
            if (state != null) {
                state.value = false;
            }
        });
        this.addDefaultContextMenuHandler("associate", (event) => {
            this.showContextMenu("itempicker", event, "pickable");
        });
        this.addDefaultContextMenuHandler("disassociate", () => {
            const state = this.getState();
            if (state != null) {
                state.item = "";
            }
        });
        /* context menu - item picker */
        this.setContextMenu("itempicker", ItemPickerContextMenu);
        this.addContextMenuHandler("itempicker", "pick", (event) => {
            const state = this.getState();
            if (state != null) {
                state.item = event.item;
            }
        });
        /* mouse events */
        const headerEl = this.shadowRoot.getElementById("header");
        headerEl.addEventListener("contextmenu", (event) => {
            this.contextmenuHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        headerEl.addEventListener("click", (event) => {
            this.clickHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    get hidden() {
        return this.getAttribute("hidden") != "false";
    }

    set hidden(val) {
        this.setAttribute("hidden", !!val);
    }

    get textRef() {
        const ref = this.ref;
        const cat = this.category;
        return cat ? `${cat}[${ref}]` : ref;
    }

    get category() {
        return "location";
    }

    clickHandler(/* event */) {
        const state = this.getState();
        if (state != null) {
            state.value = !state.value;
        }
    }

    applyDefaultValues() {
        /* access */
        this.applyAccess();
        /* visible */
        this.hidden = true;
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.typeIcon = "images/icons/location.svg";
            badgeEl.setFilterData();
        }
        /* item */
        this.applyItem();
    }

    applyStateValues(state) {
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = access.value;
        this.applyAccess(("" + accessValue).toLowerCase(), access);
        /* visible */
        this.hidden = !state.isVisible();
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.typeIcon = state.props.icon ?? "images/icons/location.svg";
            badgeEl.setFilterData(state.props.filter);
        }
        /* item */
        this.applyItem(state.itemData);
    }

    applyItem(itemData) {
        const itemEl = this.shadowRoot.getElementById("item");
        if (itemEl != null) {
            if (itemData != null) {
                itemEl.src = resolveIcon(itemData?.icon) ?? "/images/items/unknown.png";
                itemEl.text = itemData?.label ?? "";
                itemEl.valign = itemData?.valign ?? "center";
                itemEl.halign = itemData?.halign ?? "center";
            } else {
                itemEl.src = "";
                itemEl.text = "";
                itemEl.valign = "center";
                itemEl.halign = "center";
            }
        }
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        /* --- */
        if (this.ref) {
            const state = WorldStateManagerRegistry.get(this.category).get(this.ref);
            this.switchState(state);
            /* text */
            const textEl = this.shadowRoot.getElementById("text");
            if (textEl != null) {
                textEl.i18nValue = this.textRef;
            }
        }
    }

    getStateAccess(state) {
        return state.access;
    }

    applyAccess(value = "undefined", data = {}) {
        this.access = value;
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.access = value;
            badgeEl.available = data.reachable ?? 0;
            badgeEl.unopened = data.unopened ?? 0;
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get access() {
        return this.getAttribute("access");
    }

    set access(val) {
        this.setAttribute("access", val);
    }

    static get observedAttributes() {
        return ["ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = WorldStateManagerRegistry.get(this.category).get(this.ref);
                    this.switchState(state);
                    /* ref */
                    const refEl = this.shadowRoot.getElementById("ref");
                    if (refEl != null) {
                        refEl.innerText = this.ref;
                    }
                    /* text */
                    const textEl = this.shadowRoot.getElementById("text");
                    if (textEl != null) {
                        textEl.i18nValue = this.textRef;
                    }
                } break;
            }
        }
    }

    contextmenuHandler(event) {
        this.showDefaultContextMenu(event);
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

}

customElements.define("gt-locationlist-location", LocationListLocation);
UIRegistry.set("locationlist-location", new UIRegistry(LocationListLocation));
