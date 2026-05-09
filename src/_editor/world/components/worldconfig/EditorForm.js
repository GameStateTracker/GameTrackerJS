import OptionGroupRegistry from "@emcjs/fe/registry/form/OptionGroupRegistry.js";
import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import FormBuilder from "@emcjs/fe/util/form/FormBuilder.js";
import FormContext from "@emcjs/fe/util/form/context/FormContext.js";
import "@emcjs/fe/ui/form/FormContainer.js";
import "@emcjs/fe/loader/FormComponentsLoader.js";
import "@emcjs/fe/ui/i18n/I18nLabel.js";
import TPL from "./EditorForm.js.html" assert {type: "html"};
import STYLE from "./EditorForm.js.css" assert {type: "css"};
import FORM_CONFIG from "./EditorForm.js.json" assert {type: "json"};

// TODO outsource main functionality
export default class EditorForm_WorldConfig extends CustomElement {

    #formContext = new FormContext();

    #formContainerEl;

    #detailFormEl;

    #areaHintEl;

    #optionGroupRegistry = new OptionGroupRegistry("worldEditor_areaContentHints");

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
        FormBuilder.replaceForm(this.#detailFormEl, FORM_CONFIG);
        /* --- */
        this.#areaHintEl = this.shadowRoot.getElementById("area-hints");
        /* --- */
        this.#areaHintEl.setImageSelectOptionGroup("worldEditor_icons");
        this.#areaHintEl.addEventListener("change", () => {
            const options = Object.keys(this.#areaHintEl.value);
            this.#optionGroupRegistry.setAll(options);
        });
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

    setName() {
        // ignore
    }

    setData(data) {
        this.#formContext.setData(data);
    }

    hasChanges() {
        return this.#formContext.hasChanges();
    }

    getData() {
        return this.#formContext.getData();
    }

    setFilterConfig() {
        // ignore
    }

}

customElements.define("gt-edt-world-form-world-config", EditorForm_WorldConfig);
