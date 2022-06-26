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
        const categoryEl = this.shadowRoot.getElementById("category");
        const tagsEl = this.shadowRoot.getElementById("tags");
        categoryEl.i18nValue = "";
        tagsEl.innerHTML = "";
    }

    applyStateValues(state) {
        const categoryEl = this.shadowRoot.getElementById("category");
        const tagsEl = this.shadowRoot.getElementById("tags");
        categoryEl.i18nValue = `entrance_type[${state.props.type}]`;
        // tags
        tagsEl.innerHTML = "";
        const areaState = AreaStateManager.get(state.props.area);
        const areaTagConfig = WorldListState.config.areaTags;
        const areaTags = areaState?.props.areaTags;
        if (areaTags) {
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
                        titleEl.i18nValue = `entrance[${this.ref}]`;
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
