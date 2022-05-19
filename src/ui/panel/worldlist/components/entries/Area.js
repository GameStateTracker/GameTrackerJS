// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import "/emcJS/ui/Icon.js";

import WorldListState from "../../../../../state/world/WorldListState.js";
import AccessStateEnum from "../../../../../enum/AccessStateEnum.js";
import UIRegistry from "../../../../../registry/UIRegistry.js";
import WorldListSubListElement from "../abstract/SubListElement.js";
import AccessTextMarkerMixin from "../mixin/AccessTextMarkerMixin.js";
import AccessListMarkerMixin from "../mixin/AccessListMarkerMixin.js";
import AreaContextMenu from "../../../../ctxmenu/AreaContextMenu.js";
import "../../../../../state/world/area/OverworldState.js";

const TPL = new Template(`
<div id="entrances"></div>
<div id="hint"></div>
`);

const STYLE = new GlobalStyle(`
#hint {
    margin-left: 5px;
}
#hint:empty {
    display: none;
}
#hint img {
    width: 25px;
    height: 25px;
}
#entrances {
    margin-right: 5px;
}
#entrances:empty {
    display: none;
}
#entrances img {
    width: 25px;
    height: 25px;
}
`);

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    /* entrances */
    const entrancesEl = tpl.getElementById("entrances");
    textEl.insertAdjacentElement("beforebegin", entrancesEl);
    /* hint */
    const hintEl = tpl.getElementById("hint");
    textEl.insertAdjacentElement("afterend", hintEl);
}

const BaseClass = mix(
    WorldListSubListElement
).with(
    AccessTextMarkerMixin,
    AccessListMarkerMixin
);

export default class WorldListArea extends BaseClass {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* state handler */
        this.registerStateHandler("hint", event => {
            this.applyHint(event.value);
        });
        /* context menu */
        this.setDefaultContextMenu(AreaContextMenu);
        this.addDefaultContextMenuHandler("goto", () => {
            const state = this.getState();
            if (state != null) {
                WorldListState.area = this.ref;
            }
        });
        this.addDefaultContextMenuHandler("check", () => {
            const state = this.getState();
            if (state != null) {
                state.setAllEntries(true);
            }
        });
        this.addDefaultContextMenuHandler("uncheck", () => {
            const state = this.getState();
            if (state != null) {
                state.setAllEntries(false);
            }
        });
        this.addDefaultContextMenuHandler("setwoth", () => {
            const state = this.getState();
            if (state != null) {
                state.hint = "woth";
            }
        });
        this.addDefaultContextMenuHandler("setbarren", () => {
            const state = this.getState();
            if (state != null) {
                state.hint = "barren";
            }
        });
        this.addDefaultContextMenuHandler("clearhint", () => {
            const state = this.getState();
            if (state != null) {
                state.hint = "";
            }
        });
    }

    clickHandler(event) {
        const state = this.getState();
        if (state != null && !state.listContents) {
            WorldListState.area = this.ref;
        } else {
            super.clickHandler(event);
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/area.svg");
        /* hint */
        this.applyHint();
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/area.svg");
        /* hint */
        this.applyHint(state.hint);
    }

    applyAccess(value = "unavailable", data = {}) {
        super.applyAccess(value, data);
        /* entrances */
        const entrancesEl = this.shadowRoot.getElementById("entrances");
        if (entrancesEl != null) {
            entrancesEl.innerHTML = "";
            if (data.entrances) {
                const el_icon = document.createElement("img");
                el_icon.src = `images/icons/entrance.svg`;
                entrancesEl.append(el_icon);
            }
        }
        /* collapsed */
        // TODO remember and restore collapsed state
        this.setCollapsed(data.value == AccessStateEnum.OPENED);
    }

    applyHint(hint = "") {
        const hintEl = this.shadowRoot.getElementById("hint");
        if (hintEl != null) {
            hintEl.innerHTML = "";
            if (hint) {
                const el_icon = document.createElement("img");
                el_icon.src = `images/icons/area_${hint}.svg`;
                hintEl.append(el_icon);
            }
        }
    }

    get category() {
        return "area";
    }

}

customElements.define("ootrt-list-area", WorldListArea);
UIRegistry.set("worldlist-area", new UIRegistry(WorldListArea));
