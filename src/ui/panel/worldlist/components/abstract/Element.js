// frameworks
import Template from "/emcJS/util/html/Template.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import ContextMenuManagerMixin from "/emcJS/ui/overlay/ctxmenu/ContextMenuManagerMixin.js";

import WorldListStateEntry from "./StateEntry.js";
import "../../../../Badge.js";

const TPL = new Template(`
<gt-badge id="badge"></gt-badge>
`);

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    const badgeEl = tpl.getElementById("badge");
    textEl.insertAdjacentElement("afterend", badgeEl);
}

const BaseClass = mix(
    WorldListStateEntry
).with(
    ContextMenuManagerMixin
);

export default class WorldListElement extends BaseClass {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        /* mouse events */
        const headerEl = this.shadowRoot.getElementById("header");
        headerEl.addEventListener("contextmenu", (event) => {
            this.contextmenuHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    contextmenuHandler(event) {
        this.showDefaultContextMenu(event);
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    applyDefaultValues(defaultIcon) {
        super.applyDefaultValues();
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.typeIcon = defaultIcon;
            badgeEl.setFilterData();
        }
    }

    applyStateValues(state, defaultIcon) {
        super.applyStateValues(state);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.typeIcon = state.props.icon ?? defaultIcon;
            badgeEl.setFilterData(state.props.filter);
        }
    }

    applyAccess(value = "unavailable", data = {}) {
        super.applyAccess(value, data);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.access = value;
            badgeEl.available = data.reachable ?? 0;
            badgeEl.unopened = data.unopened ?? 0;
        }
    }

}
