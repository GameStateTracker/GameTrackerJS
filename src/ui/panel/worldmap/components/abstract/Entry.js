// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import ContextMenuManagerMixin from "/emcJS/ui/overlay/ctxmenu/ContextMenuManagerMixin.js";
import "/emcJS/ui/i18n/I18nLabel.js";

const TPL = new Template(`
<div id="marker"></div>
`);

const STYLE = new GlobalStyle(`
:host {
    position: absolute;
    display: inline-flex;
    user-select: none;
}
:host(:hover) {
    z-index: 1000;
}
#marker {
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: solid 4px black;
    color: black;
    background-color: var(--page-text-color, #000000);
    font-size: 1em;
    font-weight: bold;
    cursor: pointer;
}
#marker:hover,
:host(.ctx-marked) #marker {
    box-shadow: 0 0 2px 4px #67ffea;
}
`);

const BaseClass = mix(
    CustomElement
).with(
    ContextMenuManagerMixin
);

export default class WorldMapEntry extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* mouse events */
        this.addEventListener("click", event => {
            this.clickHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            this.contextmenuHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    clickHandler(event) {
        // nothing
    }

    contextmenuHandler(event) {
        this.showDefaultContextMenu(event);
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

}
