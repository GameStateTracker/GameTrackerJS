import CustomElement from "/emcJS/ui/element/CustomElement.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import "./components/AreaMarker.js";
import "./components/ConnectionMarker.js";
import "./components/ExitMarker.js";
import "./components/LocationMarker.js";
import TPL from "./MapPosInput.js.html" assert {type: "html"};
import STYLE from "./MapPosInput.js.css" assert {type: "css"};

// TODO use element manager
// TODO use form styles
// TODO scroll to current marker position

export default class MapPosInput extends CustomElement {

    #xValue;

    #yValue;

    #mapElement;

    #posXInputElement;

    #posYInputElement;

    #entryMarkerList = [];

    #connectionMarkerList = [];

    #currentMarkerType;

    #currentMarkerName;

    #currentMarkerLabel;

    #currentMarkerEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#mapElement = this.shadowRoot.getElementById("map");
        this.#posXInputElement = this.shadowRoot.getElementById("pos-x");
        this.#posYInputElement = this.shadowRoot.getElementById("pos-y");
        this.#mapElement.addEventListener("click", (event) => {
            const {offsetX, offsetY} = event;
            this.#posXInputElement.value = offsetX;
            this.#posYInputElement.value = offsetY;
            this.#xValue = offsetX;
            this.#yValue = offsetY;
            this.#handleCurrentMarker();
        });
        this.#posXInputElement.addEventListener("input", () => {
            const value = this.#posXInputElement.value;
            const xValue = parseInt(value);
            if (!isNaN(xValue)) {
                this.#xValue = xValue;
            } else {
                this.#xValue = null;
            }
            this.#handleCurrentMarker();
        });
        this.#posYInputElement.addEventListener("input", () => {
            const value = this.#posYInputElement.value;
            const yValue = parseInt(value);
            if (!isNaN(yValue)) {
                this.#yValue = yValue;
            } else {
                this.#yValue = null;
            }
            this.#handleCurrentMarker();
        });
        const removeButtonEl = this.shadowRoot.getElementById("remove");
        removeButtonEl.addEventListener("click", () => {
            this.#posXInputElement.value = "";
            this.#posYInputElement.value = "";
            this.#xValue = null;
            this.#yValue = null;
            this.#handleCurrentMarker();
        });
    }

    #onChange = debounce(() => {
        this.dispatchEvent(new Event("change"));
    });

    set value(value) {
        const {x = 0, y = 0} = value ?? {};
        const xValue = parseInt(x);
        const yValue = parseInt(y);
        if (!isNaN(xValue)) {
            this.#posXInputElement.value = x;
            this.#xValue = xValue;
        } else {
            this.#posXInputElement.value = "";
            this.#xValue = null;
        }
        if (!isNaN(yValue)) {
            this.#posYInputElement.value = y;
            this.#yValue = yValue;
        } else {
            this.#posYInputElement.value = "";
            this.#yValue = null;
        }
        this.#handleCurrentMarker();
    }

    get value() {
        if (this.#xValue != null && this.#yValue != null) {
            return {
                x: this.#xValue,
                y: this.#yValue
            };
        } else if (this.#xValue != null) {
            return {
                x: this.#xValue
            };
        } else if (this.#yValue != null) {
            return {
                y: this.#yValue
            };
        }
        return {};
    }

    setCurrentMarker(currentType, currentName, currentLabel) {
        if (this.#currentMarkerEl) {
            this.#currentMarkerEl.classList.remove("active");
        }
        this.#currentMarkerType = currentType;
        this.#currentMarkerName = currentName;
        this.#currentMarkerLabel = currentLabel;
        this.#currentMarkerEl = this.querySelector(`[data-ref="${currentType}__${currentName}"]`);
        if (this.#currentMarkerEl) {
            this.#currentMarkerEl.classList.add("active");
        }
    }

    loadMapData(mapData) {
        if (mapData != null && mapData.active && mapData.backgroundImage) {
            const {backgroundColor, backgroundImage, width, height} = mapData;
            this.#mapElement.style.backgroundColor = backgroundColor;
            this.#mapElement.style.backgroundImage = `url("${backgroundImage}")`;
            this.#mapElement.style.width = `${width}px`;
            this.#mapElement.style.height = `${height}px`;
            this.#posXInputElement.max = width;
            this.#posYInputElement.max = height;
            this.#mapElement.classList.remove("none");
        } else {
            this.#mapElement.style.backgroundColor = "";
            this.#mapElement.style.backgroundImage = "";
            this.#mapElement.style.width = "0px";
            this.#mapElement.style.height = "0px";
            this.#posXInputElement.max = 0;
            this.#posYInputElement.max = 0;
            this.#mapElement.classList.add("none");
        }
    }

    loadConnections(connections) {
        this.#connectionMarkerList = [];
        for (const entry of connections ?? []) {
            const {label, posA, posB} = entry;
            if (posA != null) {
                this.#connectionMarkerList.push(this.#createMarker("connection", `${label}_posA`, posA.x, posA.y, label));
            }
            if (posB != null) {
                this.#connectionMarkerList.push(this.#createMarker("connection", `${label}_posB`, posB.x, posB.y, label));
            }
        }
        this.#rerender();
    }

    loadEntries(entries) {
        this.#entryMarkerList = [];
        for (const entry of entries ?? []) {
            const {pos = {}, ref = {}} = entry ?? {};
            const {type = null, name = null} = ref ?? {};
            if (type != null && pos != null) {
                this.#entryMarkerList.push(this.#createMarker(type, name, pos.x, pos.y));
            }
        }
        this.#rerender();
    }

    #createMarker(type, name, x, y, label) {
        if (!isNaN(x) && !isNaN(y)) {
            type = type.toLowerCase();
            const el = document.createElement(`gt-edt-world-editor-input-position-marker-${type}`);
            el.x = x;
            el.y = y;
            el.dataset.ref = `${type}__${name}`;
            if (label != null) {
                el.label = label;
            }
            if (this.#currentMarkerType === type && this.#currentMarkerName === name) {
                this.#currentMarkerEl = el;
                this.#currentMarkerEl.classList.add("active");
            }
            return el;
        }
    }

    #handleCurrentMarker() {
        if (this.#xValue != null && this.#yValue != null) {
            if (this.#currentMarkerEl) {
                if (this.#currentMarkerEl.x != this.#xValue || this.#currentMarkerEl.y != this.#yValue) {
                    this.#currentMarkerEl.x = this.#xValue;
                    this.#currentMarkerEl.y = this.#yValue;
                    this.#onChange();
                }
            } else {
                this.#currentMarkerEl = this.#createMarker(this.#currentMarkerType, this.#currentMarkerName, this.#xValue, this.#yValue, this.#currentMarkerLabel);
                if (this.#currentMarkerEl) {
                    this.#currentMarkerEl.classList.add("active");
                    this.#onChange();
                }
            }
        } else if (this.#currentMarkerEl) {
            this.#currentMarkerEl.remove();
            this.#currentMarkerEl = null;
            this.#onChange();
        }
    }

    #rerender = debounce(() => {
        this.innerHTML = "";
        for (const el of this.#connectionMarkerList) {
            this.append(el);
        }
        for (const el of this.#entryMarkerList) {
            this.append(el);
        }
        this.#currentMarkerEl = this.querySelector(`[data-ref="${this.#currentMarkerType}__${this.#currentMarkerName}"]`);
        if (this.#currentMarkerEl) {
            this.#currentMarkerEl.classList.add("active");
        }
    });

}

customElements.define("gt-edt-input-position-map", MapPosInput);
