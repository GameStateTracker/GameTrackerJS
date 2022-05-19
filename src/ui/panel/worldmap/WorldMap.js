// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "/emcJS/ui/i18n/I18nLabel.js";

import WorldListState from "../../../state/world/WorldListState.js";
import AreaStateManager from "../../../statemanager/world/area/AreaStateManager.js";
import StateDataEventManagerMixin from "../../mixin/StateDataEventManagerMixin.js";
import "../../button/FilterMenuButton.js";
import "../../button/HintButton.js";
import "./components/WorldMapView.js";
import "./components/WorldMapOverview.js";
import "./components/WorldMapTitle.js";

//TODO save map settings per map

const TPL = new Template(`
<gt-worldmap-view id="view"></gt-worldmap-view>
<div class="overview-wrapper">
    <gt-worldmap-overview id="overview"></gt-worldmap-overview>
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
    position: relative;
    box-sizing: border-box;
    display: grid;
    min-height: 100%;
    width: 400px;
    height: 200px;
    user-select: none;
}
.overview-wrapper {
    position: absolute;
    bottom: 10px;
    left: 10px;
    border-style: solid;
    border-width: 2px;
    border-color: var(--page-border-color, #ffffff);
    transform-origin: bottom left;
    transform: scale(0.2);
    transition: transform .2s;
}
.overview-wrapper:hover {
    transform: scale(1);
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
    border: solid 2px var(--navigation-background-color, #ffffff);
    border-radius: 10px;
}
`);

const ZOOM_SPD = 2;

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
        WorldListState.addEventListener("area", event => {
            this.ref = event.value;
        });
        /* view */
        const viewEl = this.shadowRoot.getElementById("view");
        const overviewEl = this.shadowRoot.getElementById("overview");
        viewEl.addEventListener("transform", (event) => {
            // console.log("transform", event.x, event.y, event.zoom);
            overviewEl.setTransform(event.x, event.y, event.zoom);
        });
        overviewEl.addEventListener("move", (event) => {
            // console.log("move", event.x, event.y);
            viewEl.setTranslation(event.x, event.y);
        });

        /* --- */
        this.addEventListener("wheel", (event) => {
            if (!this.fixed) {
                const parW = viewEl.clientWidth;
                const parH = viewEl.clientHeight;
                const anchorX = event.layerX - parW / 2;
                const anchorY = event.layerY - parH / 2;
                const zoom = viewEl.zoom;
                const delta = Math.sign(event.deltaY) * ZOOM_SPD;
                viewEl.setZoom(zoom - delta, anchorX, anchorY);
            }
            // event.stopPropagation();
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
        return this.getAttribute("ref") || WorldListState.config.default;
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    static get observedAttributes() {
        return ["ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = AreaStateManager.get(this.ref);
                    if (state?.hasMap) {
                        this.switchState(state);
                    } else {
                        const defaultState = AreaStateManager.get(WorldListState.config.defaultArea);
                        this.switchState(defaultState);
                    }
                } break;
            }
        }
    }

}

Panel.registerReference("worldmap", WorldMap);
customElements.define("gt-worldmap", WorldMap);
