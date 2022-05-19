// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import EventTargetMixin from "/emcJS/ui/mixin/EventTargetMixin.js";
import ElementManager from "/emcJS/util/html/ElementManager.js";
import ContextMenuManagerMixin from "/emcJS/ui/overlay/ctxmenu/ContextMenuManagerMixin.js";

import SettingsObserver from "../../../../../util/observer/SettingsObserver.js";
import UIRegistry from "../../../../../registry/UIRegistry.js";
import WorldListStateEntry from "./StateEntry.js";

const TPL = new Template(`
<div id="list">
    <slot></slot>
</div>
`);

const STYLE = new GlobalStyle(`
:host(.empty) {
    display: none;
}
:host(:not(:empty)) {
    box-shadow:
        inset 0 0 0px 2px var(--page-background-color, #ffffff),
        inset 0 0 1px 3px var(--page-text-color, #000000);
}
:host(:not(:empty)) #header.collapsible > #title:before {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-right: 8px;
    font-weight: bold;
    text-align: center;
    content: "+"
}
:host(:not(:empty)) #header.collapsible.expanded > #title:before {
    content:"-"
}
#header.collapsible + #list {
    display: none;
}
:host(:not(:empty)) #header.collapsible.expanded + #list {
    display: block;
}
.button,
::slotted(*) {
    border-bottom: solid 1px var(--list-border-bottom-color, #000000);
    border-top: solid 1px var(--list-border-top-color, #000000);
}
`);

const sublistCollapsibleObserver = new SettingsObserver("sublist_collapsible");
const EL_MANAGER = new WeakMap();

function elementComposer(key, props) {
    const uiReg = UIRegistry.get(`worldlist-${props.category}`);
    if (uiReg != null) {
        return uiReg.create(props.type, key);
    }
}

const BaseClass = mix(
    WorldListStateEntry
).with(
    EventTargetMixin,
    ContextMenuManagerMixin
);

export default class WorldListSubList extends BaseClass {

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* state handler */
        this.registerStateHandler("listChange", (event) => {
            this.refreshList();
        });
        this.registerStateHandler("listContents", (event) => {
            this.refreshList();
        });
        /* mouse events */
        const headerEl = this.shadowRoot.getElementById("header");
        headerEl.addEventListener("contextmenu", (event) => {
            this.contextmenuHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        /* settings */
        this.switchTarget("sublistCollapsible", sublistCollapsibleObserver);
        this.setTargetEventListener("sublistCollapsible", "change", event => {
            const collapsible = event.value;
            if (collapsible != "off") {
                headerEl.classList.add("collapsible");
                if (collapsible == "start_expanded") {
                    headerEl.classList.add("startexpanded");
                }
            } else {
                headerEl.classList.remove("collapsible");
            }
        });
        const collapsible = sublistCollapsibleObserver.value;
        if (collapsible != "off") {
            headerEl.classList.add("collapsible");
            if (collapsible == "start_expanded") {
                headerEl.classList.add("expanded");
                headerEl.classList.add("startexpanded");
            }
        }
        /* --- */
        EL_MANAGER.set(this, new ElementManager(this, elementComposer));
    }

    connectedCallback() {
        super.connectedCallback();
        /* list */
        this.refreshList();
    }

    clickHandler() {
        const headerEl = this.shadowRoot.getElementById("header");
        if (headerEl.classList.contains("collapsible") && this.value != "") {
            if (headerEl.classList.contains("expanded")) {
                headerEl.classList.remove("expanded");
            } else {
                headerEl.classList.add("expanded");
            }
        }
    }

    contextmenuHandler(event) {
        this.showDefaultContextMenu(event);
    }

    applyStateValues(state) {
        super.applyStateValues(state);
    }

    setCollapsed(value) {
        const headerEl = this.shadowRoot.getElementById("header");
        if (headerEl.classList.contains("collapsible")) {
            if (value) {
                headerEl.classList.remove("expanded");
            } else {
                headerEl.classList.add("expanded");
            }
        }
    }

    refreshList() {
        const elManager = EL_MANAGER.get(this);
        const elManagerData = [];
        const state = this.getState();
        if (state != null && state.listContents) {
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
        elManager.manage(elManagerData);
    }

}
