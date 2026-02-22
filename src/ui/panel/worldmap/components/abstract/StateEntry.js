// frameworks
import HTMLTemplate from "/emcJS/util/html/template/HTMLTemplate.js";
import CSSTemplate from "/emcJS/util/html/template/CSSTemplate.js";
import {mix} from "/emcJS/util/Mixin.js";
import "/emcJS/ui/bubble/Bubble.js";

import WorldStateManagerRegistry from "../../../../../statemanager/WorldStateManagerRegistry.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import WorldMapEntry from "./Entry.js";

const TPL = new HTMLTemplate(`
<emc-bubble id="bubble">
    <div id="header" class="textarea">
        <emc-i18n-label id="text"></emc-i18n-label>
    </div>
</emc-bubble>
`);

const STYLE = new CSSTemplate(`
#text {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    color: var(--page-text-color, #000000);
}
#bubble {
    display: none;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 5px;
    word-break: keep-all;
    white-space: nowrap;
    --tooltip-scale: calc((1 / (var(--zoom, 100) / 100)) * (1 / (var(--scale, 100) / 100)));
}
#marker:hover + #bubble,
:host(.ctx-marked) #bubble {
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
.textarea:empty,
.textarea.hidden {
    display: none;
}
.textarea + .textarea {
    margin-top: 5px;
}
`);

const BaseClass = mix(WorldMapEntry).with(StateDataEventManagerMixin);

export default class WorldMapStateEntry extends BaseClass {

    #bubbleEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#bubbleEl = this.shadowRoot.getElementById("bubble");
        /* state handler */
        this.registerStateHandler("access", (event) => {
            const access = event.value;
            const accessValue = access.value;
            this.applyAccess(("" + accessValue).toLowerCase(), access);
        });
        this.addEventListener("mouseenter", () => {
            this.#bubbleEl.refreshTooltipPosition();
        });
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback?.();
        }
        /* --- */
        if (this.ref) {
            const state = WorldStateManagerRegistry.get(this.type).get(this.ref);
            this.switchState(state);
            /* text */
            const textEl = this.shadowRoot.getElementById("text");
            if (textEl != null) {
                textEl.i18nValue = this.textRef;
            }
        }
    }

    applyDefaultValues() {
        /* access */
        this.applyAccess("unavailable", {});
    }

    applyStateValues(state) {
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = access.value;
        this.applyAccess(("" + accessValue).toLowerCase(), access);
    }

    getStateAccess(state) {
        return state.access;
    }

    applyAccess(value = "unavailable"/* , data = {} */) {
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
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = WorldStateManagerRegistry.get(this.type).get(this.ref);
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

    get type() {
        return "0";
    }

}
