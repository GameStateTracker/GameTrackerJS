// frameworks
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

import FilterResource from "../../resource/FilterResource.js";
import "../button/FilterButton.js";

const STYLE = new GlobalStyle(`
::slotted(gt-filterbutton) {
    width: 38px;
    min-width: initial;
    height: 38px;
    padding: 4px;
    margin: 5px;
    border: solid 2px var(--navigation-background-color, #ffffff);
    border-radius: 10px;
}
`);

export default class FilterContextMenu extends ContextMenu {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    initItems() {
        const els = [];
        const data = FilterResource.get();
        for (const name in data) {
            if (data[name].choice) {
                const el = document.createElement("gt-filterbutton");
                el.ref = name;
                el.onclick = function(event) {
                    event.stopPropagation();
                };
                el.oncontextmenu = function(event) {
                    event.stopPropagation();
                };
                els.push(el);
            }
        }
        super.loadItems(els);
    }

    loadItems() {
        // nothing
    }

}

customElements.define("gt-ctxmenu-filter", FilterContextMenu);
