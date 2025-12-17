import SettingsObserver from "../util/observer/SettingsObserver.js";
import Badge from "./Badge.js";
import TPL from "./BadgeAccess.js.html" assert {type: "html"};
import STYLE from "./BadgeAccess.js.css" assert {type: "css"};

const accessValuesObserver = new SettingsObserver("show_access_values");

export default class BadgeAccess extends Badge {

    constructor() {
        super();
        this.shadowRoot.prepend(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const accessValuesEl = this.shadowRoot.getElementById("access-values");
        if (accessValuesEl != null) {
            accessValuesEl.style.display = accessValuesObserver.value ? "" : "none";
        }
        this.switchEventTarget("accessValues", accessValuesObserver);
        this.setEventTargetListener("accessValues", "change", (event) => {
            if (accessValuesEl != null) {
                accessValuesEl.style.display = event.value ? "" : "none";
            }
        });
    }

    set hideValues(val) {
        this.setBooleanAttribute("hidevalues", val);
    }

    get hideValues() {
        return this.getBooleanAttribute("hidevalues");
    }

    set available(val) {
        this.setAttribute("available", val);
    }

    get available() {
        return this.getAttribute("available");
    }

    set unopened(val) {
        this.setAttribute("unopened", val);
    }

    get unopened() {
        return this.getAttribute("unopened");
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "available", "unopened"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "available": {
                    const valueEl = this.shadowRoot.getElementById("available");
                    if (valueEl != null) {
                        const value = parseInt(newValue);
                        if (isNaN(value)) {
                            valueEl.innerHTML = 0;
                        } else {
                            valueEl.innerHTML = value;
                        }
                    }
                } break;
                case "unopened": {
                    const valueEl = this.shadowRoot.getElementById("unopened");
                    if (valueEl != null) {
                        const value = parseInt(newValue);
                        if (isNaN(value)) {
                            valueEl.innerHTML = 0;
                        } else {
                            valueEl.innerHTML = value;
                        }
                    }
                } break;
            }
        }
    }

}

customElements.define("gt-badge-access", BadgeAccess);
