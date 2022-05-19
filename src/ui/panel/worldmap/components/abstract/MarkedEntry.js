// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import "/emcJS/ui/Icon.js";

import WorldMapStateEntry from "./StateEntry.js";
import Badge from "../../../../Badge.js";
import "../../../../BadgeAccess.js";

const TPL = new Template(`
<gt-badge-access id="badge"></gt-badge-access>
`);

const STYLE = new GlobalStyle(`
#text[data-state="opened"] {
    color: var(--location-status-opened-color, var(--page-text-color, #000000));
}
#text[data-state="available"] {
    color: var(--location-status-available-color, var(--page-text-color, #000000));
}
#text[data-state="unavailable"] {
    color: var(--location-status-unavailable-color, var(--page-text-color, #000000));
}
#text[data-state="possible"] {
    color: var(--location-status-possible-color, var(--page-text-color, #000000));
}
#marker[data-state="opened"] {
    background-color: var(--location-status-opened-color, var(--page-text-color, #000000));
}
#marker[data-state="available"] {
    background-color: var(--location-status-available-color, var(--page-text-color, #000000));
}
#marker[data-state="unavailable"] {
    background-color: var(--location-status-unavailable-color, var(--page-text-color, #000000));
}
#marker[data-state="possible"] {
    background-color: var(--location-status-possible-color, var(--page-text-color, #000000));
}
`);

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    const badgeEl = tpl.getElementById("badge");
    textEl.insertAdjacentElement("afterend", badgeEl);
}

export default class WorldMapMarkedEntry extends WorldMapStateEntry {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
    }

    applyDefaultValues(defaultIcon) {
        super.applyDefaultValues();
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl instanceof Badge) {
            badgeEl.typeIcon = defaultIcon;
            badgeEl.setFilterData();
        }
    }

    applyStateValues(state, defaultIcon) {
        super.applyStateValues(state);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl instanceof Badge) {
            badgeEl.typeIcon = state.props.icon ?? defaultIcon;
            badgeEl.setFilterData(state.props.filter);
        }
    }

    applyAccess(value = "unavailable", data = {}) {
        super.applyAccess(value, data);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl instanceof Badge) {
            badgeEl.access = value;
            badgeEl.available = data.reachable ?? 0;
            badgeEl.unopened = data.unopened ?? 0;
        }
    }

}
