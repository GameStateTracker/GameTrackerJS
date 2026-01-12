import CustomElement from "/emcJS/ui/element/CustomElement.js";
import "/emcJS/ui/form/FormRow.js";
import "/emcJS/ui/form/button/Button.js";
import "/emcJS/ui/form/element/input/slider/SliderInput.js";
import "/emcJS/ui/form/element/input/switch/SwitchInput.js";
import SettingsObserver from "../../../../../util/observer/SettingsObserver.js";
import "../overview/WorldMapOverview.js";
import TPL from "./WorldMapSettingsPanel.js.html" assert {type: "html"};
import STYLE from "./WorldMapSettingsPanel.js.css" assert {type: "css"};

const showDetailedMapsObserver = new SettingsObserver("show_detailed_maps");
const mapPanSnapMagnetForce = new SettingsObserver("map_pan_snap_magnet_force");

export default class WorldMapSettingsPanel extends CustomElement {

    #resetTransformEl;

    #mapOverviewEl;

    #zoomSliderEl;

    #detailedMapsEl;

    #snapSliderEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#resetTransformEl = this.shadowRoot.getElementById("reset-transform");
        this.#resetTransformEl.addEventListener("click", (event) => {
            event.stopPropagation();
            const ev = new Event("reset");
            this.dispatchEvent(ev);
        });
        /* --- */
        this.#mapOverviewEl = this.shadowRoot.getElementById("map-overview");
        this.#mapOverviewEl.addEventListener("move", (event) => {
            const ev = new Event("move");
            ev.x = event.x;
            ev.y = event.y;
            this.dispatchEvent(ev);
        });
        /* --- */
        this.#zoomSliderEl = this.shadowRoot.getElementById("zoom-slider");
        this.#zoomSliderEl.addEventListener("input", () => {
            const ev = new Event("zoom");
            ev.value = this.#zoomSliderEl.value;
            this.dispatchEvent(ev);
        });
        /* --- */
        this.#detailedMapsEl = this.shadowRoot.getElementById("detailed-maps");
        this.#detailedMapsEl.addEventListener("input", () => {
            showDetailedMapsObserver.value = this.#detailedMapsEl.value;
        });
        showDetailedMapsObserver.onChange(() => {
            this.#detailedMapsEl.value = showDetailedMapsObserver.value;
        });
        this.#detailedMapsEl.value = showDetailedMapsObserver.value;
        /* --- */
        this.#snapSliderEl = this.shadowRoot.getElementById("snap-slider");
        this.#snapSliderEl.addEventListener("input", () => {
            mapPanSnapMagnetForce.value = this.#snapSliderEl.value;
        });
        mapPanSnapMagnetForce.onChange(() => {
            this.#snapSliderEl.value = mapPanSnapMagnetForce.value;
        });
        this.#snapSliderEl.value = mapPanSnapMagnetForce.value;
        /* --- */
        const iconEl = this.shadowRoot.getElementById("icon");
        iconEl.addEventListener("click", (event) => {
            this.open = true;
            event.stopPropagation();
            event.preventDefault();
            return false;
        });

        this.addEventListener("wheel", (event) => {
            if (this.open) {
                event.stopPropagation();
            }
        });
        this.addEventListener("mousedown", (event) => {
            if (this.open) {
                event.stopPropagation();
            }
        });
        this.addEventListener("touchstart", (event) => {
            if (this.open) {
                event.stopPropagation();
            }
        });
        window.addEventListener("mousedown", () => {
            if (this.open) {
                this.open = false;
                this.blur();
            }
        });
        window.addEventListener("touchstart", () => {
            if (this.open) {
                this.open = false;
                this.blur();
            }
        });
    }

    set ref(val) {
        this.#mapOverviewEl.ref = val;
    }

    get ref() {
        return this.#mapOverviewEl.ref;
    }

    set open(val) {
        this.setBooleanAttribute("open", val);
    }

    get open() {
        return this.getBooleanAttribute("open");
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "open"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "open": {
                    if (this.open) {
                        this.#mapOverviewEl.refreshView();
                    }
                } break;
            }
        }
    }

    setResetButtonActive(value) {
        this.#resetTransformEl.disabled = !value;
    }

    setTransform(x, y, zoom) {
        this.#mapOverviewEl.setTransform(x, y, zoom);
        this.#zoomSliderEl.value = zoom;
    }

    setViewportSize(viewportWidth, viewportHeight) {
        this.#mapOverviewEl.setViewportSize(viewportWidth, viewportHeight);
    }

    setDetailedMapsVisible(value) {
        if (value) {
            this.#detailedMapsEl.style.display = "";
        } else {
            this.#detailedMapsEl.style.display = "none";
        }
    }

}

customElements.define("gt-worldmap-settings-panel", WorldMapSettingsPanel);
