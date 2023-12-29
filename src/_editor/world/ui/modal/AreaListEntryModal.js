import ElementManager from "/emcJS/util/html/ElementManager.js";
import i18n from "/emcJS/util/I18n.js";
import {
    sortChildren
} from "/emcJS/util/helper/ui/NodeListSort.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import Modal from "/emcJS/ui/modal/Modal.js";
import I18nOption from "/emcJS/ui/i18n/builtin/I18nOption.js";
import "/emcJS/ui/FilteredList.js";
import "/emcJS/ui/container/CollapsePanel.js";
import "/emcJS/ui/form/button/Button.js";
import {
    areaListEntries, exitListEntries, locationListEntries, collectionListEntries
} from "../../data/DataManager.js";
import TPL from "./AreaListEntryModal.js.html" assert {type: "html"};
import STYLE from "./AreaListEntryModal.js.css" assert {type: "css"};

class SelectionEntryElementManager extends ElementManager {

    composer(key, params) {
        const {type, ref = key} = params;
        const el = I18nOption.create();
        el.i18nValue = ref;
        el.value = ref;
        el.dataset.type = type;
        return el;
    }

}

export default class AreaListEntryModal extends Modal {

    #locationCollapsibleEl;

    #exitCollapsibleEl;

    #areaCollapsibleEl;

    #collectionCollapsibleEl;

    #locationEntryElManager;

    #exitEntryElManager;

    #areaEntryElManager;

    #collectionEntryElManager;

    #i18nEventManager = new EventTargetManager(i18n);

    constructor() {
        super("Choose Entry...");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const footerEl = this.shadowRoot.getElementById("footer");
        const contentEl = this.shadowRoot.getElementById("content");
        contentEl.innerHTML = "";
        const containerEl = els.getElementById("elements");
        contentEl.append(containerEl);
        /* --- */
        const cancelEl = els.getElementById("cancel");
        cancelEl.addEventListener("click", () => {
            this.close();
        });
        footerEl.append(cancelEl);
        /* --- */
        containerEl.addEventListener("click", (event) => {
            const targetEl = event.target;
            if (targetEl instanceof I18nOption) {
                this.remove();
                const ev = new Event("submit");
                ev.data = {
                    type: targetEl.dataset.type,
                    ref: targetEl.value
                };
                this.dispatchEvent(ev);
                event.preventDefault();
                return false;
            }
        });
        /* --- */
        this.#locationCollapsibleEl = this.shadowRoot.getElementById("locations");
        this.#exitCollapsibleEl = this.shadowRoot.getElementById("exits");
        this.#areaCollapsibleEl = this.shadowRoot.getElementById("areas");
        this.#collectionCollapsibleEl = this.shadowRoot.getElementById("collections");
        this.#locationEntryElManager = new SelectionEntryElementManager(this.#locationCollapsibleEl);
        this.#exitEntryElManager = new SelectionEntryElementManager(this.#exitCollapsibleEl);
        this.#areaEntryElManager = new SelectionEntryElementManager(this.#areaCollapsibleEl);
        this.#collectionEntryElManager = new SelectionEntryElementManager(this.#collectionCollapsibleEl);
        /* --- */
        locationListEntries.addEventListener("change", () => {
            this.#refreshLocationEntries();
        });
        exitListEntries.addEventListener("change", () => {
            this.#refreshExitEntries();
        });
        areaListEntries.addEventListener("change", () => {
            this.#refreshAreaEntries();
        });
        collectionListEntries.addEventListener("change", () => {
            this.#refreshCollectionEntries();
        });
        /* --- */
        this.#i18nEventManager.set("language", () => {
            sortChildren(this.#locationCollapsibleEl);
            sortChildren(this.#exitCollapsibleEl);
            sortChildren(this.#areaCollapsibleEl);
            sortChildren(this.#collectionCollapsibleEl);
        });
        this.#i18nEventManager.set("translation", () => {
            sortChildren(this.#locationCollapsibleEl);
            sortChildren(this.#exitCollapsibleEl);
            sortChildren(this.#areaCollapsibleEl);
            sortChildren(this.#collectionCollapsibleEl);
        });
        /* --- */
        this.#refreshLocationEntries();
        this.#refreshExitEntries();
        this.#refreshAreaEntries();
        this.#refreshCollectionEntries();
    }

    #refreshLocationEntries() {
        this.#locationCollapsibleEl.innerHTML = "";
        const data = [];
        for (const location of locationListEntries) {
            data.push({key: location, type: "location"});
        }
        this.#locationEntryElManager.manage(data);
        sortChildren(this.#locationCollapsibleEl);
    }

    #refreshExitEntries() {
        this.#exitCollapsibleEl.innerHTML = "";
        const data = [];
        for (const exit of exitListEntries) {
            data.push({key: exit, type: "exit"});
        }
        this.#exitEntryElManager.manage(data);
        sortChildren(this.#exitCollapsibleEl);
    }

    #refreshAreaEntries() {
        this.#areaCollapsibleEl.innerHTML = "";
        const data = [];
        for (const area of areaListEntries) {
            data.push({key: area, type: "area"});
        }
        this.#areaEntryElManager.manage(data);
        sortChildren(this.#areaCollapsibleEl);
    }

    #refreshCollectionEntries() {
        this.#collectionCollapsibleEl.innerHTML = "";
        const data = [];
        for (const collection of collectionListEntries) {
            data.push({key: collection, type: "collection"});
        }
        this.#collectionEntryElManager.manage(data);
        sortChildren(this.#collectionCollapsibleEl);
    }

}

customElements.define("gt-edt-world-editor-modal-area-list-entry", AreaListEntryModal);
