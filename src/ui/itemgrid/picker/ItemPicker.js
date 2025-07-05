import HTMLTemplate from "/emcJS/util/html/template/HTMLTemplate.js";
import CSSTemplate from "/emcJS/util/html/template/CSSTemplate.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import {
    isStringNotEmpty
} from "/emcJS/util/helper/CheckType.js";
import GridsResource from "../../../data/resource/GridsResource.js";
import "./components/Item.js";

const TPL = new HTMLTemplate(`
<div id="content">
</div>
`);

const STYLE = new CSSTemplate(`
:host {
    display: block;
    min-width: min-content;
    min-height: min-content;
}
#content {
    display: content;
}
.item-row {
    display: flex;
}
.item {
    display: flex;
    padding: 2px;
}
.empty {
    display: inline-block;
    width: 40px;
    height: 40px;
    padding: 2px;
}
.text {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    padding: 2px;
}
.icon {
    display: inline-flex;
    width: 36px;
    height: 36px;
    margin: 2px;
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: border-box;
    user-select: none;
}
.icon.clickable {
    cursor: pointer;
}
.icon.clickable:hover {
    background-size: 100%;
}
`);

function createItem(value) {
    const el = document.createElement("gt-itempicker-item");
    el.className = "item";
    el.setAttribute("ref", value);
    return el;
}

function createText(value, halign, valign) {
    const el = document.createElement("DIV");
    el.className = "text";
    el.innerHTML = value;

    if (halign === "start") {
        el.style.justifyContent = "flex-start";
    } else if (halign === "end") {
        el.style.justifyContent = "flex-end";
    }
    if (valign === "start") {
        el.style.alignItems = "flex-start";
    } else if (valign === "end") {
        el.style.alignItems = "flex-end";
    }

    return el;
}

function createIcon(value) {
    const el = document.createElement("DIV");
    el.className = "icon";
    el.style.backgroundImage = `url(${value})`;
    return el;
}

function createEmpty() {
    const el = document.createElement("DIV");
    el.className = "empty";
    return el;
}

export default class ItemPicker extends Panel {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    connectedCallback() {
        this.setAttribute("data-fontmod", "items");
    }

    loadGrid(config = [[]]) {
        const content = this.shadowRoot.getElementById("content");
        content.innerHTML = "";
        for (const row of config) {
            const cnt = document.createElement("div");
            cnt.classList.add("item-row");
            for (const element of row) {
                if (element.type == "item") {
                    const itemEl = createItem(element.value);
                    itemEl.addEventListener("click", () => {
                        const ev = new Event("pick");
                        ev.value = element.value;
                        this.dispatchEvent(ev);
                    });
                    cnt.append(itemEl);
                } else if (element.type == "text") {
                    cnt.append(createText(element.value, element.halign, element.valign));
                } else if (element.type == "icon") {
                    const iconEl = createIcon(element.icon);
                    if (isStringNotEmpty(element.value)) {
                        iconEl.classList.add("clickable");
                        iconEl.title = element.value;
                        iconEl.addEventListener("click", () => {
                            const ev = new Event("iconclick");
                            ev.value = element.value;
                            this.dispatchEvent(ev);
                        });
                    }
                    cnt.append(iconEl);
                } else {
                    cnt.append(createEmpty());
                }
            }
            content.append(cnt);
        }
    }

    get items() {
        return this.getAttribute("items");
    }

    set items(val) {
        this.setAttribute("items", val);
    }

    get grid() {
        return this.getAttribute("grid");
    }

    set grid(val) {
        this.setAttribute("grid", val);
    }

    static get observedAttributes() {
        return ["items", "grid"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "items": {
                    if (newValue) {
                        const config = JSON.parse(newValue);
                        this.loadGrid(config);
                    } else if (this.grid) {
                        const config = GridsResource.get(newValue);
                        this.loadGrid(config);
                    } else {
                        this.loadGrid();
                    }
                } break;
                case "grid": {
                    if (!this.items) {
                        if (newValue) {
                            const config = GridsResource.get(newValue);
                            this.loadGrid(config);
                        } else {
                            this.loadGrid();
                        }
                    }
                } break;
            }
        }
    }

}

customElements.define("gt-itempicker", ItemPicker);
