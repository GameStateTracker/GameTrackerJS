import CustomElement from "/emcJS/ui/element/CustomElement.js";
import FormBuilder from "/emcJS/util/form/FormBuilder.js";
import FormContext from "/emcJS/util/form/FormContext.js";
import {debounce} from "/emcJS/util/Debouncer.js";
import "/emcJS/ui/form/FormContainer.js";
import "/emcJS/ui/form/element/FormElementsLoader.js";
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
export default class EditorForm_Collections_Entry extends CustomElement {

    #formContext = new FormContext();

    #formContainerEl;

    #detailFormEl;

    #headerNameEl;

    #markerListEl;

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
        FormBuilder.replaceForm(this.#detailFormEl, FORM_CONFIG, null, null, "collections_entry");
        /* --- */
        this.#markerListEl = this.shadowRoot.getElementById("marker-list");
        /* --- */
        this.#markerListEl.addOperatorGroup(...LOGIC_OPERATOR_GROUPS);
        /* --- */
        const mapImageSelectEl = this.shadowRoot.getElementById("mapselect");
        const mapImageWidthEl = this.shadowRoot.getElementById("mapwidth");
        const mapImageHeightEl = this.shadowRoot.getElementById("mapheight");
        mapImageSelectEl.addEventListener("change", () => {
            const img = new Image();
            img.onload = () => {
                mapImageWidthEl.value = img.naturalWidth;
                mapImageHeightEl.value = img.naturalHeight;
            };
            img.onerror = () => {
                mapImageWidthEl.value = 0;
                mapImageHeightEl.value = 0;
            };
            img.src = mapImageSelectEl.value;
        });
        /* --- */
        this.#formContext.addEventListener("clear", () => {
            this.#updateMapData(this.#formContext.getData());
        });
        this.#formContext.addEventListener("change", () => {
            this.#updateMapData(this.#formContext.getData());
        });
        this.#formContext.addEventListener("load", () => {
            this.#updateMapData(this.#formContext.getData());
        });
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
        const fullData = this.getFullData(data);
        this.#formContext.setData(fullData);
        /* --- */
        this.#updateMapData(fullData);
    }

    getData() {
        return this.#formContext.getData();
    }

    hasChanges() {
        return this.#formContext.hasChanges();
    }

    setFilterConfig() {
        // ignore
    }

    #updateMapData = debounce((data) => {
        this.#markerListEl.loadMapData(data.map);
    });

    getFullData(data) {
        const res = {
            map: {
                active: data?.map?.active ?? false,
                backgroundColor: data?.map?.backgroundColor ?? "#000000",
                backgroundImage: data?.map?.backgroundImage ?? "",
                width: data?.map?.width ?? 0,
                height: data?.map?.height ?? 0,
                zoom: data?.map?.zoom ?? 100
            },
            list: data?.list ?? []
        };

        return res;
    }

}

customElements.define("gt-edt-world-form-collections-entry", EditorForm_Collections_Entry);
