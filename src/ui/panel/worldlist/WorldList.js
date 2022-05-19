// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import ElementManager from "/emcJS/util/html/ElementManager.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "/emcJS/ui/i18n/I18nLabel.js";

import WorldListState from "../../../state/world/WorldListState.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";
import AreaStateManager from "../../../statemanager/world/area/AreaStateManager.js";
import UIRegistry from "../../../registry/UIRegistry.js";
import StateDataEventManagerMixin from "../../mixin/StateDataEventManagerMixin.js";
import "../../button/FilterMenuButton.js";
import "../../button/HintButton.js";
import "./components/button/Button.js";
import "./components/entries/Collection.js";
import "./components/entries/Location.js";
import "./components/entries/Area.js";
import "./components/entries/Exit.js";

const TPL = new Template(`
<div id="title">
    <emc-i18n-label id="text"></emc-i18n-label>
    <gt-hintbutton class="button" id="hint">
    </gt-hintbutton>
    <gt-filtermenubutton class="button">
    </gt-filtermenubutton>
</div>
<div id="body">
    <gt-worldlist-button id="back" class="button" text="(to overworld)"></gt-worldlist-button>
    <div id="list">
        <slot></slot>
    </div>
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    position: relative;
    box-sizing: border-box;
    display: inline-flex;
    flex-direction: column;
    min-height: 100%;
    width: 300px;
    height: 300px;
}
#title {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px;
    font-size: 1.5em;
    line-height: 1em;
    border-bottom: solid 1px var(--page-text-color, #000000);
    user-select: none;
}
#text {
    display: block;
    flex: 1;
    font-size: .8em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
:host([access="opened"]) #text {
    color: var(--location-status-opened-color, var(--page-text-color, #000000));
}
:host([access="available"]) #text {
    color: var(--location-status-available-color, var(--page-text-color, #000000));
}
:host([access="unavailable"]) #text {
    color: var(--location-status-unavailable-color, var(--page-text-color, #000000));
}
:host([access="possible"]) #text {
    color: var(--location-status-possible-color, var(--page-text-color, #000000));
}
#title > .button {
    width: 38px;
    height: 38px;
    padding: 4px;
    margin-left: 8px;
    border: solid 2px var(--navigation-background-color, #ffffff);
    border-radius: 10px;
}
#body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
}
#list {
    display: content;
}
#hint {
    margin-left: 5px;
}
#body .button.hidden,
:host(:not([ref])) #back {
    display: none;
}
.button,
::slotted(*) {
    border-bottom: solid 1px var(--list-border-bottom-color, #000000);
    border-top: solid 1px var(--list-border-top-color, #000000);
}
`);

const BaseClass = mix(
    Panel
).with(
    StateDataEventManagerMixin
);

const EL_MANAGER = new WeakMap();

function elementComposer(key, props) {
    const uiReg = UIRegistry.get(`worldlist-${props.category}`);
    if (uiReg != null) {
        return uiReg.create(props.type, key);
    }
}

export default class WorldList extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* state handler */
        WorldListState.addEventListener("area", event => {
            this.ref = event.value;
        });
        this.registerStateHandler("access", event => {
            const access = event.value;
            const accessValue = AccessStateEnum.getName(access.value);
            this.applyAccess(accessValue.toLowerCase(), access);
        });
        this.registerStateHandler("listChange", event => {
            this.refreshList();
        });
        /* back button */
        const backEl = this.shadowRoot.getElementById("back");
        backEl.addEventListener("trigger", event => {
            WorldListState.reset();
        });
        /* --- */
        EL_MANAGER.set(this, new ElementManager(this, elementComposer));
    }

    connectedCallback() {
        super.connectedCallback();
        /* init reference */
        this.ref = WorldListState.area;
    }

    applyDefaultValues() {
        /* access */
        this.applyAccess("unavailable", {});
        /* text */
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.i18nValue = "";
        }
        /* hint button */
        const hintEl = this.shadowRoot.getElementById("hint");
        if (hintEl != null) {
            hintEl.ref = "";
        }
        /* list */
        this.refreshList();
    }

    applyStateValues(state) {
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = AccessStateEnum.getName(access.value);
        this.applyAccess(accessValue.toLowerCase(), access);
        /* text */
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.i18nValue = `area[${state.ref}]`;
        }
        /* hint button */
        const hintEl = this.shadowRoot.getElementById("hint");
        if (hintEl != null) {
            hintEl.ref = state.ref;
        }
        /* list */
        this.refreshList();
    }

    getStateAccess(state) {
        return state.access;
    }

    applyAccess(value = "unavailable", data = {}) {
        this.access = value;
    }

    get ref() {
        return this.getAttribute("ref") || WorldListState.config.default;
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get access() {
        return this.getAttribute("access");
    }

    set access(val) {
        this.setAttribute("access", val);
    }

    static get observedAttributes() {
        return ["ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = AreaStateManager.get(this.ref);
                    this.switchState(state);
                    /* back button */
                    const backEl = this.shadowRoot.getElementById("back");
                    if (backEl != null) {
                        backEl.classList.toggle("hidden", WorldListState.isDefault);
                    }
                    /* scroll */
                    const bodyEl = this.shadowRoot.getElementById("body");
                    if (bodyEl != null) {
                        bodyEl.scroll(0, 0);
                    }
                } break;
            }
        }
    }

    refreshList() {
        const elManager = EL_MANAGER.get(this);
        const elManagerData = [];
        const state = this.getState();
        if (state != null) {
            const list = state.getList();
            if (list != null && list.length > 0) {
                for (const record of list) {
                    const loc = record.entry;
                    elManagerData.push({
                        key: loc.ref,
                        category: record.category,
                        type: loc.props.type
                    });
                }
            }
        }
        // this.classList.toggle("empty", !hasElements);
        elManager.manage(elManagerData);
    }

}

Panel.registerReference("worldlist", WorldList);
customElements.define("gt-worldlist", WorldList);
