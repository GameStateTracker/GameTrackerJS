import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import FormBuilder from "@emcjs/fe/util/form/FormBuilder.js";
import FormContext from "@emcjs/fe/util/form/context/FormContext.js";
import {deepClone} from "@emcjs/core/util/helper/DeepClone.js";
import "@emcjs/fe/ui/form/FormContainer.js";
import "@emcjs/fe/loader/FormComponentsLoader.js";
import "@emcjs/fe/ui/i18n/I18nLabel.js";
import TPL from "./EditorForm.js.html" assert {type: "html"};
import STYLE from "./EditorForm.js.css" assert {type: "css"};
import FORM_CONFIG from "./EditorForm.js.json" assert {type: "json"};

const LOGIC_OPERATOR_GROUPS = [
    "special",
    "items",
    "options",
    "settings",
    "filter",
    "active area list"
];

// TODO outsource main functionality
export default class EditorForm_Exits_Entry extends CustomElement {

    #formContext = new FormContext();

    #formContainerEl;

    #detailFormEl;

    headerNameEl;

    #filterInputEl;

    #visibleInputEl;

    #entranceActiveInputEl;

    #data = {};

    #filterConfig = {};

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#formContext.addEventListener("submit", () => {
            const event = new Event("save", {
                bubbles: true,
                cancelable: true
            });
            event.data = {...this.#formContext.getData()};
            this.dispatchEvent(event);
        });
        /* --- */
        this.#formContainerEl = this.shadowRoot.getElementById("form-container");
        this.headerNameEl = this.shadowRoot.getElementById("header-name");
        this.#detailFormEl = this.shadowRoot.getElementById("detail-form");
        this.#formContext.registerForm(this.#detailFormEl);
        /* --- */
        const headerFormEl = this.shadowRoot.getElementById("header-form");
        this.#formContext.registerForm(headerFormEl);
        const footerFormEl = this.shadowRoot.getElementById("footer-form");
        this.#formContext.registerForm(footerFormEl);
        /* --- */
        this.#prepareForm();
    }

    #prepareForm() {
        FormBuilder.replaceForm(this.#detailFormEl, FORM_CONFIG, null, null, "exits_entry");
        /* --- */
        this.#filterInputEl = this.shadowRoot.getElementById("filter-input");
        this.#visibleInputEl = this.shadowRoot.getElementById("visible-input");
        this.#entranceActiveInputEl = this.shadowRoot.getElementById("entrance-active");
        /* --- */
        this.#filterInputEl.addOperatorGroup(...LOGIC_OPERATOR_GROUPS);
        this.#visibleInputEl.addOperatorGroup(...LOGIC_OPERATOR_GROUPS);
        this.#entranceActiveInputEl.addOperatorGroup(...LOGIC_OPERATOR_GROUPS);
        /* --- */
        this.#formContext.addEventListener("clear", () => {
            this.dispatchEvent(new Event("clear"));
        });
        this.#formContext.addEventListener("change", () => {
            this.dispatchEvent(new Event("change"));
        });
        this.#formContext.addEventListener("load", () => {
            this.dispatchEvent(new Event("load"));
        });
    }

    acceptChanges() {
        this.#formContext.acceptChanges();
    }

    resetScroll() {
        this.#formContainerEl.resetScroll();
    }

    setName(value) {
        this.headerNameEl.i18nValue = value;
    }

    setData(data) {
        this.#data = deepClone(data);
        const fullData = this.getFullData(data);
        this.#formContext.setData(fullData);
    }

    getData() {
        return this.#formContext.getData();
    }

    hasChanges() {
        return this.#formContext.hasChanges();
    }

    setFilterConfig(config) {
        this.#filterConfig = deepClone(config);
        this.#filterInputEl.loadFilterConfig(config);
        /* --- */
        const fullData = this.getFullData(this.#data);
        this.#formContext.setData(fullData);
    }

    getFullData(data) {
        const res = {
            type: data?.type ?? "",
            target: data?.target ?? {
                type: "",
                name: ""
            },
            logicAccess: data?.logicAccess ?? "",
            area: data?.area,
            visible: data?.visible ?? true,
            filter: {},
            icon: data?.icon ?? "",
            bindsTo: data?.bindsTo ?? [],
            unbindable: data?.unbindable ?? false,
            ignoreBound: data?.ignoreBound ?? false,
            entranceActive: data?.entranceActive ?? true,
            includeInactiveEntrances: data?.includeInactiveEntrances ?? false,
            isBiDir: data?.isBiDir ?? true,
            tags: data?.tags ?? []
        };

        for (const category in this.#filterConfig) {
            res.filter[category] = {};
            for (const key of this.#filterConfig[category]) {
                res.filter[category][key] = data?.filter?.[category]?.[key] ?? true;
            }
        }

        return res;
    }

}

customElements.define("gt-edt-world-form-exits-entry", EditorForm_Exits_Entry);
