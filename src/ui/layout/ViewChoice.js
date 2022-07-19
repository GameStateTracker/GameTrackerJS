import CustomElement from "/emcJS/ui/element/CustomElement.js";
import ElementManager from "/emcJS/util/html/ElementManager.js";
import EventMultiTargetManager from "/emcJS/util/event/EventMultiTargetManager.js";
import "/emcJS/ui/input/Option.js";
import "./ViewChoicePanel.js";
import TPL from "./ViewChoice.js.html" assert {type: "html"};
import STYLE from "./ViewChoice.js.css" assert {type: "css"};
import ChildlistMutationObserverMixin from "/emcJS/ui/mixin/ChildlistMutationObserverMixin.js";

function elementComposer(key, params, eventManager) {
    const el = document.createElement("emc-option");
    el.value = key;
    eventManager.addTarget(el);
    return el;
}

function elementMutator(el, key, params) {
    el.style.backgroundImage = `url('${params.icon}')`;
    el.title = params.title || key;
}

function elementCleanup(el, key, eventManager) {
    eventManager.removeTarget(el);
}

export default class ViewChoice extends ChildlistMutationObserverMixin(CustomElement) {

    #elementManager;

    #eventManager;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const observer = new MutationObserver(() => {
            this.connectedCallback();
        });
        observer.observe(this, {childList: true});
        /* --- */
        this.#eventManager = new EventMultiTargetManager();
        this.#eventManager.set("click", (event) => {
            const el = event.currentTarget;
            if (!el.classList.contains("active")) {
                this.active = el.value;
            }
        });
        /* --- */
        const choice = this.shadowRoot.getElementById("view-choice");
        this.#elementManager = new ElementManager(choice, {
            composer: elementComposer,
            mutator: elementMutator,
            cleanup: elementCleanup
        }, this.#eventManager);
    }

    nodeAddedCallback() {
        const all = this.querySelectorAll("gt-viewchoice-panel[slot]");
        const data = [];
        for (const el of all) {
            data.push({
                key: el.slot,
                title: el.label,
                icon: el.icon
            });
        }
        this.#elementManager.manage(data);
    }

    nodeRemovedCallback() {
        const all = this.querySelectorAll("gt-viewchoice-panel[slot]");
        const data = [];
        for (const el of all) {
            data.push({
                key: el.slot,
                title: el.label,
                icon: el.icon
            });
        }
        this.#elementManager.manage(data);
    }

    connectedCallback() {
        const all = this.querySelectorAll("gt-viewchoice-panel[slot]");
        const data = [];
        for (const el of all) {
            data.push({
                key: el.slot,
                title: el.label,
                icon: el.icon
            });
        }
        this.#elementManager.manage(data);
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
