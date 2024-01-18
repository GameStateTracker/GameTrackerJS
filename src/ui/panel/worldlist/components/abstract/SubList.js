import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import EventTargetListenerElementMixin from "/emcJS/ui/mixin/EventTargetListenerElementMixin.js";
import ElementManager from "/emcJS/util/html/ElementManager.js";
import ContextMenuManagerMixin from "/emcJS/ui/mixin/ContextMenuManagerMixin.js";
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
:host(:not(:empty)) #header.collapsible > #title::before {
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
:host(:not(:empty)) #header.collapsible.expanded > #title::before {
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

const worldListSortedObserver = new SettingsObserver("sort_worldlist_by_access");
const sublistCollapsibleObserver = new SettingsObserver("sublist_collapsible");

class ListEntryElementManager extends ElementManager {

    composer(key, params) {
        const uiReg = UIRegistry.get(`worldlist-${params.type.toLowerCase()}`);
        if (uiReg != null) {
            return uiReg.create(params.subtype, key);
        }
    }

}

const BaseClass = mix(
    WorldListStateEntry
).with(
    EventTargetListenerElementMixin,
    ContextMenuManagerMixin
);

export default class WorldListSubList extends BaseClass {

    #elementManager;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* state handler */
        this.registerStateHandler("access", () => {
            if (worldListSortedObserver.value) {
                this.#sort();
            }
        });
        this.registerStateHandler("listChange", () => {
            this.refreshList();
        });
        this.registerStateHandler("listContents", () => {
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
        this.switchEventTarget("sublistCollapsible", sublistCollapsibleObserver);
        this.setEventTargetListener("sublistCollapsible", "change", (event) => {
            const collapsible = event.value;
            if (collapsible != "off") {
                headerEl.classList.add("collapsible");
                if (collapsible == "start_expanded") {
                    headerEl.classList.add("startexpanded");
                } else {
                    headerEl.classList.remove("startexpanded");
                }
            } else {
                headerEl.classList.remove("collapsible");
                headerEl.classList.remove("startexpanded");
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
        this.#elementManager = new ListEntryElementManager(this);
        /* --- */
        if (worldListSortedObserver.value) {
            this.#elementManager.registerSortFunction(this.#sortFunction);
        }
        worldListSortedObserver.addEventListener("change", () => {
            if (worldListSortedObserver.value) {
                this.#elementManager.registerSortFunction(this.#sortFunction);
            } else {
                this.#elementManager.registerSortFunction(null);
            }
        });
    }

    #sort = debounce(() => {
        this.#elementManager.sort();
    }, 1000);

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
        const elManagerData = [];
        const state = this.getState();
        if (state != null && state.listContents) {
            const list = state.getList();
            let definedOrder = 0;
            if (list != null && list.length > 0) {
                for (const record of list) {
                    const loc = record.entry;
                    if (!loc.props.visibleRootOnly) {
                        elManagerData.push({
                            key: loc.ref,
                            type: record.type,
                            subtype: loc.props.type,
                            order: definedOrder++,
                            record
                        });
                    }
                }
            }
        }
        this.#elementManager.manage(elManagerData);
    }

    #sortFunction(entry0, entry1) {
        const {data: data0} = entry0;
        const {data: data1} = entry1;
        if (data0.record.access.value.orderValue < data1.record.access.value.orderValue) {
            return -1;
        }
        if (data0.record.access.value.orderValue > data1.record.access.value.orderValue) {
            return 1;
        }
        if (data0.definedOrder < data1.definedOrder) {
            return -1;
        }
        if (data0.definedOrder > data1.definedOrder) {
            return 1;
        }
        return 0;
    }

}
