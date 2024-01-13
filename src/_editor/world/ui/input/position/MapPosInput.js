import CustomElement from "/emcJS/ui/element/CustomElement.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import "/emcJS/ui/form/element/input/range/RangeInput.js";
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

    #scaleValue;

    #mapEl;

    #posXInputEl;

    #posYInputEl;

    #posScaleInputEl;

    #entryMarkerLookup = new Map();

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
        this.#mapEl = this.shadowRoot.getElementById("map");
        this.#posXInputEl = this.shadowRoot.getElementById("pos-x");
        this.#posYInputEl = this.shadowRoot.getElementById("pos-y");
        this.#posScaleInputEl = this.shadowRoot.getElementById("pos-scale");
        this.#mapEl.addEventListener("click", (event) => {
            const {offsetX, offsetY} = event;
            this.#posXInputEl.value = offsetX;
            this.#posYInputEl.value = offsetY;
            this.#xValue = offsetX;
            this.#yValue = offsetY;
            this.#handleCurrentMarker();
        });
        this.#posXInputEl.addEventListener("input", () => {
            const value = this.#posXInputEl.value;
            const xValue = parseInt(value);
            if (!isNaN(xValue)) {
                this.#xValue = xValue;
            } else {
                this.#xValue = null;
            }
            this.#handleCurrentMarker();
        });
        this.#posYInputEl.addEventListener("input", () => {
            const value = this.#posYInputEl.value;
            const yValue = parseInt(value);
            if (!isNaN(yValue)) {
                this.#yValue = yValue;
            } else {
                this.#yValue = null;
            }
            this.#handleCurrentMarker();
        });
        this.#posScaleInputEl.addEventListener("input", () => {
            const value = this.#posScaleInputEl.value;
            const scaleValue = parseInt(value);
            if (!isNaN(scaleValue)) {
                this.#scaleValue = scaleValue;
            } else {
                this.#scaleValue = 100;
            }
            this.#handleCurrentMarker();
        });
        const removeButtonEl = this.shadowRoot.getElementById("remove");
        removeButtonEl.addEventListener("click", () => {
            this.#posXInputEl.value = "";
            this.#posYInputEl.value = "";
            this.#xValue = null;
            this.#yValue = null;
            this.#handleCurrentMarker();
        });
    }

    #onChange = debounce(() => {
        this.dispatchEvent(new Event("change"));
    });

    set value(value) {
        const {x = 0, y = 0, scale = 100} = value ?? {};
        const xValue = parseInt(x);
        const yValue = parseInt(y);
        const scaleValue = parseInt(scale);
        if (!isNaN(xValue)) {
            this.#posXInputEl.value = x;
            this.#xValue = xValue;
        } else {
            this.#posXInputEl.value = "";
            this.#xValue = null;
        }
        if (!isNaN(yValue)) {
            this.#posYInputEl.value = y;
            this.#yValue = yValue;
        } else {
            this.#posYInputEl.value = "";
            this.#yValue = null;
        }
        if (!isNaN(scaleValue)) {
            this.#posScaleInputEl.value = scaleValue;
            this.#scaleValue = scaleValue;
        } else {
            this.#posScaleInputEl.value = "100";
            this.#scaleValue = 100;
        }
        this.#handleCurrentMarker();
    }

    get value() {
        if (this.#xValue != null && this.#yValue != null) {
            return {
                x: this.#xValue,
                y: this.#yValue,
                scale: this.#scaleValue
            };
        } else if (this.#xValue != null) {
            return {
                x: this.#xValue,
                scale: this.#scaleValue
            };
        } else if (this.#yValue != null) {
            return {
                y: this.#yValue,
                scale: this.#scaleValue
            };
        }
        return {
            scale: this.#scaleValue
        };
    }

    setCurrentMarker(currentType, currentName, currentLabel) {
        if (this.#currentMarkerEl) {
            this.#currentMarkerEl.classList.remove("active");
        }
        this.#currentMarkerType = currentType;
        this.#currentMarkerName = currentName;
        this.#currentMarkerLabel = currentLabel;
        const type = this.#currentMarkerType ?? "";
        const name = this.#currentMarkerName ?? "";
        this.#currentMarkerEl = this.#entryMarkerLookup.get(`${type}::${name}`);
        if (this.#currentMarkerEl) {
            this.#currentMarkerEl.classList.add("active");
        }
    }

    async loadMapData(mapData) {
        await BusyIndicatorManager.busy();
        if (mapData != null && mapData.active && mapData.backgroundImage) {
            const {backgroundColor, backgroundImage, width, height} = mapData;
            this.#mapEl.style.backgroundColor = backgroundColor;
            this.#mapEl.style.backgroundImage = `url("${backgroundImage}")`;
            this.#mapEl.style.width = `${width}px`;
            this.#mapEl.style.height = `${height}px`;
            this.#posXInputEl.max = width;
            this.#posYInputEl.max = height;
            this.#mapEl.classList.remove("none");
        } else {
            this.#mapEl.style.backgroundColor = "";
            this.#mapEl.style.backgroundImage = "";
            this.#mapEl.style.width = "0px";
            this.#mapEl.style.height = "0px";
            this.#posXInputEl.max = 0;
            this.#posYInputEl.max = 0;
            this.#mapEl.classList.add("none");
        }
        await BusyIndicatorManager.unbusy();
    }

    async loadConnections(connections) {
        await BusyIndicatorManager.busy();
        this.#connectionMarkerList = [];
        for (const entry of connections ?? []) {
            const {label, posA, posB} = entry;
            if (posA != null) {
                const markerEl = this.#createMarker("connection", `${label}_posA`, posA.x, posA.y, posA.scale, label);
                this.#connectionMarkerList.push(markerEl);
                this.#entryMarkerLookup.set(`Connection::${label}_posA`, markerEl);
            }
            if (posB != null) {
                const markerEl = this.#createMarker("connection", `${label}_posB`, posB.x, posB.y, posB.scale, label);
                this.#connectionMarkerList.push(markerEl);
                this.#entryMarkerLookup.set(`Connection::${label}_posB`, markerEl);
            }
        }
        this.#rerender();
        await BusyIndicatorManager.unbusy();
    }

    async loadEntries(entries) {
        await BusyIndicatorManager.busy();
        this.#entryMarkerList = [];
        this.#entryMarkerLookup.clear();
        for (const entry of entries ?? []) {
            const {pos = {}, ref = {}} = entry ?? {};
            const {type = null, name = null} = ref ?? {};
            if (type != null && pos != null) {
                const markerEl = this.#createMarker(type, name, pos.x, pos.y, pos.scale);
                this.#entryMarkerList.push(markerEl);
                this.#entryMarkerLookup.set(`${type}::${name}`, markerEl);
            }
        }
        this.#rerender();
        await BusyIndicatorManager.unbusy();
    }

    #createMarker(type, name, x, y, scale, label) {
        if (!isNaN(x) && !isNaN(y)) {
            type = type.toLowerCase();
            const el = document.createElement(`gt-edt-world-editor-input-position-marker-${type}`);
            el.x = x;
            el.y = y;
            el.scale = scale;
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
            if (this.#currentMarkerEl != null) {
                if (this.#currentMarkerEl.x != this.#xValue || this.#currentMarkerEl.y != this.#yValue || this.#currentMarkerEl.scale != this.#scaleValue) {
                    this.#currentMarkerEl.x = this.#xValue;
                    this.#currentMarkerEl.y = this.#yValue;
                    this.#currentMarkerEl.scale = this.#scaleValue;
                    this.append(this.#currentMarkerEl);
                    this.#onChange();
                }
            } else {
                const type = this.#currentMarkerType ?? "";
                const name = this.#currentMarkerName ?? "";
                this.#currentMarkerEl = this.#createMarker(type, name ?? "", this.#xValue, this.#yValue, this.#scaleValue, this.#currentMarkerLabel);
                if (this.#currentMarkerEl != null) {
                    this.#entryMarkerLookup.set(`${type}::${name}`, this.#currentMarkerEl);
                    this.#currentMarkerEl.classList.add("active");
                    this.append(this.#currentMarkerEl);
                    this.#onChange();
                }
            }
        } else if (this.#currentMarkerEl != null) {
            const type = this.#currentMarkerType ?? "";
            const name = this.#currentMarkerName ?? "";
            this.#entryMarkerLookup.delete(`${type}::${name}`);
            this.#currentMarkerEl.remove();
            this.#currentMarkerEl = null;
            this.#onChange();
        }
    }

    #rerender = debounce(async () => {
        await BusyIndicatorManager.busy();
        this.innerHTML = "";
        for (const el of this.#connectionMarkerList) {
            this.append(el);
        }
        for (const el of this.#entryMarkerList) {
            this.append(el);
        }
        const type = this.#currentMarkerType ?? "";
        const name = this.#currentMarkerName ?? "";
        this.#currentMarkerEl = this.#entryMarkerLookup.get(`${type}::${name}`);
        if (this.#currentMarkerEl != null) {
            this.#currentMarkerEl.classList.add("active");
        }
        await BusyIndicatorManager.unbusy();
    });

}

customElements.define("gt-edt-input-position-map", MapPosInput);
