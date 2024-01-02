import UIRegistry from "../../../../../registry/UIRegistry.js";
import ItemElement from "../abstract/ItemElement.js";
import "./Item.js";
import TPL from "./Popout.js.html" assert {type: "html"};
import STYLE from "./Popout.js.css" assert {type: "css"};

function resolveIcon(icon, value = 0) {
    if (icon == null) {
        return "/images/items/unknown.png";
    }
    if (typeof icon == "object") {
        return icon[value] ?? icon[0] ?? "/images/items/unknown.png";
    }
    return icon;
}

function applyElements(target) {
    const tooltipEl = target.getElementById("tooltip");
    const tpl = TPL.generate();
    /* icon */
    const iconEl = tpl.getElementById("icon");
    tooltipEl.append(iconEl);
    /* slot */
    const slotEl = tpl.getElementById("slot");
    target.append(slotEl);
}

export default class Popout extends ItemElement {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("max", () => {
            this.refreshValue();
        });
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        const iconEl = this.shadowRoot.getElementById("icon");
        const valueEl = this.shadowRoot.getElementById("value");
        // icon
        iconEl.style.backgroundImage = "";
        // always active
        iconEl.classList.remove("alwaysActive");
        // always counting
        valueEl.classList.remove("alwaysActive");
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        const data = state.props;
        const iconEl = this.shadowRoot.getElementById("icon");
        const valueEl = this.shadowRoot.getElementById("value");
        // icon
        const icon = resolveIcon(data.icon, this.value);
        iconEl.style.backgroundImage = `url("${icon}")`;
        // always active
        iconEl.classList.toggle("alwaysActive", !!data.alwaysActive);
        // always counting
        valueEl.classList.toggle("alwaysActive", !data.counting || !!data.alwaysCounting);
    }

    refreshValue() {
        const state = this.getState();
        const value = this.value;
        const maxValue = state?.max;
        const data = state?.props ?? {};
        const valueEl = this.shadowRoot.getElementById("value");
        if (data.counting) {
            if (Array.isArray(data.counting)) {
                valueEl.innerHTML = data.counting[value];
            } else if (typeof data.counting == "string") {
                valueEl.innerHTML = data.counting;
            } else if (data.showMax && maxValue != null) {
                valueEl.innerHTML = `${value} / ${maxValue}`;
            } else {
                valueEl.innerHTML = value;
            }
            valueEl.classList.toggle("mark", state?.isMarked() ?? false);
        } else if (data.label) {
            if (Array.isArray(data.label)) {
                valueEl.innerHTML = data.label[value];
            } else {
                valueEl.innerHTML = data.label;
            }
        }
        // image
        const iconEl = this.shadowRoot.getElementById("icon");
        const icon = resolveIcon(data.icon, value);
        iconEl.style.backgroundImage = `url("${icon}")`;
    }

}

customElements.define("gt-itemgrid-popout", Popout);
UIRegistry.get("itemgrid-item")
    .register("popout", Popout);
