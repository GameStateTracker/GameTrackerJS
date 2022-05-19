// frameworks
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import "/emcJS/ui/overlay/Tooltip.js";
import "/emcJS/ui/Icon.js";

import WorldListState from "../../../../../state/world/WorldListState.js";
import DefaultAreaState from "../../../../../state/world/area/DefaultAreaState.js";
import UIRegistry from "../../../../../registry/UIRegistry.js";
import WorldMapMarkedEntry from "../abstract/MarkedEntry.js";
import ExitContextMenu from "../../../../ctxmenu/ExitContextMenu.js";
import ExitBindingContextMenu from "../../../../ctxmenu/ExitBindingContextMenu.js";

const TPL = new Template(`
<div id="area" class="textarea">
    <div id="entrances"></div>
    <emc-i18n-label id="value"></emc-i18n-label>
    <div id="hint"></div>
</div>
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
#value:empty:after {
    display: inline;
    font-style: italic;
    content: "no association";
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
    const tooltipEl = target.getElementById("tooltip");
    const tpl = TPL.generate();
    tooltipEl.append(tpl);
}

export default class MapExit extends WorldMapMarkedEntry {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* state handler */
        this.registerStateHandler("value", event => {
            this.applyValue(event.value);
        });
        this.registerStateHandler("hint", event => {
            this.applyHint(event.value);
        });
        /* context menu */
        this.setDefaultContextMenu(ExitContextMenu);
        this.addDefaultContextMenuHandler("associate", event => {
            const state = this.getState();
            const mnu_ctx = this.getDefaultContextMenu();
            const mnu_ext = this.getContextMenu("exitbinding");
            if (state != null) {
                mnu_ext.fillEntranceSelection(this.ref, state.value);
            } else {
                mnu_ext.fillEntranceSelection("", "");
            }
            mnu_ext.setValue(state.value);
            mnu_ext.show(mnu_ctx.left, mnu_ctx.top);
        });
        this.addDefaultContextMenuHandler("deassociate", event => {
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
        this.addDefaultContextMenuHandler("check", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.setAllEntries(true);
                }
            }
        });
        this.addDefaultContextMenuHandler("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.setAllEntries(false);
                }
            }
        });
        this.addDefaultContextMenuHandler("setwoth", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.hint = "woth";
                }
            }
        });
        this.addDefaultContextMenuHandler("setbarren", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.hint = "barren";
                }
            }
        });
        this.addDefaultContextMenuHandler("clearhint", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.hint = "";
                }
            }
        });
        /* context menu - exit binding */
        this.setContextMenu("exitbinding", ExitBindingContextMenu);
        this.addContextMenuHandler("exitbinding", "change", event => {
            const state = this.getState();
            if (state != null) {
                state.value = event.value;
            }
        });
    }

    clickHandler(event) {
        const state = this.getState();
        if (state != null) {
            const area = state.area;
            if (area instanceof DefaultAreaState) {
                if (!area.listContents) {
                    WorldListState.area = area.ref;
                } else {
                    super.clickHandler(event);
                }
            } else {
                this.showContextMenu("exitbinding", event, this.ref, state.value);
            }
        }
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/entrance.svg");
        /* value */
        this.applyValue();
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/entrance.svg");
        /* value */
        this.applyValue(state.value);
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
        /* value */
        const markerEl = this.shadowRoot.getElementById("marker");
        if (data.reachable > 0) {
            const state = this.getState();
            if (state?.area != null) {
                markerEl.innerHTML = data.reachable;
            } else {
                markerEl.innerHTML = "?";
            }
        } else {
            markerEl.innerHTML = "";
        }
    }

    applyValue = debounce((value = "") => {
        const valueEl = this.shadowRoot.getElementById("value");
        if (valueEl != null) {
            if (value) {
                valueEl.i18nValue = `entrance[${value}]`;
                const state = this.getState();
                if (state != null) {
                    this.applyHint(state.hint);
                } else {
                    this.applyHint();
                }
            } else {
                valueEl.innerHTML = "";
                this.applyHint();
            }
        }
    });

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
        return `exit[${super.textRef}]`;
    }

    get category() {
        return "exit";
    }

}

customElements.define("gt-worldmap-exit", MapExit);
UIRegistry.set("worldmap-exit", new UIRegistry(MapExit));
