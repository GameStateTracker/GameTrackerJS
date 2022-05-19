// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import "/emcJS/ui/overlay/Tooltip.js";

import UIRegistry from "../../../../../registry/UIRegistry.js";
import WorldMapMarkedEntry from "../abstract/MarkedEntry.js";
import LocationContextMenu from "../../../../ctxmenu/LocationContextMenu.js";
import ItemPickerContextMenu from "../../../../ctxmenu/ItemPickerContextMenu.js";
import LogicViewer from "../../../../window/LogicViewer.js";
import Language from "../../../../../util/Language.js";

const TPL = new Template(`
<emc-labeledicon id="item" halign="center" valign="center"></emc-labeledicon>
`);

const STYLE = new GlobalStyle(`
:host {
    width: 32px;
    height: 32px;
    transform: translate(-16px, -16px);
}
#marker {
    border-radius: 50%;
}
#item {
    width: 32px;
    height: 32px;
    margin-left: 5px;
    font-size: 0.7em;
}
`);

function resolveIcon(icon) {
    if (Array.isArray(icon)) {
        return icon[0];
    } else {
        return icon;
    }
}

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    const itemEl = tpl.getElementById("item");
    textEl.insertAdjacentElement("afterend", itemEl);
}

export default class MapLocation extends WorldMapMarkedEntry {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        badgeEl.hideValues = true;
        /* state handler */
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
        this.addDefaultContextMenuHandler("show_logic", () => {
            const state = this.getState();
            if (state != null) {
                const title = Language.generateLabel(this.ref);
                LogicViewer.show(state.props.logicAccess, title);
            }
        });
        /* context menu - item picker */
        this.setContextMenu("itempicker", ItemPickerContextMenu);
        this.addContextMenuHandler("itempicker", "pick", event => {
            const state = this.getState();
            if (state != null) {
                state.item = event.item;
            }
        });
    }

    clickHandler(event) {
        const state = this.getState();
        if (state != null) {
            state.value = !state.value;
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/location.svg");
        this.applyItem();
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/location.svg");
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

    get left() {
        return this.getAttribute("left");
    }

    set left(val) {
        this.setAttribute("left", val);
    }

    get top() {
        return this.getAttribute("top");
    }

    set top(val) {
        this.setAttribute("top", val);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    set tooltip(val) {
        this.setAttribute("tooltip", val);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "left", "top", "tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "top":
                case "left":
                    this.style.left = `${this.left}px`;
                    this.style.top = `${this.top}px`;
                    break;
                case "tooltip":
                    {
                        const tooltip = this.shadowRoot.getElementById("tooltip");
                        tooltip.position = newValue;
                    }
                    break;
            }
        }
    }

    get textRef() {
        return `location[${super.textRef}]`;
    }

    get category() {
        return "location";
    }

}

customElements.define("gt-worldmap-location", MapLocation);
UIRegistry.set("worldmap-location", new UIRegistry(MapLocation));
