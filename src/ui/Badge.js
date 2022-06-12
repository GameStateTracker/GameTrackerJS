import CustomElement from "/emcJS/ui/element/CustomElement.js";
import EventTargetListenerElementMixin from "/emcJS/ui/mixin/EventTargetListenerElementMixin.js";
import "/emcJS/ui/Icon.js";
import FilterResource from "../data/resource/FilterResource.js";
import SettingsObserver from "../util/observer/SettingsObserver.js";
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

function getFilterImage(name, filter, data) {
    if (filter.badge) {
        if (Array.isArray(filter.badge)) {
            const current = data[name];
            if (current == null) {
                return "";
            }
            for (const entry of filter.badge) {
                if (entry.values == null || Object.entries(entry.values).every(([key, value]) => current[key] == value)) {
                    return entry.image ?? "";
                }
            }
            return filter.images[filter.values.indexOf(filter.default)];
        } else {
            return filter.images[getLoneFilterIndex(name, filter, data)];
        }
    }
}

function getLoneFilterIndex(name, filter, data) {
    const def = filter.values.indexOf(filter.default);
    let current = def;
    for (let i = 0; i < filter.values.length; ++i) {
        const value = filter.values[i];
        if (data[`${name}/${value}`]) {
            if (current != def) {
                return def;
            } else {
                current = i;
            }
        }
    }
    return current;
}

export default class Badge extends EventTargetListenerElementMixin(CustomElement) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const filter = FilterResource.get();
        const filtersEl = this.shadowRoot.getElementById("filters");
        for (const name in filter) {
            const value = filter[name];
            if (value.badge) {
                const el = document.createElement("emc-icon");
                el.id = `badge-${name}`;
                filtersEl.append(el);
            }
        }
        if (filtersEl != null) {
            filtersEl.style.display = showFiltersObserver.value ? "" : "none";
        }
        this.switchEventTarget("showFilters", showFiltersObserver);
        this.setEventTargetListener("showFilters", "change", (event) => {
            if (filtersEl != null) {
                filtersEl.style.display = event.value ? "" : "none";
            }
        });
        /* --- */
        const colorBlindEl = this.shadowRoot.getElementById("access");
        if (colorBlindEl != null) {
            colorBlindEl.style.display = colorBlindObserver.value ? "" : "none";
        }
        this.switchEventTarget("colorBlind", colorBlindObserver);
        this.setEventTargetListener("colorBlind", "change", (event) => {
            if (colorBlindEl != null) {
                colorBlindEl.style.display = event.value ? "" : "none";
            }
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
                    const colorBlindEl = this.shadowRoot.getElementById("access");
                    if (colorBlindEl != null) {
                        if (ACCESS_VALUES.indexOf(newValue) >= 0) {
                            colorBlindEl.src = `images/icons/access_${newValue}.svg`;
                        } else {
                            colorBlindEl.src = "";
                        }
                    }
                } break;
            }
        }
    }

    setFilterData(data) {
        const filter = FilterResource.get();
        for (const name in filter) {
            const badgeImageEl = this.shadowRoot.getElementById(`badge-${name}`);
            if (badgeImageEl != null) {
                if (data != null) {
                    const value = filter[name];
                    if (value.badge) {
                        badgeImageEl.src = getFilterImage(name, value, data);
                    }
                } else {
                    badgeImageEl.src = "";
                }
            }
        }
    }

}

customElements.define("gt-badge", Badge);
