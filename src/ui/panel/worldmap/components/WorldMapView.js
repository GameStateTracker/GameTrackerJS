// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/element/CustomElement.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import ElementManager from "/emcJS/util/html/ElementManager.js";
import "/emcJS/ui/i18n/I18nLabel.js";

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

const EL_MANAGER = new WeakMap();

function elementComposer(key, props) {
    if (props.category === "connection") {
        const connectionEl = document.createElement("gt-connection");
        for (const position of props.coordinates) {
            const connectionPointEl = document.createElement("gt-connection-point");
            connectionPointEl.label = props.label;
            connectionPointEl.left = position.x;
            connectionPointEl.top = position.y;
            connectionEl.append(connectionPointEl);
        }
        return connectionEl;
    }
    const uiReg = UIRegistry.get(`worldmap-${props.category}`);
    if (uiReg != null) {
        const markerEl = uiReg.create(props.type, key);
        markerEl.left = props.x;
        markerEl.top = props.y;
        // XXX tooltips should really automatically adjust
        markerEl.tooltip = calculateTooltipPosition(props.x, props.y, props.areaWidth, props.areaHeight);
        return markerEl;
    }
}

const ZOOM_MIN = 10;
const ZOOM_MAX = 200;
const OFFSET_X = new WeakMap();
const OFFSET_Y = new WeakMap();
const ZOOM = new WeakMap();

const BaseClass = mix(
    CustomElement
).with(
    StateDataEventManagerMixin
);

export default class WorldMapView extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);

        /* VALUES */
        OFFSET_X.set(this, 0);
        OFFSET_Y.set(this, 0);
        ZOOM.set(this, 1);

        /* state handler */
        this.registerStateHandler("listChange", () => {
            this.refreshList();
        });

        /* MAP EVENTS */
        const mapEl = this.shadowRoot.getElementById("map");
        const mapEventManager = new EventTargetManager(mapEl, false);
        mapEl.addEventListener("mousedown", (event) => {
            if (event.target === mapEl || event.target.tagName === "GT-CONNECTION-POINT") {
                if (!this.fixed && event.button === 0) {
                    console.log("map position\n\"x\": %d, \"y\": %d", event.offsetX, event.offsetY);
                    mapEl.classList.add("grabbed");
                    mapEventManager.setActive(true);
                }
                event.preventDefault();
                return false;
            }
        });
        mapEventManager.set("mousemove", (event) => {
            if (mapEl.classList.contains("grabbed")) {
                if (event.button === 0) {
                    const vrtX = OFFSET_X.get(this);
                    const vrtY = OFFSET_Y.get(this);
                    const forceX = event.movementX;
                    const forceY = event.movementY;
                    this.setTranslation(vrtX + forceX, vrtY + forceY);
                }
            }
        });
        mapEventManager.set("mouseup", (event) => {
            if (mapEl.classList.contains("grabbed")) {
                if (event.button === 0) {
                    mapEl.classList.remove("grabbed");
                    mapEventManager.setActive(false);
                }
            }
        });
        mapEventManager.set("mouseleave", (event) => {
            if (event.target === mapEl) {
                if (event.button === 0) {
                    mapEl.classList.remove("grabbed");
                    mapEventManager.setActive(false);
                }
            }
        });
        /* settings */
        showMapConnectionsObserver.addEventListener("change", () => {
            this.refreshList();
        });

        /* --- */
        EL_MANAGER.set(this, new ElementManager(this, elementComposer));
    }

    applyDefaultValues() {
        /* map */
        const mapEl = this.shadowRoot.getElementById("map");
        if (mapEl != null) {
            mapEl.style.backgroundColor = "";
            mapEl.style.backgroundImage = "";
            mapEl.style.width = "600px";
            mapEl.style.height = "600px";
            /* value */
            mapEl.style.setProperty("--offset-x", 0);
            mapEl.style.setProperty("--offset-y", 0);
            mapEl.style.setProperty("--zoom", 100);
            OFFSET_X.set(this, 0);
            OFFSET_Y.set(this, 0);
            ZOOM.set(this, 100);
            /* event */
            const ev = new Event("transform");
            ev.zoom = 100;
            ev.x = 0;
            ev.y = 0;
            this.dispatchEvent(ev);
        }
        /* list */
        this.refreshList();
    }

    applyStateValues(state) {
        /* map */
        const mapEl = this.shadowRoot.getElementById("map");
        if (mapEl != null) {
            const mapData = state.props.map;
            mapEl.style.backgroundColor = mapData.color;
            mapEl.style.backgroundImage = `url("/images/maps/${mapData.background}")`;
            mapEl.style.width = `${mapData.width}px`;
            mapEl.style.height = `${mapData.height}px`;
            /* value */
            const zoom = Math.min(Math.max(ZOOM_MIN, Math.floor(mapData.zoom ?? 100)), ZOOM_MAX);
            mapEl.style.setProperty("--offset-x", 0);
            mapEl.style.setProperty("--offset-y", 0);
            mapEl.style.setProperty("--zoom", zoom);
            OFFSET_X.set(this, 0);
            OFFSET_Y.set(this, 0);
            ZOOM.set(this, zoom);
            /* event */
            const ev = new Event("transform");
            ev.zoom = zoom;
            ev.x = 0;
            ev.y = 0;
            this.dispatchEvent(ev);
        }
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

    get zoom() {
        return ZOOM.get(this);
    }

    get x() {
        return OFFSET_X.get(this);
    }

    get y() {
        return OFFSET_Y.get(this);
    }

    setTranslation(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        const zoom = ZOOM.get(this);
        const [offsetX, offsetY] = this.#containBoundaries(x, y, zoom);
        const oldX = OFFSET_X.get(this);
        const oldY = OFFSET_Y.get(this);
        if (oldX != offsetX || oldY != offsetY) {
            OFFSET_X.set(this, offsetX);
            OFFSET_Y.set(this, offsetY);
            /* style */
            const mapEl = this.shadowRoot.getElementById("map");
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

    setZoom(zoom/* , anchorX = 0, anchorY = 0 */) {
        zoom = Math.min(Math.max(ZOOM_MIN, Math.floor(zoom)), ZOOM_MAX);
        const old = ZOOM.get(this);
        if (old != zoom) {
            const mapEl = this.shadowRoot.getElementById("map");
            ZOOM.set(this, zoom);
            const x = OFFSET_X.get(this);
            const y = OFFSET_Y.get(this);

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
            OFFSET_X.set(this, offsetX);
            OFFSET_Y.set(this, offsetY);

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
        const elManager = EL_MANAGER.get(this);
        const elManagerData = [];
        const state = this.getState();
        if (state != null) {
            const list = state.getList();
            if (list != null && list.length > 0) {
                for (const record of list) {
                    const loc = record.entry;
                    elManagerData.push({
                        key: loc.ref,
                        category: record.category,
                        type: loc.props.type,
                        x: record.x,
                        y: record.y,
                        areaWidth: state.props.map.width,
                        areaHeight: state.props.map.height
                    });
                }
            }
            if (showMapConnectionsObserver.value) {
                const connections = state.props.connections;
                if (connections != null) {
                    for (const label in connections) {
                        const coordinates = connections[label];
                        elManagerData.push({
                            key: `connection___${label}`,
                            label,
                            category: "connection",
                            coordinates
                        });
                    }
                }
            }
        }
        elManager.manage(elManagerData);
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
