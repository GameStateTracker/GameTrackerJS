// frameworks
import {
    mix
} from "/emcJS/util/Mixin.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";
import EventTargetListenerElementMixin from "/emcJS/ui/mixin/EventTargetListenerElementMixin.js";
import ExitStateManager from "../../statemanager/world/exit/ExitStateManager.js";
import EntranceStateManager from "../../statemanager/world/entrance/EntranceStateManager.js";
import Savestate from "../../savestate/Savestate.js";
import "../entrance/EntranceSelectList.js";

const STORAGES = {
    exitBindings: Savestate.getStorage("exitBindings")
};

const STYLE = new GlobalStyle(`
::slotted(#select) {
    min-height: 300px;
    max-height: 50vh;
    min-width: 300px;
    max-width: 90vw;
}
`);

const BaseClass = mix(
    ContextMenu
).with(
    EventTargetListenerElementMixin
);

export default class ExitBindingContextMenu extends BaseClass {

    #exitSelectEl;

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
    }

    initItems() {
        this.#exitSelectEl = document.createElement("gt-entrance-select-list");
        this.#exitSelectEl.id = "select";
        this.#exitSelectEl.addEventListener("change", (event) => {
            const ev = new Event("change");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        this.#exitSelectEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        super.setItems([this.#exitSelectEl]);
    }

    setItems() {
        // nothing
    }

    show(posX, posY, access, current) {
        this.fillEntranceSelection(access, current);
        setTimeout(() => {
            super.show(posX, posY);
        }, 0);
    }

    close() {
        this.#exitSelectEl.resetSearch();
        super.close();
    }

    initFocus() {
        this.#exitSelectEl.focus();
    }

    fillEntranceSelection(access, current = "") {
        this.#exitSelectEl.innerHTML = "";
        // retrieve bound
        const bound = new Set();
        for (const [key, value] of STORAGES.exitBindings) {
            if (value != current) {
                const boundExit = EntranceStateManager.get(key);
                if (boundExit == null || boundExit.props.isBiDir) {
                    bound.add(value);
                }
            }
        }
        // add unbind
        const unbindEl = document.createElement("gt-entrance-select-option");
        unbindEl.ref = "";
        unbindEl.value = "";
        unbindEl.style.fontStyle = "italic";
        this.#exitSelectEl.append(unbindEl);
        // add empty
        const emptyEl = document.createElement("gt-entrance-select-option");
        emptyEl.ref = "\u0000";
        emptyEl.value = "\u0000";
        emptyEl.style.fontStyle = "italic";
        this.#exitSelectEl.append(emptyEl);
        // set choices and value
        const exit = ExitStateManager.get(access);
        if (exit != null) {
            // add options
            for (const [, entrance] of EntranceStateManager) {
                setTimeout(() => {
                    if (access != entrance.ref && (exit.props.ignoreBound || !bound.has(entrance.ref))) {
                        const isBindable = exit.checkBindable(entrance);
                        if (isBindable) {
                            const entranceEl = document.createElement("gt-entrance-select-option");
                            entranceEl.ref = entrance.ref;
                            entranceEl.value = entrance.ref;
                            this.#exitSelectEl.append(entranceEl);
                        }
                    }
                }, 0);
            }
            this.#exitSelectEl.value = current;
        } else {
            this.#exitSelectEl.value = "";
        }
    }

}

customElements.define("gt-ctxmenu-exitbinding", ExitBindingContextMenu);
