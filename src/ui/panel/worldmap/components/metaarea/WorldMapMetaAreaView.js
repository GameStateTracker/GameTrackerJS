import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import {mix} from "@emcjs/core/mixin/Mixin.js";
import ElementManager from "@emcjs/fe/util/element/ElementManager.js";
import "@emcjs/fe/ui/i18n/I18nLabel.js";
import SettingsObserver from "../../../../../util/observer/SettingsObserver.js";
import WorldStateManagerRegistry from "../../../../../statemanager/WorldStateManagerRegistry.js";
import WorldListState from "../../../../../state/world/WorldListState.js";
import UIRegistry from "../../../../../registry/UIRegistry.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import "../entries/Location.js";
import "../entries/Area.js";
import "../entries/Exit.js";
import TPL from "./WorldMapMetaAreaView.js.html" assert {type: "html"};
import STYLE from "./WorldMapMetaAreaView.js.css" assert {type: "css"};

const showMapConnectionsObserver = new SettingsObserver("show_map_connections");

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
                const {
                    x, y
                } = position ?? {};
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

const BaseClass = mix(CustomElement).with(StateDataEventManagerMixin);

export default class WorldMapMetaAreaView extends BaseClass {

    #elementManager;

    #mapEl;

    #closeEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#mapEl = this.shadowRoot.getElementById("map");
        this.#closeEl = this.shadowRoot.getElementById("close");
        this.#closeEl.addEventListener("click", () => {
            this.hide();
        });
        this.addEventListener("wheel", (event) => {
            event.stopPropagation();
            event.preventDefault();
        });

        /* state handler */
        WorldListState.addEventListener("area", () => {
            this.hide();
        });
        this.registerStateHandler("listChange", () => {
            this.refreshList();
        });

        /* settings */
        showMapConnectionsObserver.onChange(() => {
            this.refreshList();
        });

        /* --- */
        this.#elementManager = new MapMarkerElementManager(this.#mapEl);

        /* --- */
        const {ref} = WorldListState.config.metaArea;
        const state = WorldStateManagerRegistry.get(ref?.type)?.get(ref?.name);
        this.switchState(state);
    }

    applyDefaultValues() {
        /* map */
        this.#mapEl.style.backgroundColor = "#000000";
        this.#mapEl.style.backgroundImage = "";
        this.#mapEl.style.width = "600px";
        this.#mapEl.style.height = "600px";
        /* zoom */
        this.#mapEl.style.setProperty("--zoom", 100);
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
        /* zoom */
        const zoom = mapData.zoom ?? 100;
        const resultZoom = Math.min(Math.max(ZOOM_MIN, Math.floor(zoom ?? 100)), ZOOM_MAX);
        this.#mapEl.style.setProperty("--zoom", resultZoom);
        /* list */
        this.refreshList();
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

    show() {
        this.classList.add("show");
    }

    hide() {
        this.classList.remove("show");
    }

}

customElements.define("gt-worldmap-metaarea-view", WorldMapMetaAreaView);

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
