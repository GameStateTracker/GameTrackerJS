import {
    mix
} from "/emcJS/util/Mixin.js";
import CustomElement from "/emcJS/ui/element/CustomElement.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import "/emcJS/ui/LabeledIcon.js";
import StateDataEventManagerMixin from "../mixin/StateDataEventManagerMixin.js";
import EntranceStateManager from "../../statemanager/world/entrance/EntranceStateManager.js";
import AreaStateManager from "../../statemanager/world/area/AreaStateManager.js";
import WorldListState from "../../state/world/WorldListState.js";
import TPL from "./EntranceSelectOption.js.html" assert {type: "html"};
import STYLE from "./EntranceSelectOption.js.css" assert {type: "css"};

const BaseClass = mix(
    CustomElement
).with(
    StateDataEventManagerMixin
);

export default class EntranceSelectOption extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    applyDefaultValues() {
        const typeEl = this.shadowRoot.getElementById("type");
        const categoryEl = this.shadowRoot.getElementById("category");
        const tagsEl = this.shadowRoot.getElementById("tags");
        if (this.ref === "") {
            typeEl.i18nValue = "entrance_type[unbound]";
        } else if (this.ref === "\u0000") {
            typeEl.i18nValue = "entrance_type[empty]";
        } else {
            typeEl.i18nValue = "";
        }
        categoryEl.i18nValue = "";
        tagsEl.innerHTML = "";
    }

    applyStateValues(state) {
        const typeEl = this.shadowRoot.getElementById("type");
        const categoryEl = this.shadowRoot.getElementById("category");
        const tagsEl = this.shadowRoot.getElementById("tags");
        typeEl.i18nValue = `entrance_type[${state.props.type}]`;
        // area
        const areaState = AreaStateManager.get(state.props.area);
        // area - category
        const category = areaState?.props.category;
        if (category) {
            categoryEl.i18nValue = `area_category[${category}]`;
        } else {
            categoryEl.i18nValue = "";
        }
        // area - tags
        tagsEl.innerHTML = "";
        const areaTags = areaState?.props.areaTags;
        if (areaTags) {
            const areaTagConfig = WorldListState.config.areaTags;
            for (const tag in areaTags) {
                const areaTagData = areaTagConfig[tag];
                if (areaTagData != null) {
                    const value = areaTags[tag];
                    const tagEl = document.createElement("emc-labeledicon");
                    tagEl.src = areaTagData.icon;
                    if (areaTagData.counting) {
                        tagEl.text = value;
                        tagEl.halign = "end";
                        tagEl.valign = "end";
                    }
                    tagsEl.append(tagEl);
                }
            }
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    static get observedAttributes() {
        return ["ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    // state
                    const state = EntranceStateManager.get(newValue);
                    this.switchState(state);
                    /* text */
                    const titleEl = this.shadowRoot.getElementById("title");
                    if (titleEl != null) {
                        titleEl.i18nValue = `entrance[${newValue}]`;
                    }
                } break;
            }
        }
    }

    get textRef() {
        return `entrance[${this.ref}]`;
    }

    get innerText() {
        return this.shadowRoot.textContent;
    }

}

customElements.define("gt-entrance-select-option", EntranceSelectOption);
