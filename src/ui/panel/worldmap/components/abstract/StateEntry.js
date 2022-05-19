// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import {
    mix
} from "/emcJS/util/Mixin.js";

import AccessStateEnum from "../../../../../enum/AccessStateEnum.js";
import WorldStateManagerRegistry from "../../../../../statemanager/WorldStateManagerRegistry.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import WorldMapEntry from "./Entry.js";

const TPL = new Template(`
<emc-tooltip position="top" id="tooltip">
    <div id="header" class="textarea">
        <emc-i18n-label id="text"></emc-i18n-label>
    </div>
</emc-tooltip>
`);

const STYLE = new GlobalStyle(`
#text {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    color: var(--page-text-color, #000000);
}
#tooltip {
    display: none;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 5px;
    word-break: keep-all;
    white-space: nowrap;
}
#marker:hover + #tooltip,
:host(.ctx-marked) #tooltp {
    display: flex;
}
.textarea {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    min-height: 35px;
    word-break: break-word;
}
.textarea:empty {
    display: none;
}
.textarea + .textarea {
    margin-top: 5px;
}
`);

const BaseClass = mix(
    WorldMapEntry
).with(
    StateDataEventManagerMixin
);

export default class WorldMapStateEntry extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* state handler */
        this.registerStateHandler("visibility", (event) => {
            this.style.display = event.value ? "" : "none";
        });
        this.registerStateHandler("access", (event) => {
            const accessValue = AccessStateEnum.getName(event.value.value);
            this.applyAccess(accessValue.toLowerCase(), event.value);
        });
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        /* --- */
        if (this.ref) {
            const state = WorldStateManagerRegistry.get(this.category).get(this.ref);
            this.switchState(state);
            /* text */
            const textEl = this.shadowRoot.getElementById("text");
            if (textEl != null) {
                textEl.i18nValue = this.textRef;
            }
        }
    }

    applyDefaultValues() {
        /* visible */
        this.style.display = "none";
        /* access */
        this.applyAccess("unavailable", {});
    }

    applyStateValues(state) {
        /* visible */
        this.style.display = state.isVisible() ? "" : "none";
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = AccessStateEnum.getName(access.value);
        this.applyAccess(accessValue.toLowerCase(), access);
    }

    getStateAccess(state) {
        return state.access;
    }

    applyAccess(value = "unavailable", data = {}) {
        /* marker */
        const markerEl = this.shadowRoot.getElementById("marker");
        if (markerEl != null) {
            markerEl.dataset.state = value;
        }
        /* text */
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.dataset.state = value;
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    static get observedAttributes() {
        return ["ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = WorldStateManagerRegistry.get(this.category).get(this.ref);
                    this.switchState(state);
                    /* text */
                    const textEl = this.shadowRoot.getElementById("text");
                    if (textEl != null) {
                        textEl.i18nValue = this.textRef;
                    }
                } break;
            }
        }
    }

    get textRef() {
        return this.ref;
    }

    get category() {
        return "\u0000";
    }

}
