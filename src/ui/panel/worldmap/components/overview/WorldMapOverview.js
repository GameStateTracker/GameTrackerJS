import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import {mix} from "@emcjs/core/mixin/Mixin.js";
import EventTargetManager from "@emcjs/core/util/event/EventTargetManager.js";
import ElementManager from "@emcjs/fe/util/element/ElementManager.js";
import "@emcjs/fe/ui/i18n/I18nLabel.js";
import AreaStateManager from "../../../../../statemanager/world/area/AreaStateManager.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import "./entries/OverviewPOI.js";
import TPL from "./WorldMapOverview.js.html" assert {type: "html"};
import STYLE from "./WorldMapOverview.js.css" assert {type: "css"};

class POIElementManager extends ElementManager {

    composer(key, params) {
        const el = document.createElement("gt-worldmap-overview-poi");
        el.ref = key;
        el.type = params.type;
        return el;
    }

    mutator(el, key, params) {
        el.left = params.x;
        el.top = params.y;
        el.scale = params.scale;
    }

}

const ZOOM_MIN = 10;
const ZOOM_MAX = 200;

const BaseClass = mix(CustomElement).with(StateDataEventManagerMixin);

export default class WorldMapOverview extends BaseClass {

    #poiElementManager;

    #mapEl;

    #focusEl;

    #poiPlaneEl;

    #width = 0;

    #height = 0;

    #zoom = 100;

    #offsetX = 0;

    #offsetY = 0;

    #viewportWidth = 0;

