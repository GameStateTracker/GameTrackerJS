import UIRegistry from "../../../../../registry/UIRegistry.js";
import ItemElement from "../abstract/ItemElement.js";
import TPL from "./Item.js.html" assert {type: "html"};
import STYLE from "./Item.js.css" assert {type: "css"};

export default class Item extends ItemElement {

    #valueEl;

    #iconEl;

    constructor() {
        super();
        this.#applyElements();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("max", () => {
            this.refreshValue();
        });
        /* --- */
        this.#valueEl = this.shadowRoot.getElementById("value");
        this.#iconEl = this.shadowRoot.getElementById("icon");
    }

    #applyElements() {
        const tooltipEl = this.shadowRoot.getElementById("tooltip");
        const tpl = TPL.generate();
        /* icon */
        const iconEl = tpl.getElementById("icon");
        tooltipEl.append(iconEl);
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
        if (typeof data.icon === "string") {
            const icon = this.#resolveIcon(data.icon, this.value);
            iconEl.style.backgroundImage = `url("${icon}")`;
        }
        // always active
        valueEl.classList.toggle("alwaysActive", !data.counting || !!data.alwaysCounting);
    }

    refreshValue() {
        const state = this.getState();
        const value = this.value;
        const maxValue = state?.max;
        const data = state?.props ?? {};
        if (data.counting) {
            if (Array.isArray(data.counting)) {
                this.#valueEl.innerHTML = data.counting[value];
            } else if (typeof data.counting == "string") {
                this.#valueEl.innerHTML = data.counting;
            } else if (data.showMax && maxValue != null) {
                this.#valueEl.innerHTML = `${value} / ${maxValue}`;
            } else {
                this.#valueEl.innerHTML = value;
            }
            this.#valueEl.classList.toggle("mark", state?.isMarked() ?? false);
        } else if (data.label) {
            if (Array.isArray(data.label)) {
                this.#valueEl.innerHTML = data.label[value];
            } else {
                this.#valueEl.innerHTML = data.label;
            }
        }
        // image
        const icon = this.#resolveIcon(data.icon, value);
        if (icon != null) {
            this.#iconEl.style.backgroundImage = `url('${icon}')`;
        } else {
            this.#iconEl.style.backgroundImage = "";
        }
    }

    #resolveIcon(icon, value = 0) {
        if (icon == null) {
            return null;
        }
        if (typeof icon == "object") {
            return icon[value] ?? icon[0];
        }
        return icon;
    }

}

customElements.define("gt-itemgrid-item", Item);
UIRegistry.set("itemgrid-item", new UIRegistry(Item));
