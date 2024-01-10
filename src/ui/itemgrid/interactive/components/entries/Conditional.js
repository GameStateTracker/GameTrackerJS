import CustomElement from "/emcJS/ui/element/CustomElement.js";
import TrackerLogicHandler from "../../../../../util/handler/LogicHandler.js";
import TPL from "./Conditional.js.html" assert {type: "html"};
import STYLE from "./Conditional.js.css" assert {type: "css"};

export default class Conditional extends CustomElement {

    #containerEl;

    #thenEl;

    #elseEl;

    #currentEl = true;

    #logicHandler;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#containerEl = this.shadowRoot.getElementById("container");
        /* --- */
        this.#logicHandler = new TrackerLogicHandler(true);
        this.#logicHandler.addEventListener("change", (event) => {
            this.#containerEl.innerHTML = "";
            if (event.value) {
                this.#containerEl.append(this.#thenEl);
                this.#currentEl = this.#thenEl;
            } else {
                this.#containerEl.append(this.#elseEl);
                this.#currentEl = this.#elseEl;
            }
        });
    }

    setCondition(logic) {
        this.#logicHandler.setLogic(logic);
    }

    setThenEl(el) {
        this.#thenEl = el;
        if (this.#logicHandler.value) {
            this.#containerEl.innerHTML = "";
            this.#containerEl.append(el);
            this.#currentEl = el;
        }
    }

    setElseEl(el) {
        this.#elseEl = el;
        if (!this.#logicHandler.value) {
            this.#containerEl.innerHTML = "";
            this.#containerEl.append(el);
            this.#currentEl = el;
        }
    }

    get textRef() {
        return this.#currentEl?.textRef ?? "";
    }

}

customElements.define("gt-itemgrid-conditional", Conditional);