    #viewportHeight = 0;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("listChange", () => {
            this.#refreshPOIList();
        });
        /* --- */
        this.#mapEl = this.shadowRoot.getElementById("map");
        this.#focusEl = this.shadowRoot.getElementById("focus");
        this.#poiPlaneEl = this.shadowRoot.getElementById("poi-plane");
        const mapEventManager = new EventTargetManager(this.#mapEl, false);
        this.#mapEl.addEventListener("mousedown", (event) => {
            if (event.button === 0) {
                const evX = event.layerX;
                const evY = event.layerY;
                this.#moveFocus(evX, evY);
                mapEventManager.active = true;
            }
            event.preventDefault();
            return false;
        });
        mapEventManager.set("mousemove", (event) => {
            if (event.button === 0) {
                const evX = event.layerX;
                const evY = event.layerY;
                this.#moveFocus(evX, evY);
            }
            event.preventDefault();
            return false;
        });
        mapEventManager.set(["mouseup", "mouseleave"], (event) => {
            if (event.button === 0) {
                mapEventManager.active = false;
            }
        });
        /* --- */
        this.#poiElementManager = new POIElementManager(this.#poiPlaneEl);
    }

    connectedCallback() {
        super.connectedCallback?.();
        this.refreshView();
    }

    refreshView() {
        this.#refreshMaskBoundaries();
        this.#resizePOIPlane();
    }

    setTransform(x, y, zoom) {
        this.#offsetX = x;
        this.#offsetY = y;
        this.#zoom = zoom;
        this.#refreshMaskBoundaries();
    }

    #moveFocus(x, y) {
        const mapViewWidth = this.#mapEl.clientWidth;
        const mapViewHeight = this.#mapEl.clientHeight;
        const scale = Math.max(this.#width, this.#height) * this.#zoom / 100;
        /* event */
        const ev = new Event("move");
        ev.x = -(x - mapViewWidth / 2) * (scale / mapViewWidth);
        ev.y = -(y - mapViewHeight / 2) * (scale / mapViewHeight);
        this.dispatchEvent(ev);
    }

    setViewportSize(viewportWidth, viewportHeight) {
        if (this.#viewportWidth != viewportWidth || this.#viewportHeight != viewportHeight) {
            this.#viewportWidth = viewportWidth;
            this.#viewportHeight = viewportHeight;
            this.#refreshMaskBoundaries();
        }
    }

    applyDefaultValues() {
        /* VALUES */
        this.#width = 0;
        this.#height = 0;
        this.#zoom = 100;
        this.#offsetX = 0;
        this.#offsetY = 0;
        /* map */
        this.#mapEl.style.backgroundImage = "";
        this.#focusEl.style.backgroundImage = "";
        this.#refreshMaskBoundaries();
        /* POI plane */
        this.#resizePOIPlane();
        this.#refreshPOIList();
    }

    applyStateValues(state) {
        const mapData = state.props.map;
        /* VALUES */
        const width = mapData.width ?? 0;
        const height = mapData.height ?? 0;
        const zoom = Math.min(Math.max(ZOOM_MIN, Math.floor(mapData.zoom ?? 100)), ZOOM_MAX);
        this.#width = width;
        this.#height = height;
        this.#zoom = zoom;
        this.#offsetX = 0;
        this.#offsetY = 0;
        /* map */
        this.#mapEl.style.backgroundImage = `url("${mapData.backgroundImage}")`;
        this.#focusEl.style.backgroundImage = `url("${mapData.backgroundImage}")`;
        this.#refreshMaskBoundaries();
        /* POI plane */
        this.#resizePOIPlane();
        this.#refreshPOIList();
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get ref() {
        return this.getAttribute("ref");
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = AreaStateManager.get(this.ref);
                    this.switchState(state);
                } break;
            }
        }
    }

    #refreshMaskBoundaries() {
        if (this.#viewportWidth <= 0 || this.#viewportHeight <= 0 || this.#width <= 0 || this.#height <= 0) {
            this.#focusEl.style.setProperty("--left", 0);
            this.#focusEl.style.setProperty("--top", 0);
            this.#focusEl.style.setProperty("--right", 0);
            this.#focusEl.style.setProperty("--bottom", 0);
        } else {
            const mapViewWidth = this.#mapEl.clientWidth;
            const mapViewHeight = this.#mapEl.clientHeight;

            const scaleFactor = Math.max(this.#width, this.#height);
            const scaleX = mapViewWidth / scaleFactor;
            const scaleY = mapViewHeight / scaleFactor;
            const mapWidth = this.#width * this.#zoom / 100;
            const mapHeight = this.#height * this.#zoom / 100;

            const minmapWidth = this.#width * scaleX;
            const minmapH = this.#height * scaleY;
            const focusRectWidth = minmapWidth / mapWidth * this.#viewportWidth;
            const focusRectHeight = minmapH / mapHeight * this.#viewportHeight;
            const focusRectHalfWidth = focusRectWidth / 2;
            const focusRectHalfHeight = focusRectHeight / 2;

            const posX = -this.#offsetX * minmapWidth / mapWidth;
            const posY = -this.#offsetY * minmapH / mapHeight;

            const left = mapViewWidth / 2 + posX - focusRectHalfWidth;
            const top = mapViewHeight / 2 + posY - focusRectHalfHeight;
            const right = mapViewWidth / 2 - posX - focusRectHalfWidth;
            const bottom = mapViewHeight / 2 - posY - focusRectHalfHeight;

            this.#focusEl.style.setProperty("--left", left);
            this.#focusEl.style.setProperty("--top", top);
            this.#focusEl.style.setProperty("--right", right);
            this.#focusEl.style.setProperty("--bottom", bottom);
        }
    }

    #resizePOIPlane() {
        this.#poiPlaneEl.style.width = `${this.#width}px`;
        this.#poiPlaneEl.style.height = `${this.#height}px`;
        const mapViewWidth = this.#mapEl.clientWidth;
        const mapViewHeight = this.#mapEl.clientHeight;
        const scaleFactor = Math.max(this.#width, this.#height);
        const scaleX = mapViewWidth / scaleFactor;
        const scaleY = mapViewHeight / scaleFactor;
        this.#poiPlaneEl.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`;
    }

    #refreshPOIList() {
        const elManagerData = [];
        const state = this.getState();
        if (state != null) {
            const list = state.getList();
            if (list != null && list.length > 0) {
                for (const record of list) {
                    if (!isNaN(record.x) && !isNaN(record.y)) {
                        const loc = record.entry;
                        elManagerData.push({
                            key: loc.ref,
                            type: record.type,
                            x: record.x,
                            y: record.y,
                            scale: record.scale
                        });
                    }
                }
            }
        }
        this.#poiElementManager.manage(elManagerData);
    }

}

customElements.define("gt-worldmap-overview", WorldMapOverview);
