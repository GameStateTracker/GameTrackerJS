// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";

import UIRegistry from "../../../../../registry/UIRegistry.js";
import ItemElement from "../abstract/ItemElement.js";

const TPL = new Template(`
<div id="icon">
    <div id="value"></div>
</div>
`);

const STYLE = new GlobalStyle(`
#icon {
    width: 100%;
    height: 100%;
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: border-box;
    filter:
        contrast(var(--shallow-item-contrast, 0.8))
        saturate(var(--shallow-item-saturate, 0.5))
        brightness(var(--shallow-item-brightness, 0.4));
}
#icon.alwaysActive,
:host([value]:not([value="0"])) #icon {
    filter:
        contrast(var(--solid-item-contrast, 1))
        saturate(var(--solid-item-saturate, 1))
        brightness(var(--solid-item-brightness, 1));
}
:host(:hover) #icon {
    background-size: 100%;
}
#value {
    display: none;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 2px;
    color: white;
    font-size: 0.8em;
    text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
    flex-grow: 0;
    flex-shrink: 0;
    min-height: 0;
    white-space: normal;
    line-height: 0.7em;
    font-weight: bold;
    word-break: normal;
}
#value.alwaysActive,
:host([value]:not([value="0"])) #value {
    display: inline-flex;
}
#value.mark {
    color: #54ff54;
}
`);

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
}

export default class Item extends ItemElement {

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

customElements.define("gt-itemgrid-item", Item);
UIRegistry.set("itemgrid-item", new UIRegistry(Item));
