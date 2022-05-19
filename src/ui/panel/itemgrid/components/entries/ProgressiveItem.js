// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import "/emcJS/ui/input/Option.js";

// GameTrackerJS
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import ItemElement from "../abstract/ItemElement.js";
import "./Item.js";

const TPL = new Template(`
<slot id="slot">
</slot>
`);

const STYLE = new GlobalStyle(`
#slot {
    width: 100%;
    height: 100%;
}
::slotted(:not([value])),
::slotted([value]:not(.active)) {
    display: none !important;
}
::slotted([value]) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 2px;
    color: white;
    font-size: 0.8em;
    text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: border-box;
    flex-grow: 0;
    flex-shrink: 0;
    min-height: 0;
    white-space: normal;
    line-height: 0.7em;
    font-weight: bold;
    word-break: normal;
    filter:
        contrast(var(--shallow-item-contrast, 0.8))
        saturate(var(--shallow-item-saturate, 0.5))
        brightness(var(--shallow-item-brightness, 0.4));
}
#slot.alwaysActive ::slotted([value]),
::slotted([value]:not([value="0"])) {
    filter:
        contrast(var(--solid-item-contrast, 1))
        saturate(var(--solid-item-saturate, 1))
        brightness(var(--solid-item-brightness, 1));
}
::slotted([value]:hover) {
    background-size: 100%;
}
::slotted([value].mark) {
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

function createOption(value, icon, data, maxValue) {
    const optionEl = document.createElement("emc-option");
    optionEl.value = value;
    optionEl.style.backgroundImage = `url("${icon}")`;
    if (data.counting) {
        if (Array.isArray(data.counting)) {
            optionEl.innerHTML = data.counting[value];
        } else if (typeof data.counting == "string") {
            optionEl.innerHTML = data.counting;
        } else if (value > 0 || data.alwaysCounting) {
            if (data.showMax) {
                optionEl.innerHTML = `${value} / ${maxValue}`;
            } else {
                optionEl.innerHTML = value;
            }
        }
        if (data.mark !== false) {
            const mark = parseInt(data.mark);
            if (value >= maxValue || (!isNaN(mark) && value >= mark)) {
                optionEl.classList.add("mark");
            }
        }
    } else if (data.label) {
        if (Array.isArray(data.label)) {
            optionEl.innerHTML = data.label[value];
        } else if (typeof data.label == "string") {
            optionEl.innerHTML = data.label;
        }
    }
    return optionEl;
}

function applyElements(target) {
    const tooltipEl = target.getElementById("tooltip");
    const tpl = TPL.generate();
    /* value */
    const slotEl = tpl.getElementById("slot");
    tooltipEl.append(slotEl);
}

export default class ProgressiveItem extends ItemElement {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("max", event => {
            this.#fillItemChoices();
        });
        this.registerStateHandler("min", event => {
            this.#fillItemChoices();
        });
        this.registerStateHandler("start", event => {
            this.#fillItemChoices();
        });
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        const slotEl = this.shadowRoot.getElementById("slot");
        // choices
        this.#fillItemChoices();
        // always active
        slotEl.classList.remove("alwaysActive");
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        const data = state.props;
        const slotEl = this.shadowRoot.getElementById("slot");
        // choices
        this.#fillItemChoices();
        // always active
        slotEl.classList.toggle("alwaysActive", !!data.alwaysActive);
    }

    refreshValue() {
        const activeEl = this.querySelector(".active");
        if (activeEl != null) {
            activeEl.classList.remove("active");
        }
        const newEl = this.querySelector(`[value="${this.value}"]`);
        if (newEl != null) {
            newEl.classList.add("active");
        }
    }

    #fillItemChoices() {
        this.innerHTML = "";
        const state = this.getState();
        if (state != null) {
            for (let value = state.min; value <= state.max; ++value) {
                const icon = resolveIcon(state.props.icon, value);
                const opt = createOption(value, icon, state.props, state.max);
                if (value == this.value) {
                    opt.classList.add("active");
                }
                this.append(opt);
            }
        } else {
            const opt = document.createElement("emc-option");
            opt.value = 0;
            opt.style.backgroundImage = `url("/images/items/unknown.png")`;
            opt.classList.add("active");
            this.append(opt);
        }
    }

}

customElements.define("gt-itemgrid-progressiveitem", ProgressiveItem);
UIRegistry.get("itemgrid-item")
    .register("progressive", ProgressiveItem)
    .register("progressive_startsettings", ProgressiveItem);
