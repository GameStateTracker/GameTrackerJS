// frameworks
import HTMLTemplate from "/emcJS/util/html/template/HTMLTemplate.js";
import GlobalStyle from "/emcJS/util/html/template/CSSTemplate.js";
import "/emcJS/ui/overlay/Tooltip.js";
import "/emcJS/ui/icon/Icon.js";

import WorldListState from "../../../../../state/world/WorldListState.js";
import UIRegistry from "../../../../../registry/UIRegistry.js";
import WorldMapMarkedEntry from "../abstract/MarkedEntry.js";
import AreaContextMenu from "../../../../ctxmenu/AreaContextMenu.js";
import "../../../../../state/world/area/OverworldState.js";

const TPL = new HTMLTemplate(`
<div id="entrances">
    <img src="images/icons/entrance.svg" />
</div>
<div id="hint"></div>
`);

const STYLE = new GlobalStyle(`
:host {
    --size: 48px;
    --rotation: 0deg;
    --border-radius: 25%;
}
#marker[data-entrances="true"]::after {
    position: absolute;
    right: -2px;
    bottom: -2px;
    width: 10px;
    height: 10px;
    background-color: var(--world-entry-status-available-color, #00ff00);
    border: solid 4px black;
    border-radius: 50%;
    content: " ";
}
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
    display: none;
    margin-right: 5px;
}
#entrances.active {
    display: block;
}
#entrances img {
    width: 25px;
    height: 25px;
}
`);

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    /* hint */
    const hintEl = tpl.getElementById("hint");
    textEl.insertAdjacentElement("afterend", hintEl);
    /* entrances */
    const entrancesEl = tpl.getElementById("entrances");
    textEl.insertAdjacentElement("afterend", entrancesEl);
}

export default class WorldMapArea extends WorldMapMarkedEntry {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* state handler */
        this.registerStateHandler("hint", (event) => {
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
                state.setAllChecked(true);
            }
        });
        this.addDefaultContextMenuHandler("check_reachable", () => {
            const state = this.getState();
            if (state != null) {
                state.setAllReachableChecked(true);
            }
        });
        this.addDefaultContextMenuHandler("uncheck", () => {
            const state = this.getState();
            if (state != null) {
                state.setAllChecked(false);
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

    clickHandler() {
        const state = this.getState();
        if (state != null) {
            WorldListState.area = this.ref;
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
            if (data.entrances) {
                entrancesEl.classList.add("active");
            } else {
                entrancesEl.classList.remove("active");
            }
        }
        const markerEl = this.shadowRoot.getElementById("marker");
        if (markerEl != null) {
            markerEl.dataset["entrances"] = !!data.entrances;
            /* value */
            if (data.reachable > 0) {
                markerEl.innerHTML = data.reachable;
            } else {
                markerEl.innerHTML = "";
            }
        }
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

    get textRef() {
        return `area[${super.textRef}]`;
    }

    get type() {
        return "Area";
    }

}

customElements.define("gt-worldmap-area", WorldMapArea);
UIRegistry.set("worldmap-area", new UIRegistry(WorldMapArea));
