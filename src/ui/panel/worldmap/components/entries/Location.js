// frameworks
import HTMLTemplate from "@emcjs/fe/util/template/HTMLTemplate.js";
import CSSTemplate from "@emcjs/fe/util/template/CSSTemplate.js";

import UIRegistry from "../../../../../registry/UIRegistry.js";
import WorldMapMarkedEntry from "../abstract/MarkedEntry.js";
import LocationContextMenu from "../../../../ctxmenu/LocationContextMenu.js";
import ItemPickerContextMenu from "../../../../ctxmenu/ItemPickerContextMenu.js";

const TPL = new HTMLTemplate(`
<emc-labeledicon id="item" halign="end" valign="end"></emc-labeledicon>
`);

const STYLE = new CSSTemplate(`
:host {
    --size: 32px;
    --rotation: 0deg;
    --border-radius: 50%;
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

export default class WorldMapLocation extends WorldMapMarkedEntry {

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
        /* context menu - item picker */
        this.setContextMenu("itempicker", ItemPickerContextMenu);
        this.addContextMenuHandler("itempicker", "pick", (event) => {
            const state = this.getState();
            if (state != null) {
                state.item = event.item;
            }
        });
    }

    clickHandler(/* event */) {
        const state = this.getState();
        if (state != null) {
            state.value = !state.value;
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("/images/icons/location.svg");
        this.applyItem();
    }

    applyStateValues(state) {
        super.applyStateValues(state, "/images/icons/location.svg");
        this.applyItem(state.itemData);
    }

    applyItem(itemData) {
        const itemEl = this.shadowRoot.getElementById("item");
        if (itemEl != null) {
            if (itemData != null) {
                itemEl.src = resolveIcon(itemData?.icon) ?? "/images/items/unknown.png";
                itemEl.text = itemData?.label ?? "";
            } else {
                itemEl.src = "";
                itemEl.text = "";
            }
        }
    }

    get textRef() {
        return `location[${super.textRef}]`;
    }

    get type() {
        return "Location";
    }

}

customElements.define("gt-worldmap-location", WorldMapLocation);
UIRegistry.set("worldmap-location", new UIRegistry(WorldMapLocation));
