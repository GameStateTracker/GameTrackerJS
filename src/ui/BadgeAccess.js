// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";

import SettingsObserver from "../util/observer/SettingsObserver.js";
import Badge from "./Badge.js";

const accessValuesObserver = new SettingsObserver("show_access_values");

const TPL = new Template(`
<div id="access-values">
    <div id="available">0</div>
    <div id="unopened">0</div>
</div>
`);

const STYLE = new GlobalStyle(`
#access-values {
    display: flex;
    flex-direction: column;
    width: 24px;
    height: 24px;
    margin: 1px;
}
#access-values div {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 24px;
    height: 12px;
    font-size: 0.5em;
    line-height: 1em;
    padding: 2px;
    white-space: pre;
    word-break: keep-all;
}
`);

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
        this.switchTarget("accessValues", accessValuesObserver);
        this.setTargetEventListener("accessValues", "change", event => {
            if (accessValuesEl != null) {
                accessValuesEl.style.display = event.value ? "" : "none";
            }
        });
    }

    get available() {
        return this.getAttribute("available");
    }

    set available(val) {
        this.setAttribute("available", val);
    }

    get unopened() {
        return this.getAttribute("unopened");
    }

    set unopened(val) {
        this.setAttribute("unopened", val);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "available", "unopened"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
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
