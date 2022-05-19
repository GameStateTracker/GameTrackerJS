// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import EventTargetMixin from "/emcJS/ui/mixin/EventTargetMixin.js";
import "/emcJS/ui/input/Option.js";

// GameTrackerJS
import FilterResource from "../../resource/FilterResource.js";
import FilterStorage from "../../savestate/storage/FilterStorage.js";
import FilterObserver from "../../util/observer/FilterObserver.js";

const TPL = new Template(`
<slot>
</slot>
`);

const STYLE = new GlobalStyle(`
:host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    user-select: none;
}
:host(:not([readonly])),
:host([readonly="false"]) {
    cursor: pointer;
}
slot {
    width: 100%;
    height: 100%;
}
::slotted(:not([value])),
::slotted([value]:not(.active)) {
    display: none !important;
}
::slotted([value]) {
    width: 100%;
    height: 100%;
    min-height: auto;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-origin: content-box;
}
`);

class FilterButton extends EventTargetMixin(CustomElement) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("click", event => this.next(event));
        this.addEventListener("contextmenu", event => this.revert(event));
        /* event bus */
        this.setTargetEventListener("filterObserver", "change", event => {
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

    get readonly() {
        const val = this.getAttribute("readonly");
        return !!val && val != "false";
    }

    set readonly(val) {
        this.setAttribute("readonly", val);
    }

    static get observedAttributes() {
        return ["ref", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "ref":
                if (oldValue != newValue) {
                    const data = FilterResource.get(this.ref);
                    const filterObserver = new FilterObserver(this.ref);
                    this.switchTarget("filterObserver", filterObserver);
                    this.innerHTML = "";
                    this.value = filterObserver.value;
                    for (const i in data.values) {
                        let img = data.images;
                        if (Array.isArray(img)) {
                            img = img[i];
                        }
                        const opt = createOption(data.values[i], img);
                        if (data.values[i] == this.value) {
                            opt.classList.add("active");
                        }
                        this.append(opt);
                    }
                }
                break;
            case "value":
                if (oldValue != newValue) {
                    const oe = this.querySelector(`.active`);
                    if (oe) {
                        oe.classList.remove("active");
                    }
                    const ne = this.querySelector(`[value="${newValue}"]`);
                    if (ne) {
                        ne.classList.add("active");
                    }
                    const ev = new Event("change");
                    ev.oldValue = oldValue;
                    ev.value = newValue;
                    this.dispatchEvent(ev);
                }
                break;
        }
    }

    next(event) {
        if (!this.readonly) {
            const all = this.querySelectorAll("[value]");
            const oldValue = this.value;
            let value = oldValue;
            if (all.length) {
                const opt = this.querySelector(`[value="${oldValue}"]`);
                if (!!opt && !!opt.nextElementSibling) {
                    value = opt.nextElementSibling.getAttribute("value");
                } else {
                    value = all[0].getAttribute("value");
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
        if (!this.readonly) {
            const all = this.querySelectorAll("[value]");
            const oldValue = this.value;
            let value = oldValue;
            if (all.length) {
                const opt = this.querySelector(`[value="${oldValue}"]`);
                if (!!opt && !!opt.previousElementSibling) {
                    value = opt.previousElementSibling.getAttribute("value");
                } else {
                    value = all[all.length - 1].getAttribute("value");
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

}

customElements.define("gt-filterbutton", FilterButton);

function createOption(value, img) {
    const opt = document.createElement("emc-option");
    opt.value = value;
    opt.style.backgroundImage = `url("${img}"`;
    return opt;
}
