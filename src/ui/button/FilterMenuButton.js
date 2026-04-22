import CustomElement from "/emcJS/ui/element/CustomElement.js";
import ContextMenuManagerMixin from "/emcJS/ui/mixin/ContextMenuManagerMixin.js";
import FilterContextMenu from "../ctxmenu/FilterContextMenu.js";
import TPL from "./FilterMenuButton.js.html" assert {type: "html"};
import STYLE from "./FilterMenuButton.js.css" assert {type: "css"};

export default class FilterMenuButton extends ContextMenuManagerMixin(CustomElement) {

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */

        /* context menu */
        this.setContextMenu("filter", FilterContextMenu);

        /* mouse events */
        this.addEventListener("click", (event) => {
            const rect = this.getBoundingClientRect();
            const mnu_flt = this.getContextMenu("filter");
            if (this.classList.contains("map-menu")) {
                mnu_flt.show(rect.left, rect.top - 60);
            } else {
                mnu_flt.show(rect.left, rect.bottom + 5);
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

}

customElements.define("gt-filtermenubutton", FilterMenuButton);
