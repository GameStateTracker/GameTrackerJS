// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import "/emcJS/ui/i18n/I18nLabel.js";

import AreaStateManager from "../../../../statemanager/world/area/AreaStateManager.js";
import StateDataEventManagerMixin from "../../../mixin/StateDataEventManagerMixin.js";

const TPL = new Template(`
<div id="map">
    <div id="shadow">
        <div id="focus">
        </div>
    </div>
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    display: block;
    width: 200px;
    height: 200px;
}
#map {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background-color: #000000;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-origin: content-box;
    overflow: hidden;
}
#shadow {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.7);
    flex-shrink: 0;
    pointer-events: none;
}
#focus {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-origin: content-box;
    overflow: hidden;

    clip-path: inset(
        calc(var(--top, 0) * 1px)
        calc(var(--right, 0) * 1px)
        calc(var(--bottom, 0) * 1px)
        calc(var(--left, 0) * 1px)
    );
}
`);

const WIDTH = new WeakMap();
const HEIGHT = new WeakMap();
const ZOOM = new WeakMap();
const OFFSET_X = new WeakMap();
const OFFSET_Y = new WeakMap();

const BaseClass = mix(
    CustomElement
).with(
    StateDataEventManagerMixin
);

export default class WorldMapOverview extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);

        /* VALUES */
        WIDTH.set(this, 0);
        HEIGHT.set(this, 0);
        ZOOM.set(this, 100);
        OFFSET_X.set(this, 0);
        OFFSET_Y.set(this, 0);

        /* MAP EVENTS */
        const mapEl = this.shadowRoot.getElementById("map");
        const mapEventManager = new EventTargetManager(mapEl, false);
        mapEl.addEventListener("mousedown", (event) => {
            if (!this.fixed && event.button === 0) {
                const evX = event.layerX;
                const evY = event.layerY;
                this.#moveFocus(evX, evY);
                mapEventManager.setActive(true);
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
                mapEventManager.setActive(false);
            }
        });
        window.addEventListener("resize", () => {
            const width = WIDTH.get(this);
            const height = HEIGHT.get(this);
            const zoom = ZOOM.get(this);
            const x = OFFSET_X.get(this);
            const y = OFFSET_Y.get(this);
            this.#calcutlateMask(width, height, x, y, zoom);
        });
    }

    setTransform(x, y, zoom) {
        OFFSET_X.set(this, x);
        OFFSET_Y.set(this, y);
        ZOOM.set(this, zoom);
        const width = WIDTH.get(this);
        const height = HEIGHT.get(this);
        this.#calcutlateMask(width, height, x, y, zoom);
    }

    #moveFocus(x, y) {
        const oWidth = this.clientWidth;
        const oHeight = this.clientHeight;
        const zoom = ZOOM.get(this);
        const width = WIDTH.get(this);
        const height = HEIGHT.get(this);
        const scale = Math.max(width, height) * zoom / 100;
        /* event */
        const ev = new Event("move");
        ev.x = -(x - oWidth / 2) * (scale / oWidth);
        ev.y = -(y - oHeight / 2) * (scale / oHeight);
        this.dispatchEvent(ev);
    }

    #calcutlateMask(width, height, x, y, zoom) {
        const focusEl = this.shadowRoot.getElementById("focus");
        if (focusEl != null) {
            if (width <= 0 || height <= 0) {
                focusEl.style.setProperty("--left", 0);
                focusEl.style.setProperty("--top", 0);
                focusEl.style.setProperty("--right", 0);
                focusEl.style.setProperty("--bottom", 0);
            } else {
                const oWidth = this.clientWidth;
                const oHeight = this.clientHeight;

                const scaleX = oWidth / Math.max(width, height);
                const scaleY = oHeight / Math.max(width, height);
                const container = this.getRootNode().host;
                const cntW = container.clientWidth;
                const cntH = container.clientHeight;
                const mapW = width * zoom / 100;
                const mapH = height * zoom / 100;

                const minmapW = width * scaleX;
                const minmapH = height * scaleY;
                const rectW = minmapW / mapW * cntW;
                const rectH = minmapH / mapH * cntH;
                const halfW = rectW / 2;
                const halfH = rectH / 2;

                const posX = -x * minmapW / mapW;
                const posY = -y * minmapH / mapH;

                const left = oWidth / 2 + posX - halfW;
                const top = oHeight / 2 + posY - halfH;
                const right = oWidth / 2 - posX - halfW;
                const bottom = oHeight / 2 - posY - halfH;

                focusEl.style.setProperty("--left", left);
                focusEl.style.setProperty("--top", top);
                focusEl.style.setProperty("--right", right);
                focusEl.style.setProperty("--bottom", bottom);
            }
        }
    }

    applyDefaultValues() {
        /* VALUES */
        WIDTH.set(this, 0);
        HEIGHT.set(this, 0);
        ZOOM.set(this, 100);
        OFFSET_X.set(this, 0);
        OFFSET_Y.set(this, 0);
        /* map */
        const mapEl = this.shadowRoot.getElementById("map");
        if (mapEl != null) {
            mapEl.style.backgroundImage = "";
        }
        const focusEl = this.shadowRoot.getElementById("focus");
        if (focusEl != null) {
            focusEl.style.backgroundImage = "";
        }
        this.#calcutlateMask(0, 0, 0, 0, 100);
    }

    applyStateValues(state) {
        const mapData = state.props.map;
        /* VALUES */
        const width = mapData.width ?? 0;
        const height = mapData.height ?? 0;
        const zoom = mapData.zoom ?? 100;
        WIDTH.set(this, width);
        HEIGHT.set(this, height);
        ZOOM.set(this, zoom);
        OFFSET_X.set(this, 0);
        OFFSET_Y.set(this, 0);
        /* map */
        const mapEl = this.shadowRoot.getElementById("map");
        if (mapEl != null) {
            mapEl.style.backgroundImage = `url("/images/maps/${mapData.background}")`;
        }
        const focusEl = this.shadowRoot.getElementById("focus");
        if (focusEl != null) {
            focusEl.style.backgroundImage = `url("/images/maps/${mapData.background}")`;
        }
        this.#calcutlateMask(width, height, 0, 0, zoom);
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get fixed() {
        const value = this.getAttribute("fixed");
        return !!value && value != "false";
    }

    set fixed(val) {
        this.setAttribute("fixed", !!val);
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

}

customElements.define("gt-worldmap-overview", WorldMapOverview);
