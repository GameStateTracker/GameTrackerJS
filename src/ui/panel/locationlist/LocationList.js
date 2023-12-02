// frameworks
import ElementManager from "/emcJS/util/html/ElementManager.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import {
    sortChildren
} from "/emcJS/util/helper/ui/NodeListSort.js";
import {
    getInnerText
} from "/emcJS/util/helper/ui/ExtractText.js";
import i18n from "/emcJS/util/I18n.js";
import SearchAnd from "/emcJS/util/search/SearchAnd.js";
import UIRegistry from "../../../registry/UIRegistry.js";
import WorldResource from "../../../data/resource/WorldResource.js";
import "/emcJS/ui/input/SearchField.js";
import "./components/entries/LocationListLocation.js";
import "../../../statemanager/world/location/LocationStateManager.js";
import TPL from "./LocationList.js.html" assert {type: "html"};
import STYLE from "./LocationList.js.css" assert {type: "css"};

const LOCATIONS = WorldResource.get("locations");

class ListEntryElementManager extends ElementManager {

    composer(key, params) {
        const uiReg = UIRegistry.get("locationlist-location");
        if (uiReg != null) {
            return uiReg.create(params.type, key);
        }
    }

}

export default class LocationList extends Panel {

    #elementManager;

    #i18nEventManager = new EventTargetManager(i18n);

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#elementManager = new ListEntryElementManager(this);
        /* search */
        const searchEl = this.shadowRoot.getElementById("search");
        searchEl.addEventListener("change", (event) => {
            const all = this.querySelectorAll("[ref]");
            if (event.value) {
                const regEx = new SearchAnd(event.value);
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
            sortChildren(this);
        });
        this.#i18nEventManager.set("translation", () => {
            sortChildren(this);
        });
    }

    connectedCallback() {
        super.connectedCallback();
        /* init list */
        this.#buildList();
    }

    #buildList() {
        const elManagerData = [];
        for (const ref in LOCATIONS) {
            const loc = LOCATIONS[ref];
            elManagerData.push({
                key: ref,
                type: loc.type
            });
        }
        // this.classList.toggle("empty", !hasElements);
        this.#elementManager.manage(elManagerData);
        sortChildren(this);
    }

}

Panel.registerReference("locationlist", LocationList);
customElements.define("gt-locationlist", LocationList);
