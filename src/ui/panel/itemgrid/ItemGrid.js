import Panel from "/emcJS/ui/layout/Panel.js";
import GridsResource from "../../../data/resource/GridsResource.js";
import "../../itemgrid/interactive/ItemGridInteractive.js";
import TPL from "./ItemGrid.js.html" assert {type: "html"};
import STYLE from "./ItemGrid.js.css" assert {type: "css"};

export default class ItemGrid extends Panel {

    #contentEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#contentEl = this.shadowRoot.getElementById("content");
    }

    connectedCallback() {
        this.setAttribute("data-fontmod", "items");
        // if (!this.items && this.grid) {
        //     const config = GridsResource.get(this.grid);
        //     this.loadGrid(config);
        // }
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
                        this.#contentEl.loadGrid(config);
                    } else if (this.grid) {
                        const config = GridsResource.get(newValue);
                        this.#contentEl.loadGrid(config);
                    } else {
                        this.#contentEl.loadGrid();
                    }
                } break;
                case "grid": {
                    if (!this.items) {
                        if (newValue) {
                            const config = GridsResource.get(newValue);
                            this.#contentEl.loadGrid(config);
                        } else {
                            this.#contentEl.loadGrid();
                        }
                    }
                } break;
            }
        }
    }

}

Panel.registerReference("itemgrid", ItemGrid);
customElements.define("gt-itemgrid", ItemGrid);
