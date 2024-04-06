// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/element/CustomElement.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import ContextMenuManagerMixin from "/emcJS/ui/mixin/ContextMenuManagerMixin.js";
import "/emcJS/ui/i18n/I18nLabel.js";

const TPL = new Template(`
<div id="marker"></div>
`);

const STYLE = new GlobalStyle(`
:host {
    --scale: 100;
    --size: 0px;
    --rotation: 0deg;
    --border-radius: 0px;
    position: absolute;
    display: inline-flex;
    width: var(--size, 0px);
    height: var(--size, 0px);
    transform: translate(calc(var(--size, 0px) * -0.5), calc(var(--size, 0px) * -0.5)) rotate(var(--rotation, 0deg)) scale(calc(var(--scale, 100) / 100));
    user-select: none;
}
:host([hidden]:not([hidden="false"])) {
    display: none;
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
    font-weight: bold;
    cursor: pointer;
    border-radius: var(--border-radius, 0px);
    font-size: calc(var(--size, 0px) * 0.4);
    line-height: 1em;
}
#marker:hover,
:host(.ctx-marked) #marker {
    box-shadow: 0 0 calc(2px * (1 / (var(--zoom, 100) / 100)) * (1 / (var(--scale, 100) / 100))) calc(4px * (1 / (var(--zoom, 100) / 100)) * (1 / (var(--scale, 100) / 100))) #67ffea;
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
        this.addEventListener("click", (event) => {
            this.clickHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", (event) => {
            this.contextmenuHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    clickHandler(/* event */) {
        // nothing
    }

    contextmenuHandler(event) {
        this.showDefaultContextMenu(event);
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    set hidden(val) {
        this.setBooleanAttribute("hidden", val);
    }

    get hidden() {
        return this.getBooleanAttribute("hidden");
    }

    set top(value) {
        this.setIntAttribute("top", value);
    }

    get top() {
        return this.getIntAttribute("top");
    }

    set left(value) {
        this.setIntAttribute("left", value);
    }

    get left() {
        return this.getIntAttribute("left");
    }

    set scale(val) {
        this.setIntAttribute("scale", val);
    }

    get scale() {
        return this.getIntAttribute("scale");
    }

    static get observedAttributes() {
        return ["top", "left", "scale"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "top": {
                    this.style.top = `${newValue}px`;
                } break;
                case "left": {
                    this.style.left = `${newValue}px`;
                } break;
                case "scale": {
                    this.style.setProperty("--scale", newValue);
                } break;
            }
        }
    }

}
