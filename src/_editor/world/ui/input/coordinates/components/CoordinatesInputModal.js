import Modal from "/emcJS/ui/modal/Modal.js";
import "/emcJS/ui/form/button/Button.js";
import "../../position/MapPosInput.js";
import TPL from "./CoordinatesInputModal.js.html" assert {type: "html"};
import STYLE from "./CoordinatesInputModal.js.css" assert {type: "css"};

export default class CoordinatesInputModal extends Modal {

    #inputEl;

    constructor(name) {
        if (typeof name === "string" && name !== "") {
            super(`Edit coordinates: ${name}`);
        } else {
            super("Edit coordinates");
        }
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const footerEl = this.shadowRoot.getElementById("footer");
        const contentEl = this.shadowRoot.getElementById("content");

        this.#inputEl = els.getElementById("input");
        contentEl.append(this.#inputEl);

        const cancelEl = els.getElementById("cancel");
        cancelEl.addEventListener("click", () => this.cancel());
        footerEl.append(cancelEl);

        const submitEl = els.getElementById("submit");
        submitEl.addEventListener("click", () => this.submit());
        footerEl.append(submitEl);
    }

    set caption(value) {
        if (typeof value === "string" && value !== "") {
            super.caption = `Edit coordinates: ${value}`;
        } else {
            super.caption = "Edit coordinates";
        }
    }

    get caption() {
        return super.caption;
    }

    submit() {
        this.dispatchEvent(new Event("submit"));
        this.remove();
    }

    cancel() {
        this.dispatchEvent(new Event("cancel"));
        this.remove();
    }

    set value(value) {
        this.#inputEl.value = value;
    }

    get value() {
        return this.#inputEl.value;
    }

    setCurrentMarker(currentType, currentName, currentLabel) {
        this.#inputEl.setCurrentMarker(currentType, currentName, currentLabel);
        /* --- */
        let caption = "";
        if (currentLabel != null) {
            caption = currentLabel;
        } else if (currentName != null) {
            caption = currentName;
        }
        if (caption !== "" && currentType != null) {
            caption += ` [${currentType}]`;
        }
        this.caption = caption;
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

customElements.define("gt-edt-input-coordinates-modal", CoordinatesInputModal);
