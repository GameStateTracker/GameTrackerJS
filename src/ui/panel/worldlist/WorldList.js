import {
    mix
} from "/emcJS/util/Mixin.js";
import ElementManager from "/emcJS/util/html/ElementManager.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import SettingsObserver from "../../../util/observer/SettingsObserver.js";
import WorldListState from "../../../state/world/WorldListState.js";
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
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import TPL from "./WorldList.js.html" assert {type: "html"};
import STYLE from "./WorldList.js.css" assert {type: "css"};

const worldListSortedObserver = new SettingsObserver("sort_worldlist_by_access");

class ListEntryElementManager extends ElementManager {

    composer(key, params) {
        const uiReg = UIRegistry.get(`worldlist-${params.type.toLowerCase()}`);
        if (uiReg != null) {
            return uiReg.create(params.subtype, key);
        }
    }

}

const BaseClass = mix(
    Panel
).with(
    StateDataEventManagerMixin
);

// TODO add area list name buttons (see TOoTR worldlist TypeButton)

export default class WorldList extends BaseClass {

    #backEl;

    #elementManager;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* state handler */
        WorldListState.addEventListener("area", (event) => {
            this.ref = event.value;
        });
        this.registerStateHandler("access", (event) => {
            const access = event.value;
            const accessValue = access.value;
            this.applyAccess(("" + accessValue).toLowerCase(), access);
            if (worldListSortedObserver.value) {
                this.#sort();
            }
        });
        this.registerStateHandler("listChange", () => {
            this.refreshList();
        });
        /* back button */
        this.#backEl = this.shadowRoot.getElementById("back");
        this.#backEl.addEventListener("click", () => {
            WorldListState.reset();
        });
        /* --- */
        this.#elementManager = new ListEntryElementManager(this);
        /* --- */
        if (worldListSortedObserver.value) {
            this.#elementManager.registerSortFunction(this.#sortFunction);
        }
        worldListSortedObserver.addEventListener("change", () => {
            if (worldListSortedObserver.value) {
                this.#elementManager.registerSortFunction(WorldListState.isDefault ? null : this.#sortFunction);
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
        const accessValue = access.value;
        this.applyAccess(("" + accessValue).toLowerCase(), access);
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

    applyAccess(value = "unavailable"/* , data = {} */) {
        this.access = value;
    }

    get ref() {
        return this.getAttribute("ref") || WorldListState.defaultArea;
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
                    if (this.#backEl != null) {
                        this.#backEl.classList.toggle("hidden", WorldListState.isDefault);
                        if (worldListSortedObserver.value) {
                            this.#elementManager.registerSortFunction(WorldListState.isDefault ? null : this.#sortFunction);
                        }
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
        const elManagerData = [];
        const state = this.getState();
        if (state != null) {
            const list = state.getList();
            let definedOrder = 0;
            if (list != null && list.length > 0) {
                for (const record of list) {
                    const loc = record.entry;
                    if (!record.props.listHidden) {
                        elManagerData.push({
                            key: loc.ref,
                            type: record.type,
                            subtype: loc.props.type,
                            order: definedOrder++,
                            state: record
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
        if (data0.state.access.value.orderValue < data1.state.access.value.orderValue) {
            return -1;
        }
        if (data0.state.access.value.orderValue > data1.state.access.value.orderValue) {
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

Panel.registerReference("worldlist", WorldList);
customElements.define("gt-worldlist", WorldList);
