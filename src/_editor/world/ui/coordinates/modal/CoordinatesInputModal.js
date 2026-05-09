import ModalDialog from "@emcjs/fe/ui/modal/ModalDialog.js";
import "@emcjs/fe/ui/form/button/Button.js";
import "./components/MapPosInput.js";
import TPL from "./CoordinatesInputModal.js.html" assert {type: "html"};
import STYLE from "./CoordinatesInputModal.js.css" assert {type: "css"};

export default class CoordinatesInputModal extends ModalDialog {

    #contentEl;

    #inputEl;

    constructor(name) {
        if (typeof name === "string" && name !== "") {
            super(`Edit coordinates: ${name}`, {
                submit: true,
                cancel: true
            });
        } else {
            super("Edit coordinates", {
                submit: true,
                cancel: true
            });
        }
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#contentEl = this.shadowRoot.getElementById("content");

        this.#inputEl = els.getElementById("input");
        this.#contentEl.append(this.#inputEl);
    }

    async show(value) {
        this.#inputEl.value = value;
        return await super.show();
    }

    getSubmitValue() {
        return this.#inputEl.value;
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
