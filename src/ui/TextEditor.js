import CustomElement from "/emcJS/ui/element/CustomElement.js";
import ParameterStorage from "../storage/ParameterStorage.js";
import TPL from "./TextEditor.js.html" assert {type: "html"};
import STYLE from "./TextEditor.js.css" assert {type: "css"};

export default class TextEditor extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const fontSizeEl = this.shadowRoot.getElementById("font_size");
        const textEl = this.shadowRoot.getElementById("text");
        let textTimer = null;
        {
            const size = parseInt(ParameterStorage.get("notes.font_size", 14));
            textEl.style.fontSize = `${size}px`;
            fontSizeEl.value = size;
        }
        fontSizeEl.addEventListener("change", () => {
            const size = parseInt(fontSizeEl.value);
            ParameterStorage.set("notes.font_size", size);
            textEl.style.fontSize = `${size}px`;
        });
        textEl.addEventListener("input", () => {
            if (textTimer) {
                clearTimeout(textTimer);
            }
            textTimer = setTimeout(() => {
                const event = new Event("change");
                event.value = textEl.value;
                this.dispatchEvent(event);
            }, 1000);
        });
        textEl.addEventListener("contextmenu", function(event) {
            event.stopPropagation();
        });
    }

    set title(value) {
        this.setAttribute("title", value);
    }

    get title() {
        return this.getAttribute("title");
    }

    set value(value) {
        const notes = this.shadowRoot.getElementById("text");
        notes.value = value;
    }

    get value() {
        const notes = this.shadowRoot.getElementById("text");
        return notes.value;
    }

    static get observedAttributes() {
        return ["title"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "title":
                if (oldValue != newValue) {
                    const title = this.shadowRoot.getElementById("title");
                    title.innerText = newValue;
                }
                break;
        }
    }

}

customElements.define("gt-texteditor", TextEditor);
