// frameworks
import ElementManager from "/emcJS/util/html/ElementManager.js";
import EventMultiTargetManager from "/emcJS/util/event/EventMultiTargetManager.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import {
    nodeTextComparator,
    sortChildren
} from "/emcJS/util/helper/ui/NodeListSort.js";
import {getInnerText} from "/emcJS/util/helper/ui/ExtractText.js";
import {debounce} from "/emcJS/util/Debouncer.js";
import i18n from "/emcJS/util/I18n.js";
import SearchEvery from "/emcJS/util/search/SearchEvery.js";
import "/emcJS/ui/form/element/input/search/SearchInput.js";
import UIRegistry from "../../../registry/UIRegistry.js";
import WorldResource from "../../../data/resource/WorldResource.js";
import LocationStateManager from "../../../statemanager/world/location/LocationStateManager.js";
import SettingsObserver from "../../../util/observer/SettingsObserver.js";
import "./components/entries/LocationListLocation.js";
import TPL from "./LocationList.js.html" assert {type: "html"};
import STYLE from "./LocationList.js.css" assert {type: "css"};

const locationistSortedObserver = new SettingsObserver("sort_locationlist_by_access");

const LOCATIONS = WorldResource.get("locations");

class ListEntryElementManager extends ElementManager {

    composer(key, params) {
        const uiReg = UIRegistry.get("locationlist-location");
        if (uiReg != null) {
            return uiReg.create(params.type, key);
        }
    }

}

// TODO use dataview/datalist
export default class LocationList extends Panel {

    #searchEl;

    #elementManager;

    #listEventManager = new EventMultiTargetManager();

    #i18nEventManager = new EventTargetManager(i18n);

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#elementManager = new ListEntryElementManager(this);
        /* search */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#searchEl.addEventListener("change", () => {
            const all = this.querySelectorAll("[ref]");
            const searchValue = this.#searchEl.value;
            if (searchValue) {
                const regEx = new SearchEvery(searchValue);
                for (const el of all) {
                    const value = el.dataset.filtervalue ?? getInnerText(el);
                    if (regEx.test(value)) {
                        el.style.display = "";
                    } else {
                        el.style.display = "none";
                    }
                }
            } else {
                for (const el of all) {
                    el.style.display = "";
                }
            }
        });
        /* --- */
        this.#i18nEventManager.set("language", () => {
            this.#sort();
        });
        this.#i18nEventManager.set("translation", () => {
            this.#sort();
        });
        /* --- */
        this.#listEventManager.set("access", () => {
            if (locationistSortedObserver.value) {
                this.#sort();
            }
        });
        /* --- */
        if (locationistSortedObserver.value) {
            this.#elementManager.registerSortFunction(this.#sortByAccessAndNameFunction);
        } else {
            this.#elementManager.registerSortFunction(this.#sortByNameFunction);
        }
        locationistSortedObserver.onChange(() => {
            if (locationistSortedObserver.value) {
                this.#elementManager.registerSortFunction(this.#sortByAccessAndNameFunction);
            } else {
                this.#elementManager.registerSortFunction(this.#sortByNameFunction);
            }
        });
        this.#elementManager.addEventListener("afterrender", () => {
            BusyIndicatorManager.unbusy();
        });
    }

    load() {
        /* init list */
        this.#buildList();
    }

    unload() {
        /* init list */
        this.#elementManager.manage([]);
    }

    #sort = debounce(() => {
        this.#elementManager.sort();
    }, 1000);

    async #buildList() {
        await BusyIndicatorManager.busy();
        const elManagerData = [];
        this.#listEventManager.clearTargets();
        for (const ref in LOCATIONS) {
            const loc = LOCATIONS[ref];
            const state = LocationStateManager.get(ref);
            this.#listEventManager.addTarget(state);
            elManagerData.push({
                key: ref,
                type: loc.type,
                state
            });
        }
        // this.classList.toggle("empty", !hasElements);
        this.#elementManager.manage(elManagerData);
        sortChildren(this);
    }

    #sortByNameFunction(entry0, entry1) {
        const {element: el0} = entry0;
        const {element: el1} = entry1;
        return nodeTextComparator(el0, el1);
    }

    #sortByAccessAndNameFunction(entry0, entry1) {
        const {
            data: data0, element: el0
        } = entry0;
        const {
            data: data1, element: el1
        } = entry1;
        if (data0.state.access.value.orderValue < data1.state.access.value.orderValue) {
            return -1;
        }
        if (data0.state.access.value.orderValue > data1.state.access.value.orderValue) {
            return 1;
        }
        return nodeTextComparator(el0, el1);
    }

}

Panel.registerReference("locationlist", LocationList);
customElements.define("gt-locationlist", LocationList);
