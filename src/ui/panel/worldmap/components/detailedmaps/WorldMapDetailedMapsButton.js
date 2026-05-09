import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import "@emcjs/fe/ui/i18n/I18nLabel.js";
import "@emcjs/fe/ui/icon/Icon.js";
import SettingsObserver from "../../../../../util/observer/SettingsObserver.js";
import TPL from "./WorldMapDetailedMapsButton.js.html" assert {type: "html"};
import STYLE from "./WorldMapDetailedMapsButton.js.css" assert {type: "css"};

const showDetailedMapsObserver = new SettingsObserver("show_detailed_maps");

export default class WorldMapDetailedMapsButton extends CustomElement {

    #tooltipEl;

    #iconEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#tooltipEl = this.shadowRoot.getElementById("tooltip");
        this.#iconEl = this.shadowRoot.getElementById("icon");
        /* --- */
        showDetailedMapsObserver.onChange(() => {
            this.#applyDetailedMapsValue();
        });
        this.#applyDetailedMapsValue();
        /* --- */
        this.addEventListener("click", () => {
            showDetailedMapsObserver.value = !showDetailedMapsObserver.value;
        });
    }

    #applyDetailedMapsValue() {
        const showDetailedMaps = showDetailedMapsObserver.value;
        if (showDetailedMaps) {
            this.#tooltipEl.i18nTooltip = "toggle detailed maps (currently activated)";
            this.#iconEl.src = "/images/icons/detail_area_on.svg";
        } else {
            this.#tooltipEl.i18nTooltip = "toggle detailed maps (currently deactivated)";
            this.#iconEl.src = "/images/icons/detail_area_off.svg";
        }
    }

}

customElements.define("gt-worldmap-detailedmaps-button", WorldMapDetailedMapsButton);

