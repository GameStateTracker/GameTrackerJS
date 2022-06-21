import CustomElement from "/emcJS/ui/element/CustomElement.js";
import TPL from "./ViewChoicePanel.js.html" assert {type: "html"};
import STYLE from "./ViewChoicePanel.js.css" assert {type: "css"};

export default class ViewChoicePanel extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    get slot() {
        return this.getAttribute("slot");
    }

    set slot(val) {
        this.setAttribute("slot", val);
    }

    get label() {
        return this.getAttribute("label");
    }

    set label(val) {
        this.setAttribute("label", val);
    }

    get icon() {
        return this.getAttribute("icon");
    }

    set icon(val) {
        this.setAttribute("icon", val);
    }

}

customElements.define("gt-viewchoice-panel", ViewChoicePanel);
