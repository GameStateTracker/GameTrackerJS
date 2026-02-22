import {mix} from "/emcJS/util/Mixin.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import "/emcJS/ui/i18n/I18nTooltip.js";

import WorldListState from "../../../state/world/WorldListState.js";
import AreaStateManager from "../../../statemanager/world/area/AreaStateManager.js";
import StateDataEventManagerMixin from "../../mixin/StateDataEventManagerMixin.js";
import "../../button/FilterMenuButton.js";
import "../../button/HintButton.js";
import "./components/WorldMapView.js";
import "./components/settings/WorldMapSettingsPanel.js";
import "./components/WorldMapTitle.js";
import "./components/metaarea/WorldMapMetaAreaButton.js";
import "./components/metaarea/WorldMapMetaAreaView.js";
import "./components/detailedmaps/WorldMapDetailedMapsButton.js";
import SettingsObserver from "../../../util/observer/SettingsObserver.js";
import TPL from "./WorldMap.js.html" assert {type: "html"};
import STYLE from "./WorldMap.js.css" assert {type: "css"};

const showDetailedMapsObserver = new SettingsObserver("show_detailed_maps");
const mapPanSnapMagnetForce = new SettingsObserver("map_pan_snap_magnet_force");

const SMALL_ZOOM_SPD = 1;
const NORMAL_ZOOM_SPD = 2;
const LARGE_ZOOM_SPD = 5;

const BaseClass = mix(Panel).with(StateDataEventManagerMixin);

export default class WorldMap extends BaseClass {

    #titleEl;

    #hintEl;

    #viewEl;

    #mapSettingsEl;

    #metaAreaButtonEl;

    #metaAreaViewEl;

    #resizeObserver = new ResizeObserver(() => {
        this.#refreshOverviewViewportSize();
    });

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* state handler */
        WorldListState.addEventListener("area", (event) => {
            this.ref = event.value;
        });
        showDetailedMapsObserver.onChange(() => {
            this.#refreshMapArea();
        });
        /* view */
        this.#titleEl = this.shadowRoot.getElementById("title");
        this.#hintEl = this.shadowRoot.getElementById("hint");
        this.#viewEl = this.shadowRoot.getElementById("view");
        this.#mapSettingsEl = this.shadowRoot.getElementById("map-settings");
        this.#metaAreaButtonEl = this.shadowRoot.getElementById("meta-area-button");
        this.#metaAreaViewEl = this.shadowRoot.getElementById("meta-area-view");
        this.#viewEl.addEventListener("transform", (event) => {
            this.#mapSettingsEl.setTransform(event.x, event.y, event.zoom);
            this.#mapSettingsEl.setResetButtonActive(!this.#viewEl.isDefaultTransformation());
        });
        this.#mapSettingsEl.addEventListener("move", (event) => {
            this.#viewEl.setTranslation(event.x, event.y);
        });

        /* ZOOM */
        this.#mapSettingsEl.addEventListener("zoom", (event) => {
            const zoom = event.value;
            this.#viewEl.setZoom(zoom, 0, 0);
        });
        this.addEventListener("wheel", (event) => {
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
            event.stopPropagation();
            event.preventDefault();
        });

        this.#mapSettingsEl.addEventListener("reset", (event) => {
            this.#viewEl.resetTransformation();
            event.stopPropagation();
            event.preventDefault();
            return false;
        });

        /* snap */
        mapPanSnapMagnetForce.onChange(() => {
            this.#viewEl.panSnapMagnetForce = mapPanSnapMagnetForce.value / 10;
        });
        this.#viewEl.panSnapMagnetForce = mapPanSnapMagnetForce.value / 10;

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
        super.connectedCallback?.();
        /* init reference */
        this.ref = WorldListState.area;
        /* init detailed maps button */
        this.#mapSettingsEl.setDetailedMapsVisible(this.detailed == null);
        /* --- */
        this.#mapSettingsEl.setResetButtonActive(!this.#viewEl.isDefaultTransformation());
        this.#resizeObserver.observe(this.#viewEl);
        this.#refreshOverviewViewportSize();
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
        this.#resizeObserver.disconnect();
    }

    applyDefaultValues() {
        /* title */
        this.#titleEl.ref = "";
        /* overview */
        this.#mapSettingsEl.ref = "";
        /* view */
        this.#viewEl.ref = "";
        /* hint button */
        this.#hintEl.ref = "";
    }

    applyStateValues(state) {
        /* title */
        this.#titleEl.ref = state.ref;
        /* overview */
        this.#mapSettingsEl.ref = state.ref;
        /* view */
        this.#viewEl.ref = state.ref;
        /* hint button */
        this.#hintEl.ref = state.ref;
    }

    set ref(value) {
        this.setAttribute("ref", value);
    }

    get ref() {
        return this.getAttribute("ref") ?? WorldListState.defaultArea;
    }

    set detailed(value) {
        this.setAttribute("detailed", !!value);
    }

    get detailed() {
        const res = this.getAttribute("detailed");
        if (res != null) {
            return res !== "false";
        }
        return null;
    }

    set storeTransform(val) {
        this.setAttribute("storetransform", val);
    }

    get storeTransform() {
        return this.getAttribute("storetransform");
    }

    static get observedAttributes() {
        return ["ref", "detailed", "storetransform"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    this.#refreshMapArea();
                } break;
                case "detailed": {
                    this.#refreshMapArea();
                    this.#mapSettingsEl.setDetailedMapsVisible(this.detailed == null);
                } break;
                case "storetransform": {
                    this.#viewEl.storeTransform = newValue;
                } break;
            }
        }
    }

    #refreshMapArea() {
        if (this.getDetailedMapsActive()) {
            const state = AreaStateManager.get(this.ref);
            if (state?.hasMap) {
                this.switchState(state);
                return;
            }
        }
        const defaultState = AreaStateManager.get(WorldListState.defaultArea);
        this.switchState(defaultState);
    }

    getDetailedMapsActive() {
        const res = this.detailed;
        if (res == null) {
            return showDetailedMapsObserver.value;
        } else {
            return res !== "false";
        }
    }

    #refreshOverviewViewportSize() {
        const cntW = this.#viewEl.clientWidth;
        const cntH = this.#viewEl.clientHeight;
        this.#mapSettingsEl.setViewportSize(cntW, cntH);
    }

}

Panel.registerReference("worldmap", WorldMap);
customElements.define("gt-worldmap", WorldMap);
