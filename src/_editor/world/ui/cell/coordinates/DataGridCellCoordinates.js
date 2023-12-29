import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import DataGridCell from "/emcJS/ui/grid/cell/DataGridCell.js";
import "../../input/coordinates/CoordinatesInput.js";
import TPL from "./DataGridCellCoordinates.js.html" assert {type: "html"};
import STYLE from "./DataGridCellCoordinates.js.css" assert {type: "css"};

export default class DataGridCellCoordinates extends DataGridCell {

    #valueEl;

    #inputEl;

    #inputEventManager;

    constructor() {
        super();
        this.shadowRoot.getElementById("content").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#valueEl = this.shadowRoot.getElementById("value");
        this.#inputEl = this.shadowRoot.getElementById("input");
        /* --- */
        this.#inputEventManager = new EventTargetManager(this.#inputEl);
        this.#inputEventManager.set("change", (event) => {
            this.#onInput(event);
        });
    }

    setCurrentMarker(currentType, currentName, currentLabel) {
        this.#inputEl.setCurrentMarker(currentType, currentName, currentLabel);
    }

    loadMapData(mapData) {
        this.#inputEl.loadMapData(mapData);
    }

    loadConnections(connections) {
        this.#inputEl.loadConnections(connections);
    }

    loadEntries(entries) {
        this.#inputEl.loadEntries(entries);
    }

    get value() {
        return this.getJSONAttribute("value");
    }

    set value(val) {
        this.setJSONAttribute("value", val);
    }

    get action() {
        return this.getAttribute("action");
    }

    set action(val) {
        this.setAttribute("action", val);
    }

    get editable() {
        return this.getBooleanAttribute("editable");
    }

    set editable(val) {
        this.setBooleanAttribute("editable", val);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "editable", "row-name"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "editable": {
                    if (this.editable) {
                        this.#inputEventManager.setActive(true);
                    } else {
                        this.#inputEventManager.setActive(false);
                    }
                } break;
                case "row-name": {
                    // this.#inputEl.setModalRefName(newValue);
                } break;
            }
        }
    }

    onValueChange(value) {
        value = this.#convertValue(value);
        if (value == null) {
            this.#valueEl.innerText = "";
            this.#inputEl.value = null;
        } else {
            const {x, y} = value;
            this.#valueEl.innerText = `[${x}, ${y}]`;
            this.#inputEl.value = {x, y};
        }
    }

    #onInput(event) {
        event.stopPropagation();
        event.preventDefault();
        const value = this.#inputEl.value;
        this.value = value;
        const ev = new Event("edit", {bubbles: true});
        ev.data = {
            value,
            action: this.action,
            columnName: this.columnName,
            rowName: this.rowName
        };
        this.dispatchEvent(ev);
    }

    #convertValue(value) {
        if (value == null || typeof value !== "object") {
            return null;
        }
        const {x = 0, y = 0} = value;
        const xValue = parseInt(x) || 0;
        const yValue = parseInt(y) || 0;
        return {
            x: xValue,
            y: yValue
        };
    }

}

DataGridCell.registerCellType("coordinates", DataGridCellCoordinates, 200);
customElements.define("gt-edt-grid-datagrid-cell-coordinates", DataGridCellCoordinates);
