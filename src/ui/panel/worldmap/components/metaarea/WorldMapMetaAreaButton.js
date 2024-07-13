import CustomElement from "/emcJS/ui/element/CustomElement.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import WorldStateManagerRegistry from "../../../../../statemanager/WorldStateManagerRegistry.js";
import WorldListState from "../../../../../state/world/WorldListState.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManagerMixin.js";
import "../entries/Location.js";
import "../entries/Area.js";
import "../entries/Exit.js";
import TPL from "./WorldMapMetaAreaButton.js.html" assert {type: "html"};
import STYLE from "./WorldMapMetaAreaButton.js.css" assert {type: "css"};

const BaseClass = mix(
    CustomElement
).with(
    StateDataEventManagerMixin
);

export default class WorldMapMetaAreaButton extends BaseClass {

    #iconEl;

    #markerEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#iconEl = this.shadowRoot.getElementById("icon");
        this.#markerEl = this.shadowRoot.getElementById("marker");

        /* state handler */
        this.registerStateHandler("listChange", () => {
            this.checkVisibility();
        });
        this.registerStateHandler("access", () => {
            this.refreshAccess();
        });

        /* --- */
        const {icon = "", ref} = WorldListState.config.metaArea;
        this.#iconEl.style.backgroundImage = `url("${icon}")`;
        const state = WorldStateManagerRegistry.get(ref?.type)?.get(ref?.name);
        this.switchState(state);
    }

    checkVisibility() {
        const state = this.getState();
        if (state != null) {
            const list = state.getList();
            if (list != null && list.length > 0) {
                this.style.display = "";
            } else {
                this.style.display = "none";
            }
        } else {
            this.style.display = "none";
        }
    }

    refreshAccess() {
        const state = this.getState();
        if (state != null && state.access.entrances > 0) {
            this.#markerEl.style.display = "";
        } else {
            this.#markerEl.style.display = "none";
        }
    }

}

customElements.define("gt-worldmap-metaarea-button", WorldMapMetaAreaButton);

