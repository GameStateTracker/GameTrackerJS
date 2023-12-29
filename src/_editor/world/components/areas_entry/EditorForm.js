import CustomElement from "/emcJS/ui/element/CustomElement.js";
import FormBuilder from "/emcJS/util/form/FormBuilder.js";
import FormContext from "/emcJS/util/form/FormContext.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
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
    "locations done"
];

// TODO outsource main functionality
export default class EditorForm_Areas_Entry extends CustomElement {

    #formContext = new FormContext();

    #formContainerEl;

    #detailFormEl;

    #headerNameEl;

    #filterInputEl;

    #visibleInputEl;

    #connectionListEl;

    #markerListEl;

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
        FormBuilder.replaceForm(this.#detailFormEl, FORM_CONFIG, null, null, "areas_entry");
        /* --- */
        this.#filterInputEl = this.shadowRoot.getElementById("filter-input");
        this.#visibleInputEl = this.shadowRoot.getElementById("visible-input");
        this.#connectionListEl = this.shadowRoot.getElementById("connection-list");
        this.#markerListEl = this.shadowRoot.getElementById("marker-list");
        /* --- */
        this.#filterInputEl.addOperatorGroup(...LOGIC_OPERATOR_GROUPS);
        this.#visibleInputEl.addOperatorGroup(...LOGIC_OPERATOR_GROUPS);
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
            }
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

    resetScroll() {
        this.#formContainerEl.resetScroll();
    }

    setName(value) {
        this.#headerNameEl.i18nValue = value;
    }

    setData(data) {
        this.#formContext.loadData(data);
        /* --- */
        this.#updateMapData(data);
    }

    getData() {
        return this.#formContext.getData();
    }

    setFilterConfig(config) {
        this.#filterInputEl.loadFilterConfig(config);
    }

    #updateMapData = debounce((data) => {
        this.#connectionListEl.loadMapData(data.map);
        let allEntities = [];
        for (const list of Object.values(data.lists ?? {})) {
            allEntities = [...allEntities, ...list];
        }
        this.#connectionListEl.loadEntries(allEntities);
        // ---
        this.#markerListEl.loadMapData(data.map);
        this.#markerListEl.loadConnections(data.connections);
    });

}

customElements.define("gt-edt-world-form-areas-entry", EditorForm_Areas_Entry);
