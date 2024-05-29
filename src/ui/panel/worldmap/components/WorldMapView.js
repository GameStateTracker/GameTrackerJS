// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/element/CustomElement.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import ElementManager from "/emcJS/util/html/ElementManager.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import ParameterStorage from "../../../../storage/ParameterStorage.js";
import SettingsObserver from "../../../../util/observer/SettingsObserver.js";
import AreaStateManager from "../../../../statemanager/world/area/AreaStateManager.js";
import UIRegistry from "../../../../registry/UIRegistry.js";
import StateDataEventManagerMixin from "../../../mixin/StateDataEventManagerMixin.js";
import "../../../button/FilterMenuButton.js";
import "../../../button/HintButton.js";
import "./entries/Location.js";
import "./entries/Area.js";
import "./entries/Exit.js";
import "./connection/Connection.js";
import "./connection/ConnectionPoint.js";

const showMapConnectionsObserver = new SettingsObserver("show_map_connections");

const TPL = new Template(`
<slot id="map">
</slot>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    user-select: none;
}
#map {
    display: block;
    width: 1000px;
    height: 1000px;
    flex-shrink: 0;
    background-color: var(--page-text-color, #000000);
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center;
    background-origin: content-box;
    transform-origin: center;
    transform:
        translate(
            calc(var(--offset-x, 0) * 1px),
            calc(var(--offset-y, 0) * 1px)
        )
        scale(
            calc(var(--zoom, 100) / 100)
        );
    cursor: grab;
}
#map.grabbed {
    cursor: grabbing;
}
::slotted(*) {
    position: absolute;
}
`);

class MapMarkerElementManager extends ElementManager {

    composer(key, params) {
        if (params.type === "connection") {
            return document.createElement("gt-connection");
        }
        const uiReg = UIRegistry.get(`worldmap-${params.type.toLowerCase()}`);
        if (uiReg != null) {
            return uiReg.create(params.subtype, key);
        }
    }

    mutator(el, key, params) {
        if (params.type === "connection") {
            el.innerHTML = "";
            for (const position of params.coordinates) {
                const {x, y} = position ?? {};
                if (!isNaN(x) && !isNaN(y)) {
                    const connectionPointEl = document.createElement("gt-connection-point");
                    connectionPointEl.label = params.label;
                    connectionPointEl.left = position.x;
                    connectionPointEl.top = position.y;
                    connectionPointEl.scale = position.scale;
                    el.append(connectionPointEl);
                }
            }
        } else {
            el.left = params.x;
            el.top = params.y;
            el.scale = params.scale;
            // XXX tooltips should really automatically adjust
            el.tooltip = calculateTooltipPosition(params.x, params.y, params.areaWidth, params.areaHeight);
        }
    }

}

const ZOOM_MIN = 10;
const ZOOM_MAX = 200;

const BaseClass = mix(
    CustomElement
).with(
    StateDataEventManagerMixin
);

export default class WorldMapView extends BaseClass {

    #elementManager;

    #zoom = 100;

    #offsetX = 0;

    #offsetY = 0;

    #mapEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);

        /* state handler */
        this.registerStateHandler("listChange", () => {
            this.refreshList();
        });

