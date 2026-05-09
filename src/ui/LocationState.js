import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import WorldSummaryHandler from "../util/handler/WorldSummaryHandler.js";
import TPL from "./LocationState.js.html" assert {type: "html"};
import STYLE from "./LocationState.js.css" assert {type: "css"};

export default class LocationState extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const doneEl = this.shadowRoot.getElementById("locations-done");
        const availEl = this.shadowRoot.getElementById("locations-available");
        const missEl = this.shadowRoot.getElementById("locations-missing");
        const exitsEl = this.shadowRoot.getElementById("exits-available");

        /* LIST HANDLER */
        const listHandler = this.#generateList();
        listHandler.addEventListener("access", (event) => {
            const {
                reachable_min, reachable_max, unopened_min, unopened_max, done_min, done_max, entrances_min, entrances_max
            } = event.value;
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
            if (done_min == done_max) {
                doneEl.innerHTML = done_min;
            } else {
                doneEl.innerHTML = `[${done_min}..${done_max}]`;
            }
            if (entrances_min == entrances_max) {
                exitsEl.innerHTML = entrances_min;
            } else {
                exitsEl.innerHTML = `[${entrances_min}..${entrances_max}]`;
            }
        });
    }

    #generateList() {
        const worldSummaryHandler = new WorldSummaryHandler();
        window.worldSummaryHandler = worldSummaryHandler;
        return worldSummaryHandler;
    }

}

customElements.define("gt-locationstate", LocationState);
