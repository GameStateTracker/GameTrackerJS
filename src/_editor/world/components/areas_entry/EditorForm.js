import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import FormBuilder from "@emcjs/fe/util/form/FormBuilder.js";
import FormContext from "@emcjs/fe/util/form/context/FormContext.js";
import OptionGroupRegistry from "@emcjs/fe/registry/form/OptionGroupRegistry.js";
import {deepClone} from "@emcjs/core/util/helper/DeepClone.js";
import {debounce} from "@emcjs/core/util/Debouncer.js";
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
export default class EditorForm_Areas_Entry extends CustomElement {

    #formContext = new FormContext();

    #formContainerEl;

    #detailFormEl;

    #headerNameEl;

    #filterInputEl;

    #visibleInputEl;

    #accessPenetrationInputEl;

    #connectionListEl;

    #markerListEl;

    #data = {};

    #filterConfig = {};

    #optionGroup = new OptionGroupRegistry("worldEditor_areaContentHints");

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
        this.#optionGroup.addEventListener("change", () => {
            const fullData = this.getFullData(this.#data);
            this.#formContext.setData(fullData);
            this.#updateMapData(fullData);
        });
        /* --- */
        this.#prepareForm();
    }

    #prepareForm() {
        FormBuilder.replaceForm(this.#detailFormEl, FORM_CONFIG, null, null, "areas_entry");
        /* --- */
        this.#filterInputEl = this.shadowRoot.getElementById("filter-input");
        this.#visibleInputEl = this.shadowRoot.getElementById("visible-input");
        this.#accessPenetrationInputEl = this.shadowRoot.getElementById("access-penetration-input");
        this.#connectionListEl = this.shadowRoot.getElementById("connection-list");
        this.#markerListEl = this.shadowRoot.getElementById("marker-list");
        /* --- */
        this.#filterInputEl.addOperatorGroup(...LOGIC_OPERATOR_GROUPS);
        this.#visibleInputEl.addOperatorGroup(...LOGIC_OPERATOR_GROUPS);
        this.#accessPenetrationInputEl.addOperatorGroup(...LOGIC_OPERATOR_GROUPS);
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
            this.dispatchEvent(new Event("clear"));
        });
        this.#formContext.addEventListener("change", () => {
            this.#updateMapData(this.#formContext.getData());
            this.dispatchEvent(new Event("change"));
        });
        this.#formContext.addEventListener("load", () => {
            this.#updateMapData(this.#formContext.getData());
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
        this.#headerNameEl.i18nValue = value;
    }

    setData(data) {
        this.#data = deepClone(data);
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

    setFilterConfig(config) {
        this.#filterConfig = deepClone(config);
        this.#filterInputEl.loadFilterConfig(config);
        /* --- */
        const fullData = this.getFullData(this.#data);
        this.#formContext.setData(fullData);
        this.#updateMapData(fullData);
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

    getFullData(data) {
        const res = {
            type: data?.type ?? "",
            category: data?.category ?? "",
            visible: data?.visible ?? true,
            visibleIfEmpty: data?.visibleIfEmpty ?? true,
            filter: {},
            listContents: data?.listContents ?? false,
            accessPenetration: data?.accessPenetration ?? false,
            icon: data?.icon ?? "",
            map: {
                active: data?.map?.active ?? false,
                backgroundColor: data?.map?.backgroundColor ?? "#000000",
                backgroundImage: data?.map?.backgroundImage ?? "",
                width: data?.map?.width ?? 0,
                height: data?.map?.height ?? 0,
                zoom: data?.map?.zoom ?? 100
            },
            connections: data?.connections ?? [],
            lists: data?.lists ?? {},
            areaContentHints: {},
            tags: data?.tags ?? []
        };

        for (const category in this.#filterConfig) {
            res.filter[category] = {};
            for (const key of this.#filterConfig[category]) {
                res.filter[category][key] = data?.filter?.[category]?.[key] ?? true;
            }
        }

        for (const [value] of this.#optionGroup) {
            res.areaContentHints[value] = data?.areaContentHints?.[value] ?? 0;
        }

        return res;
    }

}

customElements.define("gt-edt-world-form-areas-entry", EditorForm_Areas_Entry);
