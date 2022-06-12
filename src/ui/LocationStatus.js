import CustomElement from "/emcJS/ui/element/CustomElement.js";
import WorldSummaryHandler from "../util/handler/WorldSummaryHandler.js";
import TPL from "./LocationStatus.js.html" assert {type: "html"};
import STYLE from "./LocationStatus.js.css" assert {type: "css"};

export default class LocationStatus extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);

        /* LIST HANDLER */
        const listHandler = this.generateList();
        listHandler.addEventListener("access", (event) => {
            const doneEl = this.shadowRoot.getElementById("locations-done");
            const availEl = this.shadowRoot.getElementById("locations-available");
            const missEl = this.shadowRoot.getElementById("locations-missing");
            const {reachable, unopened, done} = event.value;
            missEl.innerHTML = unopened;
            availEl.innerHTML = reachable;
            doneEl.innerHTML = done;
        });
    }

    generateList() {
        return new WorldSummaryHandler();
    }

}

customElements.define("gt-locationstate", LocationStatus);
