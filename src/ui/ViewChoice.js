import CustomElement from "/emcJS/ui/element/CustomElement.js";
import ElementManager from "/emcJS/util/html/ElementManager.js";
import "/emcJS/ui/input/Option.js";
import TPL from "./ViewChoice.js.html" assert {type: "html"};
import STYLE from "./ViewChoice.js.css" assert {type: "css"};

const EL_MANAGER = new WeakMap();
const ON_CLICK = new WeakMap();

function composer(key, params) {
    const el = document.createElement("emc-option");
    el.value = key;
    el.style.backgroundImage = `url('${params.icon}')`;
    el.title = params.title || key;
    el.addEventListener("click", params.onClick);
    return el;
}

export default class ViewChoice extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        ON_CLICK.set(this, (event) => {
            const el = event.currentTarget;
            if (!el.classList.contains("active")) {
                this.active = el.value;
            }
        });
        const choice = this.shadowRoot.getElementById("view-choice");
        EL_MANAGER.set(this, new ElementManager(choice, composer));
        const observer = new MutationObserver(() => {
            this.connectedCallback();
        });
        observer.observe(this, {childList: true});
    }

    connectedCallback() {
        const all = this.querySelectorAll("[slot]");
        const elManager = EL_MANAGER.get(this);
        const onClick = ON_CLICK.get(this);
        const data = [];
        all.forEach((el) => {
            data.push({
                key: el.getAttribute("slot"),
                title: el.dataset.title,
                icon: el.dataset.icon,
                onClick
            });
        });
        elManager.manage(data);
        // apply value
        const choice = this.shadowRoot.getElementById("view-choice");
        const el = choice.querySelector(`[value="${this.active}"]`);
        if (el) {
            el.classList.add("active");
        }
    }

    disconnectedCallback() {
        // revoke value
        const choice = this.shadowRoot.getElementById("view-choice");
        const current = choice.querySelector(`[value="${this.active}"]`);
        if (current) {
            current.classList.remove("active");
        }
    }

    get active() {
        return this.getAttribute("active");
    }

    set active(val) {
        this.setAttribute("active", val);
    }

    static get observedAttributes() {
        return ["active"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "active":
                if (oldValue != newValue) {
                    const container = this.shadowRoot.getElementById("container");
                    if (typeof newValue == "string") {
                        container.name = newValue;
                        // update choice
                        const choice = this.shadowRoot.getElementById("view-choice");
                        const current = choice.querySelector(`[value="${oldValue}"]`);
                        if (current) {
                            current.classList.remove("active");
                        }
                        const el = choice.querySelector(`[value="${newValue}"]`);
                        if (el) {
                            el.classList.add("active");
                        }
                    }
                }
                break;
        }
    }

}

customElements.define("gt-viewchoice", ViewChoice);
