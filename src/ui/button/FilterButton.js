import CustomElement from "/emcJS/ui/element/CustomElement.js";
import EventTargetListenerElementMixin from "/emcJS/ui/mixin/EventTargetListenerElementMixin.js";
import "/emcJS/ui/input/Option.js";
import FilterResource from "../../data/resource/FilterResource.js";
import FilterStorage from "../../savestate/storage/FilterStorage.js";
import FilterObserver from "../../util/observer/FilterObserver.js";
import TPL from "./FilterButton.js.html" assert {type: "html"};
import STYLE from "./FilterButton.js.css" assert {type: "css"};

export default class FilterButton extends EventTargetListenerElementMixin(CustomElement) {

    #optionEls =  new Map();

    #selectedEl;

    #description;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("click", (event) => this.next(event));
        this.addEventListener("contextmenu", (event) => this.revert(event));
        /* event bus */
        this.setEventTargetListener("filterObserver", "change", (event) => {
            this.value = event.value;
        });
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get readOnly() {
        const val = this.getAttribute("readonly");
        return !!val && val != "false";
    }

    set readOnly(val) {
        this.setAttribute("readonly", val);
    }

    static get observedAttributes() {
        return ["ref", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "ref": {
                if (oldValue != newValue) {
                    const filterObserver = new FilterObserver(this.ref);
                    this.switchEventTarget("filterObserver", filterObserver);
                    this.#initData();
                    this.value = filterObserver.value;
                }
            } break;
            case "value": {
                if (oldValue != newValue) {
                    if (this.#selectedEl) {
                        this.#selectedEl.classList.remove("active");
                        this.#selectedEl = null;
                    }
                    const ne = this.#optionEls.get(newValue);
                    if (ne) {
                        ne.classList.add("active");
                        this.#selectedEl = ne;
                    }
                    this.#applyTooltip();

                    const ev = new Event("change");
                    ev.oldValue = oldValue;
                    ev.value = newValue;
                    this.dispatchEvent(ev);
                }
            } break;
        }
    }

    next(event) {
        if (!this.readOnly) {
            const oldValue = this.value;
            let value = oldValue;
            if (this.#optionEls.size) {
                const opt = this.#selectedEl;
                const nextOptEl = opt?.nextElementSibling;
                if (nextOptEl != null) {
                    value = nextOptEl.getAttribute("value");
                } else {
                    const firstOptEl = this.querySelector("[value]");
                    value = firstOptEl.getAttribute("value");
                }
            }
            if (value != oldValue) {
                this.value = value;
                FilterStorage.set(this.ref, value);
            }
        }
        event.preventDefault();
        return false;
    }

    revert(event) {
        if (!this.readOnly) {
            const oldValue = this.value;
            let value = oldValue;
            if (this.#optionEls.size) {
                const opt = this.#selectedEl;
                const prevOptEl = opt?.previousElementSibling;
                if (prevOptEl != null) {
                    value = prevOptEl.getAttribute("value");
                } else {
                    const lastOptEl = this.querySelector(":nth-last-match(1 of [value])");
                    value = lastOptEl.getAttribute("value");
                }
            }
            if (value != oldValue) {
                this.value = value;
                FilterStorage.set(this.ref, value);
            }
        }
        event.preventDefault();
        return false;
    }

    #initData() {
        const data = FilterResource.get(this.ref);
        const {
            description,
            values
        } = data;

        this.#description = description;

        this.innerHTML = "";
        this.#optionEls.clear();
        for (const [value, props] of Object.entries(values)) {
            const {
                image,
                description
            } = props;

            const opt = document.createElement("emc-option");
            opt.value = value;
            opt.style.backgroundImage = `url("${image}"`;
            opt.dataset.description = description;

            if (data.values[value] == this.value) {
                opt.classList.add("active");
                this.#selectedEl = opt;
            }

            this.#optionEls.set(value, opt);
            this.append(opt);
        }

        this.#applyTooltip();
    }

    #applyTooltip() {
        if (this.#selectedEl != null) {
            this.title = `${this.#description}\n\nActive value: ${this.#selectedEl.dataset.description ?? this.#selectedEl.value}`;
        } else {
            this.title = `${this.#description}\n\nActive value: [No value selected]`;
        }
    }

}

customElements.define("gt-filterbutton", FilterButton);
