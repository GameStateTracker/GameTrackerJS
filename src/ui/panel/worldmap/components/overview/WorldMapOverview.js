import CustomElement from "/emcJS/ui/element/CustomElement.js";
import {mix} from "/emcJS/util/Mixin.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import "/emcJS/ui/i18n/I18nLabel.js";

import AreaStateManager from "../../../../../statemanager/world/area/AreaStateManager.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import TPL from "./WorldMapOverview.js.html" assert {type: "html"};
import STYLE from "./WorldMapOverview.js.css" assert {type: "css"};

const ZOOM_MIN = 10;
const ZOOM_MAX = 200;

const BaseClass = mix(CustomElement).with(StateDataEventManagerMixin);

export default class WorldMapOverview extends BaseClass {

    #containerEl;

    #focusEl;

    #mapEl;

    #width = 0;

    #height = 0;

    #zoom = 100;

    #offsetX = 0;

    #offsetY = 0;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);

        /* --- */
        this.#focusEl = this.shadowRoot.getElementById("focus");
        this.#mapEl = this.shadowRoot.getElementById("map");
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

        window.addEventListener("resize", () => {
            this.#refreshMaskBoundaries();
        });
    }

    connectedCallback() {
        this.#refreshMaskBoundaries();
    }

    setTransform(x, y, zoom) {
        this.#offsetX = x;
        this.#offsetY = y;
        this.#zoom = zoom;
        this.#refreshMaskBoundaries();
    }

    #moveFocus(x, y) {
        const oWidth = this.clientWidth;
        const oHeight = this.clientHeight;
        const scale = Math.max(this.#width, this.#height) * this.#zoom / 100;
        /* event */
        const ev = new Event("move");
        ev.x = -(x - oWidth / 2) * (scale / oWidth);
        ev.y = -(y - oHeight / 2) * (scale / oHeight);
        this.dispatchEvent(ev);
    }

    setContainer(containerEl) {
        if (this.#containerEl != containerEl) {
            this.#containerEl = containerEl;
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
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get ref() {
        return this.getAttribute("ref");
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
                } break;
            }
        }
    }

    #refreshMaskBoundaries() {
        if (this.#containerEl == null || this.#width <= 0 || this.#height <= 0) {
            this.#focusEl.style.setProperty("--left", 0);
            this.#focusEl.style.setProperty("--top", 0);
            this.#focusEl.style.setProperty("--right", 0);
            this.#focusEl.style.setProperty("--bottom", 0);
        } else {
            const oWidth = this.clientWidth;
            const oHeight = this.clientHeight;

            const scaleX = oWidth / Math.max(this.#width, this.#height);
            const scaleY = oHeight / Math.max(this.#width, this.#height);
            const mapW = this.#width * this.#zoom / 100;
            const mapH = this.#height * this.#zoom / 100;

            const minmapW = this.#width * scaleX;
            const minmapH = this.#height * scaleY;
            const cntW = this.#containerEl.clientWidth;
            const cntH = this.#containerEl.clientHeight;
            const rectW = minmapW / mapW * cntW;
            const rectH = minmapH / mapH * cntH;
            const halfW = rectW / 2;
            const halfH = rectH / 2;

            const posX = -this.#offsetX * minmapW / mapW;
            const posY = -this.#offsetY * minmapH / mapH;

            const left = oWidth / 2 + posX - halfW;
            const top = oHeight / 2 + posY - halfH;
            const right = oWidth / 2 - posX - halfW;
            const bottom = oHeight / 2 - posY - halfH;

            this.#focusEl.style.setProperty("--left", left);
            this.#focusEl.style.setProperty("--top", top);
            this.#focusEl.style.setProperty("--right", right);
            this.#focusEl.style.setProperty("--bottom", bottom);
        }
    }

}

customElements.define("gt-worldmap-overview", WorldMapOverview);
