import {
    mix
} from "/emcJS/util/Mixin.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import "/emcJS/ui/i18n/I18nTooltip.js";
import "/emcJS/ui/input/Slider.js";

import WorldListState from "../../../state/world/WorldListState.js";
import AreaStateManager from "../../../statemanager/world/area/AreaStateManager.js";
import StateDataEventManagerMixin from "../../mixin/StateDataEventManagerMixin.js";
import "../../button/FilterMenuButton.js";
import "../../button/HintButton.js";
import "./components/WorldMapView.js";
import "./components/WorldMapOverview.js";
import "./components/WorldMapTitle.js";
import "./components/metaarea/WorldMapMetaAreaButton.js";
import "./components/metaarea/WorldMapMetaAreaView.js";
import SettingsObserver from "../../../util/observer/SettingsObserver.js";
import TPL from "./WorldMap.js.html" assert {type: "html"};
import STYLE from "./WorldMap.js.css" assert {type: "css"};

const showDetailedMapsObserver = new SettingsObserver("show_detailed_maps");

const SMALL_ZOOM_SPD = 1;
const NORMAL_ZOOM_SPD = 2;
const LARGE_ZOOM_SPD = 5;

const BaseClass = mix(
    Panel
).with(
    StateDataEventManagerMixin
);

export default class WorldMap extends BaseClass {

    #titleEl;

    #hintEl;

    #viewEl;

    #overviewEl;

    #sliderEl;

    #metaAreaButtonEl;

    #metaAreaViewEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* state handler */
        WorldListState.addEventListener("area", (event) => {
            if (this.detailed || showDetailedMapsObserver.value) {
                this.ref = event.value;
            }
        });
        showDetailedMapsObserver.onChange((event) => {
            if (this.detailed || event.value) {
                this.ref = WorldListState.area;
            } else {
                this.ref = WorldListState.defaultArea;
            }
        });
        /* view */
        this.#titleEl = this.shadowRoot.getElementById("title");
        this.#hintEl = this.shadowRoot.getElementById("hint");
        this.#viewEl = this.shadowRoot.getElementById("view");
        this.#overviewEl = this.shadowRoot.getElementById("overview");
        this.#metaAreaButtonEl = this.shadowRoot.getElementById("meta-area-button");
        this.#metaAreaViewEl = this.shadowRoot.getElementById("meta-area-view");
        const resetTransformButtonEl = this.shadowRoot.getElementById("reset-transform-button");
        const iconEl = this.shadowRoot.getElementById("overview-icon");
        this.#viewEl.addEventListener("transform", (event) => {
            this.#overviewEl.setTransform(event.x, event.y, event.zoom);
            this.#sliderEl.value = event.zoom;
            if (this.#viewEl.isDefaultTransformation()) {
                resetTransformButtonEl.classList.add("hidden");
            } else {
                resetTransformButtonEl.classList.remove("hidden");
            }
        });
        this.#overviewEl.addEventListener("move", (event) => {
            this.#viewEl.setTranslation(event.x, event.y);
        });
        iconEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });

        /* ZOOM */
        this.#sliderEl = this.shadowRoot.getElementById("zoom-slider");
        this.#sliderEl.addEventListener("input", (event) => {
            const zoom = event.value;
            this.#viewEl.setZoom(zoom, 0, 0);
        });
        this.addEventListener("wheel", (event) => {
            if (!this.fixed) {
                const parW = this.#viewEl.clientWidth;
                const parH = this.#viewEl.clientHeight;
                const anchorX = event.layerX - parW / 2;
                const anchorY = event.layerY - parH / 2;
                const zoom = this.#viewEl.zoom;
                if (zoom > 100) {
                    const delta = Math.sign(event.deltaY) * LARGE_ZOOM_SPD;
                    this.#viewEl.setZoom(zoom - delta, anchorX, anchorY);
                } else if (zoom > 50) {
                    const delta = Math.sign(event.deltaY) * NORMAL_ZOOM_SPD;
                    this.#viewEl.setZoom(zoom - delta, anchorX, anchorY);
                } else {
                    const delta = Math.sign(event.deltaY) * SMALL_ZOOM_SPD;
                    this.#viewEl.setZoom(zoom - delta, anchorX, anchorY);
                }
            }
            event.stopPropagation();
            event.preventDefault();
        });

        const resetTransformEl = this.shadowRoot.getElementById("reset-transform-button");
        resetTransformEl.addEventListener("click", (event) => {
            this.#viewEl.resetTransformation();
            event.stopPropagation();
            event.preventDefault();
            return false;
        });

        /* meta area */
        if (WorldListState.config.metaArea.active) {
            this.#metaAreaButtonEl.addEventListener("click", () => {
                this.#metaAreaViewEl.show();
            });
        } else {
            this.#metaAreaButtonEl.style.display = "none";
        }
    }

    connectedCallback() {
        super.connectedCallback();
        /* init reference */
        this.ref = WorldListState.area;
    }

    applyDefaultValues() {
        /* title */
        this.#titleEl.ref = "";
        /* overview */
        this.#overviewEl.ref = "";
        /* view */
        this.#viewEl.ref = "";
        /* hint button */
        this.#hintEl.ref = "";
    }

    applyStateValues(state) {
        /* title */
        this.#titleEl.ref = state.ref;
        /* overview */
        this.#overviewEl.ref = state.ref;
        /* view */
        this.#viewEl.ref = state.ref;
        /* hint button */
        this.#hintEl.ref = state.ref;
    }

    get ref() {
        return this.getAttribute("ref") ?? WorldListState.defaultArea;
    }

    set ref(value) {
        this.setAttribute("ref", value);
    }

    get detailed() {
        const res = this.getAttribute("detailed");
        return res != null && res !== "false";
    }

    set detailed(value) {
        this.setAttribute("detailed", !!value);
    }

    get storeTransform() {
        return this.getAttribute("storetransform");
    }

    set storeTransform(val) {
        this.setAttribute("storetransform", val);
    }

    static get observedAttributes() {
        return ["ref", "detailed", "storetransform"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = AreaStateManager.get(this.ref);
                    if (state?.hasMap) {
                        this.switchState(state);
                    } else {
                        const defaultState = AreaStateManager.get(WorldListState.defaultArea);
                        this.switchState(defaultState);
                    }
                } break;
                case "detailed": {
                    if (newValue != null && newValue !== "false" || showDetailedMapsObserver.value) {
                        this.ref = WorldListState.area;
                    } else {
                        this.ref = WorldListState.defaultArea;
                    }
                } break;
                case "storetransform": {
                    this.#viewEl.storeTransform = newValue;
                } break;
            }
        }
    }

}

Panel.registerReference("worldmap", WorldMap);
customElements.define("gt-worldmap", WorldMap);
