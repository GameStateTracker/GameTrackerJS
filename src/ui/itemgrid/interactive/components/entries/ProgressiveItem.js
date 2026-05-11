import UIRegistry from "../../../../../registry/UIRegistry.js";
import ItemElement from "../abstract/ItemElement.js";
import "./Item.js";
import TPL from "./ProgressiveItem.js.html" assert {type: "html"};
import STYLE from "./ProgressiveItem.js.css" assert {type: "css"};

export default class ProgressiveItem extends ItemElement {

    constructor() {
        super();
        this.#applyElements();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("max", () => {
            this.#fillItemChoices();
        });
        this.registerStateHandler("min", () => {
            this.#fillItemChoices();
        });
        this.registerStateHandler("start", () => {
            this.#fillItemChoices();
        });
    }

    #applyElements() {
        const tooltipEl = this.shadowRoot.getElementById("tooltip");
        const tpl = TPL.generate();
        /* value */
        const slotEl = tpl.getElementById("slot");
        tooltipEl.append(slotEl);
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        // choices
        this.#fillItemChoices();
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        // choices
        this.#fillItemChoices();
    }

    refreshValue() {
        const activeEl = this.querySelector(".active");
        if (activeEl != null) {
            activeEl.classList.remove("active");
        }
        const newEl = this.querySelector(`[value="${this.value ?? ""}"]`);
        if (newEl != null) {
            newEl.classList.add("active");
        }
    }

    #fillItemChoices() {
        this.innerHTML = "";
        const state = this.getState();
        if (state != null) {
            for (let value = state.min; value <= state.max; ++value) {
                const icon = this.#resolveIcon(state.props.icon, value);
                const opt = this.#createOption(value, icon, state.props, state.max);
                if (value == this.value) {
                    opt.classList.add("active");
                }
                // always active
                opt.classList.toggle("alwaysActive", !!state.props.alwaysActive);
                this.append(opt);
            }
        } else {
            const opt = document.createElement("div");
            opt.setAttribute("value", 0);
            opt.classList.add("active");
            this.append(opt);
        }
    }

    #createOption(value, icon, data, maxValue) {
        const optionEl = document.createElement("div");
        optionEl.setAttribute("value", value);
        if (icon != null) {
            optionEl.style.backgroundImage = `url('${icon}')`;
        }
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

customElements.define("gt-itemgrid-progressiveitem", ProgressiveItem);
UIRegistry.get("itemgrid-item")
    .register("progressive", ProgressiveItem)
    .register("progressive_startsettings", ProgressiveItem);
