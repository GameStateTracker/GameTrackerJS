// frameworks
import {
    mix
} from "/emcJS/util/Mixin.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import "/emcJS/ui/Icon.js";

import WorldListState from "../../../../../state/world/WorldListState.js";
import DefaultAreaState from "../../../../../state/world/area/DefaultAreaState.js";
import AccessStateEnum from "../../../../../enum/AccessStateEnum.js";
import UIRegistry from "../../../../../registry/UIRegistry.js";
import WorldListSubListElement from "../abstract/SubListElement.js";
import AccessTextMarkerMixin from "../mixin/AccessTextMarkerMixin.js";
import AccessListMarkerMixin from "../mixin/AccessListMarkerMixin.js";
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
    const headerEl = target.getElementById("header");
    const tpl = TPL.generate();
    headerEl.append(tpl);
}

const BaseClass = mix(
    WorldListSubListElement
).with(
    AccessTextMarkerMixin,
    AccessListMarkerMixin
);

export default class WorldListExit extends BaseClass {

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
        this.addDefaultContextMenuHandler("associate", (event) => {
            const state = this.getState();
            this.showContextMenu("exitbinding", event, this.ref, state.value);
        });
        this.addDefaultContextMenuHandler("deassociate", () => {
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
                    area.setAllEntries(true);
                }
            }
        });
        this.addDefaultContextMenuHandler("uncheck", () => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.setAllEntries(false);
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
                if (!area.listContents) {
                    WorldListState.area = area.ref;
                } else {
                    super.clickHandler(event);
                }
            } else {
                this.showContextMenu("exitbinding", event, this.ref, state.value);
            }
        }
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
        /* collapsed */
        // TODO remember and restore collapsed state
        this.setCollapsed(data.value == AccessStateEnum.OPENED);
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
        this.refreshList();
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

    get category() {
        return "exit";
    }

}

customElements.define("ootrt-list-exit", WorldListExit);
UIRegistry.set("worldlist-exit", new UIRegistry(WorldListExit));
