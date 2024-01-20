// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import "/emcJS/ui/input/Slider.js";

import WorldListState from "../../../state/world/WorldListState.js";
import AreaStateManager from "../../../statemanager/world/area/AreaStateManager.js";
import StateDataEventManagerMixin from "../../mixin/StateDataEventManagerMixin.js";
import "../../button/FilterMenuButton.js";
import "../../button/HintButton.js";
import "./components/WorldMapView.js";
import "./components/WorldMapOverview.js";
import "./components/WorldMapTitle.js";
import SettingsObserver from "../../../util/observer/SettingsObserver.js";

const showDetailedMapsObserver = new SettingsObserver("show_detailed_maps");

// TODO save map settings per map
// TODO add "(to overworld)" button
const TPL = new Template(`
<gt-worldmap-view id="view"></gt-worldmap-view>
<div class="overview-wrapper">
    <gt-worldmap-overview id="overview"></gt-worldmap-overview>
    <emc-slider min="10" max="200" value="50" id="zoom-slider"></emc-slider>
    <div id="overview-icon">🧭</div>
</div>
<gt-worldmap-title id="title">
    <gt-hintbutton class="button" id="hint">
    </gt-hintbutton>
    <gt-filtermenubutton class="button">
    </gt-filtermenubutton>
</gt-worldmap-title>
`);

const STYLE = new GlobalStyle(`
:host {
    display: grid;
    width: 400px;
    height: 400px;
    user-select: none;
}
.overview-wrapper {
    position: absolute;
    box-sizing: content-box;
    bottom: 10px;
    left: 10px;
    background-color: var(--page-background-color, #ffffff);
    border-style: solid;
    border-width: 2px;
    border-color: var(--page-border-color-inverted, #ffffff);
    transform-origin: bottom left;
    width: 40px;
    height: 40px;
    transition: width .2s, height .2s;
    overflow: hidden;
}
.overview-wrapper:hover {
    width: 200px;
    height: 230px;
}
.overview-wrapper #zoom-slider {
    width: 200px;
    height: 30px;
    padding: 5px;
}
.overview-wrapper #overview-icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000000;
    font-size: 30px;
    line-height: 1em;
    overflow: hidden;
    opacity: 1;
    transition: opacity 0s, font-size 0s, width 0s, height 0s;
}
.overview-wrapper:hover #overview-icon {
    font-size: 100px;
    opacity: 0;
    width: 0%;
    height: 0%;
    transition: opacity .2s .2s, font-size .2s .2s, width 0s .4s, height 0s .4s;
}
#title {
    position: absolute;
    top: 10px;
    left: 10px;
}
#title > .button {
    width: 38px;
    height: 38px;
    padding: 4px;
    margin-left: 8px;
    border: solid 2px var(--navigation-back-color, #ffffff);
    border-radius: 10px;
}
`);

const SMALL_ZOOM_SPD = 1;
const NORMAL_ZOOM_SPD = 2;
const LARGE_ZOOM_SPD = 5;

const BaseClass = mix(
    Panel
).with(
    StateDataEventManagerMixin
);

export default class WorldMap extends BaseClass {

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
        showDetailedMapsObserver.addEventListener("change", (event) => {
            if (this.detailed || event.value) {
                this.ref = WorldListState.area;
            } else {
                this.ref = WorldListState.defaultArea;
            }
        });
        /* view */
        const viewEl = this.shadowRoot.getElementById("view");
        const overviewEl = this.shadowRoot.getElementById("overview");
        const iconEl = this.shadowRoot.getElementById("overview-icon");
        viewEl.addEventListener("transform", (event) => {
            overviewEl.setTransform(event.x, event.y, event.zoom);
        });
        overviewEl.addEventListener("move", (event) => {
            viewEl.setTranslation(event.x, event.y);
        });
        iconEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });

        /* ZOOM */
        const sliderEl = this.shadowRoot.getElementById("zoom-slider");
        sliderEl.addEventListener("input", (event) => {
            const zoom = event.value;
            viewEl.setZoom(zoom, 0, 0);
        })
        this.addEventListener("wheel", (event) => {
            if (!this.fixed) {
                const parW = viewEl.clientWidth;
                const parH = viewEl.clientHeight;
                const anchorX = event.layerX - parW / 2;
                const anchorY = event.layerY - parH / 2;
                const zoom = viewEl.zoom;
                if (zoom > 100) {
                    const delta = Math.sign(event.deltaY) * LARGE_ZOOM_SPD;
                    viewEl.setZoom(zoom - delta, anchorX, anchorY);
                } else if (zoom > 50) {
                    const delta = Math.sign(event.deltaY) * NORMAL_ZOOM_SPD;
                    viewEl.setZoom(zoom - delta, anchorX, anchorY);
                } else {
                    const delta = Math.sign(event.deltaY) * SMALL_ZOOM_SPD;
                    viewEl.setZoom(zoom - delta, anchorX, anchorY);
                }
                sliderEl.value = viewEl.zoom;
            }
            event.stopPropagation();
            event.preventDefault();
        }, {capture: true});
    }

    connectedCallback() {
        super.connectedCallback();
        /* init reference */
        this.ref = WorldListState.area;
    }

    applyDefaultValues() {
        /* title */
        const titleEl = this.shadowRoot.getElementById("title");
        if (titleEl != null) {
            titleEl.ref = "";
        }
        /* overview */
        const overviewEl = this.shadowRoot.getElementById("overview");
        if (overviewEl != null) {
            overviewEl.ref = "";
        }
        /* view */
        const viewEl = this.shadowRoot.getElementById("view");
        if (viewEl != null) {
            viewEl.ref = "";
        }
        /* hint button */
        const hintEl = this.shadowRoot.getElementById("hint");
        if (hintEl != null) {
            hintEl.ref = "";
        }
    }

    applyStateValues(state) {
        /* title */
        const titleEl = this.shadowRoot.getElementById("title");
        if (titleEl != null) {
            titleEl.ref = state.ref;
        }
        /* overview */
        const overviewEl = this.shadowRoot.getElementById("overview");
        if (overviewEl != null) {
            overviewEl.ref = state.ref;
        }
        /* view */
        const viewEl = this.shadowRoot.getElementById("view");
        if (viewEl != null) {
            viewEl.ref = state.ref;
        }
        /* hint button */
        const hintEl = this.shadowRoot.getElementById("hint");
        if (hintEl != null) {
            hintEl.ref = state.ref;
        }
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

    static get observedAttributes() {
        return ["ref", "detailed"];
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
                }
            }
        }
    }

}

Panel.registerReference("worldmap", WorldMap);
customElements.define("gt-worldmap", WorldMap);