        /* MAP EVENTS */
        this.#mapEl = this.shadowRoot.getElementById("map");
        const mapEventManager = new EventTargetManager(this.#mapEl, false);
        this.#mapEl.addEventListener("mousedown", (event) => {
            if (event.target === this.#mapEl || event.target.tagName === "GT-CONNECTION-POINT") {
                if (!this.fixed && event.button === 0) {
                    this.#mapEl.classList.add("grabbed");
                    mapEventManager.setActive(true);
                }
                event.preventDefault();
                return false;
            }
        });
        mapEventManager.set("mousemove", (event) => {
            if (this.#mapEl.classList.contains("grabbed")) {
                if (event.button === 0) {
                    const vrtX = this.#offsetX;
                    const vrtY = this.#offsetY;
                    const forceX = event.movementX;
                    const forceY = event.movementY;
                    this.setTranslation(vrtX + forceX, vrtY + forceY);
                }
            }
        });
        mapEventManager.set("mouseup", (event) => {
            if (this.#mapEl.classList.contains("grabbed")) {
                if (event.button === 0) {
                    this.#mapEl.classList.remove("grabbed");
                    mapEventManager.setActive(false);
                }
            }
        });
        mapEventManager.set("mouseleave", (event) => {
            if (event.target === this.#mapEl) {
                if (event.button === 0) {
                    this.#mapEl.classList.remove("grabbed");
                    mapEventManager.setActive(false);
                }
            }
        });
        /* settings */
        showMapConnectionsObserver.addEventListener("change", () => {
            this.refreshList();
        });

        /* --- */
        this.#elementManager = new MapMarkerElementManager(this);
    }

    applyDefaultValues() {
        /* map */
        this.#mapEl.style.backgroundColor = "#000000";
        this.#mapEl.style.backgroundImage = "";
        this.#mapEl.style.width = "600px";
        this.#mapEl.style.height = "600px";
        /* value */
        this.#mapEl.style.setProperty("--zoom", 100);
        this.#mapEl.style.setProperty("--offset-x", 0);
        this.#mapEl.style.setProperty("--offset-y", 0);
        this.#zoom = 100;
        this.#offsetX = 0;
        this.#offsetY = 0;
        /* event */
        const ev = new Event("transform");
        ev.zoom = 100;
        ev.x = 0;
        ev.y = 0;
        this.dispatchEvent(ev);
        /* list */
        this.refreshList();
    }

    applyStateValues(state) {
        /* map */
        const mapData = state.props.map;
        this.#mapEl.style.backgroundColor = mapData.backgroundColor;
        this.#mapEl.style.backgroundImage = `url("${mapData.backgroundImage}")`;
        this.#mapEl.style.width = `${mapData.width}px`;
        this.#mapEl.style.height = `${mapData.height}px`;
        /* value */
        const {x = 0, y = 0, zoom = mapData.zoom ?? 100} = this.#loadTransformation() ?? {};
        const resultZoom = Math.min(Math.max(ZOOM_MIN, Math.floor(zoom ?? 100)), ZOOM_MAX);
        this.#mapEl.style.setProperty("--zoom", resultZoom);
        this.#mapEl.style.setProperty("--offset-x", x);
        this.#mapEl.style.setProperty("--offset-y", y);
        this.#zoom = resultZoom;
        this.#offsetX = x;
        this.#offsetY = y;
        /* event */
        const ev = new Event("transform");
        ev.zoom = resultZoom;
        ev.x = x;
        ev.y = y;
        this.dispatchEvent(ev);
        /* list */
        this.refreshList();
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

    get storeTransform() {
        return this.getAttribute("storetransform");
    }

    set storeTransform(val) {
        this.setAttribute("storetransform", val);
    }

    static get observedAttributes() {
        return ["ref", "storetransform"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = AreaStateManager.get(this.ref);
                    this.switchState(state);
                } break;
                case "storetransform": {
                    const state = this.getState();
                    if (state != null) {
                        const mapData = state.props.map;
                        const {x = 0, y = 0, zoom = mapData.zoom ?? 100} = this.#loadTransformation() ?? {};
                        const resultZoom = Math.min(Math.max(ZOOM_MIN, Math.floor(zoom ?? 100)), ZOOM_MAX);
                        this.#mapEl.style.setProperty("--zoom", resultZoom);
                        this.#mapEl.style.setProperty("--offset-x", x);
                        this.#mapEl.style.setProperty("--offset-y", y);
                        this.#zoom = resultZoom;
                        this.#offsetX = x;
                        this.#offsetY = y;
                    }
                } break;
            }
        }
    }

    get zoom() {
        return this.#zoom;
    }

    get x() {
        return this.#offsetX;
    }

    get y() {
        return this.#offsetY;
    }

    setTranslation(x, y) {
        this.#setTranslation(x, y);
        this.#saveTransformation();
    }

    #setTranslation(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        const [offsetX, offsetY] = this.#containBoundaries(x, y, this.#zoom);
        if (this.#offsetX != offsetX || this.#offsetY != offsetY) {
            this.#offsetX = offsetX;
            this.#offsetY = offsetY;
            /* style */
            const mapEl = this.shadowRoot.getElementById("map");
            mapEl.style.setProperty("--offset-x", offsetX);
            mapEl.style.setProperty("--offset-y", offsetY);
            /* event */
            const ev = new Event("transform");
            ev.zoom = this.#zoom;
            ev.x = offsetX;
            ev.y = offsetY;
            this.dispatchEvent(ev);
        }
    }

    setZoom(zoom/* , anchorX = 0, anchorY = 0 */) {
        this.#setZoom(zoom/* , anchorX, anchorY */);
        this.#saveTransformation();
    }

    #setZoom(zoom/* , anchorX = 0, anchorY = 0 */) {
        zoom = Math.min(Math.max(ZOOM_MIN, Math.floor(zoom)), ZOOM_MAX);
        if (this.#zoom != zoom) {
            const mapEl = this.shadowRoot.getElementById("map");
            this.#zoom = zoom;
            const x = this.#offsetX;
            const y = this.#offsetY;

            /* calculate anchor focus shift */
            // const scale = 100 / zoom;
            // const oldScale = 100 / old;

            // const newX = x * oldScale / scale;
            // const newY = y * oldScale / scale;

            // const newDiffX = anchorX * scale;
            // const newDiffY = anchorY * scale;
            // const oldDiffX = anchorX * oldScale;
            // const oldDiffY = anchorY * oldScale;

            // console.log("zoom diff\n\"x\": %d, \"y\": %d", focusDiffX, focusDiffY);

            // const newX = x - focusDiffX;
            // const newY = y - focusDiffY;

            // console.log("zoom result\n\"x\": %d, \"y\": %d", newX, newY);

            /* recalculate offsets to stay inside boundaries */
            const [offsetX, offsetY] = this.#containBoundaries(x, y, zoom);
            this.#offsetX = offsetX;
            this.#offsetY = offsetY;

            /* style */
            mapEl.style.setProperty("--zoom", zoom);
            mapEl.style.setProperty("--offset-x", offsetX);
            mapEl.style.setProperty("--offset-y", offsetY);

            /* event */
            const ev = new Event("transform");
            ev.zoom = zoom;
            ev.x = offsetX;
            ev.y = offsetY;
            this.dispatchEvent(ev);
        }
    }

    #containBoundaries(vrtX, vrtY, zoom) {
        const scale = zoom / 100;
        const mapEl = this.shadowRoot.getElementById("map");
        const parW = this.clientWidth;
        const parH = this.clientHeight;
        const vrtW = mapEl.clientWidth * scale;
        const vrtH = mapEl.clientHeight * scale;

        if (parW > vrtW) {
            const dst = parW / 2 - vrtW / 2;
            vrtX = Math.min(Math.max(-dst, vrtX), dst);
        } else {
            const dst = -(parW / 2 - vrtW / 2);
            vrtX = Math.min(Math.max(-dst, vrtX), dst);
        }
        if (parH > vrtH) {
            const dst = parH / 2 - vrtH / 2;
            vrtY = Math.min(Math.max(-dst, vrtY), dst);
        } else {
            const dst = -(parH / 2 - vrtH / 2);
            vrtY = Math.min(Math.max(-dst, vrtY), dst);
        }

        return [vrtX, vrtY];
    }

    refreshList() {
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
                            subtype: loc.props.type,
                            x: record.x,
                            y: record.y,
                            scale: record.scale,
                            areaWidth: state.props.map.width,
                            areaHeight: state.props.map.height
                        });
                    }
                }
            }
            if (showMapConnectionsObserver.value) {
                const connections = state.props.connections;
                if (connections != null) {
                    for (const connection of connections) {
                        elManagerData.push({
                            key: `connection___${connection.label}`,
                            label: connection.label,
                            type: "connection",
                            coordinates: [
                                connection.posA,
                                connection.posB
                            ]
                        });
                    }
                }
            }
        }
        this.#elementManager.manage(elManagerData);
    }

    #saveTransformation = debounce(() => {
        if (typeof this.storeTransform === "string" && this.storeTransform !== "") {
            ParameterStorage.set(`worldmap_transform[${this.storeTransform}][${this.ref}]`, {
                x: this.#offsetX,
                y: this.#offsetY,
                zoom: this.#zoom
            });
        }
    });

    #loadTransformation() {
        if (typeof this.storeTransform === "string" && this.storeTransform !== "") {
            return ParameterStorage.get(`worldmap_transform[${this.storeTransform}][${this.ref}]`);
        }
    }

    resetTransformation() {
        if (typeof this.storeTransform === "string" && this.storeTransform !== "") {
            ParameterStorage.delete(`worldmap_transform[${this.storeTransform}][${this.ref}]`);
            const state = this.getState();
            if (state != null) {
                const mapData = state.props.map;
                const resultZoom = Math.min(Math.max(ZOOM_MIN, Math.floor(mapData.zoom ?? 100)), ZOOM_MAX);
                this.#setZoom(resultZoom, 0, 0);
            } else {
                this.#setZoom(100, 0, 0);
            }
            this.#setTranslation(0, 0);
        }
    }

    isDefaultTransformation() {
        const state = this.getState();
        if (state != null) {
            const mapData = state.props.map;
            const defaultZoom = mapData.zoom ?? 100;
            return this.#offsetX === 0 && this.#offsetY === 0 && this.#zoom === defaultZoom;
        }
    }

}

customElements.define("gt-worldmap-view", WorldMapView);

function calculateTooltipPosition(posX, posY, mapW, mapH) {
    const leftP = posX / mapW;
    const topP = posY / mapH;
    let tooltip = "";
    if (topP < 0.3) {
        tooltip = "bottom";
    } else if (topP > 0.7) {
        tooltip = "top";
    }
    if (leftP < 0.3) {
        tooltip += "right";
    } else if (leftP > 0.7) {
        tooltip += "left";
    }
    return tooltip || "top";
}
