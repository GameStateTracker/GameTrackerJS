import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import TPL from "./ViewChoicePanel.js.html" assert {type: "html"};
import STYLE from "./ViewChoicePanel.js.css" assert {type: "css"};

export default class ViewChoicePanel extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    load() {
        for (const ch of this.children) {
            if (typeof ch.load === "function") {
                ch.load();
            }
        }
    }

    unload() {
        for (const ch of this.children) {
            if (typeof ch.unload === "function") {
                ch.unload();
            }
        }
    }

}

customElements.define("gt-viewchoice-panel", ViewChoicePanel);
