// frameworks
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import HTMLTemplate from "/emcJS/util/html/template/HTMLTemplate.js";
import CSSTemplate from "/emcJS/util/html/template/CSSTemplate.js";
import "/emcJS/ui/overlay/Tooltip.js";
import "/emcJS/ui/icon/Icon.js";

import WorldListState from "../../../../../state/world/WorldListState.js";
import DefaultAreaState from "../../../../../state/world/area/DefaultAreaState.js";
import UIRegistry from "../../../../../registry/UIRegistry.js";
import WorldMapMarkedEntry from "../abstract/MarkedEntry.js";
import ExitContextMenu from "../../../../ctxmenu/ExitContextMenu.js";
import ExitBindingContextMenu from "../../../../ctxmenu/ExitBindingContextMenu.js";

const TPL = new HTMLTemplate(`
<div id="canenter">
    <img src="images/icons/entrance.svg" />
</div>
<div id="area" class="textarea">
    <emc-i18n-label id="value"></emc-i18n-label>
    <div id="entrances">
        <img src="images/icons/entrance.svg" />
    </div>
    <div id="hint"></div>
    <div id="tags"></div>
</div>
`);

const STYLE = new CSSTemplate(`
:host {
    --size: 48px;
    --rotation: 0deg;
    --border-radius: 50% 50% 5% 5%;
}
#marker[data-canenter="true"]::before {
    position: absolute;
    left: -2px;
    top: -2px;
    width: 10px;
    height: 10px;
    background-color: var(--world-entry-status-available-color, #00ff00);
    border: solid 4px black;
    border-radius: 0%;
    transform: rotate(45deg);
    transform-origin: center;
    content: " ";
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
#canenter,
#entrances {
    display: none;
    margin-right: 5px;
}
#canenter.active,
#entrances.active {
    display: block;
}
#canenter img,
#entrances img {
    width: 25px;
    height: 25px;
}
#tags {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 2px;
    margin-left: 5px;
    border: 1px solid var(--navigation-back-color, #ffffff);
    border-radius: 2px;
    font-size: 16px;
    user-select: none;
}
#tags:empty {
    display: none;
}
#tags emc-labeledicon {
    width: 24px;
    height: 24px;
    margin: 1px;
}
`);

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tooltipEl = target.getElementById("tooltip");
    const tpl = TPL.generate();
    /* can enter */
    const canenterEl = tpl.getElementById("canenter");
    textEl.insertAdjacentElement("beforebegin", canenterEl);
    /* area */
    const areaEl = tpl.getElementById("area");
    tooltipEl.append(areaEl);
}

export default class WorldMapExit extends WorldMapMarkedEntry {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* state handler */
        this.registerStateHandler("value", (event) => {
            this.applyValue(event.value);
        });
        this.registerStateHandler("hint", (event) => {
            this.applyHint(event.value);
        });
        this.registerStateHandler("reachable", (event) => {
            /* can enter */
            const markerEl = this.shadowRoot.getElementById("marker");
            const canenterEl = this.shadowRoot.getElementById("canenter");
            if (canenterEl != null) {
                if (event.value) {
                    canenterEl.classList.add("active");
                } else {
                    canenterEl.classList.remove("active");
                }
            }
            if (markerEl != null) {
                markerEl.dataset["canenter"] = !!event.value;
            }
        });
        /* context menu */
        this.setDefaultContextMenu(ExitContextMenu);
        this.addDefaultContextMenuHandler("bind", (event) => {
            const state = this.getState();
            if (state != null) {
                this.showContextMenu("exitbinding", event, this.ref, state.value);
            }
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
        this.addDefaultContextMenuHandler("check", () => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.setAllChecked(true);
                }
            }
        });
        this.addDefaultContextMenuHandler("check_reachable", () => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    state.setAllReachableChecked(true);
                }
            }
        });
        this.addDefaultContextMenuHandler("uncheck", () => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.setAllChecked(false);
                }
            }
        });
        this.addDefaultContextMenuHandler("setwoth", () => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.hint = "woth";
                }
            }
        });
        this.addDefaultContextMenuHandler("setbarren", () => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.hint = "barren";
                }
            }
        });
        this.addDefaultContextMenuHandler("clearhint", () => {
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
        this.addContextMenuHandler("exitbinding", "change", (event) => {
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
                WorldListState.area = area.ref;
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
        /* can enter */
        const markerEl = this.shadowRoot.getElementById("marker");
        const canenterEl = this.shadowRoot.getElementById("canenter");
        if (canenterEl != null) {
            canenterEl.classList.remove("active");
        }
        if (markerEl != null) {
            markerEl.dataset["canenter"] = false;
        }
        /* value */
        this.applyValue();
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/entrance.svg");
        /* can enter */
        const markerEl = this.shadowRoot.getElementById("marker");
        const canenterEl = this.shadowRoot.getElementById("canenter");
        if (canenterEl != null) {
            if (state.reachable) {
                canenterEl.classList.add("active");
            } else {
                canenterEl.classList.remove("active");
            }
        }
        if (markerEl != null) {
            markerEl.dataset["canenter"] = !!state.reachable;
        }
        /* value */
        this.applyValue(state.value);
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
            const state = this.getState();
            if (state?.area != null) {
                if (data.reachable) {
                    markerEl.innerHTML = data.reachable;
                } else {
                    markerEl.innerHTML = "";
                }
            } else {
                markerEl.innerHTML = "?";
            }
        }
    }

    applyValue = debounce((value = "") => {
        const valueEl = this.shadowRoot.getElementById("value");
        const tagsEl = this.shadowRoot.getElementById("tags");
        tagsEl.innerHTML = "";
        if (valueEl != null) {
            if (value) {
                if (value == "0") {
                    this.toggleDefaultContextMenuGroupActive("area", false);
                } else {
                    this.toggleDefaultContextMenuGroupActive("area", true);
                }
                valueEl.i18nValue = `entrance[${value}]`;
                const state = this.getState();
                if (state != null) {
                    this.applyHint(state.hint);
                    // area - tags
                    const areaContentHints = state.area?.props.areaContentHints;
                    if (areaContentHints) {
                        const areaTagConfig = WorldListState.config.areaContentHints;
                        for (const tag in areaContentHints) {
                            const value = parseInt(areaContentHints[tag]);
                            if (!isNaN(value) && value > 0) {
                                const areaTagData = areaTagConfig[tag];
                                if (areaTagData != null) {
                                    const tagEl = document.createElement("emc-labeledicon");
                                    tagEl.src = areaTagData.icon;
                                    if (areaTagData.counting) {
                                        tagEl.text = value;
                                        tagEl.halign = "end";
                                        tagEl.valign = "end";
                                    }
                                    tagsEl.append(tagEl);
                                }
                            }
                        }
                    }
                } else {
                    this.applyHint();
                }
            } else {
                this.toggleDefaultContextMenuGroupActive("area", false);
                valueEl.i18nValue = "entrance[]";
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

    get textRef() {
        return `exit[${super.textRef}]`;
    }

    get type() {
        return "Exit";
    }

}

customElements.define("gt-worldmap-exit", WorldMapExit);
UIRegistry.set("worldmap-exit", new UIRegistry(WorldMapExit));
