import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";

import ParameterStorage from "../storage/ParameterStorage.js";

const TPL = new Template(`
<div id="title"></div>
<div class="controls">
    <label>
        <span>Font size</span><input type="number" id="font_size" min="8" max="50">
    </label>
</div>
<textarea id="text"></textarea>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 10px;
}
#title {
    margin: 10px 0;
    font-size: 2em;
    line-height: 1em;
}
#title:empty {
    display: none;
}
.controls label {
    display: inline-flex;
    padding: 5px;
    background-color: var(--edit-background-color, #ffffff);
    color: var(--edit-text-color, #000000);
    border: solid 2px;
    border-bottom: none 0px;
    border-color: var(--edit-text-color, #ffffff);
}
.controls span {
    display: flex;
    align-items: center;
    margin-right: 5px;
}
.controls input {
    font-size: 1em;
    width: 70px;
    text-align: right;
}
#text {
    flex: 1;
    padding: 5px;
    resize: none;
    overflow: scroll;
    background-color: var(--edit-background-color, #ffffff);
    color: var(--edit-text-color, #000000);
    border: solid 2px;
    border-color: var(--edit-text-color, #ffffff);
    word-wrap: unset;
    white-space: pre;
    user-select: text;
}
`);

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
        textEl.addEventListener("input", (event) => {
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
