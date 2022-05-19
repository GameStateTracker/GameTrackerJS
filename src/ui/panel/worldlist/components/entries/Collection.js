// frameworks
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import "/emcJS/ui/Icon.js";

import AccessStateEnum from "../../../../../enum/AccessStateEnum.js";
import UIRegistry from "../../../../../registry/UIRegistry.js";
import WorldListSubList from "../abstract/SubList.js";

const STYLE = new GlobalStyle(`
:host() {
    box-shadow:
        inset 0 0 0px 2px var(--page-background-color, #ffffff),
        inset 0 0 1px 3px var(--page-text-color, #000000);
}
:host(:empty) {
    display: none;
}
`);

export default class WorldListCollection extends WorldListSubList {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        /* collapsed */
        this.setCollapsed(true);
    }

    applyAccess(value = "unavailable", data = {}) {
        super.applyAccess(value, data);
        /* collapsed */
        // TODO remember and restore collapsed state
        if (!!data.entrances || data.value != AccessStateEnum.OPENED) {
            this.setCollapsed(false);
        }
    }

    get category() {
        return "collection";
    }

}

customElements.define("gt-worldlist-collection", WorldListCollection);
UIRegistry.set("worldlist-collection", new UIRegistry(WorldListCollection));
