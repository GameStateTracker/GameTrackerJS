import CustomElement from "/emcJS/ui/element/CustomElement.js";
import FormBuilder from "/emcJS/util/form/FormBuilder.js";
import FormContext from "/emcJS/util/form/FormContext.js";
import "/emcJS/ui/form/FormContainer.js";
import "/emcJS/ui/form/field/DefaultFormFieldsLoader.js";
import "/emcJS/ui/i18n/I18nLabel.js";
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
export default class EditorForm_Locations_Entry extends CustomElement {

    #formContext = new FormContext();

    #formContainerEl;

    #detailFormEl;

    #headerNameEl;

    #filterInputEl;

    #visibleInputEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#formContext.addEventListener("submit", () => {
            const event = new Event("save", {bubbles: true, cancelable: true});
            event.data = {
                ...this.#formContext.getData()
            };
            this.dispatchEvent(event);
        });
        /* --- */
        this.#formContainerEl = this.shadowRoot.getElementById("form-container");
        this.#headerNameEl = this.shadowRoot.getElementById("header-name");
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
        FormBuilder.replaceForm(this.#detailFormEl, FORM_CONFIG, null, null, "locations_entry");
        /* --- */
        this.#filterInputEl = this.shadowRoot.getElementById("filter-input");
        this.#visibleInputEl = this.shadowRoot.getElementById("visible-input");
        /* --- */
        this.#filterInputEl.addOperatorGroup(...LOGIC_OPERATOR_GROUPS);
        this.#visibleInputEl.addOperatorGroup(...LOGIC_OPERATOR_GROUPS);
    }

    acceptChanges() {
        this.#formContext.acceptChanges();
    }

    resetScroll() {
        this.#formContainerEl.resetScroll();
    }

    setName(value) {
        this.#headerNameEl.i18nValue = value;
    }

    setData(data) {
        this.#formContext.loadData(data);
    }

    getData() {
        return this.#formContext.getData();
    }

    hasChanges() {
        return this.#formContext.hasChanges();
    }

    setFilterConfig(config) {
        this.#filterInputEl.loadFilterConfig(config);
    }

}

customElements.define("gt-edt-world-form-locations-entry", EditorForm_Locations_Entry);
