// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import "/emcJS/ui/overlay/Tooltip.js";
import "/emcJS/ui/Icon.js";

import WorldListState from "../../../../../state/world/WorldListState.js";
import UIRegistry from "../../../../../registry/UIRegistry.js";
import WorldMapMarkedEntry from "../abstract/MarkedEntry.js";
import AreaContextMenu from "../../../../ctxmenu/AreaContextMenu.js";
import "../../../../../state/world/area/OverworldState.js";

const TPL = new Template(`
<div id="entrances"></div>
<div id="hint"></div>
`);

const STYLE = new GlobalStyle(`
:host {
    width: 48px;
    height: 48px;
    transform: translate(-24px, -24px);
}
#marker {
    border-radius: 25%;
}
#marker[data-entrances="true"]:after {
    position: absolute;
    right: -2px;
    bottom: -2px;
    width: 10px;
    height: 10px;
    background-color: var(--location-status-available-color, , var(--page-text-color, #000000));
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

export default class MapArea extends WorldMapMarkedEntry {

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
        this.addDefaultContextMenuHandler("check", event => {
            const state = this.getState();
            if (state != null) {
                state.setAllEntries(true);
            }
        });
        this.addDefaultContextMenuHandler("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                state.setAllEntries(false);
            }
        });
        this.addDefaultContextMenuHandler("setwoth", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "woth";
            }
        });
        this.addDefaultContextMenuHandler("setbarren", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "barren";
            }
        });
        this.addDefaultContextMenuHandler("clearhint", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "";
            }
        });
    }

    clickHandler() {
        const state = this.getState();
        if (state != null && !state.listContents) {
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
        const markerEl = this.shadowRoot.getElementById("marker");
        const entrancesEl = this.shadowRoot.getElementById("entrances");
        /* entrances */
        entrancesEl.innerHTML = "";
        if (data.entrances) {
            const el_icon = document.createElement("img");
            el_icon.src = `images/icons/entrance.svg`;
            entrancesEl.append(el_icon);
        }
        markerEl.dataset["entrances"] = !!data.entrances;
        /* value */
        if (data.reachable > 0) {
            markerEl.innerHTML = data.reachable;
        } else {
            markerEl.innerHTML = "";
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
        switch (name) {
            case "top":
            case "left":
                if (oldValue != newValue) {
                    this.style.left = `${this.left}px`;
                    this.style.top = `${this.top}px`;
                }
                break;
            case "tooltip":
                if (oldValue != newValue) {
                    const tooltip = this.shadowRoot.getElementById("tooltip");
                    tooltip.position = newValue;
                }
                break;
        }
    }

    get textRef() {
        return `area[${super.textRef}]`;
    }

    get category() {
        return "area";
    }

}

customElements.define("gt-worldmap-area", MapArea);
UIRegistry.set("worldmap-area", new UIRegistry(MapArea));
