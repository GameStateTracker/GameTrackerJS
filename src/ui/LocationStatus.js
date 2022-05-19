// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";

import WorldSummaryHandler from "../util/handler/WorldSummaryHandler.js";

const TPL = new Template(`
<div class="state">
    <span id="locations-done">#</span> done | <span id="locations-available">#</span> avail | <span id="locations-missing">#</span> miss
</div>
`);

const STYLE = new GlobalStyle(`
.state {
    display: inline;
    padding: 0 5px;
    white-space: nowrap;
}
`);

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
