import Panel from "@emcjs/fe/ui/layout/Panel.js";
import SearchEvery from "@emcjs/core/util/search/SearchEvery.js";
import "@emcjs/fe/ui/form/element/input/search/SearchInput.js";
import "@emcjs/fe/ui/form/element/input/switch/SwitchInput.js";
import WorldResource from "../../../data/resource/WorldResource.js";
import WorldStateManagerRegistry from "../../../statemanager/WorldStateManagerRegistry.js";
import Language from "../../../util/Language.js";
import "./components/ExitChoice.js";
import TPL from "./ExitList.js.html" assert {type: "html"};
import STYLE from "./ExitList.js.css" assert {type: "css"};

const EXITS = WorldResource.get("exits");

export default class ExitList extends Panel {

    #searchEl;

    #hideBoundEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#searchEl.addEventListener("change", () => {
            this.calculateItems();
        }, true);
        this.#hideBoundEl = this.shadowRoot.getElementById("hide-bound");
        this.#hideBoundEl.addEventListener("change", () => {
            this.calculateItems();
        }, true);
        /* --- */
        for (const name in EXITS) {
            const state = WorldStateManagerRegistry.get("Exit").get(name);
            this.#addEntrance(state);
        }
    }

    calculateItems() {
        for (const el of this.children) {
            if (el) {
                if (!el.value || !this.#hideBoundEl.value) {
                    const searchValue = this.#searchEl.value;
                    if (searchValue) {
                        const regEx = new SearchEvery(searchValue);
                        const transRef = Language.translate(`exit[${el.getAttribute("ref")}]`);
                        const transValue = Language.translate(`entrance[${el.getAttribute("value")}]`);
                        const transRefRes = regEx.test(transRef);
                        const transValueRes = regEx.test(transValue);
                        el.classList.toggle("markname", transRefRes);
                        el.classList.toggle("markvalue", transValueRes);
                        if (transRefRes || transValueRes) {
                            el.classList.remove("hidden");
                            continue;
                        }
                    } else {
                        el.classList.remove("markname");
                        el.classList.remove("markvalue");
                        el.classList.remove("hidden");
                        continue;
                    }
                }
                el.classList.remove("markname");
                el.classList.remove("markvalue");
                el.classList.add("hidden");
            }
        }
    }

    #addEntrance(state) {
        const el = document.createElement("gt-exitchoice");
        el.ref = state.ref;
        el.setAttribute("access", state.props.logicAccess ?? "");
        el.setAttribute("type", state.props.type);
        el.setAttribute("tags", JSON.stringify(state.props.tags));
        el.addEventListener("change", () => {
            this.calculateItems();
        });
        this.append(el);
    }

}

Panel.registerReference("exitlist", ExitList);
customElements.define("gt-exitlist", ExitList);
