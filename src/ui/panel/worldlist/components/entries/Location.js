// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import "/emcJS/ui/LabeledIcon.js";

import UIRegistry from "../../../../../registry/UIRegistry.js";
import WorldListElement from "../abstract/Element.js";
import AccessTextMarkerMixin from "../mixin/AccessTextMarkerMixin.js";
import LocationContextMenu from "../../../../ctxmenu/LocationContextMenu.js";
import ItemPickerContextMenu from "../../../../ctxmenu/ItemPickerContextMenu.js";
import LogicViewer from "../../../../window/LogicViewer.js";
import Language from "../../../../../util/Language.js";

const TPL = new Template(`
<emc-labeledicon id="item" halign="center" valign="center"></emc-labeledicon>
`);

const STYLE = new GlobalStyle(`
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

const BaseClass = mix(
    WorldListElement
).with(
    AccessTextMarkerMixin
);

export default class WorldListLocation extends BaseClass {

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
        this.addContextMenuHandler("itempicker", "pick", (event) => {
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

    get category() {
        return "location";
    }

}

customElements.define("gt-worldlist-location", WorldListLocation);
UIRegistry.set("worldlist-location", new UIRegistry(WorldListLocation));
