// frameworks
import Template from "/emcJS/util/html/Template.js";

import WorldListSubList from "./SubList.js";
import "../../../../BadgeAccess.js";

const TPL = new Template(`
<gt-badge-access id="badge"></gt-badge-access>
`);

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    /* badge */
    const badgeEl = tpl.getElementById("badge");
    textEl.insertAdjacentElement("afterend", badgeEl);
}

export default class WorldListSubListElement extends WorldListSubList {

    constructor() {
        super();
        applyElements(this.shadowRoot);
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
