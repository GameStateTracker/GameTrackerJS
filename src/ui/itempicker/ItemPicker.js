// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import Panel from "/emcJS/ui/layout/Panel.js";

import GridsResource from "../../resource/GridsResource.js";
import "./components/Item.js";

const TPL = new Template(`
<div id="content">
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    position: relative;
    box-sizing: border-box;
    position: relative;
    box-sizing: border-box;
}
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
.text,
.icon,
.empty {
    display: inline-block;
    width: 40px;
    height: 40px;
    padding: 2px;
}
`);

function createItem(value) {
    const el = document.createElement("gt-itempicker-item");
    el.className = "item";
    el.setAttribute("ref", value);
    return el;
}

function createText(value) {
    const el = document.createElement("DIV");
    el.className = "text";
    el.innerHTML = value;
    return el;
}

function createIcon(value) {
    const el = document.createElement("DIV");
    el.className = "icon";
    el.dataset.icon = value;
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
                    cnt.append(createText(element.value));
                } else if (element.type == "icon") {
                    cnt.append(createIcon(element.value));
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
