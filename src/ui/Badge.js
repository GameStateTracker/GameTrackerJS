import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import EventMultiTargetManager from "@emcjs/core/util/event/EventMultiTargetManager.js";
import EventTargetListenerElementMixin from "@emcjs/fe/ui/mixin/EventTargetListenerElementMixin.js";
import "@emcjs/fe/ui/icon/Icon.js";
import FilterResource from "../data/resource/FilterResource.js";
import SettingsObserver from "../util/observer/SettingsObserver.js";
import BadgeFilterIconHandler from "../util/handler/BadgeFilterIconHandler.js";
import TPL from "./Badge.js.html" assert {type: "html"};
import STYLE from "./Badge.js.css" assert {type: "css"};

const colorBlindObserver = new SettingsObserver("color_blind_badge_icons");
const showFiltersObserver = new SettingsObserver("show_filter_badges");

const ACCESS_VALUES = [
    "opened",
    "available",
    "unavailable",
    "possible"
];

export default class Badge extends EventTargetListenerElementMixin(CustomElement) {

    #colorBlindEl;

    #filtersEl;

    #filterIconEls = new Map();

    #badgeFilterIconHandlerManager = new EventMultiTargetManager();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const filter = FilterResource.get();
        this.#filtersEl = this.shadowRoot.getElementById("filters");
        for (const name in filter) {
            const value = filter[name];
            if (value.badge) {
                const el = document.createElement("emc-icon");
                this.#filterIconEls.set(`badge-${name}`, el);
                this.#filtersEl.append(el);
            }
        }
        this.#filtersEl.style.display = showFiltersObserver.value ? "" : "none";
        this.switchEventTarget("showFilters", showFiltersObserver);
        this.setEventTargetListener("showFilters", "change", (event) => {
            this.#filtersEl.style.display = event.value ? "" : "none";
        });
        /* --- */
        this.#colorBlindEl = this.shadowRoot.getElementById("access");
        if (this.#colorBlindEl != null) {
            this.#colorBlindEl.style.display = colorBlindObserver.value ? "" : "none";
        }
        this.switchEventTarget("colorBlind", colorBlindObserver);
        this.setEventTargetListener("colorBlind", "change", (event) => {
            if (this.#colorBlindEl != null) {
                this.#colorBlindEl.style.display = event.value ? "" : "none";
            }
        });
        /* --- */
        this.#badgeFilterIconHandlerManager.set("change", (event) => {
            const {
                ref, icon
            } = event.data;
            const el = this.#filterIconEls.get(`badge-${ref}`);
            el.src = icon;
        });
    }

    get typeIcon() {
        return this.getAttribute("type-icon");
    }

    set typeIcon(val) {
        this.setAttribute("type-icon", val);
    }

    get access() {
        return this.getAttribute("access");
    }

    set access(val) {
        this.setAttribute("access", val);
    }

    static get observedAttributes() {
        return ["type-icon", "access"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "type-icon": {
                    const typeEl = this.shadowRoot.getElementById("type");
                    if (typeEl != null) {
                        typeEl.src = newValue;
                    }
                } break;
                case "access": {
                    if (this.#colorBlindEl != null) {
                        if (ACCESS_VALUES.indexOf(newValue) >= 0) {
                            this.#colorBlindEl.src = `images/icons/access_${newValue}.svg`;
                        } else {
                            this.#colorBlindEl.src = "";
                        }
                    }
                } break;
            }
        }
    }

    setFilterData(data) {
        this.#badgeFilterIconHandlerManager.clearTargets();
        const filter = FilterResource.get();
        if (data != null) {
            for (const name in filter) {
                const value = filter[name];
                if (value.badge) {
                    const handler = new BadgeFilterIconHandler(name, value, data[name]);
                    this.#badgeFilterIconHandlerManager.addTarget(handler);
                    const el = this.#filterIconEls.get(`badge-${name}`);
                    el.src = handler.icon;
                }
            }
        }
    }

}

customElements.define("gt-badge", Badge);
