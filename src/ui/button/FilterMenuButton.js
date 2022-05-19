// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import ContextMenuManagerMixin from "/emcJS/ui/overlay/ctxmenu/ContextMenuManagerMixin.js";

import FilterContextMenu from "../ctxmenu/FilterContextMenu.js";

const TPL = new Template(`
<emc-icon id="icon" src="images/icons/filter.svg"></emc-icon>
`);

const STYLE = new GlobalStyle(`
:host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    user-select: none;
    cursor: pointer;
}
#icon {
    width: 100%;
    height: 100%;
    min-height: auto;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-origin: content-box;
}
`);

class FilterMenuButton extends ContextMenuManagerMixin(CustomElement) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */

        /* context menu */
        this.setContextMenu("filter", FilterContextMenu);

        /* mouse events */
        this.addEventListener("click", event => {
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
