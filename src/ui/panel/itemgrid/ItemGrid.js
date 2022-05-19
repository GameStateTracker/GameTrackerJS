// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import Panel from "/emcJS/ui/layout/Panel.js";

// GameTrackerJS
import GridsResource from "../../../resource/GridsResource.js";
import ItemsResource from "../../../resource/ItemsResource.js";
import UIRegistry from "../../../registry/UIRegistry.js";
import "./components/entries/Item.js";
import "./components/entries/ProgressiveItem.js";

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
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
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

function createItem(value, data) {
    const el = UIRegistry.get("itemgrid-item").create(data.type, value);
    el.className = "item";
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

export default class ItemGrid extends Panel {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    connectedCallback() {
        this.setAttribute("data-fontmod", "items");
        // if (!this.items && this.grid) {
        //     const config = GridsResource.get(this.grid);
        //     this.loadGrid(config);
        // }
    }

    loadGrid(config = [[]]) {
        const content = this.shadowRoot.getElementById("content");
        content.innerHTML = "";
        for (const row of config) {
            const cnt = document.createElement("div");
            cnt.classList.add("item-row");
            const items = ItemsResource.get();
            for (const element of row) {
                if (element.type == "item") {
                    const data = items[element.value];
                    cnt.append(createItem(element.value, data));
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

Panel.registerReference("itemgrid", ItemGrid);
customElements.define("gt-itemgrid", ItemGrid);
