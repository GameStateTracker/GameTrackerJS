import CustomElement from "/emcJS/ui/element/CustomElement.js";
import WorldSummaryHandler from "../util/handler/WorldSummaryHandler.js";
import TPL from "./LocationState.js.html" assert {type: "html"};
import STYLE from "./LocationState.js.css" assert {type: "css"};

export default class LocationState extends CustomElement {

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
            const {reachable_min, reachable_max, unopened_min, unopened_max, done_min, done_max} = event.value;
            if (reachable_min == reachable_max) {
                availEl.innerHTML = reachable_min;
            } else {
                availEl.innerHTML = `[${reachable_min}..${reachable_max}]`;
            }
            if (unopened_min == unopened_max) {
                missEl.innerHTML = unopened_min;
            } else {
                missEl.innerHTML = `[${unopened_min}..${unopened_max}]`;
            }
            if (done_min == done_max) {
                doneEl.innerHTML = done_min;
            } else {
                doneEl.innerHTML = `[${done_min}..${done_max}]`;
            }
        });
    }

    generateList() {
        const worldSummaryHandler = new WorldSummaryHandler();
        window.worldSummaryHandler = worldSummaryHandler;
        return worldSummaryHandler;
    }

}

customElements.define("gt-locationstate", LocationState);
