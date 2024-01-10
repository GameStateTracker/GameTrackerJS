import CustomElement from "/emcJS/ui/element/CustomElement.js";
import UIRegistry from "../../../../../registry/UIRegistry.js";
import ItemsResource from "../../../../../data/resource/ItemsResource.js";
import "/emcJS/ui/input/Option.js";
import "/emcJS/ui/i18n/I18nTooltip.js";
import "../../../../../state/item/StartSettingsState.js";
import TPL from "./ItemMirror.js.html" assert {type: "html"};
import STYLE from "./ItemMirror.js.css" assert {type: "css"};

export default class ItemMirror extends CustomElement {

    #tooltipEl;

    #iconEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#tooltipEl = this.shadowRoot.getElementById("tooltip");
        this.#iconEl = this.shadowRoot.getElementById("icon");
    }

    set ref(val) {
        if (val != null) {
            this.setAttribute("ref", val);
        } else {
            this.removeAttribute("ref");
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set icon(val) {
        if (val != null) {
            this.setAttribute("icon", val);
        } else {
            this.removeAttribute("icon");
        }
    }

    get icon() {
        return this.getAttribute("icon");
    }

    set halign(val) {
        if (val === "center" || val === "start" || val === "end") {
            this.setAttribute("halign", val);
        } else {
            this.removeAttribute("halign");
        }
    }

    get halign() {
        return this.getAttribute("halign");
    }

    set valign(val) {
        if (val === "center" || val === "start" || val === "end") {
            this.setAttribute("valign", val);
        } else {
            this.removeAttribute("valign");
        }
    }

    get valign() {
        return this.getAttribute("halign");
    }

    set tooltip(val) {
        if (val != null) {
            this.setAttribute("tooltip", val);
        } else {
            this.removeAttribute("tooltip");
        }
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    static get observedAttributes() {
        return ["ref", "icon", "tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    this.innerHTML = "";
                    const items = ItemsResource.get();
                    const data = items[newValue];
                    if (data != null) {
                        const el = UIRegistry.get("itemgrid-item").create(data.type, newValue);
                        el.noValue = true;
                        el.addEventListener("click", (event) => {
                            event.stopPropagation();
                            this.dispatchEvent(new MouseEvent("click", event));
                        }, true);
                        el.addEventListener("contextmenu", (event) => {
                            event.stopPropagation();
                            this.dispatchEvent(new MouseEvent("contextmenu", event));
                        }, true);
                        this.append(el);
                    }
                } break;
                case "icon": {
                    if (newValue != null) {
                        this.#iconEl.style.backgroundImage = `url('${newValue}')`;
                    } else {
                        this.#iconEl.style.backgroundImage = "";
                    }
                } break;
                case "tooltip": {
                    this.#tooltipEl.i18nTooltip = newValue;
                } break;
            }
        }
    }

    get textRef() {
        return `item[${this.ref}]`;
    }

}

customElements.define("gt-itemgrid-itemmirror", ItemMirror);
