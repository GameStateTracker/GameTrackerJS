import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import DataGridCell from "/emcJS/ui/grid/components/cell/DataGridCell.js";
import "../../input/coordinates/CoordinatesInput.js";
import TPL from "./DataGridCellCoordinates.js.html" assert {type: "html"};
import STYLE from "./DataGridCellCoordinates.js.css" assert {type: "css"};

export default class DataGridCellCoordinates extends DataGridCell {

    #valueEl;

    #inputEl;

    #inputEventManager;

    constructor(dataGridId) {
        super(dataGridId);
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
        /* --- */
        this.addEventListener("rowdata", () => {
            const {entityType = "", entityName = "", entityLabel = ""} = this.rowData ?? {};
            this.#inputEl.setCurrentMarker(entityType, `${this.prefix}${entityName}${this.postfix}`, entityLabel);
        });
    }

    set value(val) {
        this.setJSONAttribute("value", val);
    }

    get value() {
        return this.getJSONAttribute("value");
    }

    set action(val) {
        this.setAttribute("action", val);
    }

    get action() {
        return this.getAttribute("action");
    }

    set editable(val) {
        this.setBooleanAttribute("editable", val);
    }

    get editable() {
        return this.getBooleanAttribute("editable");
    }

    set prefix(val) {
        this.setAttribute("prefix", val);
    }

    get prefix() {
        return this.getAttribute("prefix") ?? "";
    }

    set postfix(val) {
        this.setAttribute("postfix", val);
    }

    get postfix() {
        return this.getAttribute("postfix") ?? "";
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "editable", "row-name", "prefix", "postfix"];
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
                case "col-name": {
                    this.#inputEl.name = `${this.dataGridId}-${newValue}`;
                } break;
                case "prefix":
                case "postfix": {
                    const {type = "", name = ""} = this.rowData ?? {};
                    this.#inputEl.setCurrentMarker(type, `${this.prefix}${name}${this.postfix}`, name);
                } break;
            }
        }
    }

    onValueChange(value) {
        value = this.#convertValue(value);
        if (value == null) {
            this.#valueEl.innerText = "[unset] {100}";
            this.#inputEl.value = null;
        } else {
            const {x, y, scale} = value;
            this.#valueEl.innerText = `[${x}, ${y}] {${scale}}`;
            this.#inputEl.value = {x, y, scale};
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
        const {x = 0, y = 0, scale = 100} = value;
        const xValue = parseInt(x) || 0;
        const yValue = parseInt(y) || 0;
        const scaleValue = parseInt(scale) || 0;
        return {
            x: xValue,
            y: yValue,
            scale: scaleValue
        };
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

}

DataGridCell.registerCellType("coordinates", DataGridCellCoordinates, 200);
customElements.define("gt-edt-grid-datagrid-cell-coordinates", DataGridCellCoordinates);
